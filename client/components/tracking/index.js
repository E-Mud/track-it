import React from 'react';
import FaRetweet from 'react-icons/lib/fa/retweet'
import FaHeart from 'react-icons/lib/fa/heart'
import MdLink from 'react-icons/lib/md/link'

class Tracking extends React.Component {
  render() {
    const track = this.props.track;

    let tracksCount;

    if(track.tracksCount || track.tracksCount === 0){
      tracksCount = <div className={'primary-text margin-base-right'}>
        <MdLink size={18} className={'icon'}/>
        <span className={'margin-small-left'}>{track.tracksCount}</span>
      </div>
    }else{
      tracksCount = null
    }

    return (
      <div className={'flex-container start-center'}>
        {tracksCount}
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
