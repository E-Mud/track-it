import TwitterService from './twitter-service';

export default {
  TYPE: {
    TWITTER: TwitterService.type()
  },

  Twitter: new TwitterService(process.env.TW_API_KEY, process.env.TW_API_SECRET)
}
