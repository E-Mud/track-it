import React from 'react';

class TopBar extends React.Component {
  className() {
    return 'top-bar ' + (this.props.className || '')
  }

  render() {
    return (
      <div className={this.className()}>
        {this.props.children}
      </div>
    )
  }
}

export default TopBar
