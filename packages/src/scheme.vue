<template>
  <div class="sf-plot-theme" v-loading.body="loading">
    <header class="sf-plot-theme-header">
      <div class="tool-bar clearfix">
        <span @click="cancel()" class="iconfont icon-tupianzuofan">{{themeData.title}}</span>
        <el-button class="save-scheme" @click="addScheme()" type="primary" plain>添加方案</el-button>
      </div>
    </header>
    <div class="sf-plot-content scroll" ref="schemeContent">
      <transition-group
        tag="ul"
        name="fade"
        class="sf-plot-content-ul"
        v-if="items.length !== 0">
        <li v-for="(item, index) in items"
            :title="item['title']"
            :data-index="index"
            :key="item['id']"
            @click="checkedTheme(item)">
          <div>
            <span class="number"></span>
            <span class="title">{{item.title}}</span>
          </div>
          <div class="sf-description">
            <span class="user">{{item.createUser}}</span>
            <span class="time">{{item.createDate | formatTime}}</span>
          </div>
          <span class="delete iconfont icon-icondelete" @click.stop="deleteHandle(item)"></span>
        </li>
      </transition-group>
      <transition name="fade">
        <div class="sf-plot-null-data" v-if="items.length === 0">
          <img src="../../../../static/images/zhoubian_wushuju.png"/>
          <span>暂未检索到预案！</span>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  import * as $fetch from '@/store/api'
  export default {
    name: 'sf-plot-scheme',
    computed: {
      ...mapState({
        themeData: state => state.plot.themeData,
        schemeData: state => state.plot.schemeData
      })
    },
    data () {
      return {
        loading: false,
        items: []
      }
    },
    watch: {
      themeData (value) {
        if (value) {
          this.searchTheme()
        } else {
        }
      },
      schemeData (value) {
        this.searchTheme()
        if (this.$Plot) {
          this.$Plot.plotEdit.deactivate()
        }
      }
    },
    methods: {
      searchTheme () {
        if (this.themeData.id) {
          this.loading = true
          $fetch.getPlotScheme({
            schemeId: this.themeData.id
          }).then(res => {
            if (res) {
              this.items = res
            }
          }).catch(error => {
            console.log(error)
          }).finally(() => {
            this.loading = false
          })
        }
      },
      checkedTheme (item) {
        this.$store.dispatch('actionPanelType', 'workspace')
        this.$store.dispatch('actionSchemeData', item)
      },
      cancel () {
        this.$store.dispatch('actionThemeData', {})
        this.$store.dispatch('actionPanelType', 'theme')
      },
      addScheme () {
        this.$store.dispatch('actionPanelType', 'workspace')
      },
      deleteHandle (item) {
        this.$confirm('此操作将永久删除该主题, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          $fetch.deletePlotScheme({
            id: item.id
          }).then(res => {
            if (res.data) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            }
          }).catch(error => {
            console.log(error)
            this.$message({
              type: 'error',
              message: '删除失败!'
            })
          }).finally(() => {
            this.loading = false
            this.searchTheme()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    }
  }
</script>
<style scoped lang="scss">
  .sf-plot-theme {
    width: 100%;
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
          float: right;
          margin-top: 15px;
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
    .sf-plot-content {
      height: calc(100% - 60px);
      overflow: hidden;
      padding: 0 20px;
      &-ul {
        height: calc(100% - 32px);
        width: calc(100% + 30px);
        overflow-y: auto;
        overflow-x: hidden;
        li {
          width: calc(100% - 30px);
          padding: 5px 0;
          height: 64px;
          line-height: 32px;
          position: relative;
          .number {
            position: absolute;
            top: 15px;
            width: 38px;
            height: 32px;
            font-size: 14px;
            color: #FFFFFF;
            background: url("../../../../static/images/plot/scheme.png");
          }
          .title {
            margin-left: 50px;
          }
          .title, .time {
            /*padding: 3px 5px;*/
            font-size: 14px;
            color: #2a2a2a;
          }
          .delete {
            position: absolute;
            top: 20px;
            right: 10px;
            font-size: 14px;
            &:hover {
              cursor: pointer;
              color: #1B9DE8;
            }
          }
          .sf-description {
            width: 250px;
            margin-left: 50px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
          }
          &:hover {
            cursor: pointer;
            background-color: #f5f6f8;
          }
        }
      }
      .page-wrap {
        width: 100%;
        text-align: center;
      }
    }
  }
</style>
