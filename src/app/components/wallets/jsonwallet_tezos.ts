declare var eztz: any;
import '../../../assets/eztz.min.js';

import * as CryptoJS from '../../../assets/CryptoJS.min.js';

export class JSONTezosWallet {
  private wallet : any;
  private address : string = '';
  private walletName : string = '';
  private isDecrypted : boolean = false
  private key : string = ''
  private account : any;
  public exchange : 'tezos';
  public signingFunction = null;
  constructor(wallet) {
    this.walletName = wallet.walletName
    this.wallet = wallet
    this.address = wallet.address
    this.key = wallet.key
    this.exchange = wallet.exchange
  }

  decrypt(password) {
    try {
      var decrypted = CryptoJS.AES.decrypt(this.key, password);
      var privateKey = decrypted.toString(CryptoJS.enc.Utf8);
      var { error, account } = (new TezosWalletHelper()).createWalletWithPrivate(privateKey);
      if (error === null) {
        this.account = account;
      } else {
        return false;
      }
    }
    catch (err) {
      console.log('err', err);
      return false
    }
    this.isDecrypted = true;
    return true
  }

  userAddress() {
    return this.address
  }
  getAddress() {
    return this.address
  }
  getAccountAddress() {
    return this.account.pkh
  }
  getAccount() {
    return this.account;
  }
  getPrivateKeyHex() {
    if (!this.isDecrypted)
      return ''
    let privateKey = this.account.sk;
    return privateKey;

  }
  getPrivateKey() {
    if (!this.isDecrypted)
      return ''
    let privateKey = this.account.sk;
    return privateKey;
  }
  getKey() {
    return this.key
  }
  signTx(tx:any, publicKey : string) {
    return Promise.resolve(tx.sign(this.account.privateKey))
  }


  isWalletDecrypted(){
    this.isDecrypted;
  }
}

export class TezosWalletHelper {
  // public DEFAULT_WALLET = {
  //   version: '1.0',
  //   scrypt: {
  //     cost: 16384,
  //     blockSize: 8,
  //     parallel: 8,
  //     size: 64
  //   },
  //   wallet : null,
  //   extra: null
  // };

  generateWallet() {
    let tezosKeys = eztz.crypto.generateKeys(eztz.crypto.generateMnemonic());
    return tezosKeys;
  }

  createWalletWithJSON(JSONdata, password) {
    let walletObj = JSON.parse(JSONdata);
    if (walletObj.key === undefined) {
      return {error: 'Invalid JSON File', wallet: null};
    }
    var decrypted = CryptoJS.AES.decrypt(walletObj.key, password);
    var privateKey = decrypted.toString(CryptoJS.enc.Utf8);
    if (privateKey === '') {
      return {error: 'Please Verify Password', wallet: null};
    }
    var { error, account } = this.createWalletWithPrivate(privateKey);
    if (error === null) {
      return {error: null, wallet: account};
    } else {
      return {error, wallet: account};
    }
  }

  createWalletWithPrivate(privateKey) {
    var error, account;
    account = eztz.crypto.extractKeys(privateKey);
    if (!account) {
      account = null; error = 'Invalid Private Key';
    } else {
      error = null;
    }
    return { error, account }
  }

  getKeyForAccount(privateKey, password) {
    var encrypted = CryptoJS.AES.encrypt(privateKey, password);
    return encrypted.toString();
  }
}