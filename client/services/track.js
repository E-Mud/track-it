import api from './api';

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
  }
}
