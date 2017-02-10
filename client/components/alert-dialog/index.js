import AlertDialog from './alert-dialog'
import ErrorDialog from './error-dialog'

export default {
  show: AlertDialog.show,
  errorDialog: (errors) => {
    return new ErrorDialog(errors)
  }
}
