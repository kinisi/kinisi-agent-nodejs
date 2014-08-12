var bleno = require('bleno');

function startAdv() {
    var name = 'name';
    var serviceUuids = ['fffffffffffffffffffffffffffffff0']

    bleno.startAdvertising(name, serviceUuids); //[, callback(error)]);
}

function startiBeacon() {
    //var uuid = 'e2c56db5dffb48d2b060d0f5a71096e1';
    var uuid = 'e2c56db5dffb48d2b0606b696e697369'; // ...kinisi (in lowercase ASCII)
    var major = 0; // 0x0000 - 0xffff
    var minor = 0; // 0x0000 - 0xffff
    var measuredPower = -59; // -128 - 127

    bleno.startAdvertisingIBeacon(uuid, major, minor, measuredPower); //[, callback(error)]);
}

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    //startAdv(); // Do we want to use this for the services? Ideally, we'd like to connect to the iBeacon
    startiBeacon(); // iBeacon request seem to work. Will this allow us to start services?
  } else {
    bleno.stopAdvertising();
  }
});

var Descriptor = bleno.Descriptor;

var descriptor = new Descriptor({
    uuid: '2901',
    value: 'value' // static value, must be of type Buffer or string if set
});

var Characteristic = bleno.Characteristic;

var characteristic = new Characteristic({
    uuid: 'fffffffffffffffffffffffffffffff1', // or 'fff1' for 16-bit
    properties: [ "read" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
    descriptors: [
        // see Descriptor for data type
        descriptor
    ],
    onReadRequest: function(offset, callback) {Characteristic.RESULT_SUCCESS, Buffer('abcdef', 'hex')}, //null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var PrimaryService = bleno.PrimaryService;

var primaryService = new PrimaryService({
    uuid: 'fffffffffffffffffffffffffffffff0', // or 'fff0' for 16-bit
    characteristics: [
        characteristic
        // see Characteristic for data type
    ]
});

var services = [primaryService];

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  
  if (!error) {
    console.log('setting services');
    bleno.setServices(services);
//    bleno.setServices([
//      deviceInformationService,
//      blink1Service
//    ]);
  }
});
