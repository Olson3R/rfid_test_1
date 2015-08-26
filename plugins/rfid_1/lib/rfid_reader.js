var wpi = require('wiring-pi')
var NanoTimer = require('nanotimer')
var _ = require('underscore')

var readers = []

var RfidReader = function(options) {
  console.log("RfidReader: Starting...")
  var mode = options.MODE || 'wpi'
  wpi.setup(mode)
  _.each(options.READERS, function(value, key) { setupReader(key, value) })
  console.log("RfidReader: Started")
}

function setupReader(name, config) {
  var reader = {
    name: name,
    config: config,
    timer: new NanoTimer()
  }
  resetData(reader)
  readers.push(reader)
  setupDataPin(config.DATA_0_PIN, 0, reader)
  setupDataPin(config.DATA_1_PIN, 1, reader)
  console.log("Setup reader: ", name, config)
}

function setupDataPin(pin, value, reader) {
  wpi.pinMode(pin, wpi.INPUT)
  wpi.pullUpDnControl(pin, wpi.PUD_UP)
  wpi.wiringPiISR(pin, wpi.INT_EDGE_FALLING, function() {
    reader.data[reader.index] = value
    reader.index += 1
    reader.timer.clearTimeout()
    reader.timer.setTimeout(check, [reader], '50m')
  })
}

function check(reader) {
  var data = reader.data
  var index = reader.index
  resetData(reader)

  var valid = true
  var facility = null
  var card = null
  if (index != 26) {
    valid = false // incorrect size for expected 26bit format
  } else {
    facility = parseInt(data.slice(1, 9).join(''), 2)
    card = parseInt(data.slice(9, 25).join(''), 2)
    if (data[0] != (facility % 2)) valid = false // bad facility parity
    else if (data[25] != (card % 2)) valid = false // bad card parity
  }
  console.log("DATA", reader.name, valid, data, facility, card)
}

function resetData(reader) {
  reader.index = 0
  reader.data = new Array(26)
}

module.exports = RfidReader
