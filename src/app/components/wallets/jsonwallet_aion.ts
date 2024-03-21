import * as importers from 'ethereumjs-wallet-browser/thirdparty'
import * as Wallet from 'ethereumjs-wallet-browser'
import {Web3Service} from '../../services/web3.service'
import {AionWeb3Service} from '../../services/aion-web3.service';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { E } from '@angular/core/src/render3';
declare var require: any;
declare var Buffer: any;
declare var window: any;


var cryptobrowserify = require('crypto-browserify');
var nacl=require('tweetnacl');
var blake2b = require('blakejs');
var blake2bHex = blake2b.blake2bHex;
var blake2B = blake2b.blake2b;
const RLP = require('./RLP.js');
var globalFuncs = require('./globalFuncs.js');
var ethUtil = require('ethereumjs-util');
ethUtil.crypto= require('crypto');
ethUtil.scrypt= require('scrypt.js');
var toBuffer = require('typedarray-to-buffer');

var publickey
var privatekey
export class JSONAionWallet {

	private wallet : any;
  private address : string = '';
  private walletName : string = '';
  private isDecrypted : boolean = false
  private key : string = ''
  private account : any;
  public exchange : 'aion';
  private walletV3 : any;
  private privatekey:any;
  private web3 : any;
  private aionWeb3 : any;
	constructor(walletV3, AionWeb3Service) {
    // this.web3 = Web3Service;
    this.aionWeb3 = AionWeb3Service;
   // console.log("walletV3",walletV3)
    this.walletName = walletV3.walletName
    this.wallet = walletV3
    this.address = walletV3.address
    this.privatekey = this.getPrivateKeyHex();
    this.exchange = walletV3.exchange
    //this.a.privateKey=this.getPrivateKeyHex();
	}
  decrypt(password) {
    let aionWalletHelper = new AionWalletHelper(this.aionWeb3)
    this.privatekey =  aionWalletHelper.decrypted(this.wallet.wallet.data || this.wallet.wallet, password, true)
    if (this.privatekey)
      this.isDecrypted = true
  }
  userAddress() {
    return publickey
  }
  getAddress() {
    return  this.address
  }
  getAccountAddress() {
    return this.account._scriptHash
  }
  getPrivateKeyHex() {
    //console.log("getprivatekey is called",privatekey);
    return privatekey;
  }
  getKey() {
    return this.key
  }
  getWIF() {
    return this.account.WIF
  }
  signEthTx(ethTx, fromAddress) {
  }

  async signTransaction (txParams) {
    if (!this.isDecrypted)
      return false
  }
  async signMessage (msgData) {
    if (!this.isDecrypted)
      return false
  }
  isWalletDecrypted(){
    this.isDecrypted;
  }
}

export class AionWalletHelper {
  constructor(private aionweb3sevice:AionWeb3Service) {
  }
  public publicbufferkey;
  public privatebufferkey;
  public encfile:any;
  public key:any;
  public privatekey;
  public address;

