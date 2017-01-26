import monk from 'monk';
import DatabaseConnection from '../db/database-connection.js';

const collection = DatabaseConnection.connection().get('social_accounts');

export default {
  getPendingAccount: (requestSecret) => {
    return collection.findOne({auth: {requestSecret}})
  }
}
