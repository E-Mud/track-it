import React from 'react';
import {render} from 'react-dom'
import Track from '../services/track.js';
import CreateTrack from '../components/create-track';
import TrackList from '../components/track-list';
import './index.styl';

class MainPage extends React.Component {
  constructor(props) {
    super(props);
  }

  onTrackCreated(trackToCreate, creationPromise) {
    creationPromise.then((newTrack) => {
      this.props.trackList.push(newTrack)
      this.forceUpdate();
    })
  }

  render() {
    const onTrackCreated = this.onTrackCreated.bind(this);

    return (
      <div className={'flex-container full-height background center-start'}>
        <div className={'flex-40'}>
          <CreateTrack onTrackCreated={onTrackCreated} />
          <TrackList className={'margin-large-top'} trackList={this.props.trackList} />
        </div>
      </div>
    );
  }
}

Track.getTracks().then((trackList) => {
  render(<MainPage trackList={trackList}/>, document.getElementById('main-container'));
})
