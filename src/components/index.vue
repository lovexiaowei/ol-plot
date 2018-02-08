<template>
  <div class="ol-plot-vue">
    <header class="panel-header">
      <span title="应急标绘">应急标绘</span>
      <span class="iconfont icon-zuixiaohua" @click="minFunc()"></span>
      <span class="iconfont icon-guanbi" @click="closeFunc()"></span>
    </header>
    <div class="panel-content">
      <div ref="workspace" class="ol-plot-vue-workspace">
        <div class="ol-plot-vue-workspace-scroll">
          <div class="ol-plot-vue-workspace-scroll-inner">
            <div class="plot-list-wrap">
              <div class="plot-list">
                <ul class="clearfix">
                  <li
                    v-for="(tool, index) in plots"
                    class="ol-plot-vue-header-li"
                    :key="index"
                    :class="selected === tool.alias ? 'ol-plot-vue-selected' : ''"
                    @mouseover="mouseOverHandle(tool)"
                    @mouseout="mouseOutHandle(tool)"
                    @click="changeSelectedItem(tool, index)">
                    <span :style="{background: 'url(static/images/plot/' + tool.src + ((tool.mouseover || selected === tool.alias) ? '-hover' : '') + '.png) no-repeat'}"></span>
                    <span>{{tool.name}}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="selected !== 'TextArea' && selected !== 'Point' && selected !== ''">
              <div class="plot-edit">
                <div class="plot-edit-color">
                  <span class="stration span-background">背景色</span>
                  <color-picker v-model="backgroundColor"></color-picker>
                  <span class="stration span-border">边框色</span>
                  <color-picker v-model="borderColor"></color-picker>
                </div>
                <div class="plot-edit-title">边框线宽</div>
                <div class="plot-edit-line">
                  <sf-slider v-model="borderWidth" :min=0 :max=10 :step=1></sf-slider>
                </div>
                <div class="plot-edit-title">透明度</div>
                <div class="plot-edit-line">
                  <sf-slider v-model="opacity" :min=0 :max=1 :step=0.1></sf-slider>
                </div>
              </div>
            </div>
            <div class="ol-plot-vue-workspace-text-control" v-else-if="selected === 'TextArea'">
              <div class="plot-edit">
                <div class="plot-edit-color">
                  <span class="stration span-background">背景色</span>
                  <color-picker :color-format="'rgb'" v-model="textAreaBackgroundColor"></color-picker>
                  <span class="stration span-border">边框色</span>
                  <color-picker :color-format="'rgb'" v-model="textAreaBorderColor"></color-picker>
                </div>
                <div class="plot-edit-text">
                  <span class="font-color span-color">字体颜色</span>
                  <color-picker :color-format="'rgb'" v-model="textAreaColor"></color-picker>
                  <span class="font-size span-size">字体大小</span>
                  <sf-input-number size="small" v-model="textAreaFontSize"></sf-input-number>
                </div>
                <div class="plot-edit-title">边框线宽</div>
                <div class="plot-edit-line">
                  <sf-slider v-model="textAreaBorderWidth" :min=0 :max=10 :step=1></sf-slider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import olPlot from '../src'
  import StyleFactory from '../src/Utils/factory'
  import colorPicker from './color-picker'
  import sfInputNumber from './input-number'
  import sfSlider from './slider'
  export default {
    name: 'ol-plot-vue',
    props: {
      plots: {
        type: Array,
        default: function () {
          return []
        }
      },
      map: Object
    },
    data () {
      return {
        inPlotPanel: false,
        tools: [],
        selected: '',
        title: '应急标绘',
        height: 40,
        loading: false,
        backgroundColor: '#20a0ff',
        borderColor: '#20a0ff',
        borderWidth: 1,
        opacity: 1,
        plot: null,
        schemeTitle: '',
        textAreaBackgroundColor: 'rgb(255, 255, 255)',
        textAreaBorderColor: 'rgb(238, 238, 238)',
        textAreaColor: 'rgb(1, 5, 0)',
        textAreaFontSize: 12,
        textAreaBorderWidth: 1,
        currentTextArea: null
      }
    },
    watch: {
      borderWidth: function (newVal) {
        this.plot.plotUtils.setBorderWidth(this.plot.plotEdit.activePlot, newVal)
      },
      opacity: function (newVal) {
        this.plot.plotUtils.setOpacity(this.plot.plotEdit.activePlot, newVal)
      },
      backgroundColor: function (v) {
        this.plot.plotUtils.setBackgroundColor(this.plot.plotEdit.activePlot, v)
      },
      borderColor: function (v) {
        this.plot.plotUtils.setBorderColor(this.plot.plotEdit.activePlot, v)
      },
      textAreaBackgroundColor: function (value) {
        console.log(value)
        if (value && this.currentTextArea) {
          this.currentTextArea.setStyle({
            background: value
          })
        }
      },
      textAreaBorderColor: function (value) {
        console.log(value)
        if (value && this.currentTextArea) {
          this.currentTextArea.setStyle({
            border: this.textAreaBorderWidth + 'px' + ' solid ' + value
          })
        }
      },
      textAreaColor: function (value) {
        console.log(value)
        if (value && this.currentTextArea) {
          this.currentTextArea.setStyle({
            color: value
          })
        }
      },
      textAreaFontSize: function (value) {
        console.log(value)
        if (value && this.currentTextArea) {
          this.currentTextArea.setStyle({
            fontSize: value + 'px'
          })
        }
      },
      textAreaBorderWidth: function (value) {
        console.log(value)
        if (value && this.currentTextArea) {
          this.currentTextArea.setStyle({
            border: value + 'px' + ' solid ' + this.textAreaBorderColor
          })
        }
      },
      map: function (value) {
        if (value) {
          this.initPlot()
        }
      }
    },
    mounted () {
      if (this.map) {
        this.initPlot()
      }
    },
    methods: {
      closeFunc () {
        this.$emit('close')
      },
      minFunc () {
        this.$emit('showMin')
      },
      initPlot () {
        if (!this.plot) {
          /* eslint new-cap: 0 */
          this.plot = new olPlot(this.map, {
            zIndex: 999,
            zoomToExtent: true
          })
          this.plot.plotDraw.drawLayer.setStyle(new StyleFactory({
            fill: {
              fillColor: '#8BA2E4'
            },
            stroke: {
              strokeColor: '#1B9DE8',
              strokeWidth: 2.5
            },
            image: {
              type: 'icon',
              image: {
                imageAnchor: [0.5, 0.5],
                imageAnchorXUnits: 'fraction',
                imageAnchorYUnits: 'fraction',
                imageOpacity: 0.75,
                imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmODA3ZDlmZS1mOTRhLTRmZDktOWYwYS05ZTk3NjdkYTUxMjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDM3RkNGQUJDOEUyMTFFNkIwMDFGOUI0RDhFQUI4NEYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDM3RkNGQUFDOEUyMTFFNkIwMDFGOUI0RDhFQUI4NEYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZDc5MmU0ODgtMzAxNC1kNDRiLWI4OWEtYmIxMzNhYWIyYjI1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU1YWEwNTQ3LTlmMGQtNDllYS1hOGI4LTRkZWRhMmU1OGRiMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoW3u00AAAMESURBVHja7FdLaFNBFJ2Z1/eapCnUam0V6cYWEdd+FkUK4kIRF4pLxeJOV4IbpaDQgoiCK9d+loIIKi4V3CmuRJCCImpRW2ur5NP83oznJE1IXmZqEsVuvBA67717z5k5987cqTTGiLUwJdbI1oy4q/7h4INFp+PmHm/7csmczIVmbyE0I6ERG/jek2Ih8OTbmCefxbvkrc+Z8I0L4/Hhfjuxg3BrqqgvA/CoTSFOABPib89SXpzrDeS9Xl+dh/+7jqUeiKvjX7Lhq1TBHGsxLYq+iHmN2NMdEa+PqYvflvVtFH2i3fwhJobYG/0xNdUWMWf7PacvYSj/pIAWc3oSWGdaIh5KqNGFnL72t6oXWFeJuWpV09JFcx1SxW0gXH7SlyKBn68qYhS1EdmiYZwwdtnjKWBieMi54i1JbxsADthIsW3EYEKJvm4lApDKlYlwzHf85jkSkwEmsZ3E2ZI5YZNfVvJeW6XN+I0+Dg+1gm2XGntx3BaVrJOWhr0qxjYFkFmI53MFgS1UI6cvpG3CiGI3ECNfIzZi5rR+EpM7k2V5afuHAzH1Il3OcdXXRhzFbpA11GKdjTioW+2uQb9GSuOY7+olt1kUO5pPa480v3HopLE2EHtK/LQ5cctU7eVcUeBwqT1zzHc23wj2D2eOIdNMSZuBaBD3adBdkZD5m0ZOdw/5bBBlUlRs/dZxVf2Mkxit7Qmqb8xyqKBoTC3XJHo6W2gCL2C1LmJiO6VGP70DaG3L4cKyLgO7jN/oY+wnXkhsJzF7aI8vH1qrEojzWS2W8lrk8cDZ8ccx3/Fb6JgXMB9F+3PTWY3tcTZbCvdhAUnbytMr53LL1StFmpjpYrh6d5pNh+83xtUpm+TtGjGIRcyW+vHXrL6LJn6hwy1aE4gYxGrrBoL9eQWH/gSkyrR9OCCGscTo6M7Fqw+k2oGmcJ+V2YK0IX0Zw9iWr7cO2T/gzxHcIobRjSZwvR3H9XYUFdwHopIn5bzviU+83vpK3IT/x2q3WnWS//+F+Vf2S4ABAMe7cI4Rhe5DAAAAAElFTkSuQmCC'
              }
            }
          }))
          this.plot.plotDraw.on('drawEnd', this.onDrawEnd_, this)
          this.map.on('activeTextArea', this.activeTextArea_, this)
          this.map.on('disActiveTextArea', this.activeTextArea_, this)
          this.map.un('click', this.handleClick_, this)
          this.map.on('click', this.handleClick_, this)
        }
      },
      clearActiveTool () {
        this.plot.plotDraw.disActive()
      },
      onDrawEnd_ (event) {
        let feature = event.feature
        // 开始编辑
        if (feature) {
          this.plot.plotEdit.activate(feature)
          this.activeToolPanel(feature)
        }
      },
      activeTextArea_ (event) {
        console.log(event)
        if (event.type === 'activeTextArea') {
          this.currentTextArea = event.target.get('activeTextArea')
          this.reFresheTextArea(this.currentTextArea)
        } else {
          console.log(event.type)
        }
      },
      changeSelectedItem (item) {
        this.selected = item['alias']
        if (item['alias']) {
          this.plot.plotEdit.deactivate()
          this.plot.plotDraw.active(item['alias'])
        } else {
          console.warn('不存在的标绘类型！')
        }
      },
      handleClick_ (event) {
        let feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature) {
          return feature
        })
        if (feature && feature.get('isPlot') && !this.plot.plotDraw.isDrawing()) {
          this.plot.plotEdit.activate(feature)
          this.activeToolPanel(feature)
        } else {
          this.plot.plotEdit.deactivate()
        }
        this.currentTextArea = null
      },
      mouseOverHandle (item) {
        this.$set(item, 'mouseover', true)
      },
      mouseOutHandle (item) {
        this.$set(item, 'mouseover', false)
      },
      // 激活对应的编辑面板
      activeToolPanel (feature) {
        if (feature && feature.getGeometry()) {
          const type = feature.getGeometry().getPlotType()
          if (type) {
            this.selected = type
          }
          this.refreshe(this.plot.plotUtils.getStyleCode(feature))
        }
      },
      // 刷新对应数据
      refreshe (style) {
        if (style) {
          if (style['fill']) {
            this.opacity = style['fill']['opacity'] || this.opacity
            this.backgroundColor = style['fill']['fillColor'] || this.backgroundColor
          }
          if (style['stroke']) {
            this.borderWidth = style['stroke']['strokeWidth'] || this.borderWidth
            this.borderColor = style['stroke']['strokeColor'] || this.borderColor
          }
        }
      },
      reFresheTextArea (target) {
        if (target) {
          const _style = target.getStyle()
          if (_style) {
            if (_style['fontSize']) {
              this.textAreaFontSize = parseInt(_style['fontSize'])
            }
            if (_style['color']) {
              this.textAreaColor = _style['color']
            }
            if (_style['border']) {
              let _border = _style['border'].split(' ')
              _border.every(item => {
                if (item.indexOf('px')) {
                  this.textAreaBorderWidth = parseInt(item)
                  return false
                } else {
                  return true
                }
              })
              this.textAreaBorderColor = _style['border'].slice(_style['border'].indexOf('rgb('), _style['border'].indexOf(')') + 1)
            }
            if (_style['background']) {
              this.textAreaBackgroundColor = _style['background'].slice(_style['background'].indexOf('rgb('), _style['background'].indexOf(')') + 1)
            }
          }
        }
      },
      save () {
        const features = this.plot.plotUtils.getFeatures()
        console.log({
          content: JSON.stringify(features),
          title: this.schemeTitle
        })
      }
    },
    components: {
      sfSlider,
      colorPicker,
      sfInputNumber
    }
  }
