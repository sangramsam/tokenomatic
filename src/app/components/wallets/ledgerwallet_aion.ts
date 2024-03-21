
import Transaction from '../../aion-helpers/aion-tx'
// const TransportNodeHid = window.require('@ledgerhq/hw-transport-node-hid').default;
import AppAion from '../../aion-helpers/hw-app-aion/Aion'
import * as ethUtil from 'ethereumjs-util'
import {Buffer} from 'buffer'
import { Constants } from '../../models/constants';
declare var window: any;


function makeError(msg) {
  const err = new Error(msg)
  return err
}
export class LedgerAionWallet {
  private derivationPath : any;
  private networkId : number;
  private transport : any;
  public walletName : string = ''
  public address : any;
  private publicKey : any;
  public isDecrypted = true
  public exchange  = 'aion';
  constructor(options) {
    this._formatAddress = this._formatAddress.bind(this)
    this.userAddress = this.userAddress.bind(this)
    this.signTransaction = this.signTransaction.bind(this)
    this.signMessage = this.signMessage.bind(this)

    this.derivationPath = options.derivationPath
    this.walletName = options.derivationPath
    this.transport = options.transport
    this.address = options.address || ''
    this.publicKey = options.publicKey || ''
    this.networkId = parseInt(Constants.AllowedNetwork)
  }
  _formatAddress() {
    if (!this.address)
      return ''
    return ethUtil.addHexPrefix(this.address)
  }
  userAddress() {
    return this._formatAddress()
  }
  getAddress() {
    return this._formatAddress()
  }
  getAccounts() {
    return Promise.resolve([this.userAddress()])
  }
  async signTransaction (txParams) {
    let address = this.address;
    const derivationPath = this.derivationPath;
    const transport = this.transport
    if (address !== txParams.from || !derivationPath) {
      throw new Error(`address unknown '${txParams.from}'`);
    }
    try {
      
      const aion = new AppAion(transport)
      const tx = new Transaction(txParams)
      tx['from'] = this.address
      tx['publicKey'] = this.publicKey

      const signature = await aion.signTransaction(
        derivationPath,
        tx.serialize()
      )
      tx.publicSignature = signature
      if (tx.verifySignature() === false) {
        throw makeError(
          `Invalid signature returned.`
        )
      }
      return `0x${tx.getSignedTx().toString('hex')}`
    } catch(err) {
      throw new Error(err.message)
    }
  }
  async signMessage (msgData) {
    // const address = this.address
    // const derivationPath = this.derivationPath
    // const transport = this.transport
    // if (address !== msgData.from || !derivationPath)
    //   throw new Error(`address unknown '${msgData.from}'`)
    // let data = ethUtil.stripHexPrefix(msgData.data)
    // try {
    //   const eth = new AppEth(transport)
    //   const result = await eth.signPersonalMessage(
    //     derivationPath,
    //     data
    //   )
    //   const v = result.v.toString(16)
    //   return `0x${result.r}${result.s}${v}`
    // } catch(err) {
    //   throw new Error(err)
    // }
    throw new Error('Aion Ledger does not support sign message.')
  }
  getHashForMessage(hash) {
    let h = ethUtil.addHexPrefix(hash)
    let hashBuff = ethUtil.toBuffer(h)
    let personalMsgBuff =  ethUtil.hashPersonalMessage(hashBuff);
    return ethUtil.addHexPrefix(personalMsgBuff.toString('hex'))
  }
}