var fs = require('fs');
var bootstrap = fs.readFileSync(__dirname + '/output.js', 'utf8');
var loaderUtils = require('loader-utils');
var wasmDCE = require('wasm-dce')

module.exports = function(buffer) {

  var params = {};

  if (this.resourceQuery !== "") {
    params = loaderUtils.parseQuery(this.resourceQuery);

    if (params.dce === '1') {

      var usedExports = Object
        .keys(params)
        .filter((flagName) => (
          params[flagName] === true
        ));

      buffer = wasmDCE(buffer, usedExports);
    }
  }

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  function _arrayBufferToBase64(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  var out = `var buffer = "${_arrayBufferToBase64(buffer)}";`;
  out += bootstrap;

  this.callback(null, out);
};

module.exports.raw = true;

