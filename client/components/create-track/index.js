import React from 'react';
import Track from '../../services/track'
import Card from '../card'
import FormFields from '../form-fields'
import AlertDialog from '../alert-dialog'

const ErrorDialog = AlertDialog.errorDialog({
  'not_found_content': 'We couldn\'t find a tweet with that URL',
  'already_tracked': 'You are already tracking that tweet',
  'invalid_url': 'That\'s not a valid Tweet URL',
  'not_found_account': 'You cannot track a tweet that is not authored by you. Maybe you need to add the account?'
})

class CreateTrack extends React.Component {
  constructor(props) {
    super(props)

    this.twitterRegex = /https:\/\/twitter\.com\/[^\/]+\/status\/.+/

    this.state = {
      newTrack: {url: ''},
      addButtonDisabled: true
    }
  }

  isTwitterURL(url) {
    return this.twitterRegex.test(url)
  }

  resetState() {
    this.state.addButtonDisabled = true
    this.state.newTrack.url = ''

    this.setState(this.state)
  }

  onUrlChange() {
    const newUrl = this.state.newTrack.url
    this.state.addButtonDisabled = !this.isTwitterURL(newUrl)
    this.setState(this.state)
  }

  addNewTrack() {
    const trackToCreate = Object.assign({}, this.state.newTrack)

    this.state.addButtonDisabled = true
    this.setState(this.state)

    const promise = Track.createTrack(trackToCreate).then((res) => {
      this.resetState()
      return res;
    }, (res) => ErrorDialog.showRejectedHttpPromise(res))

    if(this.props.onTrackCreated){
      this.props.onTrackCreated(trackToCreate, promise)
    }
  }

  render() {
    const onUrlChange = this.onUrlChange.bind(this),
      addNewTrack = this.addNewTrack.bind(this);

    return (
      <Card className={'padded-base'}>
        <FormFields.Input model={this.state.newTrack} name={'url'} onChange={onUrlChange} placeholder={'Tweet URL'}/>
        <div className={'margin-base-top flex-container end-center'}>
          <button className={'primary'} onClick={addNewTrack} disabled={this.state.addButtonDisabled}>CREATE</button>
        </div>
      </Card>
    )
  }
}

export default CreateTrack;
