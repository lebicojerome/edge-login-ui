import React from 'react'

import recoveryIcon from '../../../img/modals/recovery-modal-MW.png'
import Modal from '../BaseModal.js'
import styles from './ForgotPassword.mobileStyle.scss'

export default ({ view, close }) => (
  <Modal active={view} close={close} icon={recoveryIcon}>
    <p className={styles.header}>Password Recovery</p>
    <p className={styles.text}>
      If recovery was setup, you should have emailed yourself a recovery token
      with a link. To recover your account, install the Edge Mobile App on iOS
      or Android at: <br />
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://airbitz.co/app"
        className={styles.linked}
      >
        https://edgesecure.co/
      </a>
    </p>
    <br />
    <p className={styles.text}>
      Then click one of the links in the recovery email from a device with Edge
      installed.
    </p>
    <button className={styles.close} onClick={close}>
      Ok
    </button>
  </Modal>
)
