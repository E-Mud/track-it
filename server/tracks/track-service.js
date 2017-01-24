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
    return collection.insert(trackToCreate)
  }
}
