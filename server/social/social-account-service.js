import TwitterService from './twitter-service';
import SocialAccountBase from './social-account-base';

const TYPE = {
  TWITTER: TwitterService.type()
}

const services = {
  [TYPE.TWITTER]: TwitterService
}

export default Object.assign({}, services, {
  TYPE,

  getCompleteAccounts: SocialAccountBase.getCompleteAccounts,

  createAccount: SocialAccountBase.createAccount,

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
