/**
 * Created by FDD on 2017/11/9.
 * @desc 右键功能
 */
import ol from 'openlayers'
import '@/assets/scss/contextMenu.scss'
import * as htmlUtils from '@/assets/scripts/domUtils'
import * as Events from '@/assets/scripts/Events'
import {getInstanceStore} from '@/assets/scripts/utils'
import cloneDeep from 'lodash/cloneDeep'
class ContextMenu extends ol.control.Control {
  constructor (options = {}) {
    let className = (options.className !== undefined ? options.className : 'context-menu-content')
    let element = document.createElement('div')
    element.className = className
    const render = options.render
    const target = options.target
    super({
      element,
      render,
      target
    })

    /**
     * 配置相关
     * @type {{}}
     */
    this.options = options

    /**
     * 控件容器类名
     * @type {string}
     * @private
     */
    this.className_ = className

    /**
     * 地图容器
     * @type {null}
     */
    this.mapContent = null

    /**
     * 鼠标右键的位置
     * @type {Array}
     */
    this.pixel = []

    /**
     * width
     * @type {number}
     */
    this.itemWidth = (typeof this.options['itemWidth'] === 'number' ? this.options['itemWidth'] : 160)

    /**
     * height
     * @type {number}
     */
    this.itemHeight = (typeof this.options['itemHeight'] === 'number' ? this.options['itemHeight'] : 30)
  }
  /**
   * 初始化dom
   * @param items
   */
  initDomInternal (items) {
    this.htmlUtils(items, '', this.element)
    if (this.getMap()) {
      this.mapContent = this.getMap().getViewport()
      Events.listen(this.mapContent, 'contextmenu', this.mouseDownHandle_, this)
    }
  }

  /**
   * 初始化事件
   * @param event
   * @private
   */
  mouseDownHandle_ (event) {
    let that = this
    event.stopPropagation()
    event.preventDefault()
    if (event.button === 2) {
      that.pixel = this.getMap().getEventPixel(event)
      window.setTimeout(() => {
        that.show(that.pixel)
      }, 50)
    }
    Events.listen(event.target, 'mousedown', function () {
      that.hide()
    }, this, true)
  }

  /**
   * showMenu
   * @param position
   */
  show (position) {
    this.element.style.display = 'block'
    this.element.style.top = position[1] + 'px'
    this.element.style.left = position[0] + 'px'
    let aDoc = this.getMap().getSize()
    let maxWidth = aDoc[0] - this.element.offsetWidth
    let maxHeight = aDoc[1] - this.element.offsetHeight
    if (this.element.offsetTop > maxHeight) {
      this.element.style.top = maxHeight + 'px'
    }
    if (this.element.offsetLeft > maxWidth) {
      this.element.style.left = maxWidth + 'px'
    }
  }

  /**
   * hideMenu
   */
  hide () {
    this.element.style.display = 'none'
    this.pixel = []
  }

  /**
   * html处理工具
   * @param items
   * @param index
   * @param content
   * @param isOffset
   * @returns {*}
   */
  htmlUtils (items, index, content, isOffset) {
    let that = this
    let ulList = null
    if (items && Array.isArray(items) && items.length > 0) {
      ulList = htmlUtils.create('ul', this.className_ + '-ul' + index + '-inner', content, this.className_ + '-ul' + index + '-inner')
      if (isOffset) {
        ulList.style.position = 'absolute'
        ulList.style.top = '0px'
        ulList.style.left = this.itemWidth + 20 + 'px'
      }
      items.forEach((item, index_) => {
        if (item && item['name'] && item['alias']) {
          let numList = index + '-' + index_
          let li_ = htmlUtils.create('li', this.className_ + '-li-' + numList + '-inner', ulList, this.className_ + '-li-' + numList + '-inner')
          li_.style.width = this.itemWidth + 'px'
          li_.style.height = this.itemHeight + 'px'
          li_.style.lineHeight = this.itemHeight + 'px'
          li_.setAttribute('data-name', item['alias'])
          Events.listen(li_, 'click', function (event) {
            that.handleItemClick_(event, item)
          }, this)
          if (item['icon']) {
            let span_ = htmlUtils.create('span', 'li-icon-content', li_)
            if (item['iconType'] === 'iconfont') {
              let fontName = item['fontName'] ? item['fontName'] : 'iconfont'
              htmlUtils.addClass(span_, fontName + ' ' + item['icon'])
              if (item['iconColor']) {
                span_.style.color = item['iconColor']
              }
            } else {
              span_.style.background = 'url(' + item['icon'] + ') 0px 0px no-repeat'
            }
          }
          let name_ = htmlUtils.create('span', 'li-name-content', li_)
          name_.innerHTML = item['name']
          if (item['showLine']) {
            li_.style.borderBottom = '1px solid #CCCCCC'
          }
          if (item['items']) {
            this.htmlUtils(item['items'], numList, li_, true)
            Events.listen(li_, 'mouseenter', this.handleItemMouseOver_, this)
            Events.listen(li_, 'mouseleave', this.handleItemMouseOut_, this)
          }
        }
      })
    }
    return ulList
  }

