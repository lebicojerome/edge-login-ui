// @flow

import type { AbcAccount } from 'edge-core-js'
import { sprintf } from 'sprintf-js'
import passwordCheck from 'zxcvbn'

import { enableTouchId, isTouchDisabled } from '../../native/keychain.js'
import type { Dispatch, GetState, Imports } from '../../types/ReduxTypes'
import * as Constants from '../constants'
import { isASCII } from '../util'
import { dispatchAction, dispatchActionWithData, getPreviousUsers } from './'
import * as WorkflowActions from './WorkflowActions'

export function validatePin (data: Object) {
  const pin = data.pin
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    let error = null
    if (pin.length !== 4) {
      error = Constants.FOUR_DIGIT_PIN_ERROR
    }
    if (pin.length > 4) {
      return
    }
    const obj = {
      pin: pin,
      error: error
    }
    dispatch(dispatchActionWithData(Constants.CREATE_UPDATE_PIN, obj))
    // dispatch(updatePin(obj))
  }
}
export function checkUsernameForAvailabilty (data: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const context = imports.context
    // dispatch(openLoading()) Legacy dealt with state for showing a spinner
    // the timeout is a hack until we put in interaction manager.
    setTimeout(() => {
      context
        .usernameAvailable(data)
        .then(async response => {
          if (response) {
            const obj = {
              username: data,
              error: null
            }
            dispatch(
              dispatchActionWithData(Constants.CREATE_UPDATE_USERNAME, obj)
            )
            dispatch(dispatchAction(Constants.WORKFLOW_NEXT))
            return
          }
          const obj = {
            username: data,
            error: Constants.USERNAME_EXISTS_ERROR
          }
          dispatch(
            dispatchActionWithData(Constants.CREATE_UPDATE_USERNAME, obj)
          )
        })
        .catch(e => {
          console.log(e.message)
        })
    }, 300)
  }
}

export function validateUsername (data: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    // TODO evaluate client side evaluations.
    let error = data.length > 2 ? null : Constants.USERNAME_3_CHARACTERS_ERROR // TODO: Localize string
    error = isASCII(data) ? error : Constants.USERNAME_ASCII_ERROR // TODO: localize
    const obj = {
      username: data,
      error: error
    }
    dispatch(dispatchActionWithData(Constants.CREATE_UPDATE_USERNAME, obj))
  }
}
export function validateConfirmPassword (data?: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const state = getState()
    const confirmPassword = data !== null ? data : state.create.confirmPassword
    // dispatch(openLoading()) Legacy dealt with state for showing a spinner
    // the timeout is a hack until we put in interaction manager.
    let error = null
    if (confirmPassword !== state.create.password) {
      error = Constants.CONFIRM_PASSWORD_ERROR
    }
    const obj = {
      password: confirmPassword,
      error
    }
    dispatch(
      dispatchActionWithData(Constants.AUTH_UPDATE_CONFIRM_PASSWORD, obj)
    )
  }
}
export function validatePassword (data: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const context = imports.context
    let error = null
    // dispatch(openLoading()) Legacy dealt with state for showing a spinner
    // the timeout is a hack until we put in interaction manager.
    const passwordEval = context.checkPasswordRules(data)
    const passwordCheckResult = passwordCheck(data)
    let passwordCheckString

    if (
      passwordCheckResult &&
      passwordCheckResult.crack_times_display &&
      passwordCheckResult.crack_times_display.online_no_throttling_10_per_second
    ) {
      passwordCheckString =
        passwordCheckResult.crack_times_display
          .online_no_throttling_10_per_second
    }

    passwordCheckString = sprintf(
      Constants.IT_WOULD_TAKE_XX_TO_CRACK,
      passwordCheckString
    )
    if (passwordCheckResult.score < 3) {
      passwordCheckString += Constants.RECOMMEND_CHOOSING_A_STRONGER
    }

    if (!passwordEval.passed) {
      error = Constants.PASSWORD_ERROR // TODO localize.
    }

    const obj = {
      password: data,
      passwordStatus: passwordEval,
      passwordCheckString,
      error: error
    }
    dispatch(dispatchActionWithData(Constants.AUTH_UPDATE_PASSWORD, obj))
  }
}

export function createUser (data: Object) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const context = imports.context
    const myAccountOptions = {
      ...imports.accountOptions,
      callbacks: {
        ...imports.accountOptions.callbacks,
        onLoggedOut: () => {
          dispatch(dispatchAction(Constants.RESET_APP))
        }
      }
    }
    dispatch(WorkflowActions.nextScreen())
    setTimeout(async () => {
      try {
        const abcAccount = await context.createAccount(
          data.username,
          data.password,
          data.pin,
          myAccountOptions
        )
        const touchDisabled = await isTouchDisabled(
          context,
          abcAccount.username
        )
        if (!touchDisabled) {
          await enableTouchId(context, abcAccount)
        }
        dispatch(
          dispatchActionWithData(Constants.CREATE_ACCOUNT_SUCCESS, abcAccount)
        )
        dispatch(dispatchAction(Constants.WORKFLOW_NEXT))
        await context.io.folder
          .file('lastuser.json')
          .setText(JSON.stringify({ username: abcAccount.username }))
          .catch(e => null)
        dispatch(getPreviousUsers())
      } catch (e) {
        console.log(e)
        dispatch(
          dispatchActionWithData(Constants.CREATE_ACCOUNT_FAIL, e.message)
        )
      }
    }, 300)
  }
}
export function agreeToConditions (account: AbcAccount) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const context = imports.context
    const callback = imports.callback
    // write to disklet
    // eslint-disable-next-line no-unused-expressions
    async response => {
      await context.io.folder
        .file('acceptTermsAndConditions.json')
        .setText(JSON.stringify({ accepted: true }))
        .catch(e => {
          console.log('error')
          console.log(e)
        })
      return response
    }
    callback(null, account)
    // dispatch(WorkflowActions.nextScreen())
  }
}
