/**
 * Created by FDD on 2017/11/14.
 * @desc 空间数据处理
 */
import $Geometry from 'ol/geom/geometry'
import $Point from 'ol/geom/point'
import $LineString from 'ol/geom/linestring'
import $Polygon from 'ol/geom/polygon'
import $MultiPoint from 'ol/geom/multipoint'
import $MultiPolygon from 'ol/geom/multipolygon'
import $MultiLineString from 'ol/geom/multilinestring'
import $FormatWKT from 'ol/format/wkt'
import $FormatEsriJSON from 'ol/format/esrijson'
import $FormatGeoJSON from 'ol/format/geojson'
import $Extent from 'ol/extent'
/**
 * 获取当前范围
 * @param multiFeatures
 * @param params
 * @private
 */
const _getExtent = (multiFeatures, params) => {
  let extent = multiFeatures.getExtent()
  let bExtent = true
  extent.every(item => {
    if (item === Infinity || isNaN(item) || item === undefined || item === null) {
      bExtent = false
      return false
    } else {
      return true
    }
  })
  if (bExtent) {
    if (params['view'] && params['view']['adjustExtent']) {
      extent = this.adjustExtent(extent, params['view'])
    }
    if (params['zoomToExtent']) {
      this.zoomToExtent(extent, true)
    }
  }
  return extent
}

/**
 * 读取空间数据
 * @param data
 * @param params
 * @returns {*}
 * @private
 */
