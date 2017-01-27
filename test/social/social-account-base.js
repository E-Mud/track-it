import DatabaseConnection from '../../server/db/database-connection';
import SocialAccountBase from '../../server/social/social-account-base';
import SocialAccountService from '../../server/social/social-account-service';
import monk from 'monk';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var should = chai.should();
var expect = chai.expect;
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('SocialAccountBase', () => {
  const user = {_id: monk.id('f23456789012345678901234'), username: 'username'},
    otherUser = {_id: monk.id('f23456789012345678901233'), username: 'other'};

  var collection = null, userCollection = null;

  const insertUser = () => {
    return userCollection.insert(Object.assign({}, user))
  }

  beforeEach((done) => {
    collection = DatabaseConnection.connection().get('social_accounts');
    userCollection = DatabaseConnection.connection().get('users');

    Promise.all([
      collection.remove({}),
      userCollection.remove({})
    ]).then(() => done())
  });

  describe('on social account creation', () => {
    it('creates a new social account', () => {
      return insertUser().then(() => {
        let accountToCreate = {
          userId: 'f23456789012345678901234',
          pending: true,
          type: SocialAccountService.TYPE.TWITTER,
          auth: {
            requestSecret: '1234',
            requestToken: '4321',
          },
          userData: null
        }

        return SocialAccountBase.createAccount(accountToCreate).then((createdAccount) => {
          accountToCreate._id = createdAccount._id

          createdAccount.userId.toString().should.equal(accountToCreate.userId)
          accountToCreate.userId = createdAccount.userId

          createdAccount.should.deep.equal(accountToCreate)

          return collection.find({}).then((result) => {
            result.length.should.equal(1);

            let socialAccount = result[0];

            socialAccount.should.deep.equal(createdAccount)
          })
        })
      })
    })
  })
})
