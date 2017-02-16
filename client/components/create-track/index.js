import React from 'react';
import Track from '../../services/track'
import Card from '../card'
import FormFields from '../form-fields'
import AlertDialog from '../alert-dialog'
import Tag from '../tag';

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
      newTrack: {url: '', tags: [], newTag: ''},
      addButtonDisabled: true
    }
  }

  isTwitterURL(url) {
    return this.twitterRegex.test(url)
  }

  resetState() {
    this.state.addButtonDisabled = true
    this.state.newTrack.url = ''
    this.state.newTrack.tags = []
    this.state.newTrack.newTag = ''

    this.setState(this.state)
  }

  onUrlChange() {
    const newUrl = this.state.newTrack.url
    this.state.addButtonDisabled = !this.isTwitterURL(newUrl)
    this.setState(this.state)
  }

  onNewTagChange() {
    const match = this.state.newTrack.newTag.match(/\s*([^,\s]+)[\s,]/)

    if(match){
      this.state.newTrack.tags.push(match[1])
      this.state.newTrack.newTag = ''
      this.setState(this.state)
    }
  }

  addNewTrack() {
    const trackToCreate = {
      url: this.state.newTrack.url,
      tags: this.state.newTrack.tags
    }

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

  removeTag(tag) {
    const index = this.state.newTrack.tags.indexOf(tag)

    if(index >= 0){
      this.state.newTrack.tags.splice(index, 1)
      this.setState(this.state)
    }
  }

  render() {
    const onUrlChange = this.onUrlChange.bind(this),
      onNewTagChange = this.onNewTagChange.bind(this),
      removeTag = this.removeTag.bind(this),
      addNewTrack = this.addNewTrack.bind(this);

    return (
      <Card className={'padded-base'}>
        <FormFields.Input className={'margin-base-bottom'} model={this.state.newTrack} name={'url'} onChange={onUrlChange} placeholder={'Tweet URL'}/>
        <div className={'tags-container'}>
          {
            this.state.newTrack.tags.map((tag) => {
                return (
                  <Tag className={'margin-base-right'} tag={tag} key={tag} onClose={removeTag} />
                );
            })
          }
        </div>
        <FormFields.Input model={this.state.newTrack} name={'newTag'} onChange={onNewTagChange} placeholder={'Add tag'}/>
        <div className={'margin-base-top flex-container end-center'}>
          <button className={'primary'} onClick={addNewTrack} disabled={this.state.addButtonDisabled}>CREATE</button>
        </div>
      </Card>
    )
  }
}

export default CreateTrack;
