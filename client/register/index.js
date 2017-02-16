import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import Card from '../components/card';
import User from '../services/user';
import AlertDialog from '../components/alert-dialog';
import FormFields from '../components/form-fields';

const errorStrings = {
  'used_username': 'The specified username is already used'
}

const ErrorDialog = AlertDialog.errorDialog(errorStrings)

class RegisterPage extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      registerDisabled: true
    }
  }

  get user() {
    return this.state.user
  }

  canRegister() {
    return this.user.username && this.user.password && this.user.password === this.user.confirmPassword
  }

  register() {
    if(this.canRegister()){
      this.setState({registerDisabled: true})
      User.registerUser({
        username: this.user.username,
        password: this.user.password
      }).then(() => {
        this.setState({registerDisabled: false})

        AlertDialog.show({
          msg: 'User created succesfully'
        }).then(() => window.location.href = '/login')
      }, (res) => {
        this.setState({registerDisabled: false})

        ErrorDialog.showRejectedHttpPromise(res)
      })
    }
  }

  valueChanged() {
    this.state.registerDisabled = !this.canRegister()

    this.setState(this.state)
  }

  onKeyUp(e) {
    if(e.key === 'Enter'){
      this.register()
    }
  }

  render() {
    let registerButtonDisabled = this.state.registerDisabled ? 'disabled' : '';
    let valueChanged = this.valueChanged.bind(this);
    let onKeyUp = this.onKeyUp.bind(this)

    return (
      <div className={'flex-container full-height center-center'} onKeyUp={onKeyUp}>
        <div className={'flex-25 main-content'}>
          <div className={'margin-base-bottom xl-text white-text main-text text-aligned-center alt-font bold-text'}>TrackIt</div>
          <Card className={'padded-base'}>
            <div className={'padded-base'}>
              <FormFields.Input
                type='email'
                model={this.user}
                onChange={valueChanged}
                name={'username'}
                placeholder='Email' />
            </div>
            <div className={'padded-base'}>
              <FormFields.Input
                type='password'
                model={this.user}
                onChange={valueChanged}
                name={'password'}
                placeholder='Password' />
            </div>
            <div className={'padded-base'}>
              <FormFields.Input
                type='password'
                model={this.user}
                onChange={valueChanged}
                name={'confirmPassword'}
                placeholder='Confirm Password' />
            </div>
            <div className={'flex-container padded-large-top button-group start-end'}>
              <a href={'/login'} className={'margin-base-horizontal sm-text'}>Already a member?</a>
              <span className={'flex'} />
              <button onClick={this.register.bind(this)} className={'full-raised primary'} disabled={registerButtonDisabled}>REGISTER</button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

render(<RegisterPage/>, document.getElementById('main-container'));
