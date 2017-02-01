import fixtures from './fixtures'
import DatabaseConnection from '../../../server/db/database-connection';

export default Object.assign({}, fixtures, {
  insertFixtures: (fixtures) => {
    fixtures = Array.isArray(fixtures) ? fixtures : [fixtures]

    const promiseArray = []

    fixtures.forEach((fixt) => {
      if(fixt.user){
        promiseArray.push(DatabaseConnection.connection().get('users').insert(fixt.user))
      }
      if(fixt.account){
        promiseArray.push(DatabaseConnection.connection().get('social_accounts').insert(fixt.account))
      }
      if(fixt.pendingAccount){
        promiseArray.push(DatabaseConnection.connection().get('social_accounts').insert(fixt.pendingAccount))
      }
      if(fixt.tracks){
        promiseArray.push(DatabaseConnection.connection().get('tracks').insert(fixt.tracks))
      }
    })

    return Promise.all(promiseArray)
  },

  clean: () => {
    return Promise.all([
      DatabaseConnection.connection().get('users').remove({}),
      DatabaseConnection.connection().get('social_accounts').remove({}),
      DatabaseConnection.connection().get('tracks').remove({})
    ])
  },

  parseObjectIds: (itemsArrayInput) => {
    const itemsArray = Array.isArray(itemsArrayInput) ? itemsArrayInput : [itemsArrayInput]
    const objectIdFields = ['_id', 'userId', 'socialAccountId']

    const result = itemsArray.map((item) => {
      const newItem = Object.assign({}, item)

      objectIdFields.forEach((field) => {
        if(newItem[field]){
          newItem[field] = newItem[field].toString()
        }
      })

      return newItem
    })

    return Array.isArray(itemsArrayInput) ? result : result[0]
  },

  bearerToken: (user) => {
    if(user){
      return 'Bearer ' + user.auth.authToken
    }else{
      return null
    }
  },

  authCookie: (user) => {
    return 'authToken=' + user.auth.authToken
  }
})
