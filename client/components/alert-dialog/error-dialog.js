import AlertDialog from './alert-dialog.js'

class ErrorDialog {
  constructor(errors = {}){
    this.errors = Object.assign({}, errors)
  }

  showError(error) {
    const errorMessage = this.errors[error.msg || error.message] || this.errors.default

    AlertDialog.show({msg: errorMessage})
  }

  showRejectedPromise(reason) {
    this.showError(reason)

    return Promise.reject(reason)
  }

  showRejectedHttpPromise(res) {
    this.showError(res.data)

    return Promise.reject(res)
  }
}

export default ErrorDialog
