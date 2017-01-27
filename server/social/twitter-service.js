import monk from 'monk';
import TwitterApi from 'node-twitter-api';
import DatabaseConnection from '../db/database-connection';
import SocialAccountBase from './social-account-base';

const TYPE = 'twitter'

class TwitterService {
  constructor(){
    this.collection = DatabaseConnection.connection().get('social_accounts');
    this.twitterApi = new TwitterApi({
      consumerKey: 'your consumer Key',
      consumerSecret: 'your consumer secret',
      callback: 'http://localhost:8080/twitter/callback'
    })
  }

  static type() {
    return TYPE
  }

  getPendingAccount(requestSecret) {
    return this.collection.findOne({'auth.requestSecret': requestSecret})
  }

  startAccessRequest(userId) {
    return new Promise((resolve, reject) => {
      this.twitterApi.getRequestToken((err, requestToken, requestSecret) => {
        const socialAccount = {
          userId,
          pending: true,
          type: TYPE,
          userData: null,
          auth: {requestSecret, requestToken}
        }

        SocialAccountBase.createAccount(socialAccount).then(() => {
          resolve('https://api.twitter.com/oauth/authenticate?oauth_token=' + requestToken)
        })
      })
    })
  }
}

export default TwitterService
