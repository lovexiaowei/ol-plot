import ol from 'openlayers'
const $Attribution = ol.Attribution
const $TileImageSource = ol.source.TileImage
const $TileGrid = ol.tilegrid.TileGrid
class BAIDU extends $TileImageSource {
  constructor (options = {}) {
    let attributions = ''
    if (options.attributions !== undefined) {
      attributions = options.attributions
    } else {
      attributions = [BAIDU.ATTRIBUTION]
    }
    options.projection = options['projection'] ? options.projection : 'EPSG:3857'
    let crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous'
    let url = options.url !== undefined ? options.url : 'http://online{0-3}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20170607&scaler=1&p=1'
    let tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction : undefined
    if (!tileUrlFunction) {
      tileUrlFunction = function (tileCoord) {
        let z = tileCoord[0]
        let x = tileCoord[1]
        let y = tileCoord[2]
        if (x < 0) {
          x = 'M' + (-x)
        }
        if (y < 0) {
          y = 'M' + (-y)
        }
        return url.replace('{0-3}', BAIDU.getRandom(0, 3)).replace('{x}', (x).toString()).replace('{y}', y.toString()).replace('{z}', (z).toString())
      }
    }
    let levels = options['levels'] ? options['levels'] : 19
    let resolutions = []
    for (let z = 0; z < levels; z++) {
      resolutions[z] = Math.pow(2, levels - 1 - z)
    }
    let tileGrid = new $TileGrid({
      tileSize: options['tileSize'] ? options['tileSize'] : 256,
      origin: (options['origin'] ? options['origin'] : [0, 0]),
      extent: (options['extent'] ? options['extent'] : undefined),
      resolutions: resolutions,
      minZoom: ((options['minZoom'] && typeof options['minZoom'] === 'number') ? options['minZoom'] : 0)
    })
    super({
      tileGrid: tileGrid,
      attributions: attributions,
      cacheSize: options.cacheSize,
      projection: options.projection,
      crossOrigin: crossOrigin,
      opaque: options.opaque !== undefined ? options.opaque : true,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileUrlFunction: tileUrlFunction,
      url: url,
      wrapX: options.wrapX
    })
  }
  static getRandom (min, max) {
    let r = Math.random() * (max - min)
    let re = Math.round(r + min)
    re = Math.max(Math.min(re, max), min)
    return re
  }
  static ATTRIBUTION = new $Attribution({
    html: '&copy; ' +
    '<a href="http://map.baidu.com/">百度地图</a> ' +
    'contributors.'
  })
}

export default BAIDU
