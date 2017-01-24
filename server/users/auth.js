import jwt from 'jsonwebtoken';

export default {
  getPayload: (token) => {
    if(!token) {
      return Promise.reject('missing token')
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, 'secret', (err, payload) => {
        if(err){
          reject(err)
        }else{
          resolve(payload)
        }
      })
    })
  },

  createToken: (user) => {
    return jwt.sign({user}, 'secret')
  }
}
