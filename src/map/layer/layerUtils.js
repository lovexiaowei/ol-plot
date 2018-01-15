import ol from 'openlayers'
const $LayerGroup = ol.layer.Group
const $LayerVector = ol.layer.Vector
const $VectorSource = ol.source.Vector

/**
 * 通过layerName获取图层
 * @param map
 * @param layerName
 * @returns {*}
 */
const getLayerByLayerName = function (map, layerName) {
  try {
    let targetLayer = null
    if (map) {
      let layers = map.getLayers().getArray()
      targetLayer = getLayerInternal(layers, 'layerName', layerName)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 内部处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @returns {*}
 */
const getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof $LayerGroup) {
        let layers = layer.getLayers().getArray()
        _target = getLayerInternal(layers, key, value)
        if (_target) {
          return false
        } else {
          return true
        }
      } else if (layer.get(key) === value) {
        _target = layer
        return false
      } else {
        return true
      }
    })
  }
  return _target
}

/**
 * 根据相关键值键名获取图层集合
 * @param layers
 * @param key
 * @param value
 * @returns {Array}
 */
const getLayersArrayInternal = function (layers, key, value) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof $LayerGroup) {
        let layers = layer.getLayers().getArray()
        let _layer = getLayersArrayInternal(layers, key, value)
        if (_layer) {
          _target = _target.concat(_layer)
        }
      } else if (layer.get(key) === value) {
        _target.push(layer)
      }
    })
  }
  return _target
}

/**
 * 通过键名键值获取图层（注意键名键值必须是set(key, value)）
 * @param map
 * @param key
 * @param value
 */
const getLayerByKeyValue = function (map, key, value) {
  try {
    let targetLayer = null
    if (map) {
      let layers = map.getLayers().getArray()
      targetLayer = getLayerInternal(layers, key, value)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 通过键名键值获取图层集合（注意键名键值必须是set(key, value)）
 * @param map
 * @param key
 * @param value
 */
const getLayersArrayByKeyValue = function (map, key, value) {
  try {
    let targetLayers = []
    if (map) {
      let layers = map.getLayers().getArray()
      targetLayers = getLayersArrayInternal(layers, key, value)
    }
    return targetLayers
  } catch (e) {
    console.log(e)
  }
}

/**
 * 创建临时图层
 * @param map
 * @param layerName
 * @param params
 * @returns {*}
 */
const createVectorLayer = function (map, layerName, params) {
  try {
    if (map) {
      let vectorLayer = getLayerByLayerName(map, layerName)
      if (!(vectorLayer instanceof $LayerVector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new $LayerVector({
            layerName: layerName,
            params: params,
            layerType: 'vector',
            source: new $VectorSource({
              wrapX: false
            })
          })
        }
      }
      if (map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = getLayerByLayerName(map, layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof $LayerVector)) {
          map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    }
  } catch (e) {
    console.log(e)
  }
}

export {
  getLayerByKeyValue,
  getLayerByLayerName,
  createVectorLayer,
  getLayersArrayByKeyValue
}
