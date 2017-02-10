import DatabaseConnection from '../server/db/database-connection';
import SocialAccountService from '../server/social/social-account-service';
import monk from 'monk';
import twitterApi from 'node-twitter-api';
import twitterStub from './utils/stubs/twitter';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var expect = chai.expect;
import app from '../server.js';
chai.use(chaiAsPromised);
chai.use(chaiHTTP);

import fix from './utils/fix';

describe('TrackIt API', () => {
  const post = (url, body, user = fix.newUser) => {
    return chai.request(app)
      .post('/api' + url)
      .set('Content-Type', 'application/json')
      .set('Authorization', fix.bearerToken(user))
      .send(body)
  }

  const get = (url, query = {}, user = fix.newUser) => {
    return chai.request(app)
      .get('/api' + url)
      .set('Content-Type', 'application/json')
      .set('Authorization', fix.bearerToken(user))
      .query(query)
  }

  beforeEach((done) => {
    fix.clean().then(() => done())
  })

  describe('/users', () => {
    describe('/register', () => {
      const register = (body) => {return post('/users/register', body)},
        username = fix.newUser.user.username, password = fix.newUser.auth.password;

      it('returns the created user', () => {
        return register({password, username})
          .then(function (res) {
            expect(res).to.have.status(200);
            expect(res.body._id).to.exist;
            expect(res.body.username).to.equal(username)
            expect(res.body.password).to.not.exist
          })
      })

      it('returns an error for invalid user', () => {
        return register({username})
          .catch(function (res) {
            expect(res).to.have.status(400);
            expect(res.response.body).to.deep.equal({msg: 'invalid_user'})
          })
      })

      it('returns an error for used user', () => {
        return fix.insertFixtures(fix.newUser).then(() => {
          return register({password, username})
            .catch(function (res) {
              expect(res).to.have.status(400);
              expect(res.response.body).to.deep.equal({msg: 'used_username'})
            })
        })
      })
    })

    describe('/login', () => {
      const login = (body) => {return post('/users/login', body)},
        username = fix.newUser.user.username, password = fix.newUser.auth.password;

      beforeEach((done) => {
        fix.insertFixtures(fix.newUser).then(() => done())
      })

      it('returns the created user', () => {
        return login({username, password})
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body.user).to.exist;
            expect(res.body.authToken).to.exist;
          })
      })

      it('sets authToken cookie', () => {
        return login({username, password})
          .then((res) => {
            expect(res).to.have.cookie('authToken');
            expect(res).to.have.cookie('authToken', res.body.authToken);
          })
      })

      it('returns an error for invalid user', () => {
        return login({username: '2' + username, password})
          .catch((res) => {
            expect(res).to.have.status(400);
            expect(res.response.body).to.deep.equal({msg: 'user_not_found'})
          })
      })

      it('returns an error for invalid password', () => {
        return login({username, password: '2' + password})
          .catch((res) => {
            expect(res).to.have.status(400);
            expect(res.response.body).to.deep.equal({msg: 'invalid_password'})
          })
      })
    })

    describe('/logout', () => {
      const user = fix.newUser

      const logout = () => {
        return post('/users/logout')
          .set('Cookie', fix.authCookie(user))
          .set('Authorization', fix.bearerToken(user))
      }

      beforeEach((done) => {
        fix.insertFixtures(fix.newUser).then(() => done())
      })

      it('returns confirmation message', () => {
        return logout()
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({msg: 'User logged out'});
          })
      })

      it('unsets authToken cookie', () => {
        return logout()
          .then((res) => {
            expect(res).to.have.header('set-cookie', 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
          })
      })
    })
  })

  describe('/tracks', () => {
    describe('creation', () => {
      var tweetStub = null, trackCollection = null;

      beforeEach((done) => {
        tweetStub = sinon.stub(twitterApi.prototype, 'statuses', twitterStub.getTweet)
        trackCollection = DatabaseConnection.connection().get('tracks')

        fix.insertFixtures(fix.userWithAccount).then(() => done())
      });

      afterEach(() => {
        if(tweetStub){
          tweetStub.restore()
        }
      })

      it('creates track with current user\'s id', () => {
        return post('/tracks', {url: fix.twitter.tweets['1230'].url}, fix.userWithAccount)
          .then((res) => {
            expect(res.body.userId).to.equal(fix.userWithAccount.user._id.toString())
            return trackCollection.findOne(res.body._id).then((createdTrack) => {
              expect(createdTrack.userId.toString()).to.equal(fix.userWithAccount.user._id.toString())
            })
          })
      })

      it('returns error if account not found', () => {
        return post('/tracks', {url: fix.twitter.tweets['1240'].url}, fix.userWithAccount)
          .then(
            (res) => Promise.reject('should have failed'),
            (res) => {
              expect(res).to.have.status(400)
              expect(res.response.body).to.deep.equal({msg: 'not_found_account'})
            })
      })
    })

    describe('reading', () => {
      beforeEach((done) => {
        fix.insertFixtures([fix.userWithTrackedAccount, fix.userWithTrackedAccount2]).then(() => done())
      })

      it('reads user\'s tracks', () => {
        const expectedTracks = fix.parseObjectIds(fix.userWithTrackedAccount.tracks)

        return get('/tracks', undefined, fix.userWithTrackedAccount).then((res) => {
          expect(res.body).to.deep.equal(expectedTracks)
        })
      })
    })
  })

  describe('/accounts', () => {
    describe('reading', () => {
      const toExpectedAccounts = (account) => {
        const parsedAccount = fix.parseObjectIds(account)

        delete parsedAccount.auth

        return [parsedAccount]
      }

      const getAccounts = (user = fix.userWithPendingAccount) => {
        return get('/accounts', undefined, user)
      }

      it('returns all accounts', () => {
        return fix.insertFixtures(fix.userWithAccount).then(() => {
          return getAccounts(fix.userWithAccount).then(({body}) => {
            expect(body).to.deep.equal(toExpectedAccounts(fix.userWithAccount.account))
          })
        })
      })

      it('doesn\'t return pending accounts', () => {
        return fix.insertFixtures(fix.userWithPendingAccount).then(() => {
          return getAccounts(fix.userWithPendingAccount).then(({body}) => {
            expect(body).to.deep.equal(toExpectedAccounts(fix.userWithPendingAccount.account))
          })
        })
      })

      it('doesn\'t return other user\'s accounts', () => {
        return fix.insertFixtures([fix.userWithAccount, fix.userWithTrackedAccount]).then(() => {
          return getAccounts(fix.userWithAccount).then(({body}) => {
            expect(body).to.deep.equal(toExpectedAccounts(fix.userWithAccount.account))
          })
        })
      })
    })
  })
})
