import monk from 'monk';
import DatabaseConnection from '../db/database-connection';
import TwitterService from './twitter-service';

const collection = DatabaseConnection.connection().get('social_accounts');

const TYPE = {
  TWITTER: 'twitter'
}

export default {
  TYPE,

  Twitter: TwitterService,

  createAccount: (account) => {
    const accountToCreate = Object.assign({}, account)

    accountToCreate.userId = monk.id(accountToCreate.userId)

    return collection.insert(accountToCreate)
  }
}
