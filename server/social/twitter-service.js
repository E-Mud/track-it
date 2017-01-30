import monk from 'monk';
import TwitterApi from 'node-twitter-api';
import SocialAccountBase from './social-account-base';

const TYPE = 'twitter'

class TwitterService {
  constructor(consumerKey, consumerSecret){
    this.collection = SocialAccountBase.collection()
    this.twitterApi = new TwitterApi({
      consumerKey,
      consumerSecret,
      callback: process.env.APP_DOMAIN + '/twitter/callback'
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

  getAccessData(account, verifier) {
    const auth = account.auth

    return new Promise((resolve, reject) => {
      this.twitterApi.getAccessToken(auth.requestToken, auth.requestSecret, verifier, (error, accessToken, accessSecret) => {
        if(error){
          reject(error)
        }else{
          Object.assign(account.auth, {accessToken, accessSecret});
          resolve(account)
        }
      })
    })
  }

  verifyCredentials(account) {
    const auth = account.auth

    return new Promise((resolve, reject) => {
      this.twitterApi.verifyCredentials(auth.accessToken, auth.accessSecret, (error, userData) => {
        if(error){
          reject(error)
        }else{
          account.userData = userData
          account.name = userData.name
          account.username = userData.screen_name
          resolve(account)
        }
      })
    })
  }

  saveAccessData({_id, auth, userData, name, username}) {
    return this.collection.findOne({'userData.id': userData.id}).then((foundAccount) => {
      if(foundAccount){
        return this.collection.findOneAndDelete(_id).then(() => foundAccount)
      }else{
        return this.collection.findOneAndUpdate(_id, {
          $set: {
            pending: false,
            'auth.accessToken': auth.accessToken,
            'auth.accessSecret': auth.accessSecret,
            userData,
            name,
            username
          }
        })
      }
    })
  }

  completeAccessRequest(userId, {requestToken, verifier}) {
    return this.collection.findOne({userId: monk.id(userId), 'auth.requestToken': requestToken})
      .then((account) => this.getAccessData(account, verifier))
      .then((account) => this.verifyCredentials(account))
      .then((account) => this.saveAccessData(account))
  }
}

export default TwitterService
