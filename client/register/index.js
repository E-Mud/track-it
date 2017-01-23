import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import Card from '../components/card';
import User from '../services/user';

class RegisterPage extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      registerDisabled: false
    }
  }

  buttonClicked() {
    this.setState({registerDisabled: true})
    User.registerUser({
      username: this.state.username,
      password: this.state.password
    }).finally(() => {
      this.setState({registerDisabled: false})
    })
  }

  valueChanged(event) {
    this.state[event.target.name] = event.target.value

    this.setState(this.state)
  }

  render() {
    let registerButtonDisabled = this.state.registerDisabled ? 'disabled' : '';
    let valueChanged = this.valueChanged.bind(this);
    return (
      <div className={'flex-container full-height background center-center'}>
        <Card className={'flex-40'}>
          <input
            type='email'
            value={this.state.username}
            onChange={valueChanged}
            name={'username'}
            className={'margin-base-bottom'}
            placeholder='Email' />
          <input
            type='password'
            value={this.state.password}
            onChange={valueChanged}
            name={'password'}
            className={'margin-base-bottom'}
            placeholder='Password' />
          <input
            type='password'
            value={this.state.confirmPassword}
            onChange={valueChanged}
            name={'confirmPassword'}
            className={'margin-base-bottom'}
            placeholder='Confirm Password' />
          <div className={'flex-container padded-large-top button-group end-start'}>
            <button onClick={this.buttonClicked.bind(this)} className={'primary'} disabled={registerButtonDisabled}>REGISTER</button>
          </div>
        </Card>
      </div>
    );
  }
}

render(<RegisterPage/>, document.getElementById('main-container'));
