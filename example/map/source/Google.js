import ol from 'openlayers'
const $XYZSource = ol.source.XYZ
const $Attribution = ol.Attribution
class GOOGLE extends $XYZSource {
  constructor (options = {}) {
    let attributions = ''
    if (options.attributions !== undefined) {
      attributions = options.attributions
    } else {
      attributions = [GOOGLE.ATTRIBUTION]
    }
    let crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous'
    let url = options.url !== undefined ? options.url : 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
    super({
      attributions: attributions,
      cacheSize: options.cacheSize,
      crossOrigin: crossOrigin,
      opaque: options.opaque !== undefined ? options.opaque : true,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileLoadFunction: options.tileLoadFunction,
      url: url,
      wrapX: options.wrapX
    })
  }
  static ATTRIBUTION = new $Attribution({
    html: '&copy; ' +
    '<a href="http://www.google.cn/maps">谷歌地图</a> ' +
    'contributors.'
  })
}

export default GOOGLE
