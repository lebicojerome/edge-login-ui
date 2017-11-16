import React, { Component } from 'react'
import { View, Text, TextInput, TouchableWithoutFeedback } from 'react-native'
import { Spinner } from '../common'
import * as Constants from '../../../common/constants'

/* type Props = {
  style: any,
  autoLogIn: boolean
} */

class FourDigitInputComponent extends Component {

  componentWillMount () {
    this.setState({
      autoFocus: true,
      touchId: false
    })
    this.loadedInput = (ref) => {
      if (ref) {
        this.inputRef = ref
        this.inputRef.focus()
      }
    }
  }
  componentDidMount () {
    if (this.inputRef) {
      this.inputRef.focus()
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.isLogginginWithPin) {
      this.setState({
        touchId: true
      })
    }
  }
  render () {
    const Style = this.props.style
    return (
      <TouchableWithoutFeedback onPress={this.refocus.bind(this)}>
        <View style={Style.container}>
          <View style={Style.interactiveContainer}>
            {this.renderDotContainer(Style)}
            <TextInput
              ref={this.loadedInput}
              style={Style.input}
              onChangeText={this.updatePin.bind(this)}
              maxLength={4}
              keyboardType='numeric'
              value={this.props.pin}
              onFocus={this.onFocus.bind(this)}
              onBlur={this.onBlur.bind(this)}
              autoFocus
            />
          </View>
          <View style={Style.errorContainer}>
            <Text style={Style.errorText}>{this.props.error}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  onFocus () {
    this.setState({
      isFocused: true
    })
  }
  onBlur () {
    this.setState({
      isFocused: false
    })
  }
  refocus () {
    this.setState({
      autoFocus: true,
      isFocused: false
    })
  }
  renderCircleTest (style) {
    if (this.state.isFocused) {
      return {...style, borderColor: Constants.ACCENT_RED}
    }
    return style
  }
  renderDotContainer (style) {
    const pinLength = this.props.pin ? this.props.pin.length : 0
    if ((pinLength === 4 || this.state.touchId) && this.props.autoLogIn) {
      return <Spinner />
    }
    /* return (
      <View style={style.dotContainer}>
        <View style={[style.circle, pinLength > 0 && style.circleSected]} />
        <View style={[style.circle, pinLength > 1 && style.circleSected]} />
        <View style={[style.circle, pinLength > 2 && style.circleSected]} />
        <View style={[style.circle, pinLength > 3 && style.circleSected]} />
      </View>
    ) */
    return (
      <View style={style.dotContainer}>
        <View style={[this.renderCircleTest(style.circle), pinLength > 0 && style.circleSected]} />
        <View style={[this.renderCircleTest(style.circle), pinLength > 1 && style.circleSected]} />
        <View style={[this.renderCircleTest(style.circle), pinLength > 2 && style.circleSected]} />
        <View style={[this.renderCircleTest(style.circle), pinLength > 3 && style.circleSected]} />
      </View>
    )
  }
  updatePin (arg) {
    this.props.onChangeText({ username: this.props.username, pin: arg })
  }
}

export { FourDigitInputComponent }
