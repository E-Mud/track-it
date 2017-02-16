import React from 'react';
import Card from '../card';
import FaTwitter from 'react-icons/lib/fa/twitter'

class SocialAccountsCard extends React.Component {
  render() {
    let noAccountsMessage;

    if(this.props.socialAccounts && this.props.socialAccounts.length){
      noAccountsMessage = null
    }else{
      noAccountsMessage = <div className={'padded-base-left secondary-text'}>You have no social accounts</div>
    }

    return (
      <Card>
        <div>
          {this.props.socialAccounts.map((account) => {
            return (
              <div key={account._id} className={'padded-base flex-container start-center'}>
                <div className={'flex padded-base-top'}>
                  <FaTwitter size={20} className={'icon margin-base-right'} />
                  {account.name}
                  <span className={'secondary-text'}> @{account.username}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className={'flex-container start-center'}>
          {noAccountsMessage}
          <div className={'flex'} />
          <a href='/twitter/access' className={'primary button'}>ADD</a>
        </div>
      </Card>
    )
  }
}

export default SocialAccountsCard
