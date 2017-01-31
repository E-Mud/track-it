import monk from 'monk';
import twitterFixture from './twitter';

const globalPrefix = '0'.repeat(19)

const buildId = (entPrefix, suffix) => {
  return monk.id(globalPrefix + entPrefix + suffix)
}

const userId = (suffix) => {
  return buildId('01', suffix)
}

const accountId = (suffix) => {
  return buildId('02', suffix)
}

const trackId = (suffix) => {
  return buildId('03', suffix)
}


const newUser = {
  user: {_id: userId('001'), username: 'new_user@fix.com', password: '$2a$10$vBgl2fk7FRtYj4UECwG43etYUs.e9rBuDuwxnDOJk2m9UvKT1FCbC'},
  auth: {
    password: 'mypass001',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMSIsInVzZXJuYW1lIjoibmV3X3VzZXJAZml4LmNvbSJ9LCJpYXQiOjE0ODU4NjQ2NzN9.BDJpVj5z0cBVMtxYRS4moQrVcQKwAQKWaIpZQvm1_D4',
  }
}

const userWithAccount = {
  user: {_id: userId('002'), username: 'user_with_account@fix.com', password: '$2a$10$Dox3ZGKN/qVIlHwShOdFWuhkI5ktoOqcakllbpkAlV8hr8bsVzd3C'},
  auth: {
    password: 'mypass002',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMiIsInVzZXJuYW1lIjoidXNlcl93aXRoX2FjY291bnRAZml4LmNvbSJ9LCJpYXQiOjE0ODU4NjQ2NzN9.-0rrtU23Z0deuafQvqJcO63qE9j8XClPr9YS1ZOEHfQ'
  },
  twitterAccount: twitterFixture.accounts[123],
  account: {
    _id: accountId('002'), userId: userId('002'), type: 'twitter', pending: false,
    name: twitterFixture.accounts[123].userData.name, username: twitterFixture.accounts[123].userData.screen_name,
    auth: twitterFixture.accounts[123].auth,
    userData: twitterFixture.accounts[123].userData
  }
}

const userWithTrackedAccount = {
  user: {_id: userId('003'), username: 'user_with_tracked_account@fix.com', password: '$2a$10$NSt9ot6o5ogXO0OTNH7.neA4FgXGTgYP4nmWXBm8GPVBiKoBQMYya'},
  auth: {
    password: 'mypass003',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMyIsInVzZXJuYW1lIjoidXNlcl93aXRoX3RyYWNrZWRfYWNjb3VudEBmaXguY29tIn0sImlhdCI6MTQ4NTg2NDY3M30.o0WIcDhkJnHf9uPdw8CBBm9v1R4IUf_e2necXWDa2qc'
  },
  twitterAccount: twitterFixture.accounts[124],
  account: {
    _id: accountId('003'), userId: userId('003'), type: 'twitter', pending: false,
    name: twitterFixture.accounts[124].userData.name, username: twitterFixture.accounts[124].userData.screen_name,
    auth: twitterFixture.accounts[124].auth,
    userData: twitterFixture.accounts[124].userData
  },
  tracks: [
    {
      _id: trackId('030'), userId: userId('003'), socialAccountId: accountId('003'),
      url: 'https://twitter.com/e_muddy/status/1240',
      contentItem: twitterFixture.tweets[1240].data
    },
    {
      _id: trackId('031'), userId: userId('003'), socialAccountId: accountId('003'),
      url: 'https://twitter.com/e_muddy/status/1241',
      contentItem: twitterFixture.tweets[1241].data
    }
  ]
}

const userWithTrackedAccount2 = {
  user: {_id: userId('004'), username: 'user_with_tracked_account@fix.com', password: '$2a$10$NSt9ot6o5ogXO0OTNH7.neA4FgXGTgYP4nmWXBm8GPVBiKoBQMYya'},
  auth: {
    password: 'mypass004',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMyIsInVzZXJuYW1lIjoidXNlcl93aXRoX3RyYWNrZWRfYWNjb3VudEBmaXguY29tIn0sImlhdCI6MTQ4NTg2NDY3M30.o0WIcDhkJnHf9uPdw8CBBm9v1R4IUf_e2necXWDa2qc'
  },
  account: {
    _id: accountId('004'), userId: userId('004'), type: 'twitter', pending: false,
    name: twitterFixture.accounts[124].userData.name, username: twitterFixture.accounts[124].userData.screen_name,
    auth: twitterFixture.accounts[124].auth,
    userData: twitterFixture.accounts[124].userData
  },
  tracks: [
    {
      _id: trackId('040'), userId: userId('004'), socialAccountId: accountId('004'),
      url: 'https://twitter.com/e_muddy/status/1250',
      contentItem: twitterFixture.tweets[1250].data
    },
    {
      _id: trackId('041'), userId: userId('004'), socialAccountId: accountId('004'),
      url: 'https://twitter.com/e_muddy/status/1251',
      contentItem: twitterFixture.tweets[1251].data
    }
  ]
}

export default {
  twitter: twitterFixture,
  newUser,
  userWithAccount,
  userWithTrackedAccount,
  userWithTrackedAccount2
}
