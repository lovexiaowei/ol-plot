<template>
  <transition name="el-zoom-in-top" @after-leave="doDestroy">
    <sketch v-show="showPopper" v-model="colorInner"></sketch>
  </transition>
</template>

<script>
  import Popper from '../utils/popper/vue-popper'
  import { Sketch } from 'vue-color'
  export default {
    name: 'sf-color-picker-dropdown',
    mixins: [Popper],
    props: {
      color: {
        required: true
      }
    },
    data () {
      return {
        colorInner: ''
      }
    },
    mounted () {
      this.$parent.popperElm = this.popperElm = this.$el
      this.referenceElm = this.$parent.$el
      this.colorInner = this.color
    },
    watch: {
      showPopper (val) {
        if (val === true) {
          this.$nextTick(() => {
            console.log(val)
          })
        }
      },
      colorInner (val) {
        this.$emit('update:color', val)
      }
    },
    components: {
      Sketch
    }
  }
</script>
