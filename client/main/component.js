import React from 'react';
import API from '../services/api';
import Track from '../services/track';
import Tag from '../services/tag'
import SocialAccount from '../services/social-account';
import CreateTrack from '../components/create-track';
import TrackList from '../components/track-list';
import SectionHeader from '../components/section-header';
import SocialAccountsCard from '../components/social-accounts-card';
import AppBar from '../components/app-bar';
import Icons from '../components/icons';
import TagListCard from '../components/tag-list-card';

class MainPageState {
  constructor(trackList, socialAccounts, tagList){
    this.trackList = trackList || []
    this.socialAccounts = socialAccounts || []
    this.tagList = tagList || []
  }

  addTrack(track){
    this.trackList.push(track)
  }

  updateTracks(tracks){
    this.trackList.forEach((track) => {
      const updatedTrack = tracks.find((tr) => tr._id === track._id)

      if(updatedTrack){
        track.tracking = updatedTrack.tracking
      }
    })
  }

  updateTags(tags){
    this.tagList.forEach((tag) => {
      const updatedTag = tags.find((tg) => tg._id === tag._id)

      if(updatedTag){
        if(updatedTag.tracksCount){
          tag.tracksCount = updatedTag.tracksCount
        }
        tag.tracking = updatedTag.tracking
      }
    })
  }
}

class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.mainPageState = new MainPageState(this.props.trackList, this.props.socialAccounts, this.props.tagList)

    API.setAuthToken(this.props.authToken)
  }

  connectToUpdateStream() {
    Track.connectToUpdateStream((update) => {
      this.mainPageState.updateTracks(update.tracks)
      this.mainPageState.updateTags(update.tags)

      this.forceUpdate()
    })
  }

  onTrackCreated(trackToCreate, creationPromise) {
    creationPromise.then((newTrack) => {
      this.mainPageState.addTrack(newTrack)

      return Tag.getTags().then((tagList) => this.mainPageState.updateTags(tagList))
    }).then(() => this.forceUpdate())
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

  buildTagSection(tagList) {
    if(tagList && tagList.length){
      return <TagListCard tagList={tagList} />
    }else{
      return <div className={'hint-text text-aligned-center'}>
        You have no tags. Try adding some when creating a track
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
              <SectionHeader className={'margin-base-bottom'}>
                <Icons.SocialAccount className={'margin-small-right'} />
                Social Accounts
              </SectionHeader>
              <SocialAccountsCard socialAccounts={this.props.socialAccounts} />
              <SectionHeader className={'margin-base-bottom margin-large-top'}>
                <Icons.Tag className={'margin-small-right'} />
                Tags
              </SectionHeader>
              {this.buildTagSection(this.props.tagList)}
            </div>
            <div className={'flex-50 padded-base padded-large-left'}>
              <SectionHeader className={'margin-base-bottom'}>
                <Icons.Track className={'margin-small-right'} />
                Tracks
              </SectionHeader>
              {this.buildTrackSection(this.props.socialAccounts, this.props.trackList)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPage
