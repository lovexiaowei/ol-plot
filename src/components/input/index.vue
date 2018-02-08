<template>
  <div :class="['sf-input',
    inputSize ? 'sf-input--' + inputSize : '',
    {
      'is-disabled': inputDisabled,
      'sf-input-group': $slots.prepend || $slots.append,
      'sf-input-group--append': $slots.append,
      'sf-input-group--prepend': $slots.prepend,
      'sf-input--prefix': $slots.prefix || prefixIcon,
      'sf-input--suffix': $slots.suffix || suffixIcon
    }
    ]"
       @mouseenter="hovering = true"
       @mouseleave="hovering = false"
  >
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div class="sf-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <input
        :tabindex="tabindex"
        v-if="type !== 'textarea'"
        class="sf-input__inner"
        v-bind="$props"
        :disabled="inputDisabled"
        :autocomplete="autoComplete"
        :value="currentValue"
        ref="input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        :aria-label="label"
      >
      <!-- 前置内容 -->
      <span class="sf-input__prefix" v-if="$slots.prefix || prefixIcon" :style="prefixOffset">
        <slot name="prefix"></slot>
        <i class="sf-input__icon"
           v-if="prefixIcon"
           :class="prefixIcon">
        </i>
      </span>
      <!-- 后置内容 -->
      <span
        class="sf-input__suffix"
        v-if="$slots.suffix || suffixIcon || showClear || validateState && needStatusIcon"
        :style="suffixOffset">
        <span class="sf-input__suffix-inner">
          <template v-if="!showClear">
            <slot name="suffix"></slot>
            <i class="sf-input__icon"
               v-if="suffixIcon"
               :class="suffixIcon">
            </i>
          </template>
          <i v-else
             class="sf-input__icon el-icon-circle-close sf-input__clear"
             @click="clear"
          ></i>
        </span>
        <i class="sf-input__icon"
           v-if="validateState"
           :class="['sf-input__validateIcon', validateIcon]">
        </i>
      </span>
      <!-- 后置元素 -->
      <div class="sf-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
  </div>
</template>
<script>
  import emitter from '../../utils/emitter';
  import Migrating from '../../utils/migrating';
  export default {
    name: 'sf-input',
    componentName: 'sf-input',
    mixins: [emitter, Migrating],
    data () {
      return {
        currentValue: this.value,
        prefixOffset: null,
        suffixOffset: null,
        hovering: false,
        focused: false
      };
    },

    props: {
      value: [String, Number],
      placeholder: String,
      size: String,
      resize: String,
      name: String,
      form: String,
      id: String,
      maxlength: Number,
      minlength: Number,
      readonly: Boolean,
      autofocus: Boolean,
      disabled: Boolean,
      type: {
        type: String,
        default: 'text'
      },
      rows: {
        type: Number,
        default: 2
      },
      autoComplete: {
        type: String,
        default: 'off'
      },
      max: {},
      min: {},
      step: {},
      validateEvent: {
        type: Boolean,
        default: true
      },
      suffixIcon: String,
      prefixIcon: String,
      label: String,
      clearable: {
        type: Boolean,
        default: false
      },
      tabindex: String
    },

    computed: {
      _elFormItemSize () {
        return (this.elFormItem || {}).elFormItemSize;
      },
      validateState () {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      needStatusIcon () {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      validateIcon () {
        return {
          validating: 'el-icon-loading',
          success: 'el-icon-circle-check',
          error: 'el-icon-circle-close'
        }[this.validateState];
      },
      inputSize () {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      inputDisabled () {
        return this.disabled || (this.elForm || {}).disabled;
      },
      isGroup () {
        return this.$slots.prepend || this.$slots.append;
      },
      showClear () {
        return this.clearable && this.currentValue !== '' && (this.focused || this.hovering);
      }
    },

    watch: {
      'value' (val, oldValue) {
        this.setCurrentValue(val);
      }
    },

    methods: {
      focus () {
        (this.$refs.input).focus();
      },
      getMigratingConfig () {
        return {
          props: {
            'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
            'on-icon-click': 'on-icon-click is removed.'
          },
          events: {
            'click': 'click is removed.'
          }
        };
      },
      handleBlur (event) {
        this.focused = false;
        this.$emit('blur', event);
      },
      inputSelect () {
        (this.$refs.input).select();
      },
      handleFocus (event) {
        this.focused = true;
        this.$emit('focus', event);
      },
      handleInput (event) {
        const value = event.target.value;
        this.$emit('input', value);
        this.setCurrentValue(value);
      },
      handleChange (event) {
        this.$emit('change', event.target.value);
      },
      setCurrentValue (value) {
        if (value === this.currentValue) return;
        this.currentValue = value;
      },
      calcIconOffset (place) {
        const pendantMap = {
          'suf': 'append',
          'pre': 'prepend'
        };

        const pendant = pendantMap[place];

        if (this.$slots[pendant]) {
          return {transform: `translateX(${place === 'suf' ? '-' : ''}${this.$el.querySelector(`.sf-input-group__${pendant}`).offsetWidth}px)`};
        }
      },
      clear () {
        this.$emit('input', '');
        this.$emit('change', '');
        this.setCurrentValue('');
        this.focus();
      }
    },

    created () {
      this.$on('inputSelect', this.inputSelect);
    },

    mounted () {
      if (this.isGroup) {
        this.prefixOffset = this.calcIconOffset('pre');
        this.suffixOffset = this.calcIconOffset('suf');
      }
    }
  };
</script>