  encode1(password,privatekey){

    var salt=cryptobrowserify.randomBytes(32);
       console.log(salt);
        //var n = 262144;
        var n = 8192;
        var p = 1;
        var r = 8;
        var dklen = 32;
       console.log(r+" "+p);
    
        var kdfparams=[];
        kdfparams[0] = "";
        kdfparams[1] = dklen;
        kdfparams[2] = n;
        kdfparams[3] = p;
        kdfparams[4] = r;
        kdfparams[5] = salt.toString('hex');
        var Kdfparams = RLP.encode(kdfparams);
    
        var tempParams = cryptobrowserify.randomBytes(16);
        var cipherparams=[];
        cipherparams[0] = tempParams.toString('hex');
        var Cipherparams = RLP.encode(cipherparams);
        var derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer (salt,'hex'), n, r, p, dklen);
        console.log(derivedKey);
        var cipher = cryptobrowserify.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), tempParams);
        console.log(cipher);
        var ciphertext = Buffer.concat([cipher.update(this.privatebufferkey), cipher.final()]);
        var mac = blake2bHex(Buffer.concat([new Buffer(derivedKey.slice(16,32)),ciphertext]),'',32);
        var crypto=[];
        crypto[0] = 'aes-128-ctr'; // cypher
        crypto[1] = ciphertext.toString('hex');
        crypto[2] = "scrypt"; 
        crypto[3] = mac;
        crypto[4] = Cipherparams;
        crypto[5] = Kdfparams;
        var Crypto = RLP.encode(crypto);
        var keystore = [];
        keystore[0] = cryptobrowserify.randomBytes(16).toString('hex');
        keystore[1] = 3;
        keystore[2] = Buffer(this.publicbufferkey, 'hex').toString('hex');
        keystore[3] = Crypto;
        console.log(keystore);
        var Keystore = RLP.encode(keystore);
       // console.log("keystore[2]",keystore[2]);
        console.log( Keystore);
        return Keystore;
  }
  password(password,publickey,privatekey){
    console.log("password",privatekey)
    this.privatebufferkey=privatekey
    this.publicbufferkey=publickey
    var encoded= this.encode1(password,privatekey);
    return encoded
 }
  
  public DEFAULT_WALLET = {
    version: '1.0',
    scrypt: {
      cost: 16384,
      blockSize: 8,
      parallel: 8,
      size: 64
    },
    wallet : null,
    extra: null
  };
  generateWallet() {
    
    // var keys = nacl.sign.keyPair();
    // this.publicbufferkey=keys.publicKey;
    // this.privatebufferkey=keys.secretKey;
    // this.privatekey='0x' + new Buffer(keys.secretKey, 'hex').toString('hex');
    // console.log(this.privatekey)
    // var Pub =Buffer.from(keys.publicKey,'hex');
    // var buf = new Buffer (['0xA0']);
    // var a = Buffer.concat([buf,new Buffer(blake2B(keys.publicKey,'',32).slice(1,32))]);
    // var address='0x' + new Buffer(a,'hex').toString('hex');
    // publickey =address;
    // privatekey=this.privatekey
    // return [keys.publicKey,keys.secretKey,address];
   
       let web3=this.aionweb3sevice.web3;
       let account;
       try{
        account=web3.eth.accounts.create()
        // console.log("@@@",account);
        privatekey=account.privateKey;
        console.log(privatekey)
        
       }catch(e) {
        console.log(e);
        this.generateWallet()
       }
       return privatekey;
  }
  createWalletWithJSON(JSONdata, password) {
       
  }

  createWalletWithPrivate(privateKey) {
    if (!Wallet.isWIF(privateKey) && !Wallet.isPrivateKey(privateKey)) {
      return {error : 'Invalid Private Key', wallet : null}
    }
    const account = new Wallet.Account(privateKey);
    return {error : null, wallet : account}
  }
  getKeyForAccount(account, password) {
    return Wallet.encrypt(account.WIF, password)
  }
  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  
 toHexString(byteArray) {
    return Array.from(byteArray, function (byte:any) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  
 
   getDecode(input,password,nonStrict){
     console.log("password",password)
     sessionStorage.setItem('exchange111',password)
     console.log("nonStrict",nonStrict)
     console.log("input",input);
     console.log(input.wallet)
     console.log(typeof(input.wallet));
     if(input.wallet.data !=null && input.wallet.data !=undefined){
       console.log("decode if")
      var array = new Uint8Array(input.wallet.data);
      var a =toBuffer(array);
     }
     else{
      console.log("decode if else")
       var a =input.wallet
     }
     
     
    var KeystoreItem = RLP.decode(a);
     console.log(KeystoreItem)
    if (KeystoreItem.length == 4) {
      console.log("enter 1")
        var Crypto = RLP.decode(KeystoreItem[3]);
        var CipherParams = RLP.decode(Crypto[4]);
        var KdfParams = RLP.decode(Crypto[5]);
        console.log("enter 2")
        var Keystore = {};
        Keystore['id'] = this.ab2str(KeystoreItem[0]); //0
        Keystore['version'] = this.toHexString(KeystoreItem[1]); //1
        Keystore['address'] = this.ab2str(KeystoreItem[2]); //2

        Keystore['crypto'] = {}; //3
        Keystore['crypto']['cipher'] = this.ab2str(Crypto[0]); //4
        Keystore['crypto']['cipherText'] = this.ab2str(Crypto[1]); //5
        Keystore['crypto']['kdf'] = this.ab2str(Crypto[2]); //6
        Keystore['crypto']['mac'] = this.ab2str(Crypto[3]); //7

        Keystore['crypto']['cipherParams'] = {}; //8
        Keystore['crypto']['cipherParams']['iv'] = this.ab2str(CipherParams[0]); //10

        Keystore['crypto']['kdfParams'] = {};
        Keystore['crypto']['kdfParams']['c'] = this.toHexString(KdfParams[0]); //11
        Keystore['crypto']['kdfParams']['dklen'] = this.toHexString(KdfParams[1]); //12
        Keystore['crypto']['kdfParams']['n'] = this.toHexString(KdfParams[2]); //13
        Keystore['crypto']['kdfParams']['p'] = this.toHexString(KdfParams[3]); //14
        Keystore['crypto']['kdfParams']['r'] = this.toHexString(KdfParams[4]); //15
        Keystore['crypto']['kdfParams']['salt'] = this.ab2str(KdfParams[5]); //16
        console.log("enter 3")
        var derivedKey;
        if (Keystore['crypto']['kdf'] === 'scrypt') {
          console.log("enter 4")
            derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(Keystore['crypto']['kdfParams']['salt'], 'hex'), parseInt(Keystore['crypto']['kdfParams']['n'], 16), parseInt(Keystore['crypto']['kdfParams']['r'], 16), parseInt(Keystore['crypto']['kdfParams']['p'], 16), parseInt(Keystore['crypto']['kdfParams']['dklen'], 16));
        } else {
          console.log("enter 4.1")
            throw new Error('Unsupported key derivation scheme');
        }

        var ciphertext = new Buffer(Keystore['crypto']['cipherText'], 'hex');
        console.log("enter 5")
        var part = derivedKey.slice(16, 32);
        console.log("enter 6")
        var actual = blake2bHex(Buffer.concat([new Buffer(part), new Buffer(ciphertext)]), '', 32);
        console.log("enter 7")
        console.log("actual.toString('hex')",actual.toString('hex'))
        console.log("Keystore['crypto']['mac'].toString('hex')",Keystore['crypto']['mac'].toString('hex'))
        if (actual.toString('hex') != Keystore['crypto']['mac'].toString('hex')) {
            //$scope.kernelKeystore = false;
            console.log("enter 8")
            return false;
            //throw new Error("Invalid Password!");
        }
        console.log("enter 9")
        var decipher = cryptobrowserify.createDecipheriv(Keystore['crypto']['cipher'], derivedKey.slice(0, 16), new Buffer(Keystore['crypto']['cipherParams']['iv'], 'hex'));
        console.log(decipher);


        var seed = this.decipherBuffer(decipher, ciphertext);
        var final:any ='0x' +new Buffer(seed, 'hex').toString('hex');
        //console.log('0x' +new Buffer(seed, 'hex').toString('hex'));
        privatekey=final;
        this.privatekey=privatekey;
        console.log("Final",final,Keystore['address'])
        return true
    } else {

        var keyStoreContents = RLP.decode(input);
        var keyStoreContent = [];
        for (var i = 0; i < keyStoreContents.length; i++) {
            keyStoreContent[i] = keyStoreContents[i].toString();
        }

        var derivedKey;
        if (keyStoreContent[5] === 'scrypt') {

            derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(keyStoreContent[7], 'hex'), parseInt(keyStoreContent[8]), parseInt(keyStoreContent[9]), parseInt(keyStoreContent[10]), parseInt(keyStoreContent[6]));
        } else {
            return false
           // throw new Error('Unsupported key derivation scheme');
        }
        var ciphertext = new Buffer(keyStoreContent[2], 'hex');

        var mac = blake2bHex(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex')]));
        if (mac.toString('hex') !== keyStoreContent[11]) {
            throw new Error('Key derivation failed - possibly wrong passphrase');
        }
        var decipher = cryptobrowserify.createDecipheriv(keyStoreContent[4], derivedKey.slice(0, 16), new Buffer(keyStoreContent[3], 'hex'));
        var seed = this.decipherBuffer(decipher, ciphertext);
        var a: any='0x'+seed
        while (seed.length < 32) {
            var nullBuff = new Buffer([0x00]);
            a = Buffer.concat([nullBuff, seed]);
        }

       return true;
    }
   }
   
   decipherBuffer = function(decipher, data) {
    return Buffer.concat([decipher.update(data), decipher.final()])
  } 
  decrypted(input,password,nonStrict){
    console.log("input",input);   
   var KeystoreItem = RLP.decode(input);
    console.log(KeystoreItem)
   if (KeystoreItem.length == 4) {
       var Crypto = RLP.decode(KeystoreItem[3]);
       var CipherParams = RLP.decode(Crypto[4]);
       var KdfParams = RLP.decode(Crypto[5]);

       var Keystore = {};
       Keystore['id'] = this.ab2str(KeystoreItem[0]); //0
       Keystore['version'] = this.toHexString(KeystoreItem[1]); //1
       Keystore['address'] = this.ab2str(KeystoreItem[2]); //2

       Keystore['crypto'] = {}; //3
       Keystore['crypto']['cipher'] = this.ab2str(Crypto[0]); //4
       Keystore['crypto']['cipherText'] = this.ab2str(Crypto[1]); //5
       Keystore['crypto']['kdf'] = this.ab2str(Crypto[2]); //6
       Keystore['crypto']['mac'] = this.ab2str(Crypto[3]); //7

       Keystore['crypto']['cipherParams'] = {}; //8
       Keystore['crypto']['cipherParams']['iv'] = this.ab2str(CipherParams[0]); //10

       Keystore['crypto']['kdfParams'] = {};
       Keystore['crypto']['kdfParams']['c'] = this.toHexString(KdfParams[0]); //11
       Keystore['crypto']['kdfParams']['dklen'] = this.toHexString(KdfParams[1]); //12
       Keystore['crypto']['kdfParams']['n'] = this.toHexString(KdfParams[2]); //13
       Keystore['crypto']['kdfParams']['p'] = this.toHexString(KdfParams[3]); //14
       Keystore['crypto']['kdfParams']['r'] = this.toHexString(KdfParams[4]); //15
       Keystore['crypto']['kdfParams']['salt'] = this.ab2str(KdfParams[5]); //16

       var derivedKey;
       if (Keystore['crypto']['kdf'] === 'scrypt') {
           derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(Keystore['crypto']['kdfParams']['salt'], 'hex'), parseInt(Keystore['crypto']['kdfParams']['n'], 16), parseInt(Keystore['crypto']['kdfParams']['r'], 16), parseInt(Keystore['crypto']['kdfParams']['p'], 16), parseInt(Keystore['crypto']['kdfParams']['dklen'], 16));
       } else {
           throw new Error('Unsupported key derivation scheme');
       }

       var ciphertext = new Buffer(Keystore['crypto']['cipherText'], 'hex');

       var part = derivedKey.slice(16, 32);
       var actual = blake2bHex(Buffer.concat([new Buffer(part), new Buffer(ciphertext)]), '', 32);

       if (actual.toString('hex') != Keystore['crypto']['mac'].toString('hex')) {
           //$scope.kernelKeystore = false;
           // return false;
           throw new Error("Invalid Password!");
       }

       var decipher = cryptobrowserify.createDecipheriv(Keystore['crypto']['cipher'], derivedKey.slice(0, 16), new Buffer(Keystore['crypto']['cipherParams']['iv'], 'hex'));
       console.log(decipher);
       var seed = this.decipherBuffer(decipher, ciphertext);
       var final:any ='0x' +new Buffer(seed, 'hex').toString('hex');
       //console.log('0x' +new Buffer(seed, 'hex').toString('hex'));
       privatekey=final;
       console.log("Final",final,Keystore['address'])
       return privatekey
   } else {

       var keyStoreContents = RLP.decode(input);
       var keyStoreContent = [];
       for (var i = 0; i < keyStoreContents.length; i++) {
           keyStoreContent[i] = keyStoreContents[i].toString();
       }

       var derivedKey;
       if (keyStoreContent[5] === 'scrypt') {

           derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(keyStoreContent[7], 'hex'), parseInt(keyStoreContent[8]), parseInt(keyStoreContent[9]), parseInt(keyStoreContent[10]), parseInt(keyStoreContent[6]));
       } else {
           return false
          // throw new Error('Unsupported key derivation scheme');
       }
       var ciphertext = new Buffer(keyStoreContent[2], 'hex');

       var mac = blake2bHex(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex')]));
       if (mac.toString('hex') !== keyStoreContent[11]) {
           throw new Error('Key derivation failed - possibly wrong passphrase');
       }
       var decipher = cryptobrowserify.createDecipheriv(keyStoreContent[4], derivedKey.slice(0, 16), new Buffer(keyStoreContent[3], 'hex'));
       var seed = this.decipherBuffer(decipher, ciphertext);
       var a: any='0x'+seed
       while (seed.length < 32) {
           var nullBuff = new Buffer([0x00]);
           a = Buffer.concat([nullBuff, seed]);
       }
      this.privatekey=privatekey;
      return privatekey;
   }
  }  

  getPrivateKeyHex() {
    //console.log("getprivatekey is called",privatekey);
    return this.privatekey;
  }
}

