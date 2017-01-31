import DatabaseConnection from '../../server/db/database-connection';
import TrackService from '../../server/tracks/track-service';
import SocialAccountService from '../../server/social/social-account-service';
import twitterApi from 'node-twitter-api';
import twitterStub from '../stubs/twitter';
import sinon from 'sinon';
import monk from 'monk';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var expect = chai.expect;
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('TrackService', () => {
  const user = {_id: monk.id('f23456789012345678901234'), username: 'username'},
    otherUser = {_id: monk.id('f23456789012345678901233'), username: 'other'};

  var collection = null;

  beforeEach((done) => {
    collection = DatabaseConnection.connection().get('tracks');

    collection.remove({}).then(() => done())
  });

  describe('on track creation', () => {
    const socialAccounts = [
      {_id: monk.id('123456789012345678900987'), userId: monk.id('f23456789012345678901234'), type: SocialAccountService.TYPE.TWITTER, userData: {id: 123}},
      {_id: monk.id('123456789012345678900988'), userId: monk.id('f23456789012345678901235'), type: SocialAccountService.TYPE.TWITTER, userData: {id: 124}}
    ]
    var tweetStub = null, accountCollection = null;

    const tweet = {
      id: 1230,
      user: {id: 123}
    }

    const insertAccount = () => {
      const accounts = socialAccounts.map((acc) => Object.assign({}, acc))
      return accountCollection.insert(accounts)
    }

    beforeEach((done) => {
      tweetStub = sinon.stub(twitterApi.prototype, 'statuses', twitterStub.getTweet)

      accountCollection = DatabaseConnection.connection().get('social_accounts');

      accountCollection.remove({}).then(() => done())
    });

    afterEach(() => {
      if(tweetStub){
        tweetStub.restore()
      }
    })

    it('creates a new track', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://twitter.com/e_muddy/status/1230'
        }

        return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
          expect(returnedTrack.type).to.equal(SocialAccountService.TYPE.TWITTER)
          expect(returnedTrack.userId.toString()).to.equal(trackToCreate.userId)
          expect(returnedTrack.url).to.equal('https://twitter.com/e_muddy/status/1230')

          return collection.find({}).then((result) => {
            expect(result).to.have.lengthOf(1);

            let track = result[0];
            expect(track).to.deep.equal(returnedTrack)
          })
        })
      })
    })

    it('adds tweet information to new track', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://twitter.com/e_muddy/status/1230'
        }

        return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
          expect(returnedTrack.contentItem).to.deep.equal(tweet)
        })
      })
    })

    it('adds socialAccountId to new track', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://twitter.com/e_muddy/status/1230'
        }

        return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
          expect(returnedTrack.socialAccountId.toString()).to.equal(socialAccounts[0]._id.toString())
        })
      })
    })

    it('throws not_found_content if tweet not found', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://twitter.com/e_muddy/status/404'
        }

        const promise = TrackService.createTrack(trackToCreate)

        return expect(promise).to.be.rejectedWith('not_found_content');
      })
    })

    it('throws invalid_url if not valid tweet url', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://wrong.com/e_muddy/status/1230'
        }

        const promise = TrackService.createTrack(trackToCreate)

        return expect(promise).to.be.rejectedWith('invalid_url');
      })
    })

    it('throws not_found_account if there is no user\'s account for the tweet', () => {
      return insertAccount().then(() => {
        let trackToCreate = {
          userId: 'f23456789012345678901234',
          url: 'https://twitter.com/e_muddy/status/1240'
        }

        const promise = TrackService.createTrack(trackToCreate)

        return expect(promise).to.be.rejectedWith('not_found_account');
      })
    })
  })

  describe('on track reading', () => {
    const myTracks = [
      {_id: monk.id('123456789012345678901235'), userId: user._id, url: 'https://twitter.com'},
      {_id: monk.id('123456789012345678901236'), userId: user._id, url: 'https://twitter.com'}
    ], otherTracks = [
      {_id: monk.id('123456789012345678901237'), userId: otherUser._id, url: 'https://twitter.com'},
      {_id: monk.id('123456789012345678901238'), userId: otherUser._id, url: 'https://twitter.com'}
    ]

    const insertTracks = (tracksToInsert) => {
      return collection.insert(tracksToInsert)
    }

    it('returns all my tracks', () => {
      return insertTracks(myTracks).then(() => {
        return TrackService.getTracksByUserId(user._id.toString()).then((res) => {
          expect(res).to.deep.equal(myTracks)
        })
      })
    })

    it('doesn\'t return other user\'s tracks', () => {
      return insertTracks(myTracks.concat(otherTracks)).then(() => {
        return TrackService.getTracksByUserId(user._id.toString()).then((res) => {
          expect(res).to.deep.equal(myTracks)
        })
      })
    })
  })
})
