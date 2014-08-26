var bleno = require('bleno');
var config = require("config");
var db = require("./db");

function countData(callback) {
    db.readkeys({
        "limit": 10000
    }, function(err, records) {
        callback(records.length);
    });
}

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

var descriptor_0000 = new Descriptor({
    uuid: '2901',
    value: 'Device ID' // static value, must be of type Buffer or string if set
});

var descriptor_0001 = new Descriptor({
    uuid: '2901',
    value: 'Device WLAN MAC' // static value, must be of type Buffer or string if set
});

var Characteristic = bleno.Characteristic;

var characteristic_0000 = new Characteristic({
    uuid: '0000', // or 'fff1' for 16-bit
    properties: [ "read" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
//    descriptors: [
//        // see Descriptor for data type
//        descriptor_0000
//    ],
    onReadRequest: function(offset, callback) {
        //Characteristic.RESULT_SUCCESS, Buffer('abcdef', 'hex')
	  var result = this.RESULT_SUCCESS;
	  var data = new Buffer(config.device.id);

	  if (offset > data.length) {
	    result = this.RESULT_INVALID_OFFSET;
	    data = null;
	  }

	  callback(result, data);
    }, //null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var characteristic_0001 = new Characteristic({
    uuid: '0001', // or 'fff1' for 16-bit
    properties: [ "read" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
//    descriptors: [
//        // see Descriptor for data type
//        descriptor_0001
//    ],
    onReadRequest: function(offset, callback) {
        //Characteristic.RESULT_SUCCESS, Buffer('abcdef', 'hex')
	  var result = this.RESULT_SUCCESS;
          var data;
          try {
             // data = new Buffer("00:00:00:00:00:00");
	      data = new Buffer(config.device.macs.wlan0);
          } catch (e) {
              data = new Buffer("00:00:00:00:00:00");
          }
          //var data = new Buffer('TESTBUF');

	  if (offset > data.length) {
	    result = this.RESULT_INVALID_OFFSET;
	    data = null;
	  }

	  callback(result, data);
    }, //null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var characteristic_0002 = new Characteristic({
    uuid: '0002', // or 'fff1' for 16-bit
    properties: [ "read" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
//    descriptors: [
//        // see Descriptor for data type
//        descriptor_0001
//    ],
    onReadRequest: function(offset, callback) {
        //Characteristic.RESULT_SUCCESS, Buffer('abcdef', 'hex')
	  var result = this.RESULT_SUCCESS;
          var data;
          try {
             // data = new Buffer("00:00:00:00:00:00");
	      data = new Buffer(config.device.macs.eth0);
          } catch (e) {
              data = new Buffer("00:00:00:00:00:00");
          }
          //var data = new Buffer('TESTBUF');

	  if (offset > data.length) {
	    result = this.RESULT_INVALID_OFFSET;
	    data = null;
	  }

	  callback(result, data);
    }, //null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var characteristic_0003 = new Characteristic({
    uuid: '0003', // or 'fff1' for 16-bit
    properties: [ "read" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
//    descriptors: [
//        // see Descriptor for data type
//        descriptor_0001
//    ],
    onReadRequest: function(offset, callback) {

        var suc = this.RESULT_SUCCESS;
        var fai = this.RESULT_INVALID_OFFSET;

        countData( function(len) {
          console.log('length = ', len)
        //Characteristic.RESULT_SUCCESS, Buffer('abcdef', 'hex')
          try {
	  var result = suc;
          var data = new Buffer(String(len));

	  if (offset > data.length) {
	    result = fai;
	    data = null;
	  }

          console.log(offset, data.length, result, data);
	  callback(result, data);
          } catch (ex)
          {
             console.log('Exception', ex.stack, ex);
             callback(fai, null);
          }
       });
    }, //null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var writeData = [];

var characteristic_0004 = new Characteristic({
    uuid: '0004', // or 'fff1' for 16-bit
    properties: [ "write", "writeWithoutResponse" ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
//    value: null, // optional static value, must be of type Buffer
//    descriptors: [
//        // see Descriptor for data type
//        descriptor_0001
//    ],
    onReadRequest: null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: function(data, offset, withoutResponse, callback) {

       // EOM
       if (data.length == 4 && data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0) {

         data = Buffer.concat(writeData);

	 // data is a Buffer
	 var nullIndex = null;
	 for (var i = 0 ; i <= data.length ; i++) {
	    if (data[i] == 0) {
	       nullIndex = i;
	    }
	 }
	 var ssid = data.toString('utf8', 0, nullIndex);
	 var pwd = data.toString('utf8', nullIndex+1);
	 console.log(ssid, pwd, offset, withoutResponse);

         writeData = [];

       } else {
         writeData.push(data);
       }

       callback(0);
    },
    //null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify unsubscribe handler, function() { ...}
    onNotify: null // optional notify sent handler, function() { ...}
});

var PrimaryService = bleno.PrimaryService;

var primaryService = new PrimaryService({
    uuid: 'fffffffffffffffffffffffffffffff0', // or 'fff0' for 16-bit
    characteristics: [
        characteristic_0000,
        characteristic_0001,
        characteristic_0002,
        characteristic_0003,
        characteristic_0004
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
