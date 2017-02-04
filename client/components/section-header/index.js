import React from 'react';

class SectionHeader extends React.Component {
  render() {
    const propClassName = this.props.className || '';

    return (
      <div className={propClassName + ' section-header flex-container'}>
        <div className={'flex section-divider-container'}>
          <div className={'section-divider'}></div>
        </div>
        <div className={'secondary-text margin-base-horizontal'}>
          {this.props.header}
        </div>
        <div className={'flex section-divider-container'}>
          <div className={'section-divider'}></div>
        </div>
      </div>
    )
  }
}

export default SectionHeader
