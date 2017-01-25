import React from 'react';

class Track extends React.Component {
  render() {
    return (
      <div className={'track-comp'}>
        {this.props.track.url}
      </div>
    )
  }
}

export default Track;
