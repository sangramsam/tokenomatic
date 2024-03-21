import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import * as EthWallet from "ethereumjs-wallet-browser";
import {
  JSONEthWallet,
  EthWalletHelper
} from "../components/wallets/jsonwallet_eth";
import {
  JSONNeoWallet,
  NeoWalletHelper
} from "../components/wallets/jsonwallet_neo";
import {
  JSONWanWallet,
  WanWalletHelper
} from "../components/wallets/jsonwallet_wan";
import {
  JSONAionWallet,
  AionWalletHelper
} from "../components/wallets/jsonwallet_aion";
import {
  JSONTezosWallet,
  TezosWalletHelper
} from "../components/wallets/jsonwallet_tezos";

// import { LedgerEthWallet } from '../components/wallets/ledgerwallet_eth';
import { LedgerAionWallet } from "../components/wallets/ledgerwallet_aion";
import { LedgerNeoWallet } from "../components/wallets/ledgerwallet_neo";

import * as ethUtil from "ethereumjs-util";
import { AwsService } from "./aws.service";
import { Web3Service } from "../services/web3.service";

import { INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from "@angular/platform-browser-dynamic/src/platform_providers";
import { AionWeb3Service } from "./aion-web3.service";
import { WanWeb3Service } from "./wan-web3.service";

var nacl = require("tweetnacl");
var blake2b = require("blakejs");
var blake2bHex = blake2b.blake2bHex;
var blake2B = blake2b.blake2b;
var AionWeb3 = require("aion-web3-v1.0");

const { electron, shell } = window.require("electron");
var remote = window.require("electron").remote;
const app = remote.app;
const fs = window.require("fs-extra");
const path = window.require("path");

// import * as HDKey from "hdkey";
import { Buffer } from "buffer";
import * as ehdkey from "ethereumjs-wallet-browser/hdkey";
// import AppEth from "@ledgerhq/hw-app-eth/lib/Eth";
import AppAion from "../aion-helpers/hw-app-aion/Aion";
import AppNeo from "../neo-helpers/hw-app-neo";
// const TransportNodeHid = window.require("@ledgerhq/hw-transport-node-hid")
//   .default;

declare var window: any;

@Injectable()
export class SavedWalletsService {
  private privatekey: any;
  private publicbufkey: any;
  private privatebufkey: any;
  private aion: any;
  private ethWallets: Array<any> = [];
  private neoWallets: Array<any> = [];
  private wanWallets: Array<any> = [];
  private aionWallets: Array<any> = [];
  private tezosWallets: Array<any> = [];
  private baseCurrency: string = "eth";
  private currentWallet: any;
  private _serviceStatus = new BehaviorSubject<any>("initializing");
  public serviceStatus$ = this._serviceStatus.asObservable();
  private neoWalletHelper: any;
  private ethWalletHelper: any;
  private wanWalletHelper: any;
  public aionWalletHelper: any;
  public tezosWalletHelper: any;
  public aionWeb3: any;
  public _web3: any;
  public web3: any;
  public keystore = {};
  private keyStorePath: string = path.join("library", "wallet", "keystore");

  private ledgerDefaultWalletCount = 5;
  private ledgerConnSub: any;
  private ledgerConnListener: BehaviorSubject<any> = new BehaviorSubject<any>(
    ""
  );
  private ledgerTransport: any;

  private ledgerEthPath = "m/44'/60'/0'";
  private ledgerEthWallets: Array<any> = [];

  // private ledgerNeoPath = "m/44'/60'/0'";
  private ledgerNeoWallets: Array<any> = [];

  private ledgerWanPath = "m/44'/60'/0'";
  private ledgerWanWallets: Array<any> = [];

  // we r using base path here
  // derived path would be m/44'/425'/0'/0'/0', m/44'/425'/0'/0'/1' and so on
  private ledgerAionBasePath = "m/44'/425'/0'/0'";
  private ledgerAionWallets: Array<any> = [];
  private walletStatus: string = "";

  constructor(
    private wanweb3service: WanWeb3Service,
    private awsservice: AwsService,
    private web3service: Web3Service,
    private AionWeb3Service: AionWeb3Service
  ) {
    this.saveEthToJson = this.saveEthToJson.bind(this);
    this.saveNeoToJson = this.saveNeoToJson.bind(this);
    this.getEthWallets = this.getEthWallets.bind(this);
    this.getNeoWallets = this.getNeoWallets.bind(this);
    this.getWanWallets = this.getWanWallets.bind(this);
    this.addNewEthWallet = this.addNewEthWallet.bind(this);
    this.addNewNeoWallet = this.addNewNeoWallet.bind(this);
    this.addNewTezosWallet = this.addNewTezosWallet.bind(this);
    this.setCurrentWallet = this.setCurrentWallet.bind(this);
    this.hasWalletWithName = this.hasWalletWithName.bind(this);
    this.hasWallets = this.hasWallets.bind(this);
    this.getAionLedgerWallets = this.getAionLedgerWallets.bind(this);
    // this.getEthLedgerWallets = this.getEthLedgerWallets.bind(this);

    this.neoWalletHelper = new NeoWalletHelper();
    this.ethWalletHelper = new EthWalletHelper();
    this.wanWalletHelper = new WanWalletHelper();
    this.aionWalletHelper = new AionWalletHelper(this.AionWeb3Service);
    this.tezosWalletHelper = new TezosWalletHelper();
    this.aionWeb3 = new AionWeb3(
      new AionWeb3.providers.HttpProvider("http://18.191.165.67")
    );
    this._web3 = this.wanweb3service._getWeb3();
    this.web3 = this.web3service.getWeb3();
    this.getWallet();
    // this.initLedger();
  }

  getWallet() {
    this.ethWallets = [];
    this.neoWallets = [];
    this.wanWallets = [];
    this.aionWallets = [];
    this.tezosWallets = [];
    var homePath = app.getPath("home");
    var folderPath = path.join(homePath, this.keyStorePath);
    fs.readdir(folderPath, (err, files) => {
      if (err) return;
      let length = files.length;
      files.forEach(file => {
        console.log(file, file.indexOf('utc'));
        if (file.toLowerCase().indexOf("utc") !== -1)
          try {
            var filePath = path.join(folderPath, file);
            var data = fs.readFileSync(filePath, "utf-8");
            var a = JSON.parse(data);

            var j = null;
            // 
            // console.log(j);

            if (a.exchange == "neo") j = new JSONNeoWallet(a);
            else if (a.exchange == "eth") j = new JSONEthWallet(a);
            else if (a.exchange == "wan") j = new JSONWanWallet(a, this._web3);
            else if (a.exchange == "aion")
              j = new JSONAionWallet(a, this.aionWeb3);
            else if (a.exchange == "tezos") j = new JSONTezosWallet(a);
            // j.decrypt('password')
            j['filename'] = file;
            if (a.exchange == "eth") this.ethWallets.push(j);
            else if (a.exchange == "neo") this.neoWallets.push(j);
            else if (a.exchange == "wan") this.wanWallets.push(j);
            else if (a.exchange == "aion") this.aionWallets.push(j);
            else if (a.exchange == "tezos") this.tezosWallets.push(j);
            //console.log(this.addNewAionWallet);
          } catch (err) {
            console.log(err.message);
          }
      });
      this._serviceStatus.next("ready");
      this._serviceStatus.next("walletsReady");
      this.walletStatus = "initialized";
      if (!this.currentWallet) {
        var currentWallet =
          this.getEthWallets().jsonWallets &&
            this.getEthWallets().jsonWallets.length
            ? this.getEthWallets().jsonWallets[0]
            : null;
        setTimeout(() => {
          this.setCurrentWallet(currentWallet);
        });
      }
    });
  }

  saveEthToJson(walletName, password, wallet) {
    let a = wallet.toV3(password, {
      kdf: "scrypt",
      n: 8192
    });
    a["walletName"] = walletName;
    a["exchange"] = "eth";
    // console.log('app', app.getPath('home'));
    var homePath = app.getPath("home");
    var filePath = path.join(
      homePath,
      this.keyStorePath,
      `utc-${new Date().getTime()}_eth_${a.address}.json`
    );
    fs.ensureFileSync(filePath);
    try {
      let data = {
        type: "ETH",
        address: a.address
      };
      this.awsservice.addItemNewWallet(data);
      // console.log('eth', a);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return { error: err };
    }
    return a;
  }
  saveWanToJson(walletName, password, wallet) {
    let a = wallet.toV3(password, {
      kdf: "scrypt",
      n: 8192
    });
    a["walletName"] = walletName;
    a["exchange"] = "wan";
    // console.log('app', app.getPath('home'));
    var homePath = app.getPath("home");
    var filePath = path.join(
      homePath,
      this.keyStorePath,
      `utc-${new Date().getTime()}_wan_${a.address}.json`
    );
    fs.ensureFileSync(filePath);
    try {
      let data = {
        type: "WAN",
        address: a.address
      };
      //this.awsservice.addItemNewWallet(data);
      console.log("eth", a);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return { error: err };
    }
    return a;
  }

  saveAionToJson(walletName, password, wallet) {
    let address;
    let a = {};
    if (typeof wallet == "string") {
      //  console.log("wallet",wallet)
      ///  console.log("WALLET1",wallet[0],"WALLET2",wallet[1])
      wallet = this.aionWeb3.eth.accounts.privateKeyToAccount(wallet);
      console.log("privateKey", wallet._privateKey);
      let enc_data = this.aionWalletHelper.password(
        password,
        wallet.publicKey,
        wallet._privateKey
      );
      address = new Buffer(wallet.publicKey, "hex").toString("hex");
      this.keystore["walletName"] = walletName;
      this.keystore["exchange"] = "aion";
      this.keystore["address"] = wallet.address;
      this.keystore["wallet"] = enc_data;
      // console.log(JSON.stringify(this.keystore));
    } else if (wallet.encode != null && wallet.encode != undefined) {
      //  console.log("WALLET1",wallet.encode,"WALLET2",wallet.key)
      let aionWeb3 = this.aionWeb3.eth.accounts.privateKeyToAccount(wallet.key);
      address = new Buffer(aionWeb3.publicKey, "hex").toString("hex");
      this.keystore["walletName"] = walletName;
      this.keystore["exchange"] = "aion";
      this.keystore["address"] = aionWeb3.address;
      this.keystore["wallet"] = wallet.encode;
      //console.log(JSON.stringify(this.keystore));
    } else {
      let enc_data = this.aionWalletHelper.password(
        password,
        wallet[0],
        wallet[1]
      );
      address = new Buffer(wallet[0], "hex").toString("hex");
      this.keystore["walletName"] = walletName;
      this.keystore["exchange"] = "aion";
      this.keystore["address"] = wallet[2];
      this.keystore["wallet"] = enc_data;
      // console.log(JSON.stringify(this.keystore));
    }
    var homePath = app.getPath("home");
    var filePath = path.join(
      homePath,
      this.keyStorePath,
      `utc-${new Date().getTime()}_aion_${address}.json`
    );

    fs.ensureFileSync(filePath);
    try {
      var data = {
        type: "AION"
        //address:address1
      };
      //this.awsservice.addItemNewWallet(data);
      console.log("Aion", this.keystore);
      fs.writeFileSync(filePath, JSON.stringify(this.keystore));
    } catch (err) {
      return { error: err };
    }

    return this.keystore;
  }
  saveNeoToJson(walletName, password, wallet) {
    let a = {
      walletName,
      exchange: "neo",
      address: wallet._address,
      key: this.neoWalletHelper.getKeyForAccount(wallet, password)
    };
    var homePath = app.getPath("home");
    var filePath = path.join(
      homePath,
      this.keyStorePath,
      `utc-${new Date().getTime()}_neo_${a.address}.json`
    );
    fs.ensureFileSync(filePath);
    try {
      //  console.log('eth', a);
      let data = {
        type: "NEO",
        address: a.address
      };
      this.awsservice.addItemNewWallet(data);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return { error: err };
    }
    return a;
  }

  saveTezosToJson(walletName, password, wallet) {
    let a = {
      walletName,
      exchange: "tezos",
      address: wallet.pkh,
      key: this.tezosWalletHelper.getKeyForAccount(wallet.sk, password)
    };
    var homePath = app.getPath("home");
    var filePath = path.join(
      homePath,
      this.keyStorePath,
      `utc-${new Date().getTime()}_tezos_${a.address}.json`
    );
    fs.ensureFileSync(filePath);
    try {
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return { error: err };
    }
    return a;
  }

  getEthWallets() {
    return {
      jsonWallets: this.ethWallets.slice()
      // hdWallets : this.ledgerEthWallets.slice()
    };
  }

  getNeoWallets() {
    return {
      jsonWallets: this.neoWallets.slice(),
      hdWallets: this.ledgerNeoWallets.slice()
    };
  }
  getWanWallets() {
    return {
      jsonWallets: this.wanWallets.slice(),
      hdWallets: this.ledgerWanWallets.slice()
    };
  }
  getAionWallets() {
    return {
      jsonWallets: this.aionWallets.slice(),
      hdWallets: this.ledgerAionWallets.slice()
    };
  }
  getTezosWallets() {
    return {
      jsonWallets: this.tezosWallets.slice()
    };
  }

  newNeoWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == "private" || data.type == "json") {
      var a = this.saveNeoToJson(data.walletName, data.password, wallet);
      walletData = new JSONNeoWallet(a);
      deCryptedNewWallet = new JSONNeoWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return { walletData, deCryptedNewWallet };
  }

  newEthWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == "private" || data.type == "json") {
      var a = this.saveEthToJson(data.walletName, data.password, wallet);
      walletData = new JSONEthWallet(a);
      deCryptedNewWallet = new JSONEthWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return { walletData, deCryptedNewWallet };
  }

  newWanWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == "private" || data.type == "json") {
      var a = this.saveWanToJson(data.walletName, data.password, wallet);
      walletData = new JSONWanWallet(a, this._web3);
      deCryptedNewWallet = new JSONWanWallet(a, this._web3);
      deCryptedNewWallet.decrypt(data.password);
    }

    return { walletData, deCryptedNewWallet };
  }

  newAionWalletSetUp(data, wallet) {
    // console.log(data,wallet);
    var walletData, deCryptedNewWallet;
    if (data.type == "private" || data.type == "json") {
      var a = this.saveAionToJson(data.walletName, data.password, wallet);
      // console.log(a);
      walletData = new JSONAionWallet(a, this.aionWeb3);
      deCryptedNewWallet = new JSONAionWallet(a, this.aionWeb3);
      console.log(deCryptedNewWallet);
      deCryptedNewWallet.decrypt(data.password);
    }

    return { walletData, deCryptedNewWallet };
  }

  newTezosWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == "private" || data.type == "json") {
      var a = this.saveTezosToJson(data.walletName, data.password, wallet);
      walletData = new JSONTezosWallet(a);
      deCryptedNewWallet = new JSONTezosWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return { walletData, deCryptedNewWallet };
  }

  addNewEthWallet(data, wallet) {
    data["exchange"] = "eth";
    var address = wallet._address;
    var ethWallets = this.getEthWallets().jsonWallets;
    for (let w of ethWallets) {
      if (w.address == wallet.getAddressString()) {
        return { error: "Duplicate!! Wallet already added", wallet: null };
      }
    }
    var { walletData, deCryptedNewWallet } = this.newEthWalletSetUp(
      data,
      wallet
    );
    //this.ethWallets.push(walletData);
    this.getWallet();
    this._serviceStatus.next("newWalletAdded");
    return { error: "", wallet: deCryptedNewWallet };
  }

  addNewWanWallet(data, wallet) {
    console.log("addNewWanWallet");

    console.log(data);
    console.log(wallet);

    data["exchange"] = "wan";
    var address = wallet._address;
    var wanWallets = this.getWanWallets().jsonWallets;
    for (let w of wanWallets) {
      if (w.address == wallet.getAddressString()) {
        return { error: "Duplicate!! Wallet already added", wallet: null };
      }
      if (w.walletName == data["walletName"]) {
        return { error: "Duplicate!! Wallet Name already Have", wallet: null };
      }
    }
    var { walletData, deCryptedNewWallet } = this.newWanWalletSetUp(
      data,
      wallet
    );
    this.wanWallets.push(walletData);
    this._serviceStatus.next("newWalletAdded");
    return { error: "", wallet: deCryptedNewWallet };
  }

  addNewAionWallet(data, wallet) {
    console.log("add", data, wallet);
    if (wallet.encode != null && wallet.encode != undefined) {
      data["exchange"] = "aion";
      let aionWeb3 = this.aionWeb3.eth.accounts.privateKeyToAccount(wallet.key);
      var address = aionWeb3.address;
      var aionWallets = this.getAionWallets().jsonWallets;
    } else if (typeof wallet == "string") {
      data["exchange"] = "aion";
      var a = this.aionWeb3.eth.accounts.privateKeyToAccount(wallet);
      var address: any = a.address;
      var aionWallets = this.getAionWallets().jsonWallets;
    } else {
      data["exchange"] = "aion";
      var address = wallet[2];
      var aionWallets = this.getAionWallets().jsonWallets;
    }
    for (let w of aionWallets) {
      if (w.address == address && w.walletName == data["walletName"]) {
        return { error: "Duplicate!! Wallet already added", wallet: null };
      }
      if (w.walletName == data["walletName"]) {
        return { error: "Duplicate!! Wallet Name already have", wallet: null };
      }
    }
    var { walletData, deCryptedNewWallet } = this.newAionWalletSetUp(
      data,
      wallet
    );
    console.log("walletData", walletData);
    this.aionWallets.push(walletData);
    this._serviceStatus.next("newWalletAdded");
    return { error: "", wallet: deCryptedNewWallet };
  }
  addNewNeoWallet(data, wallet) {
    data["exchange"] = "neo";
    // check for duplicates
    var address = wallet._address;
    var neoWallets = this.getNeoWallets().jsonWallets;
    for (let w of neoWallets) {
      if (w.address == wallet._address) {
        return { error: "Duplicate!! Wallet already added", wallet: null };
      }
    }
    var { walletData, deCryptedNewWallet } = this.newNeoWalletSetUp(
      data,
      wallet
    );
    this.neoWallets.push(walletData);
    this._serviceStatus.next("newWalletAdded");
    return { error: "", wallet: deCryptedNewWallet };
  }

  addNewTezosWallet(data, wallet) {
    data["exchange"] = "tezos";
    // check for duplicates
    var address = wallet.pkh;
    var tezosWallets = this.tezosWallets;
    for (let w of tezosWallets) {
      if (w.address == address) {
        return { error: "Duplicate!! Wallet already added", wallet: null };
      }
    }
    var { walletData, deCryptedNewWallet } = this.newTezosWalletSetUp(
      data,
      wallet
    );
    this.tezosWallets.push(walletData);
    this._serviceStatus.next("newWalletAdded");
    return { error: "", wallet: deCryptedNewWallet };
  }

  setCurrentWallet(wallet) {
    if (!wallet) {
      this.currentWallet = wallet;
      this._serviceStatus.next("ready");
      // this._serviceStatus.next('currentWalletChanged');
      return;
    }
    var oldWallet = this.currentWallet;
    this.currentWallet = wallet;

    if (wallet) {
      this._serviceStatus.next("currentWalletChanged");
    }
  }

  getCurrentWallet() {
    return this.currentWallet;
  }

  generateWallet(exchange) {
    if (exchange == "eth") {
      return EthWallet.generate();
    } else if (exchange == "neo") {
      return this.neoWalletHelper.generateWallet();
    } else if (exchange == "wan") {
      return EthWallet.generate();
    } else if (exchange == "aion") {
      return this.aionWalletHelper.generateWallet();
    } else if (exchange == "tezos") {
      return this.tezosWalletHelper.generateWallet();
    }
  }

  createWalletWithPrivate(privateKey, exchange) {
    let w = {
      error: "",
      wallet: ""
    };
    if (exchange == "eth") {
      privateKey = ethUtil.stripHexPrefix(privateKey);
      let pk = new Buffer(Buffer.from(privateKey, "hex"));
      w.wallet = EthWallet.fromPrivateKey(pk);
    } else if (exchange == "neo") {
      w = this.neoWalletHelper.createWalletWithPrivate(privateKey);
    } else if (exchange == "wan") {
      privateKey = ethUtil.stripHexPrefix(privateKey);
      let pk = new Buffer(Buffer.from(privateKey, "hex"));
      w.wallet = EthWallet.fromPrivateKey(pk);
    } else if (exchange == "aion") {
      w.wallet = privateKey;
    } else if (exchange == "tezos") {
      var { error, account } = this.tezosWalletHelper.createWalletWithPrivate(
        privateKey
      );
      w.error = error;
      w.wallet = account;
    }
    return w;
  }

  createWalletWithJSON(jsonData, password, exchange) {
    //console.log(jsonData)
    if (exchange == "eth") {
      var { error, wallet } = this.ethWalletHelper.createWalletWithJSON(
        jsonData,
        password
      );
    } else if (exchange == "neo") {
      var { error, wallet } = this.neoWalletHelper.createWalletWithJSON(
        jsonData,
        password
      );
    } else if (exchange == "wan") {
      var { error, wallet } = this.wanWalletHelper.createWalletWithJSON(
        jsonData,
        password
      );
    } else if (exchange == "aion") {
      var { error, wallet } = this.aionWalletHelper.createWalletWithJSON(
        jsonData,
        password
      );
    } else if (exchange == "tezos") {
      var { error, wallet } = this.tezosWalletHelper.createWalletWithJSON(
        jsonData,
        password
      );
    }
    return { error, wallet };
  }

  downloadFile() {
    var dPath = app.getPath("home");
    dPath = path.join(dPath, path.join("library", "wallet", "keystore"));
    shell.showItemInFolder(dPath);
  }

  deleteFile(filename) {
    console.log(filename);

    var dPath = app.getPath("home");
    dPath = path.join(dPath, path.join("library", "wallet", "keystore", filename));
    console.log(dPath);

    fs.remove(dPath, err => {
      if (err) return console.error(err)
      this.getWallet();
      console.log('success!')
    })
  }
  hasWalletWithName(name, exchange) {
    var walletList =
      exchange == "eth"
        ? this.ethWallets
        : exchange == "neo"
          ? this.neoWallets
          : exchange == "tezos"
            ? this.tezosWallets
            : [];
    var found = false;
    if (!name) return false;
    for (let w of walletList) {
      if (w.walletName === name) {
        found = true;
        break;
      }
    }
    return found;
  }

  hasWallets() {
    return this.ethWallets.length || this.neoWallets.length;
  }

  decrypt(encode, password, nonstrict) {
    var keystore = this.aionWalletHelper.getDecode(encode, password, nonstrict);

    return keystore;
  }

  keystoreconvert(encode, password, nonstrict) {
    var key = this.aionWalletHelper.decrypted(encode, password, nonstrict);
    return key;
  }

  // Ledger Related -- Maybe make this a separate service ?
  // getHWDEthAddresses = (publicKey, chainCode, path, start) => {
  //   if (!path) path = this.ledgerEthPath;
  //   const hdk = new HDKey();
  //   hdk.publicKey = new Buffer(publicKey, "hex");
  //   hdk.chainCode = new Buffer(chainCode, "hex");
  //   const accounts = [];
  //   for (let i = start; i < start + this.ledgerDefaultWalletCount; i++) {
  //     const derivedKey = hdk.derive(`m/${i}`);
  //     const address = ehdkey
  //       .fromExtendedKey(derivedKey.publicExtendedKey)
  //       .getWallet()
  //       .getAddress()
  //       .toString("hex");
  //     const aPath = `${path}/${i}`;
  //     const aAddress = `0x${address}`;
  //     accounts.push({
  //       path: aPath,
  //       address: aAddress
  //     });
  //   }
  //   return accounts;
  // };
  // Init Ledger Listener
  // initLedger = () => {
  //   this.ledgerConnListener.subscribe(
  //     e => {
  //       console.log("Coomes to listener", e);
  //       if (!e) return;
  //       // this.ledgerConnSub.unsubscribe()
  //       if (e.type == "add") {
  //         TransportNodeHid.open(e.descriptor, true, 20).then(
  //           async transport => {
  //             this.ledgerTransport = transport;
  //             // try {
  //             //   await this.getEthLedgerWallets()
  //             //   await this.getAionLedgerWallets()
  //             // } catch(err) {
  //             //   console.log(err)
  //             // }
  //           }
  //         );
  //       } else if (e.type == "remove") {
  //         this.ledgerTransport = null;
  //         // this.ledgerEthWallets = [];
  //         this.ledgerAionWallets = [];
  //         this.ledgerNeoWallets = [];
  //         if (this.walletStatus == "initialized") {
  //           this._serviceStatus.next("newWalletAdded");
  //         }
  //       }
  //     },
  //     e => {
  //       console.log(e);
  //     }
  //   );
  //   this.ledgerConnSub = TransportNodeHid.listen(this.ledgerConnListener);
  // };
  // async getEthLedgerWallets() {
  //   if (!this.ledgerTransport)
  //     throw new Error(
  //       "Please make sure the ledger device is connected and is unlocked."
  //     );
  //   try {
  //     const eth = new AppEth(this.ledgerTransport);
  //     const result = await eth.getAddress(this.ledgerEthPath, false, true);
  //     let publicKey = result.publicKey;
  //     let chainCode = result.chainCode;
  //     let accounts = this.getHWDEthAddresses(
  //       publicKey,
  //       chainCode,
  //       this.ledgerEthPath,
  //       0
  //     );
  //     let ledgerEthWallets = [];
  //     accounts.forEach(info => {
  //       ledgerEthWallets.push(
  //         new LedgerEthWallet({
  //           derivationPath: info.path,
  //           address: info.address,
  //           transport: this.ledgerTransport
  //         })
  //       );
  //     });
  //     this.ledgerEthWallets = ledgerEthWallets;
  //     if (this.walletStatus == "initialized") {
  //       this._serviceStatus.next("newWalletAdded");
  //     }
  //   } catch (err) {
  //     if (err.statusCode == 26368)
  //       throw new Error(
  //         "Please make sure Eth app is selected on your ledger device."
  //       );
  //     else {
  //       throw new Error(
  //         "Please make sure Ledger is connected and Eth app is selected. If you are still not able to connect, please disconnect ledger and reconnect."
  //       );
  //     }
  //   }
  // }
  async getAionLedgerWallets() {
    if (!this.ledgerTransport)
      throw new Error(
        "Please make sure the ledger device is connected and is unlocked."
      );
    try {
      const aion = new AppAion(this.ledgerTransport);
      let ledgerAionWallets = [];
      for (let i = 0; i < this.ledgerDefaultWalletCount; i++) {
        let derivationPath = `${this.ledgerAionBasePath}/${i}'`;
        let result = await aion.getAddress(derivationPath, false, true);
        let publicKey = result.publicKey;
        let address = result.address;
        if (address.toLowerCase().indexOf("0xa0") == -1) {
          break;
        }
        ledgerAionWallets.push(
          new LedgerAionWallet({
            derivationPath,
            address,
            publicKey,
            transport: this.ledgerTransport
          })
        );
      }
      this.ledgerAionWallets = ledgerAionWallets;
      if (this.walletStatus == "initialized") {
        this._serviceStatus.next("newWalletAdded");
      }
    } catch (err) {
      if (err.statusCode == 26368)
        throw new Error(
          "Please make sure Aion app is selected on your ledger device."
        );
      else {
        throw new Error(
          "Please make sure Ledger is connected and Aion app is selected. If you are still not able to connect, please disconnect ledger and reconnect."
        );
      }
    }
  }
  async getNeoLedgerWallets() {
    if (!this.ledgerTransport)
      throw new Error(
        "Please make sure the ledger device is connected and is unlocked."
      );
    try {
      const neo = new AppNeo(this.ledgerTransport);
      let ledgerNeoWallets = [];
      for (let i = 0; i < this.ledgerDefaultWalletCount; i++) {
        let derivationPath = `Wallet - ${i + 1}`;
        let result = await neo.getPublicKey(i);
        let publicKey = result.key;
        ledgerNeoWallets.push(
          new LedgerNeoWallet({
            derivationPath,
            publicKey,
            transport: this.ledgerTransport
          })
        );
      }
      this.ledgerNeoWallets = ledgerNeoWallets;
      if (this.walletStatus == "initialized") {
        this._serviceStatus.next("newWalletAdded");
      }
    } catch (err) {
      if (err.statusCode == 26368)
        throw new Error(
          "Please make sure Neo app is selected on your ledger device."
        );
      else {
        throw new Error(
          "Please make sure Ledger is connected and Neo app is selected. If you are still not able to connect, please disconnect ledger and reconnect."
        );
      }
    }
  }
  ngOnDestroy() {
    if (this.ledgerTransport) this.ledgerTransport.close();
  }
  update() {
    this._serviceStatus.next("ready");
    this._serviceStatus.next("walletsReady");
  }
}
