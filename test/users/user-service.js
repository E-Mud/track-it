import DatabaseConnection from '../../server/db/database-connection';
import UserService from '../../server/users/user-service';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var should = chai.should();
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('UserService', () => {
  describe('on user registration', () => {
    var collection = null;

    beforeEach((done) => {
      collection = DatabaseConnection.connection().get('users');

      collection.remove({}).then(() => done())
    });

    it('creates a new user', () => {
      return UserService.registerUser({
        username: 'alberto@test.com',
        password: 'myPass'
      }).then((createdUser) => {
        return collection.find({}).then((result) => {
          result.length.should.equal(1);

          let user = result[0];

          user.username.should.equal('alberto@test.com')
          createdUser.username.should.equal('alberto@test.com')
          createdUser._id.should.exist
          bcrypt.compareSync('myPass', user.password).should.equal(true);
        })
      })
    })

    it('throws invalid_user if no username', () => {
      return UserService.registerUser({
        password: 'myPass'
      }).should.be.rejectedWith('invalid_user');
    })

    it('throws invalid_user if no password', () => {
      return UserService.registerUser({
        username: 'alberto@test.com'
      }).should.be.rejectedWith('invalid_user');
    })

    it('throws used_username if username is already used', () => {
      return collection.insert({username: 'alberto@test.com'}).then(() => {
        return UserService.registerUser({
          username: 'alberto@test.com',
          password: 'myPass'
        }).should.be.rejectedWith('used_username');
      })
    })
  })
})
