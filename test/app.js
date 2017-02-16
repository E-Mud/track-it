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

        fix.insertFixtures([fix.userWithPendingAccount, fix.userWithTrackedAccount]).then(() => done())
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
        return goToCallback().then(() => {
          return accountCollection.find(
            {'userData.id': expectedAccount.userData.id, userId: expectedAccount.userId}
          ).then((foundAccounts) => {
            expect(foundAccounts).to.have.lengthOf(1);

            const account = foundAccounts[0];
            expectedAccount._id = account._id;

            expect(account).to.deep.equal(expectedAccount)
          })
        })
      })

      it('doesn\'t duplicate/replace twitter account', () => {
        return accountCollection.findOneAndUpdate(
          {'userData.id': 123, userId: expectedAccount.userId}, {$set: {'userData.id': 124}}
        ).then((expectedAccount) => {
          return goToCallback().then(() => {
            return accountCollection.find({'userData.id': 124, userId: expectedAccount.userId}).then((foundAccounts) => {
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
