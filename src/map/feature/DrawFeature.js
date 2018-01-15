import $Feature from 'ol/feature'
import $Point from 'ol/geom/point'
import $LineString from 'ol/geom/linestring'
import $Polygon from 'ol/geom/polygon'
import $MultiPoint from 'ol/geom/multipoint'
import $MultiPolygon from 'ol/geom/multipolygon'
import $MultiLineString from 'ol/geom/multilinestring'
import { getGeomFromGeomData } from '../geom/Geometry'
import { createVectorLayer } from '../layer/layerUtils'
import { adjustExtent, zoomToExtent } from '../view/ViewUtils'
import Factory from '../style/factory'
/**
 * 添加样式
 * @param data_
 * @param params
 * @param feature
 * @returns {*}
 */
const fixStyle = (data_, params, feature) => {
  if (!data_['attributes']) data_['attributes'] = {}
  let style = new Factory(data_['attributes']['style'] || params['style'])
  let selectStyle = new Factory(data_['attributes']['selectStyle'] || params['selectStyle'])
  if (style && feature) {
    feature.setStyle(style)
    feature.set('style', style)
    if (selectStyle) {
      feature.set('selectStyle', selectStyle)
    }
  }
  return feature
}

/**
 * 添加相关属性信息
 * @param data_
 * @param params
 * @param feature
 * @returns {*}
 */
const fixProperties = (data_, params, feature) => {
  if (data_['attributes'] && (data_['attributes']['id'] || data_['attributes']['ID'])) {
    let id = (data_.attributes['id'] || data_.attributes['ID'] || params['id'])
    feature.setId(id)
    feature.setProperties(data_['attributes'])
  }
  return feature
}

/**
 * 调整视图
 * @param map
 * @param geometry
 * @param params
 */
const fixView = (map, geometry, params) => {
  if (params['zoomToExtent']) {
    let extent = geometry.getExtent()
    if (params['view'] && params['view']['adjustExtent']) {
      extent = adjustExtent(map, extent, params['view'])
    }
    zoomToExtent(map, extent, true)
  }
}

/**
 * 向图层添加要素
 * @param map
 * @param params
 * @param feature
 */
const appendFeature = (map, params, feature) => {
  params['create'] = true
  let layer = createVectorLayer(map, params['layerName'], params)
  layer.getSource().addFeature(feature)
}

/**
 * 添加单点
 * @param map
 * @param point
 * @param params
 * @returns {_ol_Feature_}
 */
const addPoint = (map, point, params) => {
  let geometry = getGeomFromGeomData(point, params)
  if (geometry) {
    let feature = new $Feature({
      geometry: geometry,
      params: params
    })
    feature = fixStyle(point, params, feature)
    feature = fixProperties(point, params, feature)
    fixView(map, geometry, params)
    if (params['layerName']) {
      appendFeature(map, params, feature)
    }
    return feature
  }
}

/**
 * 添加多个点
 * @param map
 * @param points
 * @param params
 * @returns {null}
 */
const addPoints = (map, points, params) => {
  try {
    if (points && Array.isArray(points)) {
      let [features, multiPoint, change] = [[], (new $MultiPoint([])), false]
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = false
        change = true
      }
      points.forEach(point => {
        if (point && point['geometry']) {
          let pointFeat = addPoint(map, point, params)
          if (pointFeat && pointFeat instanceof $Feature) {
            features.push(pointFeat)
            let geom = pointFeat.getGeometry()
            if (geom && geom instanceof $Point) {
              multiPoint.appendPoint(geom)
            } else if (geom && geom instanceof $MultiPoint) {
              let multiGeoms = geom.getPoints()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof $Point) {
                    multiPoint.appendPoint(_geom)
                  }
                })
              }
            }
          }
        }
      })
      if (change) {
        params['zoomToExtent'] = true
        fixView(map, multiPoint, params)
      }
      return features
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * 添加线要素
 * @param map
 * @param line
 * @param params
 * @returns {_ol_Feature_}
 */
const addPolyline = (map, line, params) => {
  let geometry = getGeomFromGeomData(line, params)
  if (geometry) {
    let lineFeature = new $Feature({
      geometry: geometry,
      params: params
    })
    lineFeature = fixStyle(line, params, lineFeature)
    lineFeature = fixProperties(line, params, lineFeature)
    fixView(map, geometry, params)
    if (params['layerName']) {
      appendFeature(map, params, lineFeature)
    }
    return lineFeature
  }
}

/**
 * 添加多条线要素
 * @param map
 * @param lines
 * @param params
 * @returns {null}
 */
const addPolylines = (map, lines, params) => {
  try {
    if (lines && Array.isArray(lines)) {
      let [features, MultiLine, change] = [[], (new $MultiLineString([])), false]
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = false
        change = true
      }
      lines.forEach(line => {
        let polyLine = addPolyline(map, line, params)
        if (polyLine && polyLine instanceof $Feature) {
          features.push(polyLine)
          let geom = polyLine.getGeometry()
          if (geom && geom instanceof $LineString) {
            MultiLine.appendLineString(geom)
          } else if (geom && geom instanceof $MultiLineString) {
            let multiGeoms = geom.getLineStrings()
            if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
              multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof $LineString) {
                  MultiLine.appendLineString(_geom)
                }
              })
            }
          }
        }
      })
      if (change) {
        params['zoomToExtent'] = true
        fixView(map, MultiLine, params)
      }
      return features
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * 添加面要素
 * @param map
 * @param polygon
 * @param params
 * @returns {_ol_Feature_}
 */
const addPolygon = (map, polygon, params) => {
  let geometry = getGeomFromGeomData(polygon, params)
  if (geometry) {
    let polygonFeature = new $Feature({
      geometry: geometry,
      params: params
    })
    polygonFeature = fixStyle(polygon, params, polygonFeature)
    polygonFeature = fixProperties(polygon, params, polygonFeature)
    fixView(map, geometry, params)
    if (params['layerName']) {
      appendFeature(map, params, polygonFeature)
    }
    return polygonFeature
  }
}

/**
 * 添加多个面
 * @param map
 * @param polygons
 * @param params
 * @returns {null}
 */
const addPolygons = (map, polygons, params) => {
  try {
    if (polygons && Array.isArray(polygons)) {
      let [features, MultiPolygon, change] = [[], (new $MultiPolygon([])), false]
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = false
        change = true
      }
      polygons.forEach(polygon => {
        let polygonFeat = addPolygon(map, polygon, params)
        if (polygonFeat && polygonFeat instanceof $Feature) {
          features.push(polygonFeat)
          let geom = polygonFeat.getGeometry()
          if (geom && geom instanceof $Polygon) {
            MultiPolygon.appendPolygon(geom)
          } else if (geom && geom instanceof $MultiPolygon) {
            let multiGeoms = geom.getPolygons()
            if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
              multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof $Polygon) {
                  MultiPolygon.appendPolygon(_geom)
                }
              })
            }
          }
        }
      })
      if (change) {
        params['zoomToExtent'] = true
        fixView(map, MultiPolygon, params)
      }
      return features
    }
  } catch (e) {
    console.log(e)
  }
}

export {
  addPoint,
  addPoints,
  addPolyline,
  addPolylines,
  addPolygon,
  addPolygons
}
