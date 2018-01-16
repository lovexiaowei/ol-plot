<template>
  <div class="sf-plot" :class="panelSelected !== '应急标绘' ? 'min-style' : ''">
    <header class="panel-header">
      <span title="应急标绘">应急标绘</span>
      <span class="iconfont icon-zuixiaohua" @click="minFunc()"></span>
      <span class="iconfont icon-guanbi" @click="closeFunc()"></span>
    </header>
    <div class="panel-content">
      <workspace ref="workspace"></workspace>
    </div>
  </div>
</template>

<script>
  import workspace from './workspace'
  export default {
    name: 'sf-plot',
    computed: {
    },
    data () {
      return {
        loading: false
      }
    },
    methods: {
      closeFunc () {
        if (this.panelType === 'workspace') {
          this.$refs.workspace.$emit('action-save')
        } else {
          this.$store.dispatch('plotShowAction', false)
          this.$store.dispatch('actionPanelType', '')
          this.$store.dispatch('actionThemeData', {})
          this.$store.dispatch('actionSchemeData', {})
        }
      },
      minFunc () {
        this.$store.dispatch('toolSelected', '')
      },
      backFunc () {
        const panelType = this.$store.getters.panelType
        switch (panelType) {
          case 'workspace':
            this.$store.dispatch('actionPanelType', 'scheme')
            break
          case 'scheme':
            this.$store.dispatch('actionPanelType', 'theme')
            break
        }
      }
    },
    components: {
      workspace
    }
  }
</script>

<style lang="scss">
  .sf-plot {
    position: absolute;
    width: 390px;
    right: 15px;
    top: 60px;
    bottom: 15px;
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
      background: url(../../../../static/images/zhoubian_topbg.png)  right bottom no-repeat #1b9de8;
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
    }
    .sf-plot-null-data {
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
  .el-message-box__wrapper {
    .el-message-box__btns {
      text-align: center;
    }
  }
</style>