  /**
   * 更新面板元素
   * @param type
   * @param item
   * @param items
   * @private
   */
  updateElement_ (type, item, items) {
    let child_ = htmlUtils.get(this.className_ + '-ul' + '-inner')
    let cloneItems = cloneDeep(this.options['items'])
    let afterItems = null
    switch (type) {
      case 'pop': // 移除最后一个
        this.element.removeChild(child_)
        afterItems = cloneItems.pop()
        this.htmlUtils(cloneItems, '', this.element)
        break
      case 'push': // 数组的末尾添加新的元素
        this.element.removeChild(child_)
        afterItems = cloneItems = cloneItems.push(item)
        this.htmlUtils(cloneItems, '', this.element)
        break
      case 'shift': // 删除数组的第一个元素
        this.element.removeChild(child_)
        afterItems = cloneItems.shift()
        this.htmlUtils(cloneItems, '', this.element)
        break
      case 'unshift': // 在数组的开头添加新元素
        this.element.removeChild(child_)
        afterItems = cloneItems = cloneItems.unshift(item)
        this.htmlUtils(cloneItems, '', this.element)
        break
      case 'reverse':
        this.element.removeChild(child_)
        afterItems = cloneItems.reverse()
        this.htmlUtils(cloneItems, '', this.element)
        break
      default:
        this.element.removeChild(child_)
        afterItems = items
        this.htmlUtils(items, '', this.element)
    }
    return afterItems
  }

  /**
   * 获取鼠标右键位置的像素坐标
   * @returns {ol.Pixel|*|Array}
   */
  getCurrentPixel () {
    return this.pixel
  }

  /**
   * 获取鼠标点击位置的地图坐标
   * @returns {ol.Coordinate}
   */
  getCurrentCoordinates () {
    return (this.getMap().getCoordinateFromPixel(this.getCurrentPixel()))
  }

  /**
   * 处理列表点击事件
   * @param event
   * @param item
   * @private
   */
  handleItemClick_ (event, item) {
    if (item && item['callback'] && typeof item['callback'] === 'function') {
      item['callback'](event, {
        source: item,
        pixel: this.getCurrentPixel(),
        coordinates: this.getCurrentCoordinates()
      })
    }
    getInstanceStore().dispatch('actionContextMenuClick', {
      event: event,
      source: item,
      pixel: this.getCurrentPixel(),
      coordinates: this.getCurrentCoordinates()
    })
    window.setTimeout(() => {
      this.hide()
    }, 50)
  }

  /**
   * 处理鼠标移入事件
   * @param event
   * @private
   */
  handleItemMouseOver_ (event) {
    if (event.target && event.target.childNodes) {
      let elements = Array.prototype.slice.call(event.target.childNodes, 0)
      if (elements && elements.length > 0) {
        elements.every(ele => {
          if (ele && ele.nodeName.toLowerCase() === 'ul') {
            ele.style.display = 'block'
            return false
          } else {
            return true
          }
        })
      }
    }
  }

  /**
   * 处理鼠标移出事件
   * @param event
   * @private
   */
  handleItemMouseOut_ (event) {
    if (event.target && event.target.childNodes) {
      let elements = Array.prototype.slice.call(event.target.childNodes, 0)
      if (elements && elements.length > 0) {
        elements.every(ele => {
          if (ele && ele.nodeName.toLowerCase() === 'ul') {
            ele.style.display = 'none'
            return false
          } else {
            return true
          }
        })
      }
    }
  }

  /**
   * setMap
   * @param map
   */
  setMap (map) {
    ol.control.Control.prototype.setMap.call(this, map)
    if (map && map instanceof ol.Map) {
      this.initDomInternal(this.options['items'])
    }
  }

  /**
   * 移除菜单最后一项
   */
  pop () {
    return this.updateElement_('pop')
  }

  /**
   * 向菜单末尾添加一项
   * @param item
   */
  push (item) {
    if (item && typeof item === 'object') {
      return this.updateElement_('push', item)
    } else {
      throw new Error('传入的不是对象')
    }
  }

  /**
   * 移除菜单第一项
   */
  shift () {
    return this.updateElement_('shift')
  }

  /**
   * 倒叙菜单
   */
  reverse () {
    return this.updateElement_('reverse')
  }

  /**
   * 向菜单开头添加一项
   * @param item
   */
  unshift (item) {
    if (item && typeof item === 'object') {
      return this.updateElement_('unshift', item)
    } else {
      throw new Error('传入的不是对象')
    }
  }

  /**
   * 更新菜单
   * @param items
   */
  update (items) {
    if (items && Array.isArray(items) && items.length > 0) {
      this.updateElement_('', '', items)
    } else {
      throw new Error('传入的数组有误！')
    }
  }

  /**
   * 更新内置配置
   * @param items
   */
  updateOption (items) {
    if (items && Array.isArray(items) && items.length > 0) {
      this.options['items'] = items
      this.updateElement_('', '', items)
    } else {
      throw new Error('传入的数组有误！')
    }
  }
}
export default ContextMenu
