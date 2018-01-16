<template>
  <div class="layer-switcher">
    <ul class="layer-switcher-ul">
      <li
        :key="item.layerName"
        class="layer-switcher-li"
        :class="selectLayerName === item.layerName ? 'selected-item' : ''"
        :style="fixStyle(item, index)"
        @click="switchLayer(item)"
        v-for="(item, index) in layers">
        <span class="layer-name">{{item.layerName}}</span>
      </li>
    </ul>
  </div>
</template>
<script>
  import { getLayersArrayByKeyValue } from '../../map/layer/layerUtils'
  export default {
    data () {
      return {
        layers: [
          {
            layerName: 'OSM',
            name: 'OSM',
            icon: './static/images/maptype_pano.png'
          },
          {
            layerName: 'Google',
            name: '谷歌',
            icon: './static/images/maptype_yunran.png'
          },
          {
            layerName: 'Baidu',
            name: '百度',
            icon: './static/images/maptype_vector.png'
          }
        ],
        baseLayers: '',
        selectLayerName: 'Baidu',
        isOver: false
      }
    },
    computed: {
    },
    mounted () {
      this.$el.addEventListener('mouseenter', event => {
        this.isOver = true
      }, false)
      this.$el.addEventListener('mouseleave', event => {
        this.isOver = false
      }, false)
    },
    methods: {
      // 动态样式（主要处理层叠效果）
      fixStyle (item, index) {
        return {
          background: 'url(' + item['icon'] + ') 0px 0px no-repeat',
          zIndex: index + 1
        }
      },
      // 切换底图
      switchLayer (item) {
        if (item['layerName']) {
          this.selectLayerName = item['layerName']
          let layers = this.getBaseLayers()
          if (layers) {
            layers.forEach(layer => {
              if (layer.get('layerName') === item['layerName']) {
                layer.setVisible(true)
              } else {
                layer.setVisible(false)
              }
            })
          }
        }
      },
      // 获取所有底图（获取后不会再次获取，性能优化）
      getBaseLayers () {
        if (!this.baseLayers) {
          this.baseLayers = getLayersArrayByKeyValue(this.$Map, 'isBaseLayer', true)
        }
        return this.baseLayers
      }
    }
  }
</script>
<style scoped lang="scss">
  .layer-switcher {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
    ul {
      width: 110px;
      height: 80px;
      transition-property: width,background-color;
      transition-duration: .4s;
      background-color: rgba(255, 255, 255, 0);
      li {
        height: 60px;
        width: 86px;
        position: absolute;
        border-radius: 2px;
        top: 10px;
        box-sizing: border-box;
        border: 1px solid rgba(153,153,153,.42);
        background-size: 86px 240px;
        transition-property: right,background-image;
        transition-duration: .4s;
        .layer-name {
          position: absolute;
          bottom: 0;
          right: 0;
          display: inline-block;
          padding: 3px 3px 2px 4px;
          font-size: 12px;
          height: 16px;
          line-height: 8px;
          color: #FFF;
          border-top-left-radius: 2px;
        }
        &:hover {
          cursor: pointer;
          border-color: #3385FF;
          .layer-name {
            background-color: #3385FF;
          }
        }
      }
      li:nth-child(1) {
        right: 0px;
        margin-right: 30px;
      }
      li:nth-child(2) {
        right: 0px;
        margin-right: 20px;
      }
      li:nth-child(3) {
        right: 0px;
        margin-right: 10px;
      }
      .selected-item {
        border-color: #3385FF;
        .layer-name {
          background-color: #3385FF;
        }
      }
      &:hover {
        width: 298px;
        background-color: rgba(255, 255, 255, 0.8);
        li:nth-child(1) {
          right: 192px;
          margin-right: 10px;
        }
        li:nth-child(2) {
          right: 96px;
          margin-right: 10px;
        }
        li:nth-child(3) {
          right: 0px;
          margin-right: 10px;
        }
      }
    }
  }
</style>
