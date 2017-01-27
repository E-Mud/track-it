import monk from 'monk';
import DatabaseConnection from '../db/database-connection';

const collection = DatabaseConnection.connection().get('social_accounts');

export default {
  createAccount: (account) => {
    const accountToCreate = Object.assign({}, account)

    accountToCreate.userId = monk.id(accountToCreate.userId)

    return collection.insert(accountToCreate)
  }
}
