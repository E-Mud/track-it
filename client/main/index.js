import React from 'react';
import {render} from 'react-dom'
import Track from '../services/track';
import SocialAccount from '../services/social-account';
import CreateTrack from '../components/create-track';
import TrackList from '../components/track-list';
import SocialAccountsCard from '../components/social-accounts-card';
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
        <div className={'flex-70 flex-container'}>
          <div className={'flex-50 padded-base'}>
            <SocialAccountsCard socialAccounts={this.props.socialAccounts} />
          </div>
          <div className={'flex-50 padded-base'}>
            <CreateTrack onTrackCreated={onTrackCreated} />
            <TrackList className={'margin-large-top'} trackList={this.props.trackList} />
          </div>
        </div>
      </div>
    );
  }
}

Promise.all([
  Track.getTracks(),
  SocialAccount.getAccounts()
]).then((result) => {
  const trackList = result[0],
    accounts = result[1];

  render(<MainPage trackList={trackList} socialAccounts={accounts}/>, document.getElementById('main-container'));
})
