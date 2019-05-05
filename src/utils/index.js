function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

// 处理诗句格式
export function formatSentence(sentence) {
    // 取诗句第一句
    let firstSentence = sentence.split(/。|！|；/)[0]
    // 补充符号
    let symbol = sentence.match(/。|！|；/) || ''

    let secondSentence = firstSentence.replace(/\s\s/, '')
    return secondSentence + symbol
}

export default {
  formatNumber,
  formatTime
}
