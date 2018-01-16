<template>
  <div class="sf-plot-workspace" v-loading.body="loading">
    <header class="sf-plot-workspace-header">
      <div class="tool-bar clearfix">
        <span @click="cancel('')" class="iconfont icon-tupianzuofan">新方案</span>
        <el-button class="save-scheme" @click="save()" type="primary" plain>保存方案</el-button>
      </div>
      <div class="sf-plot-workspace-title">
        <h4>方案名称</h4>
        <el-input v-model="schemeTitle" placeholder="请输入方案名称"></el-input>
      </div>
    </header>
    <div class="sf-plot-workspace-scroll">
      <div class="sf-plot-workspace-scroll-inner">
        <div class="plot-list-wrap">
          <el-row>
            <el-col :span="5"><h4>标绘工具</h4></el-col>
            <el-col :span="5" :offset="12">
              <el-button @click="clearActiveTool()" size="small" type="warning">取消激活工具</el-button>
            </el-col>
          </el-row>
          <div class="plot-list">
            <ul class="clearfix">
              <li
                v-for="(tool, index) in tools"
                class="sf-plot-header-li"
                :class="selected === tool.alias ? 'sf-plot-selected' : ''"
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
              <sf-color-picker v-model="backgroundColor"></sf-color-picker>
              <span class="stration span-border">边框色</span>
              <sf-color-picker v-model="borderColor"></sf-color-picker>
            </div>
            <div class="plot-edit-title">边框线宽</div>
            <div class="plot-edit-line">
              <el-slider v-model="borderWidth" :min=0 :max=10 :step=1></el-slider>
            </div>
            <div class="plot-edit-title">透明度</div>
            <div class="plot-edit-line">
              <el-slider v-model="opacity" :min=0 :max=1 :step=0.1></el-slider>
            </div>
          </div>
        </div>
        <div class="sf-plot-workspace-text-control" v-else-if="selected === 'TextArea'">
          <div class="plot-edit">
            <div class="plot-edit-color">
              <span class="stration span-background">背景色</span>
              <sf-color-picker :color-format="'rgb'" v-model="textAreaBackgroundColor"></sf-color-picker>
              <span class="stration span-border">边框色</span>
              <sf-color-picker :color-format="'rgb'" v-model="textAreaBorderColor"></sf-color-picker>
            </div>
            <div class="plot-edit-text">
              <span class="font-color span-color">字体颜色</span>
              <sf-color-picker :color-format="'rgb'" v-model="textAreaColor"></sf-color-picker>
              <span class="font-size span-size">字体大小</span>
              <el-input-number size="small" v-model="textAreaFontSize"></el-input-number>
            </div>
            <div class="plot-edit-title">边框线宽</div>
            <div class="plot-edit-line">
              <el-slider v-model="textAreaBorderWidth" :min=0 :max=10 :step=1></el-slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  import Vue from 'vue'
  import * as $fetch from '@/store/api'
  export default {
    name: 'sf-plot-workspace',
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
    computed: {
      ...mapState({
        panelSelected: state => state.customPanel.selected,
        panelType: state => state.plot.panelType,
        themeData: state => state.plot.themeData,
        schemeData: state => state.plot.schemeData
      })
    },
    mounted () {
      this.init()
      this.$on('action-save', () => {
        this.cancel('close')
      })
    },
    watch: {
      panelType: function (value) {
        if (value !== 'workspace') {
          config.Maps.map.un('click', this.handleClick_, this)
        } else {
          config.Maps.map.un('click', this.handleClick_, this)
          config.Maps.map.on('click', this.handleClick_, this)
          this.reDrawData()
        }
      },
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
      }
    },
    methods: {
      init () {
        $fetch.getList().then(res => {
          this.tools = res.data
          this.initPlot()
        }).catch(error => {
          console.log(error)
        })
        this.reDrawData()
      },
      initPlot () {
        /* eslint new-cap: 0 */
        this.plot = new olPlot(config.Maps.map, {
          zIndex: 999,
          zoomToExtent: true
        })
        Vue.prototype.$Plot = this.plot
        this.plot.plotDraw.drawLayer.setStyle(new ol.style.Factory({
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
        config.Maps.map.on('activeTextArea', this.activeTextArea_, this)
        config.Maps.map.on('disActiveTextArea', this.activeTextArea_, this)
        config.Maps.map.un('click', this.handleClick_, this)
        config.Maps.map.on('click', this.handleClick_, this)
      },
      clearActiveTool () {
        this.plot.plotDraw.disActive()
      },
      onDrawEnd_ (event) {
        let feature = event.feature
        // 开始编辑
        if (feature && feature instanceof ol.Feature) {
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
          // this.currentTextArea = null
          console.log(event.type)
        }
      },
      changeSelectedItem (item) {
        this.selected = item['alias']
        if (item['alias']) {
          this.plot.plotEdit.deactivate()
          this.plot.plotDraw.active(item['alias'])
        } else {
          this.$message({
            message: '不存在的标绘类型！',
            type: 'warning'
          })
        }
      },
      handleClick_ (event) {
        let feature = config.Maps.map.forEachFeatureAtPixel(event.pixel, function (feature) {
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
      save (type) {
        const features = this.plot.plotUtils.getFeatures()
        console.log(features)
        if (this.schemeTitle && features.length > 0) {
          this.loading = true
          $fetch.addPlotScheme({
            content: JSON.stringify(features),
            createUser: this.themeData.createUser,
            schemeId: this.themeData.id,
            title: this.schemeTitle
          }).then(res => {
            if (res && res.data) {
              this.$message({
                message: '添加成功！',
                type: 'success'
              })
            }
          }).catch(error => {
            console.log(error)
          }).finally(() => {
            this.loading = false
            if (type === 'close') {
              this.$store.dispatch('plotShowAction', false)
              this.$store.dispatch('actionPanelType', '')
              this.$store.dispatch('actionThemeData', {})
              this.$store.dispatch('actionSchemeData', {})
            } else {
              this.$store.dispatch('actionPanelType', 'scheme')
              this.$store.dispatch('actionSchemeData', {})
            }
            this.plot.plotUtils.removeAllFeatures()
          })
        } else {
          this.$message({
            message: '请补全相关信息再次提交！',
            type: 'warning'
          })
        }
      },
      cancel (type) {
        const features = this.plot.plotUtils.getFeatures()
        if (features && features.length > 0) {
          this.$confirm('是否保留当前标绘方案？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '放弃',
            type: 'warning'
          }).then(() => {
            this.save(type)
          }).catch(() => {
            this.plot.plotUtils.removeAllFeatures()
            if (type === 'close') {
              this.$store.dispatch('plotShowAction', false)
              this.$store.dispatch('actionPanelType', '')
              this.$store.dispatch('actionThemeData', {})
              this.$store.dispatch('actionSchemeData', {})
            } else {
              this.$store.dispatch('actionPanelType', 'scheme')
              this.$store.dispatch('actionSchemeData', {})
            }
          })
        } else {
          this.$store.dispatch('actionPanelType', 'scheme')
          this.$store.dispatch('actionSchemeData', {})
        }
      },
      reDrawData () {
        if (this.schemeData.id && this.panelType === 'workspace') {
          this.loading = true
          $fetch.getPlotSchemeById({
            id: this.schemeData.id
          }).then(res => {
            this.plot.plotUtils.removeAllFeatures()
            this.plot.plotUtils.addFeatures(JSON.parse(res.data.content))
          }).catch(error => {
            console.log(error)
          }).finally(() => {
            this.loading = false
          })
        }
      }
    },
    components: {
    }
  }
</script>
<style lang="scss">
  $blue: #1b9de8;
  .sf-plot-workspace {
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
      .sf-plot-workspace-title {
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

          .sf-plot-selected {
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
      height: calc(100% - 190px);
      overflow-y: auto;
      overflow-x: hidden;
      &-inner {
        width: calc(100% - 30px);
      }
    }
  }
</style>
