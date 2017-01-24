import DatabaseConnection from '../server/db/database-connection';
import UserService from '../server/users/user-service';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHTTP from 'chai-http';
var should = chai.should();
var expect = chai.expect;
import app from '../server.js';
chai.use(chaiAsPromised);
chai.use(chaiHTTP);

const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjU4ODc5NTUyOWRmYzc5MDAxNmQ1ZGYwMSIsInVzZXJuYW1lIjoiYWxiZXJ0b0B0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJEM0V3pWSVVtdDNLMzYyTFlrbXViVHUyWURVT3N4bjRkaGFhMFlvLnpkYVBYaUE1NkpxZ1ltIn0sImlhdCI6MTQ4NTI4MDU5NH0.ZMnP1lmuOjj2ZfZ5953aPmWEXYmhe0PdHQP5fcNw3CM'
const userId = '588795529dfc790016d5df01'

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
          .set('Authorization', authToken)
          .send({url: 'https://twitter.com/e_muddy/status/30091501105068441'})
          .then((res) => {
            res.body.userId.should.equal(userId)
            return trackCollection.findOne({'_id': res.body._id}).then((createdTrack) => {
              createdTrack.userId.should.equal(userId)
            })
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
})
