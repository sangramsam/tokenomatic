import * as rlp from 'aion-rlp';
import * as aionWeb3utils from 'aion-web3-utils';
import {Buffer} from 'buffer'
const BN = aionWeb3utils.BN

const AionLong = rlp.AionLong;
const isHex = aionWeb3utils.isHex;
const isHexStrict = aionWeb3utils.isHexStrict;

const isHexPrefixed = function(str) {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
}
const stripHexPrefix = function (str) {
  if (typeof str !== 'string') {
    return str
  }
  return str.slice(0, 2) === '0x' ? str.slice(2) : str
}

const stripZeros = function (a) {
  a = stripHexPrefix(a);
  var first = a[0];
  while (a.length > 0 && first.toString() === '0') {
    a = a.slice(1);
    first = a[0];
  }
  return a;
};

const toAionLong = function (val) {
    var num;

    if (
        val === undefined ||
        val === null ||
        val === '' ||
        val === '0x'
    ) {
      return null;
    }

    if (typeof val === 'string') {
        if (
            val.indexOf('0x') === 0 ||
            val.indexOf('0') === 0 ||
            isHex(val) === true ||
            isHexStrict(val) === true
        ) {
            num = new BN(stripHexPrefix(val), 16);
        } else {
            num = new BN(val, 10);
        }
    }

    if (typeof val === 'number') {
      num = new BN(val);
    }

    return new AionLong(num);
};

// Removes 0x from a given String


function intToHex (i) {
  var hex = i.toString(16)
  if (hex.length % 2) {
    hex = '0' + hex
  }

  return hex
}

function padToEven (a) {
  if (a.length % 2) a = '0' + a
  return a
}

function intToBuffer (i) {
  var hex = intToHex(i)
  return Buffer.from(hex, 'hex')
}

const toBuffer = function(v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
      } else {
        v = Buffer.from(v)
      }
    } else if (AionLong.isAionLong(v)) {
      v = AionLong.aionEncodeLong(v)
    } else if (typeof v === 'number') {
      if (!v) {
        v = Buffer.from([])
      } else {
        v = intToBuffer(v)
      }
    } else if (v === null || v === undefined) {
      v = Buffer.from([])
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray())
    } else {
      throw new Error('invalid type')
    }
  }
  return v
}

export default {
  toBuffer,
  toAionLong,
  stripZeros,
  stripHexPrefix
}

