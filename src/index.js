import package_ from '../package'
import olPlotVue from './components/index'
import './assets/style/index.scss'
const components = [
  olPlotVue
]

const install = function (Vue, opts = {}) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  version: package_.version,
  install
}
