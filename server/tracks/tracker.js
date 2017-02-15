import cron from 'node-cron';
import TrackItStream from '../stream'
import TrackService from './track-service'
import TagService from '../tags/tag-service'
import _ from 'lodash';

let task = null;

class Tracker {
  _getUpdatedTags(tracks) {
    const tags = {}, allTags = [];

    tracks.forEach((track) => {
      const userId = track.userId.toString()

      if(track.tags && track.tags.length){
        track.tags.forEach((tagName) => {
          const fullTagName = userId + ':' + tagName

          if(!tags[fullTagName]){
            tags[fullTagName] = {name: tagName, userId, tracking: {retweets: 0, favorites: 0}}
            allTags.push(tags[fullTagName])
          }

          tags[fullTagName].tracking.retweets += track.tracking.retweets
          tags[fullTagName].tracking.favorites += track.tracking.favorites
        })
      }
    })

    return TagService.updateTags(allTags).then(() => allTags)
  }

  updateTracks() {
    TrackService.updateTracks().then((tracks) => {
      this._getUpdatedTags(tracks).then((tags) => {
        const mappedTracks = _.groupBy(tracks, (track) => track.userId.toString()),
          mappedTags = _.groupBy(tags, (tag) => tag.userId.toString());

        _.forEach(mappedTracks, (trackList, userId) => {
          const notification = {
            tracks: trackList,
            tags: mappedTags[userId] || []
          }

          TrackItStream.notifyUpdatedTracks(userId, notification)
        })
      })
    })
  }

  startTracking() {
    if(task){
      task.destroy()
    }

    task = cron.schedule('*/5 * * * *', () => {
      this.updateTracks()
    })
  }

  stopTracking() {
    if(task){
      task.destroy()
      task = null
    }
  }
}

export default new Tracker()
