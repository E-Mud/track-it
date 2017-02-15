import DatabaseConnection from '../../server/db/database-connection';
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
import fix from '../utils/fix';
import _ from 'lodash';

describe("Tracker", () => {
  var client = null, server = null, updateTracksStub = null, tagCollection = null;

  const socketURL = 'http://localhost:' + (process.env.PORT);
  const user = fix.userWithTrackedAccount;
  const options = {
    path: '/stream',
    transports: ['websocket'],
    query: 'auth_token=' + user.auth.authToken,
    'force new connection': true
  }

  const tracksMessage = user.tracks.map((track) => {
    return Object.assign({}, track, {tracking: {retweets: track.tracking.retweets + 10, favorites: track.tracking.favorites + 10}})
  }), expectedTagsMessage = user.tags.map((tag) => {
    return {
      name: tag.name,
      tracking: {
        retweets: tag.tracking.retweets + tag.tracksCount * 10,
        favorites: tag.tracking.favorites + tag.tracksCount * 10
      }
    }
  })

  const connect = () => {
    return io(socketURL, options)
  }

  beforeEach((done) => {
    server = http.Server(express());
    server = TrackItStream.server(server)

    tagCollection = DatabaseConnection.connection().get('tags')

    updateTracksStub = sinon.stub(TrackService, 'updateTracks', () => {
      return Promise.resolve(tracksMessage)
    })

    fix.clean()
      .then(() => fix.insertFixtures(user))
      .then(() => server.listen(process.env.PORT, () => done()))
  })

  afterEach((done) => {
    Tracker.stopTracking()

    client.disconnect()

    updateTracksStub.restore()

    server.close(() => done())
  })

  it('updates tracks and notifies', (done) => {
    const expectedTracksMessage = tracksMessage.map((track) => {
      return {
        _id: track._id.toString(),
        tracking: track.tracking
      }
    })

    client = connect();

    client.on('connect', () => {
      client.on('tracking/update', (data) => {
        expect(data.tracks).to.deep.equal(expectedTracksMessage)
        done();
      })

      Tracker.updateTracks()
    })
  })

  it('notifies updated tags', (done) => {
    client = connect();

    client.on('connect', () => {
      client.on('tracking/update', (data) => {
        expect(data.tags).to.deep.equal(expectedTagsMessage)
        done();
      })

      Tracker.updateTracks()
    })
  })

  it('updates tags', (done) => {
    client = connect();

    client.on('connect', () => {
      client.on('tracking/update', (data) => {
        tagCollection.find({}, 'name tracking -_id').then((tags) => {
          expect(tags).to.deep.equal(expectedTagsMessage)
          done();
        })
      })

      Tracker.updateTracks()
    })
  })
})
