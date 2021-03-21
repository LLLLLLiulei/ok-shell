export const formatDate = (date: Date | string | number, fmt?: string) => {
  if (typeof date === 'string') {
    date = new Date(Date.parse(date.replace(/-/g, '/')))
  } else if (!(date instanceof Date)) {
    date = new Date(date)
  }
  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'H+': date.getHours(),
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k as KeyOf<typeof o>] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length))
    }
  }
  return fmt
}
