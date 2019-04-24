function ms2Minutes(ms) {
    // 得到分
    let minutes = Math.floor(ms / 60000)
    let leftMs = ms % 60000
    // 得到秒
    let seconds = leftMs / 1000
    let minutesStr = minutes < 10 ? ('0' + minutes) : minutes
    let secondsStr = seconds < 10 ? ('0' + seconds) : seconds
    return `${minutesStr}′${secondsStr}″`
}

export default ms2Minutes