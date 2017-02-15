import express from 'express';
import http from 'http';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var expect = chai.expect;
import TrackItStream from '../server/stream';
import sinon from 'sinon';
import io from 'socket.io-client';
import fix from './utils/fix'

describe("TrackIt Stream", () => {
  var client = null, client2 = null, server = null;

  const socketURL = 'http://localhost:' + (process.env.PORT);
  const user = fix.newUser;
  const baseOptions = {
    path: '/stream',
    transports: ['websocket'],
    'force new connection': true
  }

  const connect = (user) => {
    const options = Object.assign({query: 'auth_token=' + user.auth.authToken}, baseOptions);

    return io(socketURL, options)
  }

  beforeEach((done) => {
    server = http.Server(express());
    server = TrackItStream.server(server)

    server.listen(process.env.PORT, () => done());
  })

  afterEach((done) => {
    client.disconnect()

    if(client2){
      client2.disconnect()
    }

    server.close(() => done())
  })

  it('fails if no auth token', (done) => {
    const options = Object.assign({}, baseOptions)

    client = io(socketURL, options);

    client.on('error', (data) => {
      expect(data).to.equal('authentication_error')
      done();
    })
  })

  it('fails if invalid auth token', (done) => {
    const options = Object.assign({query: 'auth_token=123'}, baseOptions)

    client = io(socketURL, options);

    client.on('error', (data) => {
      expect(data).to.equal('authentication_error')
      done();
    })
  })

  it('emits custom event', (done) => {
    const expectedMessage = {msg: 'HI'}

    client = connect(user);

    client.on('connect', () => {
      TrackItStream.emitToUser(user.user._id.toString(), 'custom_event', expectedMessage)

      client.on('custom_event', (data) => {
        expect(data).to.deep.equal(expectedMessage)

        done();
      })
    })
  })

  it('emits custom event to specific user', (done) => {
    const expectedMessage = {msg: 'HI'}

    client = connect(user);

    client.on('connect', () => {
      client2 = connect(fix.userWithAccount)

      client2.on('connect', () => {
        const client2callback = sinon.spy()

        client2.on('custom_event', client2callback)

        client.on('custom_event', (data) => {
          setTimeout(() => {
            expect(client2callback.called).to.be.false

            done();
          }, 200)
        })

        TrackItStream.emitToUser(user.user._id.toString(), 'custom_event', expectedMessage)
      })
    })
  })

  it('notifies updated tracks', (done) => {
    const user = fix.userWithTrackedAccount;
    const expectedMessage = {
      tracks: user.tracks.map((track) => {
        return {_id: track._id.toString(), tracking: track.tracking}
      })
    }

    client = connect(user);

    client.on('connect', () => {
      client.on('tracking/update', (data) => {
        expect(data).to.deep.equal(expectedMessage)
        done();
      })

      TrackItStream.notifyUpdatedTracks(user.user._id.toString(), {tracks: user.tracks})
    })
  })
})
