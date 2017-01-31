import DatabaseConnection from '../../server/db/database-connection';
import UserService from '../../server/users/user-service';
import fix from '../utils/fix';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var expect = chai.expect;
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('UserService', () => {
  const user = {
    username: fix.newUser.user.username,
    password: fix.newUser.auth.password
  }

  describe('on user registration', () => {
    var collection = null;

    beforeEach((done) => {
      collection = DatabaseConnection.connection().get('users');
      fix.clean().then(() => done())
    });

    it('creates a new user', () => {
      return UserService.registerUser(user).then((returnedUser) => {
        expect(returnedUser.username).to.equal(user.username)

        return collection.find({}).then((result) => {
          expect(result).to.have.lengthOf(1);

          let createdUser = result[0];

          expect(createdUser.username).to.equal(user.username)
          expect(returnedUser._id.toString()).to.equal(createdUser._id.toString())
          expect(bcrypt.compareSync(user.password, createdUser.password)).to.equal(true);
        })
      })
    })

    it('throws invalid_user if no username', () => {
      return expect(UserService.registerUser({
        password: 'myPass'
      })).to.be.rejectedWith('invalid_user');
    })

    it('throws invalid_user if no password', () => {
      return expect(UserService.registerUser({
        username: 'alberto@test.com'
      })).to.be.rejectedWith('invalid_user');
    })

    it('throws used_username if username is already used', () => {
      return fix.insertFixtures(fix.newUser).then(() => {
        return expect(UserService.registerUser(user)).to.be.rejectedWith('used_username');
      })
    })
  })

  describe('on login', () => {
    beforeEach((done) => {
      fix.clean()
        .then(() => fix.insertFixtures(fix.newUser))
        .then(() => done())
    });

    it('returns the user', () => {
      return UserService.login(user).then((res) => {
        expect(res.user).to.deep.equal(fix.newUser.user);
      })
    })

    it('returns the authToken', () => {
      return UserService.login(user).then((res) => {
        expect(res.authToken).to.exist;
      })
    })

    it('throws invalid_password if password is invalid', () => {
      return expect(UserService.login({
        username: user.username,
        password: 'ñeeeee'
      })).to.be.rejectedWith('invalid_password');
    })

    it('throws user_not_found if user doesn\'t exist', () => {
      return expect(UserService.login({
        username: user.username + 'hey',
        password: 'myPass'
      })).to.be.rejectedWith('user_not_found');
    })
  })
})
