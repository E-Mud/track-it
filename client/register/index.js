import React from 'react';
import {render} from 'react-dom';
import css from './index.styl';

class RegisterPage extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className={'flex-container full-height center-center'}>
        <div className={'flex-20'}>
          Hello!
        </div>
      </div>
    );
  }
}

render(<RegisterPage/>, document.getElementById('main-container'));
