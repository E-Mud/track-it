import React from 'react';

class Divider extends React.Component {
  render() {
    const directionClass = this.props.direction === 'vertical' ? 'vertical' : 'horizontal';

    return (
      <div className={'divider ' + directionClass}></div>
    )
  }
}

export default Divider;
