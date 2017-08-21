import './scss/index.scss'
import PlotDraw from './core/PlotDraw'
import PlotEdit from './core/PlotEdit'
import PlotTypes from './Utils/PlotTypes'
class olPlot {
  constructor (map) {
    this.plotDraw = new PlotDraw(map)
    this.plotEdit = new PlotEdit(map)
  }
  static PlotTypes = PlotTypes
}

export default olPlot
