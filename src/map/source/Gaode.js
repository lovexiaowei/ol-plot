import ol from 'openlayers'
const $XYZSource = ol.source.XYZ
const $Attribution = ol.Attribution
class GAODE extends $XYZSource {
  constructor (options = {}) {
    let attributions = ''
    if (options.attributions !== undefined) {
      attributions = options.attributions
    } else {
      attributions = [GAODE.ATTRIBUTION]
    }
    let crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : undefined
    let url = options.url !== undefined ? options.url : 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
    let tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction : undefined
    super({
      attributions: attributions,
      cacheSize: options.cacheSize,
      crossOrigin: crossOrigin,
      opaque: options.opaque !== undefined ? options.opaque : true,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileLoadFunction: options.tileLoadFunction,
      tileUrlFunction: tileUrlFunction,
      url: url,
      wrapX: options.wrapX
    })
  }
  static ATTRIBUTION = new $Attribution({
    html: '&copy; ' +
    '<a href="http://ditu.amap.com/">高德地图</a> ' +
    'contributors.'
  })
}

export default GAODE
