import React from 'react';

export default class Card extends React.Component {
  constructor() {
    super();
  }

  render() {
    let className = 'card'

    if(this.props.className){
      className += ' ' + this.props.className
    }

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}
