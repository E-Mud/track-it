import monk from'monk';
import fix from '../fix/twitter';

const tweets = fix.tweets

const relatedSocialAccount = {
  _id: monk.id('098765432109876543210987'),
  userId: monk.id('588795529dfc790016d5df01'),
  type: 'twitter',
  userData: {id: 123}
}

const validateTweetRequest = (type, params) => {
  if(type !== 'show'){
    throw new Error('incorrect method')
  }

  if(!params || !tweets[params.id]){
    throw new Error('incorrect params')
  }
}

export default {
  relatedSocialAccount,

  tweetUrl: fix.tweetUrl,

  getTweet: (type, params, token, secret, callback) => {
    validateTweetRequest(type, params)

    const tweet = tweets[params.id]
    callback(tweet.error, tweet.data)
  },

  getRequestToken: (callback) => {
    callback(null, 'token', 'secret')
  },

  getAccessToken: (expected, {accessToken, accessSecret}) => {
    return (token, secret, verifier, callback) => {
      if(token !== expected.token || secret !== expected.secret || verifier !== expected.verifier){
        throw new Error('incorrect params')
      }

      callback(null, accessToken, accessSecret)
    }
  },

  verifyCredentials: (expected, twitterUserData) => {
    return (token, secret, callback) => {
      if(token !== expected.token || secret !== expected.secret){
        throw new Error('incorrect params')
      }

      callback(null, twitterUserData)
    }
  }
}
