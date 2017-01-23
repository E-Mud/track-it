import React from 'react';
import {render} from 'react-dom';
import './modal.styl';

function Modal(WrappedComponent, opt = {}) {
  opt = Object.assign({
    clickOutsideTo: 'cancel'
  })
  return class ModalComponent extends React.Component {
    constructor(props) {
      super(props);
    }

    stopClick(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    getMaskClick({clickOutsideTo}) {
      switch (clickOutsideTo) {
        case 'close':
          return this.props.closeModal;
        case 'cancel':
          return this.props.cancelModal;
        default:
          return null;
      }
    }

    render() {
      let maskClick = this.getMaskClick(opt)
      return (
        <div className={'modal-mask'} onClick={maskClick}>
          <div className={'modal flex-50'} onClick={this.stopClick}>
            <WrappedComponent {...this.props}/>
          </div>
        </div>
      )
    }
  }
}

// Modal.show(Example, {msg: 'HI'}).then((res) => {
//   console.log(res)
// })

const clearModalContainer = () => {
  let modalContainer = document.getElementById("modal-container");
  while (modalContainer.firstChild) {
      modalContainer.removeChild(modalContainer.firstChild);
  }
}

export default {
  show: (component, props, opt = {}) => {
    const modalPromise = new Promise((closeModal, cancelModal) => {
      const ModalComponentToShow = Modal(component, opt);

      render(<ModalComponentToShow {...props} closeModal={closeModal} cancelModal={cancelModal} />, document.getElementById('modal-container'));
    })

    return modalPromise.then((result) => {
      clearModalContainer();
      return result;
    }, (reason) => {
      clearModalContainer();
      return reason;
    })
  }
}
