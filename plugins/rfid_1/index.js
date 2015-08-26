var RfidReader = require('./lib/rfid_reader')

var register = function(server, options, next) {
  rfidReader = new RfidReader(options)
  server.expose('rfidReader', rfidReader)

  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
