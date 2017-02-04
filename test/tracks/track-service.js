import DatabaseConnection from '../../server/db/database-connection';
import TrackService from '../../server/tracks/track-service';
import SocialAccountService from '../../server/social/social-account-service';
import twitterApi from 'node-twitter-api';
import twitterStub from '../utils/stubs/twitter';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var expect = chai.expect;
chai.use(chaiAsPromised);
import fix from '../utils/fix';

describe('TrackService', () => {
  beforeEach((done) => {
    fix.clean().then(() => done())
  });

  describe('on track creation', () => {
    const user = fix.userWithAccount,
      track1230 = {
        userId: user.user._id.toString(),
        url: fix.twitter.tweets[1230].url
      }, track1231 = {
        userId: user.user._id.toString(),
        url: fix.twitter.tweets[1231].url
      };

    var tweetStub = null, tracksCollection = null;

    beforeEach((done) => {
      tracksCollection = DatabaseConnection.connection().get('tracks');
      tweetStub = sinon.stub(twitterApi.prototype, 'statuses', twitterStub.getTweet)

      fix.insertFixtures(user).then(() => done())
    });

    afterEach(() => {
      if(tweetStub){
        tweetStub.restore()
      }
    })

    it('creates a new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.type).to.equal(SocialAccountService.TYPE.TWITTER)
        expect(returnedTrack.userId.toString()).to.equal(trackToCreate.userId)
        expect(returnedTrack.url).to.equal(trackToCreate.url)

        return tracksCollection.find({}).then((result) => {
          expect(result).to.have.lengthOf(1);

          let track = result[0];
          expect(track).to.deep.equal(returnedTrack)
        })
      })
    })

    it('adds tweet information to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.contentItem).to.deep.equal(fix.twitter.tweets[1230].data)
        expect(returnedTrack.contentItemId).to.deep.equal(fix.twitter.tweets[1230].data.id)
      })
    })

    it('adds text tweet preview to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.preview).to.deep.equal(fix.twitter.tweets[1230].preview)
      })
    })

    it('adds text + url tweet preview to new track', () => {
      let trackToCreate = track1231

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.preview).to.deep.equal(fix.twitter.tweets[1231].preview)
      })
    })

    it('adds tracking information to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.tracking).to.deep.equal(fix.twitter.tweets[1230].tracking)
      })
    })

    it('adds author information to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.author).to.equal(fix.twitter.accounts[123].userData.name)
      })
    })

    it('adds socialAccountId to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.socialAccountId.toString()).to.equal(user.account._id.toString())
      })
    })

    it('throws not_found_content if tweet not found', () => {
      let trackToCreate = {
        userId: track1230.userId,
        url: fix.twitter.tweets[404].url
      }

      const promise = TrackService.createTrack(trackToCreate)

      return expect(promise).to.be.rejectedWith('not_found_content');
    })

    it('throws invalid_url if not valid tweet url', () => {
      let trackToCreate = {
        userId: track1230.userId,
        url: 'https://wrong.com/e_muddy/status/1230'
      }

      const promise = TrackService.createTrack(trackToCreate)

      return expect(promise).to.be.rejectedWith('invalid_url');
    })

    it('throws not_found_account if there is no user\'s account for the tweet', () => {
      let trackToCreate = {
        userId: track1230.userId,
        url: fix.twitter.tweets[1240].url
      }

      return fix.insertFixtures(fix.userWithTrackedAccount).then(() => {
        const promise = TrackService.createTrack(trackToCreate)

        return expect(promise).to.be.rejectedWith('not_found_account');
      })
    })
  })

  describe('on track reading', () => {
    const user = fix.userWithTrackedAccount, otherUser = fix.userWithTrackedAccount2;

    it('returns all my tracks', () => {
      return fix.insertFixtures(user).then(() => {
        return TrackService.getTracksByUserId(user.user._id.toString()).then((res) => {
          expect(res).to.deep.equal(user.tracks)
        })
      })
    })

    it('doesn\'t return other user\'s tracks', () => {
      return fix.insertFixtures([user, otherUser]).then(() => {
        return TrackService.getTracksByUserId(user.user._id.toString()).then((res) => {
          expect(res).to.deep.equal(user.tracks)
        })
      })
    })
  })
})
