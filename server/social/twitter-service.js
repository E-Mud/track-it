import monk from 'monk';
import TwitterApi from 'node-twitter-api';
import SocialAccountBase from './social-account-base';

const TWITTER_LOOKUP_LIMIT = 100
const TYPE = 'twitter'

class TwitterService {
  constructor(account){
    this.collection = SocialAccountBase.collection()
    this.twitterApi = new TwitterApi({
      consumerKey: process.env.TW_API_KEY,
      consumerSecret: process.env.TW_API_SECRET,
      callback: process.env.APP_DOMAIN + '/twitter/callback'
    })

    if(account){
      const auth = account.auth

      this.accessToken = auth.accessToken
      this.accessSecret = auth.accessSecret
    }
  }

  static type() {
    return TYPE
  }

  type() {
    return TYPE
  }

  static testTrackUrl(trackUrl) {
    return /https:\/\/twitter\.com\/[^\/]+\/status\/.+/.test(trackUrl)
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

  getTweetIdFromUrl(trackUrl) {
    const match = trackUrl.match(/https:\/\/twitter\.com\/[^\/]+\/status\/(.+)/)

    return match[1]
  }

  getAccountForContentItem(userId, contentItem) {
    return this.collection.findOne({userId: monk.id(userId), 'userData.id': contentItem.user.id})
  }

  getTweet(trackUrl) {
    return new Promise((resolve, reject) => {
      const tweetId = this.getTweetIdFromUrl(trackUrl)

      this.twitterApi.statuses('show', {id: tweetId}, null, null, (error, data) => {
        if(error){
          reject(new Error('not_found_content'))
        }else{
          resolve(data)
        }
      })
    })
  }

  getPreview(contentItem) {
    return {
      text: contentItem.text,
      links: contentItem.entities.urls.map((url) => url.url)
    }
  }

  getTracking(tweet) {
    return {
      retweets: tweet.retweet_count || 0,
      favorites: tweet.favorite_count || 0
    }
  }

  buildTrack(trackUrl) {
    return this.getTweet(trackUrl).then((tweet) => {
      const result = {contentItem: tweet}

      result.preview = this.getPreview(tweet)
      result.contentItemId = tweet.id
      result.tracking = this.getTracking(tweet)

      return result
    })
  }

  getUpdatedTracking(fullTrackList) {
    const chunkedTrackList = [];

    for(let i=0; i<fullTrackList.length; i += TWITTER_LOOKUP_LIMIT){
      chunkedTrackList.push(fullTrackList.slice(i, i + TWITTER_LOOKUP_LIMIT))
    }

    const promiseArray = chunkedTrackList.map((trackList) => {
      const idList = trackList.map((track) => track.contentItemId).join(',')

      return new Promise((resolve, reject) => {
        this.twitterApi.statuses('lookup', {id: idList, trim_user: true}, this.accessToken, this.accessSecret, (error, data) => {
          if(error){
            reject(error)
          }else{
            const updatedTracking = data.map((tweet) => {
              const relatedTrack = trackList.find((track) => track.contentItemId === tweet.id)

              return Object.assign({}, relatedTrack, {tracking: this.getTracking(tweet)})
            })

            resolve(updatedTracking)
          }
        })
      })
    })

    return Promise.all(promiseArray).then((result) => {
      return result.reduce((acc, tracks) => {
        return acc.concat(tracks)
      }, [])
    })
  }
}

export default TwitterService
