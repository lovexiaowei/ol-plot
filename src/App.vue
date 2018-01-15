<template>
  <div id="main-map" class="map-box">
    <layer-switcher></layer-switcher>
  </div>
</template>
<script>
  import Vue from 'vue'
  import ol from 'openlayers'
  import GOOGLE from './map/source/Google'
  import BAIDU from './map/source/Baidu'
  // import ContextMenu from './map/controls/contextMenu'
  import layerSwitcher from './components/control/LayerSwitcher'
  export default {
    data () {
      return {
        contextMenu: {
          itemWidth: 130,
          itemHeight: 30,
          items: [
            {
              name: '测面',
              alias: 'measureArea',
              iconType: 'iconfont',
              icon: 'icon-cemian',
              iconColor: '#1AD3EF',
              showLine: true
            },
            {
              name: '清空地图',
              alias: 'clearMap',
              iconType: 'iconfont',
              icon: 'icon-shanchu',
              iconColor: '#F05849'
            },
            {
              name: '搜周边',
              alias: 'circleSearch',
              iconType: 'iconfont',
              icon: 'icon-map',
              iconColor: '#2994EF'
            }
          ]
        }
      }
    },
    mounted () {
      this.initMap()
    },
    methods: {
      // 地图初始化
      initMap () {
        Vue.prototype.$Map = new ol.Map({
          target: 'main-map',
          layers: [
            new ol.layer.Tile({
              isBaseLayer: true,
              layerName: 'OSM',
              visible: false,
              source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
              isBaseLayer: true,
              layerName: 'Google',
              visible: false,
              source: new GOOGLE()
            }),
            new ol.layer.Tile({
              isBaseLayer: true,
              layerName: 'Baidu',
              visible: true,
              source: new BAIDU({
                projection: 'EPSG:3857',
                origin: [43.88955327932, 12.590178885765],
                url: 'http://online{0-3}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20170607&scaler=1&p=1'
              })
            })
          ],
          controls: [],
          view: new ol.View({
            center: ol.proj.fromLonLat([113.534501, 34.441045]),
            zoom: 4
          })
        })
        Vue.prototype.$View = this.$Map.getView()
        this.addContextMenu()
      },
      // 添加右键菜单
      addContextMenu () {
        // this.$Map.addControl(new ContextMenu(this.contextMenu))
      }
    },
    components: {
      layerSwitcher
    }
  }
</script>
<style lang="scss">
  .map-box {
  }
</style>
