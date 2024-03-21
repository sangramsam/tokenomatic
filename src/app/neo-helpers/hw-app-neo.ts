
import Neon, {wallet as Wallet, u, tx, wallet} from '@cityofzion/neon-js';
// const Neon = window['Neon']
// const tx = Neon.tx
// const wallet = Neon.wallet
// const u = Neon.u
// const Transaction = tx.Transaction


const asyncWrap = function(promise) {
  return promise.then(data => [null, data]).catch(err => [err])
}
export const BIP44_PATH = '8000002C' + '80000378' + '80000000' + '00000000'

const VALID_STATUS = 0x9000
const MSG_TOO_BIG = 0x6d08
const APP_CLOSED = 0x6e00
const TX_DENIED = 0x6985
const TX_PARSE_ERR = 0x6d07

export const MESSAGES = {
  NOT_SUPPORTED: 'Your computer does not support the ledger',
  NOT_CONNECTED: 'Connect and unlock your Ledger device',
  APP_CLOSED: 'Navigate to the NEO app on your Ledger device',
  MSG_TOO_BIG: 'Your transaction is too big for the Ledger to sign',
  TX_DENIED: 'You have denied the transaction on your ledger',
  TX_PARSE_ERR:
    'Error parsing transaction. Make sure your NEO Ledger app version is up to date'
}

/**
 * Evaluates Transport Error thrown and rewrite the error message to be more user friendly.
 * @param {Error} err
 * @return {Error}
 */
const evalTransportError = error => {
  const err = JSON.parse(JSON.stringify((error)))
  switch (err.statusCode) {
    case APP_CLOSED:
      err.message = MESSAGES.APP_CLOSED
      break
    case MSG_TOO_BIG:
      err.message = MESSAGES.MSG_TOO_BIG
      break
    case TX_DENIED:
      err.message = MESSAGES.TX_DENIED
      break
    case TX_PARSE_ERR:
      err.message = MESSAGES.TX_PARSE_ERR
      break
    default:
  }
  return err
}

const BIP44 = (acct = 0) => {
  const acctNumber = acct.toString(16)
  return `${BIP44_PATH}${'0'.repeat(8 - acctNumber.length)}${acctNumber}`
}
const assembleSignature = (response: string): string => {
  const ss = new u.StringStream(response)
  // The first byte is format. It is usually 0x30 (SEQ) or 0x31 (SET)
  // The second byte represents the total length of the DER module.
  ss.read(2)
  // Now we read each field off
  // Each field is encoded with a type byte, length byte followed by the data itself
  ss.read(1) // Read and drop the type
  const r = ss.readVarBytes()
  ss.read(1)
  const s = ss.readVarBytes()

  // We will need to ensure both integers are 32 bytes long
  const integers = [r, s].map(i => {
    if (i.length < 64) {
      // eslint-disable-next-line
      i = i.padStart(64, '0')
    }
    if (i.length > 64) {
      // eslint-disable-next-line
      i = i.substr(-64)
    }
    return i
  })

  return integers.join('')
}

export default class NeonLedger {

  transport : any;

  constructor(transport) {
    this.transport = transport
  }

  async getPublicKeys(
    acct: number = 0,
    unencodedPublicKeys: Array<{ account: number, key: string }> = [],
    batchSize: number = 10
  ) {
    const res = await this.send('80040000', BIP44(acct), [VALID_STATUS])
    const key = await res.toString('hex').substring(0, 130)

    if (unencodedPublicKeys.length < batchSize) {
      unencodedPublicKeys.push({ account: acct, key })
      const nextKey = acct + 1
      return this.getPublicKeys(nextKey, unencodedPublicKeys)
    }
    return unencodedPublicKeys
  }

  /**
   * Retrieves the public key of an account from the Ledger.
   * @param {number} [acct] - Account that you want to retrieve the public key from.
   * @return {string} Public Key (Unencoded)
   */
  async getPublicKey(
    acct: number = 0
  ): Promise<{ account: number, key: string }> {
    const res = await this.send('80040000', BIP44(acct), [VALID_STATUS])
    const key = await res.toString('hex').substring(0, 130)
    return { account: acct, key }
  }

  getDeviceInfo() {
    try {
      return this.transport.device.getDeviceInfo()
    } catch (err) {
      throw evalTransportError(err)
    }
  }

  /**
   * Sends an message with params over to the Ledger.
   * @param {string} params - params as a hexstring
   * @param {string} msg - Message as a hexstring
   * @param {number[]} statusList - Statuses to return
   * @return {Promise<Buffer>} return value decoded to ASCII string
   */
  async send(
    params: string,
    msg: string,
    statusList: number[]
  ): Promise<Buffer> {
    if (params.length !== 8) throw new Error('params requires 4 bytes')
    // $FlowFixMe
    const [cla, ins, p1, p2] = params.match(/.{1,2}/g).map(i => parseInt(i, 16))
    try {
      return await this.transport.send(
        cla,
        ins,
        p1,
        p2,
        Buffer.from(msg, 'hex'),
        statusList
      )
    } catch (err) {
      throw evalTransportError(err)
    }
  }

  /**
   * Gets the ECDH signature of the data from Ledger using acct
   * @param {string} data
   * @param {number} [acct]
   * @return {Promise<string>}
   */
  async getSignature(data: string, acct: number = 0): Promise<string> {
    data += BIP44(acct) // eslint-disable-line
    let response = null
    const chunks = data.match(/.{1,510}/g) || []
    if (!chunks.length) throw new Error(`Invalid data provided: ${data}`)
    // eslint-disable-next-line
    for (let i = 0; i < chunks.length; i++) {
      const p = i === chunks.length - 1 ? '80' : '00'
      // $FlowFixMe
      const chunk = chunks[i]
      const params = `8002${p}00`
      // eslint-disable-next-line
      const [err, res] = await asyncWrap(
        this.send(params, chunk, [VALID_STATUS])
      )
      if (err) throw evalTransportError(err)
      response = res
    }
    if (response === 0x9000) {
      throw new Error('No more data but Ledger did not return signature!')
    }
    // $FlowFixMe
    return assembleSignature(response.toString('hex')) //eslint-disable-line
  }
  async legacySignWithLedger (
    unsignedTx: any | string,
    publicKeyEncoded: string,
    acct: number = 0
  ): Promise<string> {
    const ledger = this.transport
    try {
      const data =
        typeof unsignedTx !== 'string'
          ? tx.serializeTransaction(unsignedTx, false)
          : unsignedTx
      const invocationScript = `40${await this.getSignature(data, acct)}`
      const verificationScript = wallet.getVerificationScriptFromPublicKey(
        publicKeyEncoded
      )
      const txObj = tx.deserializeTransaction(data)
      txObj.scripts.push({ invocationScript, verificationScript })
      return tx.serializeTransaction(txObj)
    } catch(err) {
      console.log(err)
    }
  }
}

