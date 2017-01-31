import TwitterService from './twitter-service';

const TYPE = {
  TWITTER: TwitterService.type()
}

const services = {
  [TYPE.TWITTER]: TwitterService
}

export default Object.assign({}, services, {
  TYPE,

  forType: (type) => {
    const service = services[type]

    return new service()
  },

  forSocialAccount: (account) => {
    const service = services[account.type]

    return new service(account)
  },

  forTrackUrl: (trackUrl) => {
    if(services[TYPE.TWITTER].testTrackUrl(trackUrl)){
      const service = services[TYPE.TWITTER]

      return new service()
    }else{
      return null
    }
  }
})
