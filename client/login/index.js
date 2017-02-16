import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import User from '../services/user';
import Card from '../components/card';
import AlertDialog from '../components/alert-dialog';
import FormFields from '../components/form-fields';

const errorStrings = {
  default: 'Incorrect username or password'
}

const ErrorDialog = AlertDialog.errorDialog(errorStrings)

class LoginPage extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {
        username: '',
        password: ''
      },
      loginDisabled: true
    }
  }

  canLogin() {
    return this.state.user.username && this.state.user.password
  }

  login() {
    if(this.canLogin()){
      this.setState({loginDisabled: true})
      User.login({
        username: this.state.user.username,
        password: this.state.user.password
      }).then(() => {
        window.location.href = '/'
      }, (res) => {
        this.setState({loginDisabled: false})

        ErrorDialog.showRejectedHttpPromise(res)
      })
    }
  }

  valueChanged() {
    this.state.loginDisabled = !this.canLogin()

    this.setState(this.state)
  }

  onKeyUp(e) {
    if(e.key === 'Enter'){
      this.login()
    }
  }

  render() {
    let loginButtonDisabled = this.state.loginDisabled ? 'disabled' : '';
    let valueChanged = this.valueChanged.bind(this);
    let onKeyUp = this.onKeyUp.bind(this);

    return (
      <div className={'flex-container full-height center-center'} onKeyUp={onKeyUp}>
        <div className={'flex-25 main-content'}>
          <div className={'margin-base-bottom xl-text white-text main-text text-aligned-center alt-font bold-text'}>TrackIt</div>
          <Card className={'padded-base'}>
            <div className={'padded-base'}>
              <FormFields.Input
                type='email'
                model={this.state.user}
                onChange={valueChanged}
                name={'username'}
                placeholder='Email' />
            </div>
            <div className={'padded-base'}>
              <FormFields.Input
                type={'password'}
                model={this.state.user}
                onChange={valueChanged}
                name={'password'}
                placeholder='Password' />
            </div>
            <div className={'flex-container padded-large-top button-group start-end'}>
              <a href={'/register'} className={'margin-base-horizontal sm-text'}>Not a member yet?</a>
              <span className={'flex'} />
              <button onClick={this.login.bind(this)} className={'full-raised primary'} disabled={loginButtonDisabled}>SIGN IN</button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

render(<LoginPage/>, document.getElementById('main-container'));
