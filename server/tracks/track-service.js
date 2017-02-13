import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';
import SocialAccountService from '../social/social-account-service.js';
import TagService from '../tags/tag-service.js';

class TrackService {
  constructor() {
    this.collection = DatabaseConnection.connection().get('tracks');
  }

  createTrack(track) {
    const socialService = SocialAccountService.forTrackUrl(track.url);

    if(!socialService){
      return Promise.reject(new Error('invalid_url'))
    }else{
      const trackToCreate = Object.assign({type: socialService.type()}, track)

      trackToCreate.userId = monk.id(trackToCreate.userId)

      return socialService.buildTrack(track.url).then((track) => {
        return this.collection.findOne({userId: trackToCreate.userId, contentItemId: track.contentItemId}).then((foundTrack) => {
          if(foundTrack){
            throw new Error('already_tracked')
          }

          Object.assign(trackToCreate, track)

          return socialService.getAccountForContentItem(trackToCreate.userId, trackToCreate.contentItem).then((socialAccount) => {
            if(socialAccount){
              trackToCreate.socialAccountId = monk.id(socialAccount._id);
              trackToCreate.author = socialAccount.name

              return this.collection.insert(trackToCreate)
            }else{
              throw new Error('not_found_account')
            }
          })
        })
      }).then((createdTrack) => {
        if(createdTrack.tags && createdTrack.tags.length){
          return TagService.tagTrack(createdTrack, createdTrack.tags).then(() => createdTrack)
        }else{
          return createdTrack
        }
      })
    }
  }

  _getTracks() {
    return this.collection.find()
  }

  getTracksByUserId(userId) {
    return this.collection.find({userId: monk.id(userId)})
  }

  _getUpdatedTracking(tracks, socialAccounts) {
    const promiseArray = [];

    if(!tracks.length){
      return Promise.resolve([]);
    }

    socialAccounts.forEach((account) => {
      const socialService = SocialAccountService.forSocialAccount(account),
        accountTracks = [];

      tracks.forEach((track) => {
        if(track.socialAccountId.toString() === account._id.toString()){
          accountTracks.push(track)
        }
      })

      if(accountTracks.length){
        promiseArray.push(socialService.getUpdatedTracking(accountTracks))
      }
    })

    return Promise.all(promiseArray).then(
      (tracks) => tracks.reduce((acc, trackList) => acc.concat(trackList), [])
    )
  }

  _saveUpdatedTracking(updatedTracks) {
    if(!updatedTracks.length){
      return {}
    }

    const writeOps = updatedTracks.map((track) => {
      return {
        updateOne: {
          filter: {_id: track._id},
          update: {$set: {tracking: track.tracking}}
        }
      }
    })

    return this.collection.bulkWrite(writeOps).then(() => {
      return updatedTracks.reduce((acc, track) => {
        const userId = track.userId.toString();

        if(!acc[userId]){
          acc[userId] = []
        }

        acc[userId].push(track)

        return acc
      }, {})
    })
  }

  updateTracks() {
    return Promise.all([
      this._getTracks(),
      SocialAccountService.getCompleteAccounts()
    ])
    .then((result) => this._getUpdatedTracking(result[0], result[1]))
    .then((tracks) => this._saveUpdatedTracking(tracks))
  }
}

export default new TrackService()
