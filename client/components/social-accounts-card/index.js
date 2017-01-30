import React from 'react';
import Card from '../card';

class SocialAccountsCard extends React.Component {
  render() {
    return (
      <Card>
        <div>
          {this.props.socialAccounts.map((account) => {
            return (
              <div key={account._id} className={'padded-base flex-container start-center'}>
                <div className={'flex'}>
                  {account.name}
                  <span className={'secondary-text'}> @{account.username}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className={'flex-container end-center'}>
          <a href='/twitter/access' className={'primary button'}>ADD</a>
        </div>
      </Card>
    )
  }
}

export default SocialAccountsCard
