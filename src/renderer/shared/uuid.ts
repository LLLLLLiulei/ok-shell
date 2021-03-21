export const uuid = (): string => {
  let now = Date.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (now + Math.random() * 16) % 16 | 0
    now = Math.floor(now / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
