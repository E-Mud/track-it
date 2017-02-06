import cron from 'node-cron';
import TrackService from './track-service'

export default {
  startTracking: () => {
    cron.schedule('*/2 * * * *', () => {
      TrackService.updateTracks()
    })
  }
}
