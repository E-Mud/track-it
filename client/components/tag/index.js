import React from 'react';

class Tag extends React.Component {
  constructor(props) {
    super(props)

    this.clicked = this.clicked.bind(this)
    this.tag = this.tag.bind(this)
  }

  className() {
    let baseClass = 'tag sm-text '

    if(this.isCloseable()) {
      baseClass += 'closeable '
    }

    return baseClass + (this.props.className || '')
  }

  isCloseable() {
    return !!this.props.onClose
  }

  tag() {
    return this.props.tag.name || this.props.tag
  }

  clicked() {
    if(this.isCloseable()){
      this.props.onClose(this.tag())
    }
  }

  render() {
    return (
      <div className={this.className()} onClick={this.clicked}>
        <span className={'close'}>&times;</span>
        {this.tag()}
      </div>
    )
  }
}

export default Tag
