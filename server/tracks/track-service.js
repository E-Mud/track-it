import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';

const collection = DatabaseConnection.connection().get('tracks');

const TYPE = {
  TWITTER: 'twitter'
}

const typeForUrl = (url) => {
  return TYPE.TWITTER
}

export default {
  TYPE,

  createTrack: (track) => {
    const trackToCreate = Object.assign({type: typeForUrl(track.url)}, track)

    trackToCreate.userId = monk.id(trackToCreate.userId)

    return collection.insert(trackToCreate)
  },

  getTracksByUserId: (userId) => {
    return collection.find({userId: monk.id(userId)})
  }
}
