import DatabaseConnection from '../../server/db/database-connection';
import TrackService from '../../server/tracks/track-service';
import monk from 'monk';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var should = chai.should();
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('TrackService', () => {
  const user = {_id: monk.id('f23456789012345678901234'), username: 'username'},
    otherUser = {_id: monk.id('f23456789012345678901233'), username: 'other'};

  var collection = null, userCollection = null;

  const insertUser = () => {
    return userCollection.insert(Object.assign({}, user))
  }

  beforeEach((done) => {
    collection = DatabaseConnection.connection().get('tracks');
    userCollection = DatabaseConnection.connection().get('users');

    Promise.all([
      collection.remove({}),
      userCollection.remove({})
    ]).then(() => done())
  });

  describe('on track creation', () => {
    it('creates a new track', () => {
      return insertUser().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'myPass'
        }

        return TrackService.createTrack(trackToCreate).then((createdTrack) => {
          trackToCreate._id = createdTrack._id

          createdTrack.type.should.equal(TrackService.TYPE.TWITTER)
          trackToCreate.type = createdTrack.type

          createdTrack.userId.toString().should.equal(trackToCreate.userId)
          trackToCreate.userId = createdTrack.userId

          createdTrack.should.deep.equal(trackToCreate)

          return collection.find({}).then((result) => {
            result.length.should.equal(1);

            let track = result[0];

            track.should.deep.equal(createdTrack)
          })
        })
      })
    })
  })

  describe('on track reading', () => {
    const myTracks = [
      {_id: '123456789012345678901235', userId: user._id, url: 'https://twitter.com'},
      {_id: '123456789012345678901236', userId: user._id, url: 'https://twitter.com'}
    ], otherTracks = [
      {_id: '123456789012345678901237', userId: otherUser._id, url: 'https://twitter.com'},
      {_id: '123456789012345678901238', userId: otherUser._id, url: 'https://twitter.com'}
    ]

    const insertTracks = (tracksToInsert) => {
      return collection.insert(tracksToInsert)
    }

    it('returns all my tracks', () => {
      return insertTracks(myTracks).then(() => {
        return TrackService.getTracksByUserId(user._id.toString()).then((res) => {
          res.should.deep.equal(myTracks)
        })
      })
    })

    it('doesn\'t return other user\'s tracks', () => {
      return insertTracks(myTracks.concat(otherTracks)).then(() => {
        return TrackService.getTracksByUserId(user._id.toString()).then((res) => {
          res.should.deep.equal(myTracks)
        })
      })
    })
  })
})
