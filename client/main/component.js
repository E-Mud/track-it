import React from 'react';
import Track from '../services/track';
import API from '../services/api';
import SocialAccount from '../services/social-account';
import CreateTrack from '../components/create-track';
import TrackList from '../components/track-list';
import SectionHeader from '../components/section-header';
import SocialAccountsCard from '../components/social-accounts-card';
import AppBar from '../components/app-bar';
import Tag from '../components/tag';

class MainPage extends React.Component {
  constructor(props) {
    super(props);

    API.setAuthToken(this.props.authToken)
  }

  connectToUpdateStream() {
    Track.connectToUpdateStream((update) => {
      this.props.trackList.forEach((track) => {
        const updatedTrack = update.tracks.find((tr) => tr._id === track._id)

        if(updatedTrack){
          track.tracking = updatedTrack.tracking
        }
      })

      this.forceUpdate()
    })
  }

  onTrackCreated(trackToCreate, creationPromise) {
    creationPromise.then((newTrack) => {
      this.props.trackList.push(newTrack)
      this.forceUpdate();
    })
  }

  buildTrackSection(socialAccounts, trackList) {
    if(socialAccounts && socialAccounts.length){
      const onTrackCreated = this.onTrackCreated.bind(this);

      return <div>
        <CreateTrack onTrackCreated={onTrackCreated} />
        <TrackList className={'margin-large-top'} trackList={trackList} />
      </div>
    }else{
      return <div className={'hint-text text-aligned-center'}>
        You cannot track any content until you add a social account
      </div>
    }
  }

  render() {
    return (
      <div className={'flex-container column full-height background'}>
        <AppBar />
        <div className={'scrollable flex-container padded-base-top center-start'}>
          <div className={'flex-70 flex-container'}>
            <div className={'flex-50 padded-base padded-large-right'}>
              <SectionHeader className={'margin-base-bottom'} header={'Accounts'} />
              <SocialAccountsCard socialAccounts={this.props.socialAccounts} />
              <SectionHeader className={'margin-base-bottom margin-large-top'} header={'Tags'} />
            </div>
            <div className={'flex-50 padded-base padded-large-left'}>
              <SectionHeader className={'margin-base-bottom'} header={'Tracks'} />
              {this.buildTrackSection(this.props.socialAccounts, this.props.trackList)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPage
