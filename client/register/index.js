import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import Card from '../components/card';
import User from '../services/user';
import AlertDialog from '../components/alert-dialog';

const errorStrings = {
  'used_username': 'The specified username is alredy used'
}

class RegisterPage extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      registerDisabled: true
    }
  }

  buttonClicked() {
    this.setState({registerDisabled: true})
    User.registerUser({
      username: this.state.username,
      password: this.state.password
    }).then(() => {
      this.setState({registerDisabled: false})

      AlertDialog.show({
        msg: 'User created succesfully'
      }).then(() => window.location.href = '/login')
    }, ({data}) => {
      this.setState({registerDisabled: false})

      AlertDialog.show({
        msg: errorStrings[data.msg]
      })
    })
  }

  valueChanged(event) {
    this.state[event.target.name] = event.target.value

    this.state.registerDisabled = !this.state.username || !this.state.password || this.state.password !== this.state.confirmPassword

    this.setState(this.state)
  }

  render() {
    let registerButtonDisabled = this.state.registerDisabled ? 'disabled' : '';
    let valueChanged = this.valueChanged.bind(this);
    return (
      <div className={'flex-container full-height background center-center'}>
        <Card className={'flex-25 padded-base'}>
          <div className={'padded-base'}>
            <input
              type='email'
              value={this.state.username}
              onChange={valueChanged}
              name={'username'}
              placeholder='Email' />
          </div>
          <div className={'padded-base'}>
            <input
              type='password'
              value={this.state.password}
              onChange={valueChanged}
              name={'password'}
              placeholder='Password' />
          </div>
          <div className={'padded-base'}>
            <input
              type='password'
              value={this.state.confirmPassword}
              onChange={valueChanged}
              name={'confirmPassword'}
              placeholder='Confirm Password' />
          </div>
          <div className={'flex-container padded-large-top button-group end-start'}>
            <button onClick={this.buttonClicked.bind(this)} className={'full-raised primary'} disabled={registerButtonDisabled}>REGISTER</button>
          </div>
        </Card>
      </div>
    );
  }
}

render(<RegisterPage/>, document.getElementById('main-container'));
