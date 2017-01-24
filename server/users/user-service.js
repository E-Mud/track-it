import DatabaseConnection from '../db/database-connection.js';
import bcrypt from 'bcrypt';
import Auth from './auth';

const collection = DatabaseConnection.connection().get('users');

const UserDAO = {
  getUserByUsername: (username) => {
    return collection.findOne({username});
  },

  createUser: (user) => {
    return bcrypt.hash(user.password, 10).then((encryptedPassword) => {
      return collection.insert({
        username: user.username,
        password: encryptedPassword
      });
    });
  }
}

export default {
  registerUser: (user = {}) => {
    if(!user.username || !user.password){
      return Promise.reject('invalid_user');
    }

    return UserDAO.getUserByUsername(user.username).then((existingUser) => {
      if(existingUser){
        throw 'used_username'
      }else{
        return UserDAO.createUser(user)
      }
    })
  },

  login: (userToLogin) => {
    return UserDAO.getUserByUsername(userToLogin.username).then((user) => {
      if(!user){
        throw new Error('user_not_found')
      }else if(bcrypt.compareSync(userToLogin.password, user.password)){
        const authToken = Auth.createToken(user)
        return {authToken, user}
      }else{
        throw new Error('invalid_password')
      }
    })
  }
}
