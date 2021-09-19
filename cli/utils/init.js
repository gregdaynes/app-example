const welcome = require('cli-welcome')
const pkg = require('./../package.json')
const unhandled = require('cli-handle-unhandled')

module.exports = ({ clear = true }) => {
  unhandled()
  welcome({
    title: 'app-example-cli',
    tagLine: 'by Gregory Daynes',
    description: pkg.description,
    version: pkg.version,
    bgColor: '#36BB09',
    color: '#000000',
    bold: true,
    clear,
  })
}
