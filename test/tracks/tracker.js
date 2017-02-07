import express from 'express';
import http from 'http';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var expect = chai.expect;
import TrackItStream from '../../server/stream';
import sinon from 'sinon';
import Tracker from '../../server/tracks/tracker';
import TrackService from '../../server/tracks/track-service';
import io from 'socket.io-client';
import fix from '../utils/fix'

describe("Tracker", () => {
  var client = null, server = null, updateStub = null;

  const socketURL = 'http://localhost:' + (process.env.PORT);
  const user = fix.userWithTrackedAccount;
  const options = {
    path: '/stream',
    transports: ['websocket'],
    query: 'auth_token=' + user.auth.authToken,
    'force new connection': true
  }

  const connect = () => {
    return io(socketURL, options)
  }

  beforeEach((done) => {
    server = http.Server(express());
    server = TrackItStream.server(server)

    server.listen(process.env.PORT, () => done());
  })

  afterEach((done) => {
    Tracker.stopTracking()

    client.disconnect()

    updateStub.restore()

    server.close(() => done())
  })

  it('updates tracks and notifies', (done) => {
    const expectedMessage = user.tracks.map((track) => {
      return {_id: track._id.toString(), tracking: track.tracking}
    })

    updateStub = sinon.stub(TrackService, 'updateTracks', () => {
      const userId = user.user._id.toString()
      return Promise.resolve({[userId]: expectedMessage})
    })

    client = connect();

    client.on('connect', () => {
      client.on('tracks/update', (data) => {
        expect(data).to.deep.equal(expectedMessage)
        done();
      })

      Tracker.updateTracks()
    })
  })
})
