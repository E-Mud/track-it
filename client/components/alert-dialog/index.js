import React from 'react';
import Modal from '../modal';

class AlertDialogContent extends React.Component {
  render() {
    return (
      <div className={'padded-base'}>
        <div className={'main-text margin-base'}>{this.props.msg}</div>
        <div className={'flex-container end-start'}>
          <button className={'primary'} onClick={this.props.closeModal}>ACCEPT</button>
        </div>
      </div>
    )
  }
}

export default {
  show: (props) => {
    return Modal.show(AlertDialogContent, props, {clickOutsideTo: 'close'})
  }
}
