import monk from 'monk';
import DatabaseConnection from '../db/database-connection';
import TwitterService from './twitter-service';

const collection = DatabaseConnection.connection().get('social_accounts');

export default {
  TYPE: {
    TWITTER: TwitterService.type()
  },

  Twitter: new TwitterService()
}
