import React from 'react';
import FaRetweet from 'react-icons/lib/fa/retweet'
import FaHeart from 'react-icons/lib/fa/heart'

class Tracking extends React.Component {
  render() {
    const track = this.props.track;

    return (
      <div className={'flex-container start-center'}>
        <div className={'primary-text margin-base-right'}>
          <FaRetweet size={18} className={'icon'}/>
          <span className={'margin-small-left'}>{track.tracking.retweets}</span>
        </div>
        <div className={'primary-text'}>
          <FaHeart size={18} className={'icon'}/>
          <span className={'margin-small-left'}>{track.tracking.retweets}</span>
        </div>
      </div>
    )
  }
}

export default Tracking
