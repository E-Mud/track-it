import DatabaseConnection from '../server/db/database-connection';
import UserService from '../server/users/user-service';
import SocialAccountService from '../server/social/social-account-service';
import monk from 'monk';
import twitterApi from 'node-twitter-api';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var should = chai.should();
var expect = chai.expect;
import app from '../server.js';
chai.use(chaiAsPromised);
chai.use(chaiHTTP);

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjU4ODc5NTUyOWRmYzc5MDAxNmQ1ZGYwMSIsInVzZXJuYW1lIjoiYWxiZXJ0b0B0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJEM0V3pWSVVtdDNLMzYyTFlrbXViVHUyWURVT3N4bjRkaGFhMFlvLnpkYVBYaUE1NkpxZ1ltIn0sImlhdCI6MTQ4NTI4MDU5NH0.ZMnP1lmuOjj2ZfZ5953aPmWEXYmhe0PdHQP5fcNw3CM'
const bearerToken = 'Bearer ' + authToken
const userId = '588795529dfc790016d5df01'
const userObjectId = monk.id(userId)

sinon.config = {
  injectIntoThis: true,
  injectInto: null,
  properties: ["stub"],
  useFakeTimers: false,
  useFakeServer: false
}

describe('TrackIt', () => {
  var userCollection = null;

  const insertUser = (user) => {
    return userCollection.insert(user)
  }

  const doLoginRequest = (user, body) => {
    return insertUser(user).then(() => {
      return chai.request(app)
      .post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send(body)
    })
  }

  beforeEach((done) => {
    userCollection = DatabaseConnection.connection().get('users');

    userCollection.remove({}).then(() => done())
  });

  describe('/users', () => {
    describe('/register', () => {
      const doRegisterRequest = (body) => {
        return chai.request(app)
          .post('/api/users/register')
          .set('Content-Type', 'application/json')
          .send(body)
      }

      it('returns the created user', () => {
        return doRegisterRequest({ password: '123', username: 'alberto@test.com' })
          .then(function (res) {
            res.should.have.status(200);
            res.body._id.should.exist;
            res.body.username.should.equal('alberto@test.com')
            expect(res.body.password).to.not.exist
          })
      })

      it('returns an error for invalid user', () => {
        return doRegisterRequest({username: 'alberto@test.com' })
          .catch(function (res) {
            res.should.have.status(400);
            res.response.body.should.deep.equal({msg: 'invalid_user'})
          })
      })

      it('returns an error for used user', () => {
        return doRegisterRequest({ password: '123', username: 'alberto@test.com' })
          .then(() => {
            return doRegisterRequest({password: '123', username: 'alberto@test.com' })
              .catch(function (res) {
                res.should.have.status(400);
                res.response.body.should.deep.equal({msg: 'used_username'})
              })
          })
      })
    })

    describe('/login', () => {
      const user = {
        username: 'alberto@test.com',
        password: '$2a$10$C4WzVIUmt3K362LYkmubTu2YDUOsxn4dhaa0Yo.zdaPXiA56JqgYm'
      }

      it('returns the created user', () => {
        return doLoginRequest(user, {username: user.username, password: 'myPass' })
          .then(function (res) {
            res.should.have.status(200);
            res.body.user.should.exist;
            res.body.authToken.should.exist;
          })
      })

      it('sets authToken cookie', () => {
        return doLoginRequest(user, {username: user.username, password: 'myPass' })
          .then((res) => {
            expect(res).to.have.cookie('authToken');
            expect(res).to.have.cookie('authToken', res.body.authToken);
          })
      })

      it('returns an error for invalid user', () => {
        return doLoginRequest(user, {username: '2' + user.username, password: 'myPass' })
          .catch((res) => {
            res.should.have.status(400);
            res.response.body.should.deep.equal({msg: 'user_not_found'})
          })
      })

      it('returns an error for invalid password', () => {
        return doLoginRequest(user, {username: user.username, password: 'myPass2' })
          .catch((res) => {
            res.should.have.status(400);
            res.response.body.should.deep.equal({msg: 'invalid_password'})
          })
      })
    })
  })

  describe('/tracks', () => {
    var trackCollection = null;

    beforeEach((done) => {
      trackCollection = DatabaseConnection.connection().get('tracks');

      trackCollection.remove({}).then(() => done())
    });

    describe('creation', () => {
      it('creates track with current user\'s id', () => {
        return chai.request(app)
          .post('/api/tracks')
          .set('Authorization', bearerToken)
          .send({url: 'https://twitter.com/e_muddy/status/30091501105068441'})
          .then((res) => {
            res.body.userId.should.equal(userId)
            return trackCollection.findOne({'_id': res.body._id}).then((createdTrack) => {
              createdTrack.userId.toString().should.equal(userId)
            })
          })
      })
    })

    describe('reading', () => {
      const otherUserId = userId.replace('0', 'f')
      const insertedTracks = [
        {_id: '123456789012345678901230', userId: userObjectId, url: 'http://...'},
        {_id: '123456789012345678901231', userId: userObjectId, url: 'http://...'},
        {_id: '123456789012345678901232', userId: monk.id(otherUserId), url: 'http://...'},
        {_id: '123456789012345678901233', userId: monk.id(otherUserId), url: 'http://...'}
      ]

      const readTracks = () => {
        return trackCollection.insert(insertedTracks).then(() => {
          return chai.request(app)
            .get('/api/tracks')
            .set('Authorization', bearerToken)
        })
      }

      it('reads user\'s tracks', () => {
        const expectedTracks = [
          {_id: '123456789012345678901230', userId: userId, url: 'http://...'},
          {_id: '123456789012345678901231', userId: userId, url: 'http://...'}
        ]

        return readTracks().then((res) => {
          res.body.should.deep.equal(expectedTracks)
        })
      })
    })
  })

  describe('main page', () => {
    it('redirect to login if no authToken cookie', () => {
      return chai.request(app)
        .get('/').then((res) => {
          res.should.redirect
        })
    })

    it('redirect to login if invalid authToken cookie', () => {
      return chai.request(app)
        .get('/').set('Cookie', 'authToken=123').then((res) => {
          res.should.redirect
        })
    })

    it('doesn\'t redirect to login if valid authToken cookie', () => {
      let agent = chai.request.agent(app)
      return insertUser({
        username: 'alberto@test.com',
        password: '$2a$10$C4WzVIUmt3K362LYkmubTu2YDUOsxn4dhaa0Yo.zdaPXiA56JqgYm'
      }).then(() => {
        return agent
          .post('/api/users/login')
          .set('Content-Type', 'application/json')
          .send({username: 'alberto@test.com', password: 'myPass'})
      }).then(() => {
        return agent.get('/')
      }).then((res) => {
        res.should.not.redirect
      })
    })
  })

  describe('twitter', () => {
    var accountCollection = null;

    const pendingAccount = {
      userId: userObjectId,
      pending: true,
      type: SocialAccountService.TYPE.TWITTER,
      auth: {
        requestSecret: 'secret',
        requestToken: 'token'
      },
      userData: null
    }

    beforeEach((done) => {
      accountCollection = DatabaseConnection.connection().get('social_accounts');

      accountCollection.remove({}).then(() => done())
    });

    describe('requiring access', () => {
      var stub = null;

      beforeEach(() => {
        stub = sinon.stub(twitterApi.prototype, 'getRequestToken')
        stub.callsArgWith(0, null, 'token', 'secret')
      });

      afterEach(() => {
        if(stub){
          stub.restore()
        }
      })

      it('redirects to twitter authorize page', (done) => {
        chai.request(app)
          .get('/twitter/access').set('Cookie', 'authToken=' + authToken)
          .end(function(err, res) {
            res.should.redirectTo('https://api.twitter.com/oauth/authenticate?oauth_token=token')
            done()
          });
      })

      it('creates a pending social account', () => {
        const expectedAccount = pendingAccount

        return chai.request(app)
          .get('/twitter/access').set('Cookie', 'authToken=' + authToken)
          .then(
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

      const twitterUserData = {
        id: 123,
        username: '@something'
      }

      const insertPendingAccount = () => {
        return accountCollection.insert(pendingAccount)
      }

      const goToCallback = () => {
        return insertPendingAccount().then(() => {
          return chai.request(app)
          .get('/twitter/callback')
          .set('Cookie', 'authToken=' + authToken)
          .query({oauth_token: 'token', oauth_verifier: 'verifier'})
        })
      }

      beforeEach(() => {
        accessStub = sinon.stub(twitterApi.prototype, 'getAccessToken')
        accessStub.callsArgWith(3, null, 'accessToken', 'accessSecret')

        verifyStub = sinon.stub(twitterApi.prototype, 'verifyCredentials')
        verifyStub.callsArgWith(2, null, twitterUserData)
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
          userId: userObjectId,
          pending: false,
          type: SocialAccountService.TYPE.TWITTER,
          auth: {
            requestSecret: 'secret',
            requestToken: 'token',
            accessToken: 'accessToken',
            accessSecret: 'accessSecret'
          },
          userData: twitterUserData
        }

        return goToCallback().then(() => {
          return accountCollection.find({}).then((foundAccounts) => {
            expect(foundAccounts).to.have.lengthOf(1);

            const account = foundAccounts[0];
            expectedAccount._id = account._id;

            expect(account).to.deep.equal(expectedAccount)
          })
        })
      })

      it('interacts with node twitter api', () => {
        return goToCallback().then(() => {
          expect(accessStub.args[0][0]).to.equal('token')
          expect(accessStub.args[0][1]).to.equal('secret')
          expect(accessStub.args[0][2]).to.equal('verifier')

          expect(verifyStub.args[0][0]).to.equal('accessToken')
          expect(verifyStub.args[0][1]).to.equal('accessSecret')
        })
      })
    })
  })
})
