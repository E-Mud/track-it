import cron from 'node-cron';
import TrackItStream from '../stream'
import TrackService from './track-service'

let task = null;

class Tracker {
  updateTracks() {
    TrackService.updateTracks().then((mappedUpdatedTracks) => {
      for(let userId in mappedUpdatedTracks){
        const updatedTracks = mappedUpdatedTracks[userId]
        TrackItStream.notifyUpdatedTracks(userId, updatedTracks)
      }
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
