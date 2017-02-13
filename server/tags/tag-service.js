import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';

class TagService {
  constructor() {
    this.collection = DatabaseConnection.connection().get('tags')
  }

  getAllTags(userId) {
    return this.collection.find({userId: monk.id(userId)})
  }

  updateTags(tags) {
    const writeOps = tags.map((tag) => {
      return {
        updateOne: {
          filter: {_id: tag._id},
          update: {$set: {tracking: tag.tracking}}
        }
      }
    })

    return this.collection.bulkWrite(writeOps).then(() => {
      return tags.reduce((acc, tag) => {
        const userId = tag.userId.toString();

        if(!acc[userId]){
          acc[userId] = []
        }

        acc[userId].push(tag)

        return acc
      }, {})
    })
  }

  tagTrack(track, tags) {
    const userId = monk.id(track.userId.toString());
    const writeOps = tags.map((tag) => {
      return {
        updateOne: {
          filter: {name: tag, userId},
          update: {
            $set: {name: tag, userId},
            $inc: {tracksCount: 1, 'tracking.retweets': track.tracking.retweets, 'tracking.favorites': track.tracking.favorites}
          },
          upsert: true
        }
      }
    })

    return this.collection.bulkWrite(writeOps)
  }
}

export default new TagService()
