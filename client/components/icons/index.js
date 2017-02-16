import React from 'react';

function Icon(WrappedComponent) {
  return class IconComponent extends React.Component {
    constructor(props) {
      super(props);
    }

    className() {
      return 'icon ' + (this.props.className || '')
    }

    render() {
      const newProps = Object.assign({}, this.props, {size: 18, className: this.className()});

      delete newProps.model

      return (
        <WrappedComponent {...newProps}/>
      )
    }
  }
}

export default {
  Track: Icon(require('react-icons/lib/md/link')),
  Tag: Icon(require('react-icons/lib/fa/tag')),
  Retweet: Icon(require('react-icons/lib/fa/retweet')),
  Favorite: Icon(require('react-icons/lib/fa/heart')),
  SocialAccount: Icon(require('react-icons/lib/md/person'))
}
