/**
 * Created by FDD on 2017/11/15.
 * @desc 样式处理
 */
import $Geometry from 'ol/geom/geometry'
import $Style from 'ol/style/style'
import $RegularShape from 'ol/style/regularshape'
import $Icon from 'ol/style/icon'
import $Stroke from 'ol/style/stroke'
import $Text from 'ol/style/text'
import $Fill from 'ol/style/fill'
class Factory {
  constructor (options = {}) {
    let style = new $Style({})
    if (options['geometry'] && options['geometry'] instanceof $Geometry) {
      style.setGeometry(options['geometry'])
    }
    if (options['zIndex'] && typeof options['zIndex'] === 'number') {
      style.setZIndex(options['zIndex'])
    }
    if (options['fill'] && typeof options['fill'] === 'object') {
      style.setFill(this._getFill(options['fill']))
    }
    if (options['image'] && typeof options['image'] === 'object') {
      style.setImage(this._getImage(options['image']))
    }
    if (options['stroke'] && typeof options['stroke'] === 'object') {
      style.setStroke(this._getStroke(options['stroke']))
    }
    if (options['text'] && typeof options['text'] === 'object') {
      style.setText(this._getText(options['text']))
    }
    return style
  }

  /**
   * 获取规则样式图形
   * @param options
   * @returns {_ol_style_RegularShape_}
   * @private
   */
  _getRegularShape (options) {
    try {
      let regularShape = new $RegularShape({
        fill: (this._getFill(options['fill']) || undefined),
        points: ((typeof options['points'] === 'number') ? options['points'] : 1),
        radius: ((typeof options['radius'] === 'number') ? options['radius'] : undefined),
        radius1: ((typeof options['radius1'] === 'number') ? options['radius1'] : undefined),
        radius2: ((typeof options['radius2'] === 'number') ? options['radius2'] : undefined),
        angle: ((typeof options['angle'] === 'number') ? options['angle'] : 0),
        snapToPixel: ((typeof options['snapToPixel'] === 'boolean') ? options['snapToPixel'] : true),
        stroke: (this._getStroke(options['stroke']) || undefined),
        rotation: ((typeof options['rotation'] === 'number') ? options['rotation'] : 0),
        rotateWithView: ((typeof options['rotateWithView'] === 'boolean') ? options['rotateWithView'] : false),
        atlasManager: (options['atlasManager'] ? options['atlasManager'] : undefined)
      })
      return regularShape
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取图标样式
   * @param options
   * @returns {*}
   * @private
   */
  _getImage (options) {
    try {
      let image
      options = options || {}
      if (options['type'] === 'icon') {
        image = this._getIcon(options['image'])
      } else {
        image = this._getRegularShape(options['image'])
      }
      return image
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取icon
   * @param options
   * @returns {_ol_style_Icon_}
   * @private
   */
  _getIcon (options) {
    try {
      options = options || {}
      let icon = new $Icon({
        anchor: (options['imageAnchor'] ? options['imageAnchor'] : [0.5, 0.5]),
        anchorXUnits: (options['imageAnchorXUnits'] ? options['imageAnchorXUnits'] : 'fraction'),
        anchorYUnits: (options['imageAnchorYUnits'] ? options['imageAnchorYUnits'] : 'fraction'),
        anchorOrigin: (options['imageAnchorOrigin'] ? options['imageAnchorYUnits'] : 'top-left'),
        color: (options['imageColor'] ? options['imageColor'] : undefined),
        crossOrigin: (options['crossOrigin'] ? options['crossOrigin'] : undefined),
        img: (options['img'] ? options['img'] : undefined),
        offset: (options['offset'] && Array.isArray(options['offset']) && options['offset'].length === 2 ? options['offset'] : [0, 0]),
        offsetOrigin: (options['offsetOrigin'] ? options['offsetOrigin'] : 'top-left'),
        scale: ((typeof options['scale'] === 'number') ? options['scale'] : 1),
        snapToPixel: (typeof options['snapToPixel'] === 'boolean' ? options['snapToPixel'] : true),
        rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
        opacity: (typeof options['imageOpacity'] === 'number' ? options['imageOpacity'] : 1),
        rotation: (typeof options['imageRotation'] === 'number' ? options['imageRotation'] : 0),
        size: (options['size'] && Array.isArray(options['size']) && options['size'].length === 2 ? options['size'] : undefined),
        imgSize: (options['imgSize'] && Array.isArray(options['imgSize']) && options['imgSize'].length === 2 ? options['imgSize'] : undefined),
        src: (options['imageSrc'] ? options['imageSrc'] : undefined)
      })
      return icon
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取线条样式
   * @param options
   * @returns {_ol_style_Stroke_}
   * @private
   */
  _getStroke (options) {
    try {
      options = options || {}
      let stroke = new $Stroke({
        color: (options['strokeColor'] ? options['strokeColor'] : undefined),
        lineCap: ((options['strokeLineCap'] && typeof options['strokeLineCap'] === 'string') ? options['strokeLineCap'] : 'round'),
        lineJoin: ((options['strokeLineJoin'] && typeof options['strokeLineJoin'] === 'string') ? options['strokeLineJoin'] : 'round'),
        lineDash: (options['strokeLineDash'] ? options['strokeLineDash'] : undefined),
        lineDashOffset: (typeof options['strokeLineDashOffset'] === 'number' ? options['strokeLineDashOffset'] : '0'),
        miterLimit: (typeof options['strokeMiterLimit'] === 'number' ? options['strokeMiterLimit'] : 10),
        width: (typeof options['strokeWidth'] === 'number' ? options['strokeWidth'] : undefined)
      })
      return stroke
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取样式文本
   * @param options
   * @returns {_ol_style_Text_}
   * @private
   */
  _getText (options) {
    try {
      let text = new $Text({
        font: ((options['textFont'] && typeof options['textFont'] === 'string') ? options['textFont'] : '10px sans-serif'),
        offsetX: (typeof options['textOffsetX'] === 'number' ? options['textOffsetX'] : 0),
        offsetY: (typeof options['textOffsetY'] === 'number' ? options['textOffsetY'] : 0),
        scale: (typeof options['textScale'] === 'number' ? options['textScale'] : undefined),
        rotation: (typeof options['textRotation'] === 'number' ? options['textRotation'] : 0),
        text: ((options['text'] && typeof options['text'] === 'string') ? options['text'] : undefined),
        textAlign: ((options['textAlign'] && typeof options['textAlign'] === 'string') ? options['textAlign'] : 'start'),
        textBaseline: ((options['textBaseline'] && typeof options['textBaseline'] === 'string') ? options['textBaseline'] : 'alphabetic'),
        rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
        fill: this._getFill(options['textFill']),
        stroke: this._getStroke(options['textStroke'])
      })
      return text
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取填充颜色
   * @param options
   * @returns {_ol_style_Fill_}
   * @private
   */
  _getFill (options) {
    try {
      options = options || {}
      let fill = new $Fill({
        color: (options['fillColor'] ? options['fillColor'] : undefined)
      })
      return fill
    } catch (error) {
      console.log(error)
    }
  }
}

export default Factory
