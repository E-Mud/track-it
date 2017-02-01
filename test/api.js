import DatabaseConnection from '../server/db/database-connection';
import UserService from '../server/users/user-service';
import SocialAccountService from '../server/social/social-account-service';
import monk from 'monk';
import twitterApi from 'node-twitter-api';
import twitterStub from './utils/stubs/twitter';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var should = chai.should();
var expect = chai.expect;
import app from '../server.js';
chai.use(chaiAsPromised);
chai.use(chaiHTTP);

import fix from './utils/fix';

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjU4ODc5NTUyOWRmYzc5MDAxNmQ1ZGYwMSIsInVzZXJuYW1lIjoiYWxiZXJ0b0B0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJEM0V3pWSVVtdDNLMzYyTFlrbXViVHUyWURVT3N4bjRkaGFhMFlvLnpkYVBYaUE1NkpxZ1ltIn0sImlhdCI6MTQ4NTI4MDU5NH0.ZMnP1lmuOjj2ZfZ5953aPmWEXYmhe0PdHQP5fcNw3CM'
const bearerToken = 'Bearer ' + authToken
const userId = '588795529dfc790016d5df01'
const userObjectId = monk.id(userId)

const otherUserId = userId.replace('0', 'f')
const otherUserObjectId = monk.id(otherUserId)

sinon.config = {
  injectIntoThis: true,
  injectInto: null,
  properties: ["stub"],
  useFakeTimers: false,
  useFakeServer: false
}

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
        return post('/tracks', {url: fix.twitter.tweets[1230].url}, fix.userWithAccount)
          .then((res) => {
            expect(res.body.userId).to.equal(fix.userWithAccount.user._id.toString())
            return trackCollection.findOne(res.body._id).then((createdTrack) => {
              expect(createdTrack.userId.toString()).to.equal(fix.userWithAccount.user._id.toString())
            })
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

describe('TrackIt App', () => {
  const goToPage = (url, user = fix.newUser) => {
    return chai.request(app)
      .get(url)
      .set('Cookie', fix.authCookie(user))
  }

  beforeEach((done) => {
    fix.clean().then(() => done())
  });

  describe('main page', () => {
    it('redirect to login if no authToken cookie', () => {
      return chai.request(app)
        .get('/').then((res) => {
          expect(res).to.redirect
        })
    })

    it('redirect to login if invalid authToken cookie', () => {
      return chai.request(app)
        .get('/').set('Cookie', 'authToken=123').then((res) => {
          expect(res).to.redirect
        })
    })

    it('doesn\'t redirect to login if valid authToken cookie', () => {
      return chai.request(app)
        .get('/').set('Cookie', fix.authCookie(fix.newUser)).then((res) => {
          expect(res).to.not.redirect
        })
    })
  })

  describe('twitter', () => {
    var accountCollection = null;

    beforeEach(() => {
      accountCollection = DatabaseConnection.connection().get('social_accounts');
    });

    describe('requiring access', () => {
      var stub = null;

      const pendingAccount = {
        userId: fix.newUser.user._id,
        pending: true,
        type: SocialAccountService.TYPE.TWITTER,
        auth: {
          requestSecret: 'secret',
          requestToken: 'token'
        },
        userData: null
      }

      beforeEach(() => {
        stub = sinon.stub(twitterApi.prototype, 'getRequestToken', twitterStub.getRequestToken)
      });

      afterEach(() => {
        if(stub){
          stub.restore()
        }
      })

      it('redirects to twitter authorize page', (done) => {
        goToPage('/twitter/access').end((err, res) => {
          expect(res).to.redirectTo('https://api.twitter.com/oauth/authenticate?oauth_token=token')
          done()
        });
      })

      it('creates a pending social account', () => {
        const expectedAccount = pendingAccount

        return goToPage('/twitter/access').then(
          () => Promise.reject('should have failed'),
          () => {
            return accountCollection.find({}).then((foundAccounts) => {
              expect(foundAccounts).to.have.lengthOf(1);

              const account = foundAccounts[0];
              expectedAccount._id = account._id;

              expect(account).to.deep.equal(expectedAccount)
            })
          }
        )
      })
    })

    describe('obtaining access', () => {
      var accessStub = null, verifyStub = null;

      const twitterAccount = fix.twitter.accounts[124]
      const pendingAccount = fix.userWithPendingAccount.pendingAccount;

      const goToCallback = (user, token) => {
        return goToPage('/twitter/callback', fix.userWithPendingAccount)
          .query({oauth_token: pendingAccount.auth.requestToken, oauth_verifier: 'verifier'})
      }

      beforeEach((done) => {
        const accessStubMethod = twitterStub.getAccessToken(
          {token: pendingAccount.auth.requestToken, secret: pendingAccount.auth.requestSecret, verifier: 'verifier'},
          {accessToken: twitterAccount.auth.accessToken, accessSecret: twitterAccount.auth.accessSecret}
        )
        const verifyStubMethod = twitterStub.verifyCredentials(
          {token: twitterAccount.auth.accessToken, secret: twitterAccount.auth.accessSecret},
          twitterAccount.userData
        )

        accessStub = sinon.stub(twitterApi.prototype, 'getAccessToken', accessStubMethod)
        verifyStub = sinon.stub(twitterApi.prototype, 'verifyCredentials', verifyStubMethod)

        fix.insertFixtures(fix.userWithPendingAccount).then(() => done())
      });

      afterEach(() => {
        if(accessStub){
          accessStub.restore()
        }

        if(verifyStub){
          verifyStub.restore()
        }
      })

      it('saves twitter info', () => {
        const expectedAccount = {
          userId: fix.userWithPendingAccount.user._id,
          pending: false,
          type: SocialAccountService.TYPE.TWITTER,
          name: twitterAccount.userData.name,
          username: twitterAccount.userData.screen_name,
          auth: {
            requestToken: pendingAccount.auth.requestToken,
            requestSecret: pendingAccount.auth.requestSecret,
            accessToken: twitterAccount.auth.accessToken,
            accessSecret: twitterAccount.auth.accessSecret
          },
          userData: twitterAccount.userData
        }

        return goToCallback().then(() => {
          return accountCollection.find({'userData.id': expectedAccount.userData.id}).then((foundAccounts) => {
            expect(foundAccounts).to.have.lengthOf(1);

            const account = foundAccounts[0];
            expectedAccount._id = account._id;

            expect(account).to.deep.equal(expectedAccount)
          })
        })
      })

      it('doesn\'t duplicate/replace twitter account', () => {
        return accountCollection.findOneAndUpdate({'userData.id': 123}, {$set: {'userData.id': 124}}).then((expectedAccount) => {
          return goToCallback().then(() => {
            return accountCollection.find({'userData.id': 124}).then((foundAccounts) => {
              expect(foundAccounts).to.have.lengthOf(1);

              const account = foundAccounts[0];
              expect(account).to.deep.equal(expectedAccount)
            })
          })
        })
      })
    })
  })
})