const _getMultiGeomtery = (data, params) => {
  try {
    let geom = null
    let multiPolygon = new $MultiPolygon([])
    let multiLine = new $MultiLineString([])
    let multiPoint = new $MultiPoint([])
    if (!(data instanceof $Geometry)) {
      geom = this.getGeomFromGeomData(data, params)
    } else {
      geom = data
    }
    if (geom) {
      if (geom instanceof $Polygon || geom instanceof $MultiPolygon) {
        if (geom instanceof $Polygon) {
          multiPolygon.appendPolygon(geom)
        } else {
          let multiGeoms = geom.getPolygons()
          if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
            multiGeoms.forEach(_geom => {
              if (_geom && _geom instanceof $Polygon) {
                multiPolygon.appendPolygon(_geom)
              }
            })
          }
        }
        return multiPolygon
      } else if (geom instanceof $LineString || geom instanceof $MultiLineString) {
        if (geom instanceof $LineString) {
          multiLine.appendLineString(geom)
        } else {
          let multiGeoms = geom.getLineStrings()
          if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
            multiGeoms.forEach(_geom => {
              if (_geom && _geom instanceof $LineString) {
                multiLine.appendLineString(_geom)
              }
            })
          }
        }
        return multiLine
      } else if (geom instanceof $Point || geom instanceof $MultiPoint) {
        if (geom instanceof $Point) {
          multiPoint.appendPoint(geom)
        } else {
          let multiGeoms = geom.getPoints()
          if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
            multiGeoms.forEach(_geom => {
              if (_geom && _geom instanceof $Point) {
                multiPoint.appendPoint(_geom)
              }
            })
          }
        }
        return multiPoint
      }
    } else {
      return false
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * 读取空间信息(无类型默认以wkt方式读取)
 * @param geomData
 * @param options
 * @returns {*}
 */
const getGeomFromGeomData = (geomData, options = {}) => {
  try {
    let featureGeom = null
    if (geomData instanceof $Geometry) {
      featureGeom = geomData
      if (options['dataProjection'] && options['featureProjection']) {
        featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
      }
    } else if (geomData.hasOwnProperty('geometry') && geomData['geometry'] instanceof $Geometry) {
      featureGeom = geomData['geometry']
      if (options['dataProjection'] && options['featureProjection']) {
        featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
      }
    } else if (geomData['geomType'] === 'GeoJSON' || options['geomType'] === 'GeoJSON') {
      let GeoJSONFormat = new $FormatGeoJSON()
      featureGeom = GeoJSONFormat.readGeometry(geomData['geometry'], {
        dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
        featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
      })
    } else if (geomData['geomType'] === 'EsriJSON' || options['geomType'] === 'EsriJSON') {
      let esriJsonFormat = new $FormatEsriJSON()
      featureGeom = esriJsonFormat.readGeometry(geomData['geometry'], {
        dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
        featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
      })
    } else if (Array.isArray(geomData['geometry'])) {
      featureGeom = new $Point(geomData['geometry'])
      if (options['dataProjection'] && options['featureProjection']) {
        featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
      }
    } else {
      let wktFormat = new $FormatWKT()
      featureGeom = wktFormat.readGeometry(geomData['geometry'], {
        dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
        featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
      })
    }
    return featureGeom
  } catch (e) {
    console.log(e)
  }
}

/**
 * 简单兼容
 * @param geomData
 * @param options
 * @returns {{extent: *, center: ol.Coordinate}}
 */
const getCenterExtentFromGeom = (geomData, options) => {
  let geom = this.getGeomFromGeomData(geomData, options)
  let extent = this._getExtent(geom, options)
  let center = $Extent.getCenter(extent)
  let bExtent = true
  extent.every(item => {
    if (item === Infinity || isNaN(item) || item === undefined || item === null) {
      bExtent = false
      return false
    } else {
      return true
    }
  })
  if (bExtent && options['zoomToExtent']) {
    if (options['view'] && options['view']['adjustExtent']) {
      extent = this.adjustExtent(extent, options['view'])
    }
    this.zoomToExtent(extent, true)
  }
  return ({
    extent: extent,
    center: center
  })
}

/**
 * 获取范围和中心点
 * @param multiGeom
 * @param options
 * @returns {{extent: *, center: ol.Coordinate}}
 * @private
 */
const _getExtentCenter = (multiGeom, options) => {
  let extent = this._getExtent(multiGeom, options)
  let center = $Extent.getCenter(extent)
  let bExtent = true
  extent.every(item => {
    if (item === Infinity || isNaN(item) || item === undefined || item === null) {
      bExtent = false
      return false
    } else {
      return true
    }
  })
  if (bExtent && options['zoomToExtent']) {
    if (options['view'] && options['view']['adjustExtent']) {
      extent = this.adjustExtent(extent, options['view'])
    }
    this.zoomToExtent(extent, true)
  }
  return ({
    extent: extent,
    center: center
  })
}

/**
 * 从多个geom获取范围和中心点（必须同种类型）
 * @param geomDatas
 * @param options
 * @returns {null}
 */
const getCenterExtentFromGeoms = (geomDatas, options = {}) => {
  let [res, type] = [null, '']
  if (geomDatas && Array.isArray(geomDatas) && geomDatas.length > 0) {
    let multiPolygon = new $MultiPolygon([])
    let multiLine = new $MultiLineString([])
    let multiPoint = new $MultiPoint([])
    geomDatas.forEach(item => {
      if (item) {
        let multiGeom = this._getMultiGeomtery(this.getGeomFromGeomData(item, options))
        if (multiGeom) {
          if (multiGeom instanceof $MultiPolygon) {
            let _multiGeoms = multiGeom.getPolygons()
            if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
              _multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof $Polygon) {
                  multiPolygon.appendPolygon(_geom)
                }
              })
            }
            type = 'multiPolygon'
          } else if (multiGeom instanceof $MultiLineString) {
            let _multiGeoms = multiGeom.getLineStrings()
            if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
              _multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof $LineString) {
                  multiLine.appendLineString(_geom)
                }
              })
            }
            type = 'multiLine'
          } else if (multiGeom instanceof $MultiPoint) {
            let _multiGeoms = multiGeom.getPoints()
            if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
              _multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof $Point) {
                  multiPoint.appendPoint(_geom)
                }
              })
            }
            type = 'multiPoint'
          }
        }
      }
    })
    if (type === 'multiPolygon') {
      res = this._getExtentCenter(multiPolygon, options)
    } else if (type === 'multiLine') {
      res = this._getExtentCenter(multiLine, options)
    } else if (type === 'multiPoint') {
      res = this._getExtentCenter(multiPoint, options)
    }
  }
  return res
}

export {
  _getExtent,
  _getMultiGeomtery,
  getGeomFromGeomData,
  getCenterExtentFromGeom,
  _getExtentCenter,
  getCenterExtentFromGeoms
}
