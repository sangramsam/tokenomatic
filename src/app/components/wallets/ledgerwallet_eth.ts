// import * as Transaction from 'ethereumjs-tx'
// import * as ethSigUtil from 'eth-sig-util'
// const TransportNodeHid = window.require('@ledgerhq/hw-transport-node-hid').default;
// import AppEth from '@ledgerhq/hw-app-eth/lib/Eth'
// import * as ethUtil from 'ethereumjs-util'
// import {Buffer} from 'buffer'
// import { Constants } from '../../models/constants';
// declare var window: any;

// function makeError(msg, id) {
//   const err = new Error(msg)
//   return err
// }
// export class LedgerEthWallet {
//   private derivationPath : any;
//   private networkId : number;
//   private transport : any;
//   public walletName : string = ''
//   public address : any;
//   public isDecrypted = true
//   public exchange  = 'eth';
//   constructor(options) {
//     this._formatAddress = this._formatAddress.bind(this)
//     this.userAddress = this.userAddress.bind(this)
//     this.signTransaction = this.signTransaction.bind(this)
//     this.signMessage = this.signMessage.bind(this)

//     this.derivationPath = options.derivationPath
//     this.walletName = options.derivationPath
//     this.transport = options.transport
//     this.address = options.address || ''
//     this.networkId = parseInt(Constants.AllowedNetwork)
//   }
//   _formatAddress() {
//     if (!this.address)
//       return ''
//     return ethUtil.addHexPrefix(this.address)
//   }
//   userAddress() {
//     return this._formatAddress()
//   }
//   getAddress() {
//     return this._formatAddress()
//   }
//   getAccounts() {
//     return Promise.resolve([this.userAddress()])
//   }
//   async signTransaction (txParams) {
//     let address = this.address;
//     const derivationPath = this.derivationPath;
//     const transport = this.transport
//     if (address !== txParams.from || !derivationPath) {
//       throw new Error(`address unknown '${txParams.from}'`);
//     }
//     try {
//       const eth = new AppEth(transport)
//       const tx = new Transaction(txParams)

//       // Set the EIP155 bits
//       tx.raw[6] = Buffer.from([this.networkId]) // v
//       tx.raw[7] = Buffer.from([]) // r
//       tx.raw[8] = Buffer.from([]) // s

//       const result = await eth.signTransaction(
//         derivationPath.substring(2),
//         tx.serialize().toString('hex')
//       )
//       // Store signature in transaction
//       tx.v = Buffer.from(result.v, 'hex')
//       tx.r = Buffer.from(result.r, 'hex')
//       tx.s = Buffer.from(result.s, 'hex')

//       // EIP155: v should be chain_id * 2 + {35, 36}
//       const signedChainId = Math.floor((tx.v[0] - 35) / 2)
//       let validChainId = this.networkId & 0xff // FIXME this is to fixed a current workaround that app don't support > 0xff
//       if (signedChainId !== validChainId) {
//         throw makeError(
//           `Invalid networkId signature returned. Expected: ${
//             this.networkId
//           }, Got: ${
//             signedChainId}`,
//           'InvalidNetworkId'
//         )
//       }

//       return `0x${tx.serialize().toString('hex')}`
//     } catch(err) {
//       throw new Error(err.message)
//     }
//     finally {
//       // transport.close()
//     }
//   }
//   async signMessage (msgData) {
//     const address = this.address
//     const derivationPath = this.derivationPath
//     const transport = this.transport
//     if (address !== msgData.from || !derivationPath)
//       throw new Error(`address unknown '${msgData.from}'`)
//     let data = ethUtil.stripHexPrefix(msgData.data)
//     try {
//       const eth = new AppEth(transport)
//       const result = await eth.signPersonalMessage(
//         derivationPath,
//         data
//       )
//       const v = result.v.toString(16)
//       return `0x${result.r}${result.s}${v}`
//     } catch(err) {
//       throw new Error(err)
//     }
//   }
//   getHashForMessage(hash) {
//     let h = ethUtil.addHexPrefix(hash)
//     let hashBuff = ethUtil.toBuffer(h)
//     let personalMsgBuff =  ethUtil.hashPersonalMessage(hashBuff);
//     return ethUtil.addHexPrefix(personalMsgBuff.toString('hex'))
//   }
// }
