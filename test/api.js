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

describe('TrackIt API', () => {
  describe('/users', () => {
    describe('/register', () => {
      var collection = null;

      const doRegisterRequest = (body) => {
        return chai.request(app)
          .post('/api/users/register')
          .set('Content-Type', 'application/json')
          .send(body)
      }

      beforeEach((done) => {
        collection = DatabaseConnection.connection().get('users');

        collection.remove({}).then(() => done())
      });

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
      var collection = null;

      const doLoginRequest = (body) => {
        return collection.insert(user).then(() => {
          return chai.request(app)
            .post('/api/users/login')
            .set('Content-Type', 'application/json')
            .send(body)
        })
      }

      beforeEach((done) => {
        collection = DatabaseConnection.connection().get('users');

        collection.remove({}).then(() => done())
      });

      it('returns the created user', () => {
        return doLoginRequest({username: user.username, password: 'myPass' })
          .then(function (res) {
            res.should.have.status(200);
            res.body.user.should.exist;
            res.body.authToken.should.exist;
          })
      })

      it('sets authToken cookie', () => {
        return doLoginRequest({username: user.username, password: 'myPass' })
          .then(function (res) {
            expect(res).to.have.cookie('authToken');
            expect(res).to.have.cookie('authToken', res.body.authToken);
          })
      })

      it('returns an error for invalid user', () => {
        return doLoginRequest({username: '2' + user.username, password: 'myPass' })
          .catch(function (res) {
            res.should.have.status(400);
            res.response.body.should.deep.equal({msg: 'user_not_found'})
          })
      })

      it('returns an error for invalid password', () => {
        return doLoginRequest({username: user.username, password: 'myPass2' })
          .catch(function (res) {
            res.should.have.status(400);
            res.response.body.should.deep.equal({msg: 'invalid_password'})
          })
      })
    })
  })
})
