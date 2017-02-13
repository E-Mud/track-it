import DatabaseConnection from '../../server/db/database-connection';
import TrackService from '../../server/tracks/track-service';
import TagService from '../../server/tags/tag-service';
import SocialAccountService from '../../server/social/social-account-service';
import twitterApi from 'node-twitter-api';
import twitterStub from '../utils/stubs/twitter';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var expect = chai.expect;
chai.use(chaiAsPromised);
import fix from '../utils/fix';

describe('TagService', () => {
  beforeEach((done) => {
    fix.clean().then(() => done())
  })

  describe('on reading', () => {
    const user = fix.userWithTrackedAccount,
      expectedTags = user.tags,
      userId = user.user._id.toString();

    beforeEach((done) => {
      fix.insertFixtures(user).then(() => done())
    })

    it('returns all tags', () => {
      return TagService.getAllTags(userId).then((tags) => {
        expect(tags).to.deep.equal(expectedTags)
      })
    })

    it('doesn\'t return other user tags', () => {
      return fix.insertFixtures(fix.userWithTrackedAccount2).then(() => {
        return TagService.getAllTags(userId).then((tags) => {
          expect(tags).to.deep.equal(expectedTags)
        })
      })
    })
  })

  describe('on updating', () => {
    const user = fix.userWithTrackedAccount,
      userId = user.user._id.toString(),
      collection = DatabaseConnection.connection().get('tags'),
      expectedTags = user.tags.map((tag) => {
        const newTag = Object.assign({}, tag)
        newTag.tracking.retweets = tag.tracking.retweets + 10
        newTag.tracking.favorites = tag.tracking.favorites + 10

        return newTag
      });

    beforeEach((done) => {
      fix.insertFixtures(user).then(() => done())
    })

    it('updates tags', () => {
      return TagService.updateTags(expectedTags).then((returnedTags) => {
        return collection.find().then((insertedTags) => {
          expect(insertedTags).to.deep.equal(expectedTags)
        })
      })
    })

    it('returns tags mapped by user id', () => {
      const mappedTags = {[userId]: expectedTags}

      return TagService.updateTags(expectedTags).then((returnedTags) => {
        expect(returnedTags).to.deep.equal(mappedTags)
      })
    })
  })

  describe('on tagging track', () => {
    const user = fix.userWithTrackedAccount,
      userId = user.user._id.toString(),
      collection = DatabaseConnection.connection().get('tags'),
      track = user.tracks[0];

    beforeEach((done) => {
      fix.insertFixtures(user).then(() => done())
    })

    it('increments track count', () => {
      const tagToUpdate = user.tags[1]

      return TagService.tagTrack(track, ['long']).then(() => {
        return collection.find({name: 'long'}).then((foundTags) => {
          expect(foundTags).to.have.lengthOf(1);

          const tag = foundTags[0]

          expect(tag.tracksCount).to.equal(tagToUpdate.tracksCount + 1)
        })
      })
    })

    it('increments tracking', () => {
      const tagToUpdate = user.tags[1]

      return TagService.tagTrack(track, ['long']).then(() => {
        return collection.find({name: 'long'}).then((foundTags) => {
          const tag = foundTags[0],
            expectedTracking = {
              retweets: tagToUpdate.tracking.retweets + track.tracking.retweets,
              favorites: tagToUpdate.tracking.favorites + track.tracking.favorites
            }

          expect(tag.tracking).to.deep.equal(expectedTracking)
        })
      })
    })

    it('doesn\'t update other user\'s tags', () => {
      const tagToNotUpdate = fix.userWithTrackedAccount2.tags[1],
        otherUserId = fix.userWithTrackedAccount2.user._id;

      return fix.insertFixtures(fix.userWithTrackedAccount2)
      .then(() => TagService.tagTrack(track, ['long']))
      .then(() => collection.find({name: 'long', userId: otherUserId}))
      .then((foundTags) => {
        expect(foundTags).to.have.lengthOf(1);

        const tag = foundTags[0]

        expect(tag).to.deep.equal(tagToNotUpdate)
      })
    })

    it('creates tags if they don\'t exist', () => {
      const expectedTag = {
        userId: user.user._id,
        name: 'new',
        tracksCount: 1,
        tracking: {retweets: track.tracking.retweets, favorites: track.tracking.favorites}
      };

      return TagService.tagTrack(track, ['long', 'new'])
      .then(() => collection.find({name: 'new', userId: user.user._id}))
      .then((foundTags) => {
        expect(foundTags).to.have.lengthOf(1);

        const tag = foundTags[0]
        expectedTag._id = tag._id

        expect(tag).to.deep.equal(expectedTag)
      })
    })
  })
})
