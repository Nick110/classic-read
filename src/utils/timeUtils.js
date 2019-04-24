// symbol: 符号，用冒号还是′和″,true为冒号，false为分秒符号
function ms2Minutes(ms, symbol = true) {
    // 得到分
    let minutes = Math.floor(ms / 60000)
    let leftMs = ms % 60000
    // 得到秒
    let seconds = leftMs / 1000
    let minutesStr = minutes < 10 ? ('0' + minutes) : minutes
    let secondsStr = seconds < 10 ? ('0' + seconds) : seconds
    // 冒号形式：02：49
    let colonStr = `${minutesStr}:${secondsStr}`
    // 分秒符号形式：02′49″
    let str = `${minutesStr}′${secondsStr}″`
    return symbol ? colonStr : str
}

function symbolChange(duration) {
    return duration.replace('′', ':').replace('″', '')
}

// 将微信音频的秒转化为分秒形式
function getAudioTime(currentTime) {
    // 整数
    let integer = Math.round(currentTime)
    // 得到分钟
    return ms2Minutes(integer * 1000, true)
}

export {ms2Minutes, symbolChange, getAudioTime}