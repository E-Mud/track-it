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
  const user = {_id: monk.id('f23456789012345678901234'), username: 'username'};

  var collection = null;

  beforeEach((done) => {
    collection = DatabaseConnection.connection().get('social_accounts');

    collection.remove({}).then(() => done())
  });

  describe('on social account reading', () => {
    const pendingAccounts = [
      {
        _id: '123456789012345678901235',
        pending: true,
        type: SocialAccountService.TYPE.TWITTER,
        auth: {
          requestSecret: '1231',
          requestToken: '3121'
        },
        userData: null
      },
      {
        _id: '123456789012345678901236',
        pending: true,
        type: SocialAccountService.TYPE.TWITTER,
        auth: {
          requestSecret: '1232',
          requestToken: '3221'
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
