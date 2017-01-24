import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import Card from '../components/card';
import User from '../services/user';
import AlertDialog from '../components/alert-dialog';
import FormFields from '../components/form-fields';

const errorStrings = {
  'used_username': 'The specified username is alredy used'
}

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

  buttonClicked() {
    this.setState({loginDisabled: true})
    User.login({
      username: this.state.user.username,
      password: this.state.user.password
    }).then(() => {
      this.setState({loginDisabled: false})
    }, ({data}) => {
      this.setState({loginDisabled: false})
    })
  }

  valueChanged() {
    this.state.loginDisabled = !this.state.user.username || !this.state.user.password

    this.setState(this.state)
  }

  render() {
    let loginButtonDisabled = this.state.loginDisabled ? 'disabled' : '';
    let valueChanged = this.valueChanged.bind(this);
    return (
      <div className={'flex-container full-height background center-center'}>
        <Card className={'flex-25 padded-base'}>
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
          <div className={'flex-container padded-large-top button-group end-start'}>
            <button onClick={this.buttonClicked.bind(this)} className={'full-raised primary'} disabled={loginButtonDisabled}>SIGN IN</button>
          </div>
        </Card>
      </div>
    );
  }
}

render(<LoginPage/>, document.getElementById('main-container'));
