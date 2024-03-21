
import {Buffer} from 'buffer'
import Neon, {wallet as Wallet, tx as Tx} from '@cityofzion/neon-js';
import AppNeo from '../../neo-helpers/hw-app-neo';

export class LedgerNeoWallet {
	private wallet : any;
  private walletName : string = '';
  private isDecrypted = true
  private account : any;
  public exchange = 'neo';
  private transport : any;
	constructor(options) {
    this.walletName = options.derivationPath
    this.account = new Wallet.Account(options.publicKey)
    this.transport = options.transport
	}
  userAddress() {
    return this.account.address
  }
  getAddress() {
    return this.account.address
  }
  getAccountAddress() {
    return this.account._scriptHash
  }
  getPrivateKey() {
    return null;
  }
  getScriptHash() {
    return this.account.scriptHash
  }
  getAccount() {
    return this.account;
  }
  async signTransaction (tx, publicKey) {
    if (!this.isDecrypted)
      return false
    let p = new AppNeo(this.transport)
    return p.legacySignWithLedger(tx, publicKey);
  }
  async signMessage (msgData) {
    if (!this.isDecrypted)
      return false
  }
  isWalletDecrypted(){
    this.isDecrypted;
  }
  async signTx(tx, publicKey) {
    if (!publicKey)
      publicKey = this.account.publicKey
    let p = new AppNeo(this.transport)
    let txString = await p.legacySignWithLedger(tx, publicKey);
    const txObj = Tx.deserializeTransaction(txString)
    tx.scripts = txObj.scripts
  }
  signingFunction = async (tx, publicKey) => {
    if (!publicKey)
      publicKey = this.account.publicKey
    let p = new AppNeo(this.transport)
    let txString = await p.legacySignWithLedger(tx, publicKey);
    const txObj = Tx.deserializeTransaction(txString)
    if (!tx.scripts)
      tx.scripts = txObj.scripts
    else {
      tx.scripts = tx.scripts.concat(txObj.scripts)
    }
  }
}


