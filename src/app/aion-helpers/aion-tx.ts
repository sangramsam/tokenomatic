
import * as aionLib from 'aion-lib';
import * as rlp from 'aion-rlp';
import * as aionWeb3utils from 'aion-web3-utils';
import aionUtils from './aion-utils'
import {Buffer} from 'buffer'

const BN = aionWeb3utils.BN
const blake2b256 = aionLib.crypto.blake2b256;
const nacl = aionLib.crypto.nacl;
const AionLong = rlp.AionLong;
const isHex = aionWeb3utils.isHex;
const isHexStrict = aionWeb3utils.isHexStrict;
const removeLeadingZeroX = aionLib.formats.removeLeadingZeroX;



const defineProperties = function (self, fields, data) {
  self.raw = [];
  self._fields = [];

  self.serialize = function serialize(includeSignature) {
  	if (includeSignature && self.signature.length == 0)
  		throw new Error('Signature not set')

    if (!includeSignature)
  		return rlp.encode(self.raw.slice(0, 8))
  	if (includeSignature) {
      // Include the public key too
      let raw = self.raw.slice(0, 8)
      raw.push(self._senderPubKey)
      raw.push(self.signature)
      return rlp.encode(raw);
    }

  };

  fields.forEach(function (field, i) {
    self._fields.push(field.name);
    function getter() {
      return self.raw[i];
    }
    function setter(v) {
    	if (field.type == 'long')
    		v = aionUtils.toAionLong(v)
      v = aionUtils.toBuffer(v);

      if (v.toString('hex') === '00' && !field.allowZero) {
        v = Buffer.allocUnsafe(0);
      }

      // if (field.allowLess && field.length) {
      //   v = aionUtils.stripZeros(v);
      //   assert(field.length >= v.length, 'The field ' + field.name + ' must not have more ' + field.length + ' bytes');
      // } else if (!(field.allowZero && v.length === 0) && field.length) {
      //   assert(field.length === v.length, 'The field ' + field.name + ' must have byte length of ' + field.length);
      // }
      self.raw[i] = v;
    }

    Object.defineProperty(self, field.name, {
      enumerable: true,
      configurable: true,
      get: getter,
      set: setter
    });

    if (field.default) {
      self[field.name] = field.default;
    }

    // attach alias
    if (field.alias) {
      Object.defineProperty(self, field.alias, {
        enumerable: false,
        configurable: true,
        set: setter,
        get: getter
      });
    }
  });

  // if the constuctor is passed data
  if (data) {
    if (typeof data === 'string') {
      data = Buffer.from(aionUtils.stripHexPrefix(data), 'hex');
    }

    if (Buffer.isBuffer(data)) {
      data = rlp.decode(data);
    }

    if (Array.isArray(data)) {
      if (data.length > self._fields.length) {
        throw new Error('wrong number of fields in data');
      }

      // make sure all the items are buffers
      data.forEach(function (d, i) {
        self[self._fields[i]] = aionUtils.toBuffer(d);
      });
    } else if (typeof data === 'object') {
      var keys = Object.keys(data);
      fields.forEach(function (field) {
        if (keys.indexOf(field.name) !== -1) self[field.name] = data[field.name];
        if (keys.indexOf(field.alias) !== -1) self[field.alias] = data[field.alias];
      });
      if (data.publicKey) {
      	self['publicKey'] = data.publicKey
      }
      if (data.from) {
      	self['from'] = data.from
      }
    } else {
      throw new Error('invalid data');
    }
  }
}
function Transaction (data){
	let self = this
  function constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'nonce',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'to',
      allowZero: true,
      length: 32,
      default: new Buffer([])
    }, {
      name: 'value',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'data',
      alias: 'input',
      allowZero: true,
      default: new Buffer([])
    }, {
      name: 'timestamp',
      default: new Buffer([])
    }, {
      name: 'gasPrice',
      type : 'long',
      allowLess: true,
      default: 10000000000
    }, {
      name: 'gasLimit',
      alias: 'gas',
      type : 'long',
      allowLess: true,
      default: 4000000
    },{
      name: 'type',
      type : 'long',
      default: 1
    },{
      name: 'publicSignature',
      alias: 'signature',
      default: new Buffer([])
    }]

    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(self, 'from', {
      enumerable: true,
      configurable: true,
      get: () => {
      	return self._from;
      },
      set : (from) => {
      	self._from = aionUtils.toBuffer(from)
      }
    })
    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(self, 'publicKey', {
      enumerable: true,
      configurable: true,
      get: () => {
      	return self._senderPubKey;
      },
      set : (publicKey) => {
      	self._senderPubKey = aionUtils.toBuffer(publicKey)
      }
    })
    /**
     * Returns the rlp encoding of the transaction
     * @method serialize
     * @return {Buffer}
     * @memberof Transaction
     * @name serialize
     */
    // attached serialize
    defineProperties(self, fields, data)

    
  }

  this.hash = function() {
  	let rlpEncoded = this.serialize()
    return blake2b256(rlpEncoded)
  }


  /**
   * Determines if the signature is valid
   * @return {Boolean}
   */
  this.verifySignature = function() {
  	let hash = this.hash()
  	let publicKey = this._senderPubKey
  	let signature = this.publicSignature
    return nacl.sign.detached.verify(hash, signature, publicKey) === true
  }
  this.getSignedTx = function() {
    return this.serialize(true)
  }
  constructor(data)
}

export default Transaction;


