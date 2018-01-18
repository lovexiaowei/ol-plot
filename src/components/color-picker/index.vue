<template>
  <div
    :class="[
      'sf-color-picker',
      disabled ? 'is-disabled' : '',
      colorSize ? `sf-color-picker--${ colorSize }` : ''
    ]"
    v-clickoutside="hide">
    <div class="sf-color-picker__trigger" @click="handleTrigger">
      <span class="sf-color-picker__color" :class="{ 'is-alpha': showAlpha }">
        <span
          class="sf-color-picker__color-inner"
          :style="{ backgroundColor: displayedColor }"></span>
        <span class="sf-color-picker__empty el-icon-close" v-if="!value && !showPanelColor"></span>
      </span>
      <span class="sf-color-picker__icon el-icon-caret-bottom" v-show="value || showPanelColor"></span>
    </div>
    <sf-color-picker-dropdown
      ref="dropdown"
      v-model="showPicker"
      :color.sync="color"
      :class="['sf-color-picker__panel', popperClass || '']"></sf-color-picker-dropdown>
  </div>
</template>

<script>
  import { toRgbaColor, rgbaToagb } from '../../utils/color'
  import sfColorPickerDropdown from './picker-dropdown'
  import Clickoutside from '../../utils/clickoutside'
  export default {
    name: 'SfColorPicker',
    props: {
      value: String,
      showAlpha: Boolean,
      colorFormat: String,
      disabled: Boolean,
      size: String,
      popperClass: String
    },
    inject: {
      elFormItem: {
        default: ''
      }
    },
    directives: {Clickoutside},
    computed: {
      displayedColor () {
        if (!this.value && !this.showPanelColor) {
          return 'transparent'
        } else if (this.color.rgba) {
          return rgbaToagb(this.color.rgba)
        } else {
          return 'transparent'
        }
      },

      _elFormItemSize () {
        return (this.elFormItem || {}).elFormItemSize
      },

      colorSize () {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
      }
    },
    watch: {
      value (val) {
        if (!val) {
          this.showPanelColor = false
        } else if (val && val !== this.color) {
          this.color = toRgbaColor(val)
        }
      },
      color (value) {
        this.showPanelColor = true
        if (value && value.rgba) {
          this.$emit('input', rgbaToagb(value.rgba))
          this.$emit('change', rgbaToagb(value.rgba))
        }
      }
    },
    methods: {
      handleTrigger () {
        if (this.disabled) return
        this.showPicker = !this.showPicker
      },
      hide () {
        this.showPicker = false
        this.resetColor()
      },
      resetColor () {
        this.$nextTick(_ => {
          if (this.value) {
            this.color = toRgbaColor(this.value)
          } else {
            this.showPanelColor = false
          }
        })
      }
    },
    mounted () {
      const value = this.value
      if (value) {
        this.color = toRgbaColor(value)
      }
    },
    data () {
      return {
        color: {},
        showPicker: false,
        showPanelColor: false
      }
    },
    components: {
      sfColorPickerDropdown
    }
  }
</script>

<style lang="scss">
  .sf-color-picker {
    position: relative;
    display: inline-block;
    line-height: normal;
    left: 20px;
    height: 40px;
    &__trigger {
      display: inline-block;
      box-sizing: border-box;
      height: 36px;
      padding: 6px;
      border: 1px solid #bfcbd9;
      font-size: 0;
      border-radius: none;
    }
    &__color {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      border: 1px solid #666;
      width: 22px;
      height: 22px;
      text-align: center;
      &-inner {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
      }
    }
    &__icon {
      display: inline-block;
      position: relative;
      top: -6px;
      margin-left: 8px;
      width: 12px;
      color: #888;
      font-size: 12px;
    }
  }
</style>
