import React from 'react';
import Card from '../card';
import Track from '../track';

class TrackList extends React.Component {
  className() {
    return 'card-list track-list ' + (this.props.className || '')
  }

  render() {
    return (
      <div className={this.className()}>
        {
          this.props.trackList.map((track) => {
              return (
                <Card className={'margin-base-bottom'} key={track._id}>
                  <Track track={track}/>
                </Card>
              );
          })
        }
      </div>
    )
  }
}

export default TrackList;
