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
        tags: ['new'],
        url: fix.twitter.tweets['1230'].url
      }, track1231 = {
        userId: user.user._id.toString(),
        url: fix.twitter.tweets['1231'].url
      };

    var tweetStub = null, tracksCollection = null, tagsCollection = null;

    beforeEach((done) => {
      tracksCollection = DatabaseConnection.connection().get('tracks');
      tagsCollection = DatabaseConnection.connection().get('tags');
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
        expect(returnedTrack.contentItem).to.deep.equal(fix.twitter.tweets['1230'].data)
        expect(returnedTrack.contentItemId).to.deep.equal(fix.twitter.tweets['1230'].data.id_str)
      })
    })

    it('adds text tweet preview to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.preview).to.deep.equal(fix.twitter.tweets['1230'].preview)
      })
    })

    it('adds text + url tweet preview to new track', () => {
      let trackToCreate = track1231

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.preview).to.deep.equal(fix.twitter.tweets['1231'].preview)
      })
    })

    it('adds tracking information to new track', () => {
      let trackToCreate = track1230

      return TrackService.createTrack(trackToCreate).then((returnedTrack) => {
        expect(returnedTrack.tracking).to.deep.equal(fix.twitter.tweets['1230'].tracking)
      })
    })

    it('creates/updates tag with track info', () => {
      let trackToCreate = track1230

      const expectedTag = {
        name: 'new',
        userId: user.user._id,
        tracksCount: 1,
        tracking: fix.twitter.tweets['1230'].tracking
      }

      return TrackService.createTrack(trackToCreate).then(() => {
        return tagsCollection.find({name: 'new', userId: user.user._id}).then((found) => {
          expect(found).to.have.lengthOf(1)

          const tag = found[0]
          expectedTag._id = tag._id

          expect(tag).to.deep.equal(expectedTag)
        })
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
        url: fix.twitter.tweets['404'].url
      }

      const promise = TrackService.createTrack(trackToCreate)

      return expect(promise).to.be.rejectedWith('not_found_content');
    })

    it('throws already_tracked if track already exists', () => {
      let trackToCreate = track1230

      const promise = TrackService.createTrack(trackToCreate).then(() => TrackService.createTrack(trackToCreate))

      return expect(promise).to.be.rejectedWith('already_tracked');
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
        url: fix.twitter.tweets['1240'].url
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

  describe('on track update', () => {
    var tracksCollection = null, updateStub = null;

    beforeEach((done) => {
      tracksCollection = DatabaseConnection.connection().get('tracks')

      const expectedParams = {
        124: {
          token: fix.userWithTrackedAccount.account.auth.accessToken,
          secret: fix.userWithTrackedAccount.account.auth.accessSecret,
        },
        125: {
          token: fix.userWithTrackedAccount2.account.auth.accessToken,
          secret: fix.userWithTrackedAccount2.account.auth.accessSecret,
        }
      }

      updateStub = sinon.stub(twitterApi.prototype, 'statuses', twitterStub.getTweetBulk(expectedParams))

      fix.insertFixtures([fix.userWithTrackedAccount, fix.userWithTrackedAccount2]).then(() => done())
    })

    afterEach(() => {
      updateStub.restore()
    })

    it('updates tracking info of tracks', () => {
      return TrackService.updateTracks().then(() => {
        return tracksCollection.find(
          {userId: {$in: [fix.userWithTrackedAccount.user._id, fix.userWithTrackedAccount2.user._id]}}
        ).then((tracks) => {
          tracks.forEach((track) => {
            const relatedTweet = fix.twitter.tweets[track.contentItemId].data
            expect(track.tracking.retweets).to.equal(relatedTweet.retweet_count * 10)
            expect(track.tracking.favorites).to.equal(relatedTweet.favorite_count * 10)
          })
        })
      })
    })

    it('returns updated tracks mapped by user id', () => {
      return TrackService.updateTracks().then((result) => {
        return tracksCollection.find(
          {userId: {$in: [fix.userWithTrackedAccount.user._id, fix.userWithTrackedAccount2.user._id]}}
        ).then((tracks) => {
          const count = {}, firstUserId = fix.userWithTrackedAccount.user._id.toString(),
            secondUserId = fix.userWithTrackedAccount2.user._id.toString()

          count[firstUserId] = 0
          count[secondUserId] = 0

          tracks.forEach((track) => {
            const userTracks = result[track.userId.toString()]

            count[track.userId.toString()]++

            expect(userTracks).to.deep.include(track)
          })

          expect(result[firstUserId]).to.have.lengthOf(count[firstUserId])
          expect(result[secondUserId]).to.have.lengthOf(count[secondUserId])
        })
      })
    })
  })
})
