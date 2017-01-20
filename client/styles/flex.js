const flexContainerDefaultValues = {
  display: 'flex'
}

const flexItemDefaultValues = {
  grow: 0,
  shrink: 1,
  basis: 'auto'
}

const justifyContent = (justify = 'start') => {
  switch(justify){
    case 'start':
    case 'end':
      return 'flex-' + justify;
    case 'around':
    case 'between':
      return 'space-' + justify;
    default:
      return justify;
  }
}

const alignItems = (align = 'stretch') => {
  switch(align){
    case 'start':
    case 'end':
      return 'flex-' + align;
    default:
      return align;
  }
}

const flexContainer = (opt = {}) => {
  opt = Object.assign({}, flexContainerDefaultValues, opt)

  return {
    display: opt.display,
    flexDirection: opt.direction,
    flexWrap: opt.wrap,
    justifyContent: justifyContent(opt.justify),
    alignItems: alignItems(opt.align)
  }
}

const flexItem = (opt = {}) => {
  opt = Object.assign({}, flexItemDefaultValues, opt)

  return {
    flex: `${opt.grow} ${opt.shrink} ${opt.basis}`
  }
}

console.log(flexContainer)

export default {
  flexContainer,
  flexItem
}
