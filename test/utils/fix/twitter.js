export default {
  account123: {
    id: 123,
    name: 'One Two Three',
    screen_name: '@onetwothree'
  },
  account124: {
    id: 124,
    name: 'One Two Four',
    screen_name: '@onetwofour'
  },
  auth123: {
    requestToken: 'requestToken123',
    requestSecret: 'requestSecret123',
    accessToken: 'accessToken123',
    accessSecret: 'accessSecret123'
  },
  auth124: {
    requestToken: 'requestToken124',
    requestSecret: 'requestSecret124',
    accessToken: 'accessToken124',
    accessSecret: 'accessSecret124'
  },
  tweets: {
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
}
