import React from 'react';

class Tag extends React.Component {
  className() {
    return 'tag sm-text ' + (this.props.className || '')
  }

  render() {
    return (
      <div className={this.className()}>
        {this.props.tag.name || this.props.tag}
      </div>
    )
  }
}

export default Tag
