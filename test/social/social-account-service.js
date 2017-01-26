import DatabaseConnection from '../../server/db/database-connection';
import SocialAccountService from '../../server/social/social-account-service';
import monk from 'monk';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
var should = chai.should();
var expect = chai.expect;
chai.use(chaiAsPromised);
import bcrypt from 'bcrypt';

describe('SocialAccountService', () => {
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
            requestSecret: '1234'
          },
          userData: null
        }

        return SocialAccountService.createAccount(accountToCreate).then((createdAccount) => {
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

  describe('on social account reading', () => {
    const pendingAccounts = [
      {
        _id: '123456789012345678901235',
        pending: true,
        type: SocialAccountService.TYPE.TWITTER,
        auth: {
          requestSecret: '1231'
        },
        userData: null
      },
      {
        _id: '123456789012345678901236',
        pending: true,
        type: SocialAccountService.TYPE.TWITTER,
        auth: {
          requestSecret: '1232'
        },
        userData: null
      }
    ]

    const insertAccounts = (accountsToInsert) => {
      return collection.insert(accountsToInsert)
    }

    it('returns pending account by request secret', () => {
      return insertAccounts(pendingAccounts).then(() => {
        return SocialAccountService.Twitter.getPendingAccount('1231').then((res) => {
          res.should.deep.equal(pendingAccounts[0])
        })
      })
    })

    it('doesn\'t return other pending social accounts', () => {
      return insertAccounts(pendingAccounts[1]).then(() => {
        return SocialAccountService.Twitter.getPendingAccount('1231').then((res) => {
          expect(res).to.be.null
        })
      })
    })
  })
})
