import React from 'react'
import ReactDOM from 'react-dom'
import MainPage from './component'

document.addEventListener( "DOMContentLoaded", () => {
  const mountedComponent = ReactDOM.render(<MainPage {...window.props} />, document.getElementById('main-container'), () => {
    delete window.props
  });
  mountedComponent.connectToUpdateStream()

}, false )
