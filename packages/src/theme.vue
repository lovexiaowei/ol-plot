<template>
  <div class="sf-plot-theme" v-loading.body="loading">
    <div v-if="inAddThemeContent" class="sf-plot-theme-add">
      <header class="sf-plot-theme-add-header">添加主题</header>
      <el-form :label-position="'top'" :model="themeForm" status-icon :rules="themeFormRules" ref="themeForm">
        <el-form-item label="标绘主题" prop="theme">
          <el-input type="text" v-model="themeForm.theme" auto-complete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="添加人" prop="autor">-->
        <!--<el-input type="text" v-model="themeForm.autor" auto-complete="off"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="描述信息" prop="message">
          <el-input
            type="textarea"
            :resize="'none'"
            v-model="themeForm.message"
            placeholder="描述信息">
          </el-input>
        </el-form-item>
        <el-form-item class="sf-plot-theme-button">
          <el-button size="medium" @click="submitForm('themeForm')">保存</el-button>
          <el-button size="medium" @click="resetForm('themeForm')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="sf-plot-list" v-else>
      <div class="header clearfix">
        <el-col :span="4">
          <span>检索主题：</span>
        </el-col>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            prefix-icon="el-icon-search"
            v-model="value" clearable>
          </el-input>
        </el-col>
        <el-col class="search" :span="4">
          <el-button
            size="medium"
            type="primary"
            @click="searchTheme()">搜索</el-button>
        </el-col>
        <el-col class="new-theme" :span="4">
          <el-button
            size="medium"
            @click="addTheme()">添加主题</el-button>
        </el-col>
      </div>
      <div class="sf-plot-content scroll" ref="themeContent">
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
            <div class="sf-plot-theme-ul-li-div">
              <span class="number"></span>
              <span class="title">{{item.title}}</span>
            </div>
            <div class="sf-description">
              <span class="user">{{item.createUser}}</span>
              <span class="time">{{item.createDate | formatTime}}</span>
            </div>
            <div class="sf-description" :title="item.description">{{item.description}}</div>
            <span class="delete iconfont icon-icondelete" @click.stop="deleteHandle(item)"></span>
          </li>
        </transition-group>
        <transition name="fade">
          <div class="page-wrap" v-show="count > limit && items.length > 0">
            <el-pagination
              small
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="limit"
              layout="prev, pager, next"
              :total="count">
            </el-pagination>
          </div>
        </transition>
        <transition name="fade">
          <div class="sf-plot-null-data" v-if="items.length === 0">
            <img src="../../../../static/images/zhoubian_wushuju.png"/>
            <span>暂未检索到主题！</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
  import * as $fetch from '@/store/api'
  export default {
    name: 'sf-plot-theme',
    data () {
      return {
        value: '',
        loading: false,
        items: [],
        count: 0,
        limit: 10, // 当前页面过滤数
        currentPage: 1,
        inAddThemeContent: false,
        themeForm: {
          theme: '',
          message: ''
        },
        themeFormRules: {
          theme: [
            {required: true, message: '请输入主题', trigger: 'blur'}
          ],
          message: [
            {required: true, message: '描述信息', trigger: 'blur'}
          ]
        }
      }
    },
    mounted () {
      this.searchTheme()
    },
    methods: {
      searchTheme () {
        this._getLimit()
        this.loading = true
        $fetch.getPlotThemes({
          title: this.value,
          pageSize: this.limit,
          currentPage: this.currentPage
        }).then(res => {
          if (res) {
            this.count = res.totalCount
            this.items = res.entitys
          }
        }).catch(error => {
          this.loading = false
          console.log(error)
        }).finally(() => {
          this.loading = false
        })
      },
      addTheme () {
        console.log('add')
        this.inAddThemeContent = true
      },
      _getLimit () {
        if (this.$refs['themeContent']) {
          let panelHeight = this.$refs['themeContent'].offsetHeight
          this.limit = Math.floor(panelHeight / 84)
        }
      },
      checkedTheme (item) {
        this.$store.dispatch('actionPanelType', 'scheme')
        this.$store.dispatch('actionThemeData', item)
      },
      handleCurrentChange (page) {
        this.currentPage = page
        console.log(this.currentPage)
      },
      submitForm (form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            this.loading = true
            $fetch.addPlotTheme({
              title: this.themeForm.theme,
              description: this.themeForm.message
            }).then(res => {
              if (res && res.data) {
                this.$message({
                  message: '添加成功！',
                  type: 'success'
                })
                this.inAddThemeContent = false
                this.searchTheme()
              }
            }).catch(error => {
              this.loading = false
              console.log(error)
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.$message({
              message: '请补全相关信息再次提交！',
              type: 'warning'
            })
            return false
          }
        })
      },
      deleteHandle (item) {
        this.$confirm('此操作将永久删除该主题, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          $fetch.deletePlotTheme({
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
            this.loading = false
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
      },
      resetForm () {
        this.inAddThemeContent = false
      }
    }
  }
</script>
<style lang="scss">
  .sf-plot-theme {
    width: 100%;
    height: 100%;
    font-family: "Microsoft YaHei", serif;
    .header {
      padding: 5px 15px;
      line-height: 46px;
      .line {
        text-align: center;
      }
      .search {
        text-align: center;
        margin-left: 10px;
      }
      .new-theme {
        text-align: center;
        margin-left: 10px;
      }
      .el-date-editor.el-input {
        width: 100%;
      }
    }
    .sf-plot-theme-add {
      height: calc(100% - 55px);
      overflow: hidden;
      padding: 0 20px;
      &-header {
        height: 60px;
        line-height: 60px;
        font-size: 15px;
        color: #2a2a2a;
      }
      .el-form {
        padding: 0 15px;
        .el-form-item {
          .el-form-item__label {
            color: #000;
            font-size: 14px;
          }
          .el-form-item__content {
            .el-input {
              .el-input__inner {
                font-family: SimSun;
                font-size: 12px;
                border-radius: 0px;
              }
            }
          }
          .el-textarea {
            textarea {
              border-radius: 0px!important;
            }
          }
        }
        .sf-plot-theme-button {
          text-align: center;
          .el-button {
            padding: 8px 18px;
          }
          .el-button:nth-child(1) {
            border: 1px solid #1B9DE8;
            &:hover {
              background-color: #1B9DE8;
              color: #FFFFFF;
            }
          }
        }
      }
    }
    .sf-plot-list {
      height: calc(100% - 55px);
      .sf-plot-content {
        height: 100%;
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
            height: 84px;
            line-height: 28px;
            position: relative;
            .sf-plot-theme-ul-li-div {
              width: 300px;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
            }
            .number {
              position: absolute;
              top: 15px;
              width: 26px;
              height: 32px;
              font-size: 14px;
              color: #FFFFFF;
              background: url("../../../../static/images/plot/theme.png");
            }
            .title {
              margin-left: 35px;
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
              width: 270px;
              margin-left: 36px;
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
  }
</style>
