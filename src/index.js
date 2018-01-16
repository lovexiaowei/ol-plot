import Pagination from './/pagination/index.js'

const components = [
  Pagination
]

const install = function(Vue, opts = {}) {
  components.map(component => {
    Vue.component(component.name, component);
  })
  Vue.prototype.$message = Message
  Vue.prototype.$confirm = MessageBox
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

module.exports = {
  version: '1.0.1',
  install
}

module.exports.default = module.exports
