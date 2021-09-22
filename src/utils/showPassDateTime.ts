export default function showPassDateTime(preTime: Date): string {
  const nowTime = new Date()
  const passTime = nowTime.getTime() - preTime.getTime()
  const base = 1000
  if (passTime < 0) return '-'
  if (passTime < base * 60) {
    return Math.floor(passTime / base) + ' seconds ago'
  }
  if (passTime < base * 60 * 60) {
    return Math.floor(passTime / (base * 60)) + ' minutes ago'
  }
  if (passTime < base * 60 * 60 * 24) {
    return Math.floor(passTime / (base * 60 * 60)) + ' hours ago'
  }
  if (passTime < base * 60 * 60 * 24 * 3) {
    return Math.floor(passTime / (base * 60 * 60 * 24)) + ' days ago'
  }
  return preTime.toLocaleString('en')
}
