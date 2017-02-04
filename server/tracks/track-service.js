import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';
import SocialAccountService from '../social/social-account-service.js';

const collection = DatabaseConnection.connection().get('tracks');

export default {
  createTrack: (track) => {
    const socialService = SocialAccountService.forTrackUrl(track.url);

    if(!socialService){
      return Promise.reject(new Error('invalid_url'))
    }else{
      const trackToCreate = Object.assign({type: socialService.type()}, track)

      trackToCreate.userId = monk.id(trackToCreate.userId)

      return socialService.buildTrack(track.url).then((track) => {
        Object.assign(trackToCreate, track)

        return socialService.getAccountForContentItem(trackToCreate.userId, trackToCreate.contentItem).then((socialAccount) => {
          if(socialAccount){
            trackToCreate.socialAccountId = monk.id(socialAccount._id);
            trackToCreate.author = socialAccount.name

            return collection.insert(trackToCreate)
          }else{
            throw new Error('not_found_account')
          }
        })
      })
    }
  },

  getTracksByUserId: (userId) => {
    return collection.find({userId: monk.id(userId)})
  }
}
