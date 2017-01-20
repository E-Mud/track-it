import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';
import Card from '../components/card';

class RegisterPage extends React.Component {
  constructor() {
    super();
  }

  buttonClicked() {
    console.log('CLICKED')
  }

  render() {
    return (
      <div className={'flex-container full-height background center-center'}>
        <Card className={'flex-40'}>
          <input type='email' className={'margin-base-bottom'} placeholder='Email' />
          <input type='password' className={'margin-base-bottom'} placeholder='Password' />
          <input type='password' className={'margin-base-bottom'} placeholder='Confirm Password' />
          <div className={'flex-container padded-large-top button-group end-start'}>
            <button onClick={this.buttonClicked} className={'primary'}>REGISTER</button>
          </div>
        </Card>
      </div>
    );
  }
}

render(<RegisterPage/>, document.getElementById('main-container'));