</script>

<style lang="scss">
  .ol-plot-vue {
    position: absolute;
    width: 390px;
    right: 15px;
    top: 20px;
    bottom: 80px;
    overflow: hidden;
    border-radius: 3px;
    box-shadow: 0 1px 0 0 rgba(0,0,0,.12),
    0 5px 10px -3px rgba(0,0,0,.3);
    pointer-events: auto;
    background: #fff;
    z-index:1;
    .panel-header {
      height: 80px;
      line-height: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #FFFFFF;
      padding: 0 20px;
      font-size: 16px;
      font-weight: bold;
      background: url(../../static/images/zhoubian_topbg.png)  right bottom no-repeat #1b9de8;
      .title {
        display: inline-block;
        font-size: 14px;
        margin-left: 5px;
      }
      .icon-fanhui1 {
        margin-right: 10px;
        line-height: 14px;
        height: 14px;
        font-size: 14px;
        transition: .3s;
        &:hover {
          cursor: pointer;
          color: #07C8C7;
        }
      }
      .icon-guanbi {
        position: absolute;
        right: 20px;
        top: 25px;
        line-height: 14px;
        height: 14px;
        font-size: 14px;
        transition: .3s;
        &:hover {
          cursor: pointer;
          color: #07C8C7;
        }
      }
      .icon-zuixiaohua {
        position: absolute;
        right: 44px;
        top: 25px;
        line-height: 14px;
        height: 14px;
        font-size: 14px;
        transition: .3s;
        &:hover {
          cursor: pointer;
          color: #07C8C7;
        }
      }
    }
    .panel-content {
      width: 100%;
      height: calc(100% - 80px);
      .ol-plot-vue-workspace {
        height: 100%;
        &-header {
          .tool-bar {
            height: 60px;
            line-height: 60px;
            padding: 0 20px;
            .icon-tupianzuofan {
              &:before {
                margin-right: 10px;
              }
              &:hover {
                cursor: pointer;
                color: #1B9DE8;
              }
            }
            .save-scheme {
              margin-left: 180px;
            }
          }
          .ol-plot-vue-workspace-title {
            height: 100px;
            line-height: 25px;
            padding: 0 30px;
            .el-input {
              .el-input__inner {
                font-size: 12px;
                border-radius: 0px;
              }
            }
          }
        }
        .plot-list-wrap {
          padding: 0 30px;
          .plot-list {
            ul {
              margin: auto;
              padding: 0;
              background: #FFFFFF;
              li {
                float: left;
                width: 54px;
                height: 60px;
                color: #818181;
                margin-left: 0px;
                box-sizing: border-box;
                border: 1px transparent solid;
                text-align: center;
                span:nth-child(1) {
                  width: 25px;
                  height: 25px;
                  display: block;
                  margin: auto;
                  margin-top: 10px;
                  background-size: 100% 100%!important;
                }
                span:nth-child(2) {
                  display: inline-block;
                  width: 100%;
                  overflow: hidden;
                  text-overflow:ellipsis;
                  white-space: nowrap;
                }
                span {
                  margin-top: 4px;
                  display: block;
                }
                &:hover {
                  cursor: pointer;
                  background: #FFF;
                  color: #1B9DE8;
                  border: 1px #76c4f1 solid;
                }
              }

              .ol-plot-vue-selected {
                background: #FFF;
                color: #1B9DE8;
                border: 1px #76c4f1 solid;
              }
            }
            .qipao1 {
              width: 40px;
              height: 36px;
              margin: auto;
              margin-top: 4px;
              font-size: 27px;
            }
          }
        }
        .plot-edit {
          margin-top: 15px;
          .plot-edit-color {
            text-align: left;
            padding: 0 0 0 15px;
            color: #3a3a3a;
            .stration {
              display: inline-block;
              position: relative;
              top: -12px;
              margin-right: 12px;
            }
            .demonstration {
              position: relative;
              top: 4px;
            }
            .span-border {
              margin-left: 40px;
            }
            label {
              display: inline-block;
              margin: 0 15px;
              &[for="plotBorderColor"] {
                margin-left: 70px;
              }
            }
            .el-color-picker {
              display: inline-block;
              position: relative;
              line-height: normal;
              left: 20px;
              height: 40px;
            }
          }

          .plot-edit-text {
            text-align: left;
            margin: 10px 0px;
            padding: 0 0 0 15px;
            color: #3a3a3a;
            .stration {
              display: inline-block;
              position: relative;
              top: -12px;
            }
            .font-color {
            }

            .font-size {
              margin-left: 40px;
            }

            .el-input-number--small {
              width: 100px;
            }

            .span-border {
              margin-left: 50px;
            }
            label {
              display: inline-block;
              margin: 0 15px;
              &[for="plotBorderColor"] {
                margin-left: 70px;
              }
            }
            .el-color-picker {
              display: inline-block;
              position: relative;
              line-height: normal;
              left: 9px;
              height: 40px;
            }
          }

          .min-input {
            width: 30px;
            height: 30px;
            margin: 0;
            padding: 0;
            text-align: center;
            border: 1px solid #e3e3e3;
          }

          .plot-edit-delete {
            margin: 20px 0 20px;
            padding: 0 15px;
            color: #3a3a3a;
            .el-button--small {
              padding: 7px 15px;
              font-size: 12px;
              border-radius: 4px;
              margin-left: 40px;
            }
          }
          .plot-edit-title {
            margin: 20px 0 10px;
            padding: 0 15px;
            color: #3a3a3a;
          }
          .plot-edit-line {
            padding: 0 32px 0 27px;
          }
          .plot-view-wrap {
            .plot-view-title {
              font-family: 'SimSun', Arial, sans-serif;
              font-weight: bold;
              margin-bottom: 10px;
              display: block;
              padding: 0 20px;
            }
            .plot-view-box {
              border: 1px dashed #E3E3E3;
              padding: 20px;
              text-align: center;
              width: 280px;
              margin: auto;
              background-image: linear-gradient(45deg, #E3E3E3 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0)),
              linear-gradient(-45deg, #E3E3E3 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0)),
              linear-gradient(45deg, rgba(0, 0, 0, 0) 75%, #E3E3E3 75%),
              linear-gradient(-45deg, rgba(0, 0, 0, 0) 75%, #E3E3E3 75%);
              background-size: 10px 10px;

              .iconfont {
                display: table;
                margin: auto;
                text-align: center;
                &:before {
                  display: table-cell;
                  vertical-align: middle;
                }
              }
            }
          }
          .el-color-picker__trigger, .el-color-picker__color {
            border-radius: 0 !important;
          }
          .el-color-svpanel {
            width: 274px !important;
          }
          .el-slider__runway {
            height: 2px;
            .el-slider__bar {
              height: 2px;
            }
            .el-slider__button-wrapper {
              width: 32px;
              height: 32px;
              .el-slider__button {
                width: 12px;
                height: 12px;
              }
            }
          }
        }
        &-scroll {
          width: calc(100% + 30px);
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          &-inner {
            width: 390px;
          }
        }
      }
    }
    .ol-plot-vue-null-data {
      text-align: center;
      height: 100%;
      line-height: 100%;
      padding-top: 50%;
      img {
        display: block;
        margin: 0 auto;
      }
      span {
        margin-bottom: 8px;
        color: #7ac2f1;
        display: block;
      }
      span:nth-child(1) {
        margin-top: 10px;
      }
    }
  }
</style>
