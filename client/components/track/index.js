import React from 'react';
import Divider from '../divider'
import Tag from '../tag'
import Tracking from '../tracking'

class Track extends React.Component {
  buildPreviewHtml(track) {
    let previewHtml = track.preview.text

    for(let i=0; i<track.preview.links.length; i++){
      let link = track.preview.links[i]

      previewHtml = previewHtml.replace(link, `<a href="${link}">${link}</a>`)
    }

    return previewHtml
  }

  componentWillReceiveProps(newProps) {
    this.previewHtml = this.buildPreviewHtml(newProps.track)
  }

  componentWillMount() {
    this.previewHtml = this.buildPreviewHtml(this.props.track)
  }

  render() {
    const track = this.props.track;

    let tagsContainer;

    if(track.tags && track.tags.length){
      tagsContainer = <div className={'tags-container'}>
          {
            track.tags.map((tag) => {
              return (
                <Tag className={'margin-base-right'} tag={tag} key={tag} />
              );
            })
          }
        </div>
    }else{
      tagsContainer = null
    }

    return (
      <div className={'track-comp flex-container column'}>
        <div className={'preview-container flex padded-base'}>
          <div className={'secondary-text margin-base-bottom'}>{track.author}</div>
          <div className={'main-text'} dangerouslySetInnerHTML={{__html: this.previewHtml}}></div>
        </div>

        <Divider />

        <div className={'tracking-container padded-base flex flex-container start-center'}>
          {tagsContainer}
          <div className={'flex'}/>
          <Tracking track={track} />
        </div>
      </div>
    )
  }
}

export default Track;
