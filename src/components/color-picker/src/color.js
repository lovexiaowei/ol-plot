const INT_HEX_MAP = {10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F'}

const toHex = function ({r, g, b}) {
  const hexOne = function (value) {
    value = Math.min(Math.round(value), 255)
    const high = Math.floor(value / 16)
    const low = value % 16
    return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low)
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return ''

  return '#' + hexOne(r) + hexOne(g) + hexOne(b)
}

const HEX_INT_MAP = {A: 10, B: 11, C: 12, D: 13, E: 14, F: 15}

const parseHexChannel = function (hex) {
  if (hex.length === 2) {
    return (HEX_INT_MAP[hex[0].toUpperCase()] || +hex[0]) * 16 + (HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1])
  }

  return HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1]
}

const toRgbaColor = value => {
  let _rValue = ''
  if (value && typeof value === 'object') {
    _rValue = 'rgb(' + value['r'] + ', ' + value['g'] + ', ' + value['b'] + ')'
  } else if (value.indexOf('rgb') !== -1) {
    const parts = value.replace(/rgba|rgb|\(|\)/gm, '')
      .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

    if (parts.length === 4) {
      _rValue = Math.floor(parseFloat(parts[3]) * 100)
    } else {
      parts.push(1)
    }
    _rValue = {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts[3]
    }
  } else if (value.indexOf('#') !== -1) {
    const hex = value.replace('#', '').trim()
    let r, g, b
    if (hex.length === 3) {
      r = parseHexChannel(hex[0] + hex[0])
      g = parseHexChannel(hex[1] + hex[1])
      b = parseHexChannel(hex[2] + hex[2])
    } else if (hex.length === 6) {
      r = parseHexChannel(hex.substring(0, 2))
      g = parseHexChannel(hex.substring(2, 4))
      b = parseHexChannel(hex.substring(4))
    }
    _rValue = {
      r,
      g,
      b,
      a: 1
    }
  }
  return {
    rgba: _rValue
  }
}

const rgbaToagb = value => {
  let _rData = ''
  if (value && typeof value === 'object') {
    _rData = 'rgb(' + value['r'] + ', ' + value['g'] + ', ' + value['b'] + ')'
  } else if (value.indexOf('rgb') !== -1) {
    const parts = value.replace(/rgba|rgb|\(|\)/gm, '')
      .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

    if (parts.length === 4) {
      _rData = Math.floor(parseFloat(parts[3]) * 100)
    } else {
      _rData = 'rgb(' + parts.join(',') + ')'
    }
  }
  return _rData
}

export {
  rgbaToagb,
  toRgbaColor,
  toHex
}
