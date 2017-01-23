import mongo from 'mongodb'
import monk from 'monk'

class DatabaseConnection {
  constructor() {
    const address = `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}/${process.env.DB_DATABASE}`;

    this.conn = monk(address);
  }

  connection() {
    return this.conn;
  }
}

export default new DatabaseConnection();
