import monk from'monk';

const tweets = {
  404: {
    error: {
      statusCode: 404,
      data: '{"errors":[{"code":144,"message":"No status found with that ID."}]}'
    },
    data: {"errors":[{"code":144,"message":"No status found with that ID."}]}
  },
  1230: {
    error: null,
    data: {id: 1230, user: {id: 123}}
  },
  1240: {
    error: null,
    data: {id: 1240, user: {id: 124}}
  }
}

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

  getTweet: (type, params, token, secret, callback) => {
    validateTweetRequest(type, params)

    const tweet = tweets[params.id]
    callback(tweet.error, tweet.data)
  }
}
