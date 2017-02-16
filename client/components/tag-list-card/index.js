import React from 'react';
import Card from '../card';
import Divider from '../divider';
import Tag from '../tag';
import Tracking from '../tracking';

class TagListCard extends React.Component {
  render() {
    return (
      <Card>
        <div>
          {this.props.tagList.map((tag, index) => {
            const divider = index === 0 ? null : <Divider />

            return (
              <div key={tag._id}>
                {divider}
                <div className={'padded-base-left padded-large-right padded-large-vertical flex-container start-center'}>
                  <Tag tag={tag} />
                  <div className={'flex'} />
                  <Tracking track={tag} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }
}

export default TagListCard
