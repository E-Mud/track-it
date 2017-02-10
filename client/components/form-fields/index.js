import React from 'react';

function FormField(WrappedComponent) {
  return class FormFieldComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: this.value}
    }

    componentWillReceiveProps(nextProps) {
      if(this.state.value !== this.getValue(nextProps)){
        this.setState({value: this.getValue(nextProps)})
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.value !== this.getValue(nextProps) || this.state.value !== nextState.value
    }

    getValue(props) {
      return props.model[props.name]
    }

    get value() {
      return this.getValue(this.props)
    }

    onChange(event) {
      const name = this.props.name,
        previousValue = this.value,
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
        <WrappedComponent value={this.state.value} {...newProps}/>
      )
    }
  }
}

export default {
  Input: FormField('input')
}
