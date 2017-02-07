import url from 'url';
import socketIo from 'socket.io';
import Auth from './users/auth';

let io;

class TrackItStream {
  emitToUser(userId, messageHead, message) {
    io.in(userId).emit(messageHead, message)
  }

  notifyUpdatedTracks(userId, updatedTracks) {
    const messageData = updatedTracks.map((track) => {
      return {
        _id: track._id.toString(),
        tracking: track.tracking
      }
    })

    this.emitToUser(userId, 'tracks/update', messageData)
  }

  server(server) {
    io = socketIo(server, {serveClient: false, path: '/stream'})

    io.use((socket, next) => {
      socket.request.query = url.parse(socket.request.url, true).query
      next()
    })

    io.use((socket, next) => {
      const authToken = socket.request.query.auth_token

      if(!authToken){
        next(new Error('authentication_error'))
      }else{
        Auth.getPayload(authToken).then(
          ({user}) => {
            socket.request.user = user
            next()
          },
          () => next(new Error('authentication_error'))
        )
      }
    })

    io.on('connection', (socket) => {
      socket.join(socket.request.user._id)
    })

    return server
  }
}

export default new TrackItStream()
