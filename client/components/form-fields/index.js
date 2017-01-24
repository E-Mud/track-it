import React from 'react';

function FormField(WrappedComponent) {
  return class FormFieldComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: this.getValue()}
    }

    getValue() {
      const name = this.props.name

      return this.props.model[name]
    }

    onChange(event) {
      const name = this.props.name,
        previousValue = this.getValue(),
        value = event.target.value;

      this.props.model[name] = value

      this.setState({value})

      if(this.props.onChange){
        this.props.onChange(value, previousValue, event)
      }
    }

    render() {
      const newProps = Object.assign({}, this.props, {onChange: this.onChange.bind(this)});

      delete newProps.model

      return (
        <WrappedComponent {...newProps}/>
      )
    }
  }
}

export default {
  Input: FormField('input')
}
