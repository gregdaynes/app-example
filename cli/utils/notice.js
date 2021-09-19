const alert = require('cli-alerts')
const { green: g, red: r, yellow: y } = require('chalk')

exports.success = (name, msg) => {
  alert({
    type: 'success',
    name: `${g(name)}`,
    msg,
  })
}

exports.error = (name, msg) => {
  alert({
    type: 'error',
    name: `${r(name)}`,
    msg,
  })
}

exports.warn = (name, msg) => {
  alert({
    type: 'info',
    name: `${y(name)}`,
    msg,
  })
}
