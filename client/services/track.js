import api from './api';
import io from 'socket.io-client';

let connectStream = null

export default {
  getTracks: () => {
    return api.get('tracks').then((res) => {
      return res.data
    })
  },
  createTrack: (newTrack) => {
    return api.post('tracks', newTrack).then((res) => {
      return res.data
    })
  },

  connectToUpdateStream: (callback) => {
    const options = {
      transports: ['websocket'],
      path: '/stream',
      query: 'auth_token=' + api.getAuthToken()
    }

    connectStream = io(window.location.hostname + ':' + window.location.port, options)

    connectStream.on('connect', () => {
      connectStream.on('tracking/update', callback)
    })
  }
}
