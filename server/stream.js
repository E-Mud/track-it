import url from 'url';
import socketIo from 'socket.io';
import Auth from './users/auth';

let io;

class TrackItStream {
  emitToUser(userId, messageHead, message) {
    io.in(userId).emit(messageHead, message)
  }

  notifyUpdatedTracks(userId, notification) {
    notification.tracks = notification.tracks.map((track) => {
      return {
        _id: track._id.toString(),
        tracking: track.tracking
      }
    })
    if(notification.tags){
      notification.tags = notification.tags.map((tag) => {
        return {
          name: tag.name,
          tracking: tag.tracking
        }
      })      
    }

    this.emitToUser(userId, 'tracking/update', notification)
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
