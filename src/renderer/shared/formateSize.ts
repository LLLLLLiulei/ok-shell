export const formatSize = (size: number) => {
  if (isNaN(size) || size === Infinity) {
    return ''
  }
  if (size < 1024) {
    return size.toFixed(0) + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024.0).toFixed(0) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024.0 / 1024.0).toFixed(1) + ' M'
  } else {
    return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' G'
  }
}
