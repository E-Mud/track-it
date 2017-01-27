import monk from 'monk';
import DatabaseConnection from '../db/database-connection';

const collection = DatabaseConnection.connection().get('social_accounts');

export default {
  collection: () => {
    return collection
  },

  createAccount: (account) => {
    const accountToCreate = Object.assign({}, account)

    accountToCreate.userId = monk.id(accountToCreate.userId)

    return collection.insert(accountToCreate)
  },

  getCompleteAccounts: (userId) => {
    return collection.find({userId: monk.id(userId), pending: false})
  }
}
