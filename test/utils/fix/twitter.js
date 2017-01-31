const utils = {
  tweetUrl: (tweetId) => {
    return 'https://twitter.com/e_muddy/status/' + tweetId
  }
}

const generateTweets = (userId, total) => {
  const tweets = [];

  for(let i=0; i<total; i++){
    let tweetId = userId * 10 + i
    tweets.push({
      error: null,
      data: {id: tweetId, user: {id: userId}},
      url: utils.tweetUrl(tweetId)
    })
  }

  return tweets
}

const accounts = {
  123: {
    userData: {
      id: 123,
      name: 'One Two Three',
      screen_name: '@onetwothree'
    },
    auth: {
      requestToken: 'requestToken123',
      requestSecret: 'requestSecret123',
      accessToken: 'accessToken123',
      accessSecret: 'accessSecret123'
    },
    tweets: generateTweets(123, 2)
  },
  124: {
    userData: {
      id: 124,
      name: 'One Two Four',
      screen_name: '@onetwofour'
    },
    auth: {
      requestToken: 'requestToken124',
      requestSecret: 'requestSecret124',
      accessToken: 'accessToken124',
      accessSecret: 'accessSecret124'
    },
    tweets: generateTweets(124, 2)
  },
  125: {
    userData: {
      id: 125,
      name: 'One Two Five',
      screen_name: '@onetwofive'
    },
    auth: {
      requestToken: 'requestToken125',
      requestSecret: 'requestSecret125',
      accessToken: 'accessToken125',
      accessSecret: 'accessSecret125'
    },
    tweets: generateTweets(125, 2)
  }
}

const indexedTweets = {
  404: {
    error: {
      statusCode: 404,
      data: '{"errors":[{"code":144,"message":"No status found with that ID."}]}'
    },
    data: {"errors":[{"code":144,"message":"No status found with that ID."}]},
    url: utils.tweetUrl(404)
  }
}

for (var accountId in accounts) {
  let acc = accounts[accountId]

  acc.tweets.forEach((tweet) => {
    indexedTweets[tweet.data.id] = tweet
  })
}

export default Object.assign({}, {accounts}, {tweets: indexedTweets}, utils)
