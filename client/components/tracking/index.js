import React from 'react'
import Icons from '../icons'

class Tracking extends React.Component {
  render() {
    const track = this.props.track;

    let tracksCount;

    if(track.tracksCount || track.tracksCount === 0){
      tracksCount = <div className={'primary-text margin-large-right'}>
        <Icons.Track/>
        <span className={'margin-small-left'}>{track.tracksCount}</span>
      </div>
    }else{
      tracksCount = null
    }

    return (
      <div className={'flex-container start-center'}>
        {tracksCount}
        <div className={'primary-text margin-base-right'}>
          <Icons.Retweet/>
          <span className={'margin-small-left'}>{track.tracking.retweets}</span>
        </div>
        <div className={'primary-text'}>
          <Icons.Favorite/>
          <span className={'margin-small-left'}>{track.tracking.retweets}</span>
        </div>
      </div>
    )
  }
}

export default Tracking
