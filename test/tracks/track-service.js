import DatabaseConnection from '../../server/db/database-connection';
import TrackService from '../../server/tracks/track-service';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var should = chai.should();
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('TrackService', () => {
  describe('on track creation', () => {
    var collection = null, userCollection = null;

    const insertUser = () => {
      return userCollection.insert({username: 'username'})
    }

    beforeEach((done) => {
      collection = DatabaseConnection.connection().get('tracks');
      userCollection = DatabaseConnection.connection().get('users');

      Promise.all([
        collection.remove({}),
        userCollection.remove({})
      ]).then(() => done())
    });

    it('creates a new track', () => {
      return insertUser().then((user) => {
        let trackToCreate = {
          userId: user._id,
          url: 'myPass'
        }

        return TrackService.createTrack(trackToCreate).then((createdTrack) => {
          trackToCreate._id = createdTrack._id

          createdTrack.type.should.equal(TrackService.TYPE.TWITTER)
          trackToCreate.type = createdTrack.type

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
})
