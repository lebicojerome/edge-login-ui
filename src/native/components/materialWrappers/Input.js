import React, { Component } from 'react'
import { TextField } from 'react-native-material-textfield'

class Input extends Component {
  /* static defaultProps = {
    secureTextEntry: false
  } */
  render () {
    console.log('test')
    const {
      container,
      baseColor,
      tintColor,
      textColor,
      errorColor,
      titleTextStyle

    } = this.props.style
    return (
      <TextField
        label={this.props.label}
        value={this.props.value}
        onChangeText={this.props.onChangeText}
        error={this.props.error}
        containerStyle={container}
        baseColor={baseColor}
        tintColor={tintColor}
        textColor={textColor}
        errorColor={errorColor}
        titleTextStyle={titleTextStyle}
        secureTextEntry={this.props.secureTextEntry}
        returnKeyType={this.props.returnKeyType}
      />
    )
  }
}

export { Input }
