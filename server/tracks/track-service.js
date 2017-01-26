import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';
import SocialAccountService from '../social/social-account-service.js';

const collection = DatabaseConnection.connection().get('tracks');

const typeForUrl = (url) => {
  return SocialAccountService.TYPE.TWITTER
}

export default {
  createTrack: (track) => {
    const trackToCreate = Object.assign({type: typeForUrl(track.url)}, track)

    trackToCreate.userId = monk.id(trackToCreate.userId)

    return collection.insert(trackToCreate)
  },

  getTracksByUserId: (userId) => {
    return collection.find({userId: monk.id(userId)})
  }
}
