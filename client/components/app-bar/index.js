import React from 'react';
import FaPowerOff from 'react-icons/lib/fa/power-off'
import TopBar from '../top-bar';
import User from '../../services/user'

class AppBar extends React.Component {
  logout() {
    User.logout().then(() => {
      window.location.href = '/login'
    })
  }

  render() {
    return (
      <TopBar className={'app-bar white-text'}>
        <div className={'flex-container full-height padded-base start-center'}>
          <div className={'flex-20'}></div>
          <div className={'flex flex-container center-center'}>
            <span className={'main-text app-title alt-font bold-text'}>TrackIt</span>
          </div>
          <div className={'flex-20 flex-container end-center padded-base-right'}>
            <button className={'icon-button'} onClick={this.logout}>
              <FaPowerOff size={18} className={'icon'}/>
            </button>
          </div>
        </div>
      </TopBar>
    )
  }
}

export default AppBar
