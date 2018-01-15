/**
 * Created by FDD on 2017/11/15.
 * @desc 视图处理工具
 */
import $Extent from 'ol/extent'
/**
 * 获取当前视图范围
 * @param map
 * @param size
 * @returns {ol.Extent}
 */
const getExtent = (map, size) => {
  if (map && size) {
    return (map.getView().calculateExtent(size))
  } else {
    return (map.getView().calculateExtent(map.getSize()))
  }
}

/**
 * 获取当前地图的范围
 * @param map
 * @returns {ol.Extent}
 */
const getMapCurrentExtent = (map) => {
  if (map) {
    return map.getView().calculateExtent(map.getSize())
  }
}

/**
 * 缩放到全图
 * @param map
 * @param zoom
 */
const zoomMaxExtent = (map, zoom) => {
  let view = map.getView()
  zoom = (typeof zoom === 'number') ? zoom : 2
  if (map && view) {
    let center = view.getCenter()
    if (center) {
      this.view.setCenter(center)
      this.view.setZoom(zoom)
    }
  }
}

/**
 * 设置视图中心点
 * @param map
 * @param coordinate
 */
const setViewCenter = (map, coordinate) => {
  if (coordinate && Array.isArray(coordinate) && map) {
    map.getView().animate({
      center: coordinate,
      duration: 800
    })
  }
}

/**
 * 判断点是否在视图内，如果不在地图将自动平移
 * @param map
 * @param coordinate
 */
const movePointToView = (map, coordinate) => {
  if (map) {
    let extent = getMapCurrentExtent(map)
    if (!($Extent.containsXY(extent, coordinate[0], coordinate[1]))) {
      map.getView().animate({
        center: [coordinate[0], coordinate[1]],
        duration: 400
      })
    }
  }
}

/**
 * 调整当前要素范围
 * @param map
 * @param extent
 * @param params
 * @returns {*}
 */
const adjustExtent = (map, extent, params) => {
  if (map) {
    params = params || {}
    let size = $Extent.getSize(extent)
    let adjust = typeof params['adjust'] === 'number' ? params['adjust'] : 0.2
    let minWidth = typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05
    let minHeight = typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05
    if (size[0] <= minWidth || size[1] <= minHeight) {
      let bleft = $Extent.getBottomLeft(extent) // 获取xmin,ymin
      let tright = $Extent.getTopRight(extent) // 获取xmax,ymax
      let xmin = bleft[0] - adjust
      let ymin = bleft[1] - adjust
      let xmax = tright[0] + adjust
      let ymax = tright[1] + adjust
      extent = $Extent.buffer([xmin, ymin, xmax, ymax], adjust)
    }
    return extent
  }
}

/**
 * 缩放到当前范围
 * @param map
 * @param extent
 * @param isanimation
 * @param duration
 */
const zoomToExtent = (map, extent, isanimation, duration) => {
  if (map) {
    let view = map.getView()
    let size = map.getSize()
    let center = $Extent.getCenter(extent)
    if (!isanimation) {
      view.fit(extent, size, {
        padding: [350, 200, 200, 350]
      })
      view.setCenter(center)
    } else {
      if (!duration) {
        duration = 800
        view.animate({
          center: center,
          duration: duration
        })
        view.fit(extent, {
          size: size,
          duration: duration,
          maxZoom: (view.getMaxZoom() || undefined)
        })
      }
    }
  }
}

export {
  getExtent,
  getMapCurrentExtent,
  zoomMaxExtent,
  zoomToExtent,
  adjustExtent,
  setViewCenter,
  movePointToView
}
