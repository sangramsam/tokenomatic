import { Injectable } from "@angular/core";
import { Constants } from "../models/constants";
import { NeotokenService } from "./neotoken.service";
import { Http, RequestOptions, Headers } from "@angular/http";
import { constants } from "fs";
let server_config = require("../../../config/server-config.json");
const Store = window.require("electron-store");
declare var window: any;

@Injectable()
export class ConfigService {
  public store = new Store();
  private NEO_CONFIG: any;
  private ETH_CONFIG: any;
  private WAN_CONFIG: any;
  private AION_CONFIG: any;

  constructor(private neotokenService: NeotokenService, private http: Http) {
    //console.log("NETWORK", this.store.get("network"));
    //console.log("BLOCKCHAIN", this.store.get("blockchain"));
    // console.log(server_config)
  }

  getSettings() {
    return new Promise((resolve, reject) => {
      this.http
        .get("https://storage.googleapis.com/wandx-desktop-wallet/config.json")
        .subscribe(
          res => {
            console.log(res.json());
            // var d = res.json();
            var d = server_config;
            console.log(d);
            console.log(d.desktopConfig);

            this.NEO_CONFIG = d.desktopConfig.blockchain["NEO"];
            this.ETH_CONFIG = d.desktopConfig.blockchain["ETH"];
            this.WAN_CONFIG = d.desktopConfig.blockchain["wan"];
            this.AION_CONFIG = d.desktopConfig.blockchain["aion"];
            console.log(this.AION_CONFIG, this.WAN_CONFIG);
            this.configureETH();
            this.configureNeo();
            this.configureWan();
            this.configureAion();
            resolve({ data: d });
          },
          err => {
            reject(err);
          }
        );
    });
  }

  configureNeo() {
    if (this.store.get("network") === "TESTNET") {
      console.log("configure TESTNETNEO");
      Constants.RPC_URL = this.NEO_CONFIG.TESTNET.NEO_TESTNET_RPC_URL;
      Constants.NEOSCAN_URL = this.NEO_CONFIG.TESTNET.NEOSCAN_URL;
      Constants.contractScriptHash = this.NEO_CONFIG.TESTNET.contractScriptHash;
      Constants.NEO_SERVER_URL = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_TESTNET;
      Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_STAKE_TESTNET;
      Constants.NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_ASSET_ID;
      Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_GAS_ASSET_ID;
      Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.WAND_NEO_ASSET_ID;
      this.neotokenService.setNeonTokenList(this.NEO_CONFIG.TESTNET.tokens);
    } else if (this.store.get("network") === "PRIVATENET") {
      console.log("configure PRIVATENET");
      Constants.RPC_URL = this.NEO_CONFIG.PRIVATENET.NEO_TESTNET_RPC_URL;
      Constants.NEOSCAN_URL = this.NEO_CONFIG.PRIVATENET.NEOSCAN_URL;
      Constants.contractScriptHash = this.NEO_CONFIG.PRIVATENET.contractScriptHash;
      Constants.NEO_SERVER_URL = this.NEO_CONFIG.PRIVATENET.NEO_SERVER_URL_TESTNET;
      Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.PRIVATENET.NEO_SERVER_URL_STAKE_TESTNET;
      Constants.NEO_ASSET_ID = this.NEO_CONFIG.PRIVATENET.NEO_ASSET_ID;
      Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.PRIVATENET.NEO_GAS_ASSET_ID;
      Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.PRIVATENET.WAND_NEO_ASSET_ID;
      this.neotokenService.setNeonTokenList(this.NEO_CONFIG.PRIVATENET.tokens);
    } else {
      console.log("configure MAINNET");
      //since don't have neo main net have to config with test net in future will chainge it into main net
      Constants.RPC_URL = this.NEO_CONFIG.TESTNET.NEO_TESTNET_RPC_URL;
      Constants.NEOSCAN_URL = this.NEO_CONFIG.TESTNET.NEOSCAN_URL;
      Constants.contractScriptHash = this.NEO_CONFIG.TESTNET.contractScriptHash;
      Constants.NEO_SERVER_URL = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_TESTNET;
      Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_STAKE_TESTNET;
      Constants.NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_ASSET_ID;
      Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_GAS_ASSET_ID;
      Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.WAND_NEO_ASSET_ID;
      this.neotokenService.setNeonTokenList(this.NEO_CONFIG.TESTNET.tokens);
    }
  }

  configureETH() {
    if (
      this.store.get("network") === "TESTNET" ||
      this.store.get("network") === "PRIVATENET"
    ) {
      console.log("configure TESTNETETH");
      Constants.TokenVault = this.ETH_CONFIG.TESTNET.TokenVault;
      Constants.TokenHistoryUrl = this.ETH_CONFIG.TESTNET.TokenHistoryUrl;
      Constants.ServiceURL = this.ETH_CONFIG.TESTNET.ServiceURL;
      Constants.CryptoCompareUrl = this.ETH_CONFIG.TESTNET.CryptoCompareUrl;
      Constants.WandxCompareUrl = this.ETH_CONFIG.TESTNET.WandxCompareUrl;
      Constants.ThemedBasketRequest = this.ETH_CONFIG.TESTNET.ThemedBasketRequest;
      Constants.BashketURL =
        // "https://ethmain.wandx.co/api/portfolio/findPortfolio";
        // Constants.ethBasketUrl = "http://35.184.121.85:8009/";
        Constants.ethBasketUrl = this.ETH_CONFIG.TESTNET.NodeServer;
      Constants.TxAppnetURL = this.ETH_CONFIG.TESTNET.TxAppnetURL;
      Constants.AddressAppnetURL = this.ETH_CONFIG.TESTNET.AddressAppnetURL;
      Constants.EthTokenDetailURL = this.ETH_CONFIG.TESTNET.EthTokenDetailURL;
      Constants.ApiManagementSubscriptionKey = this.ETH_CONFIG.TESTNET.ApiManagementSubscriptionKey;
      Constants.AllowedNetwork = this.ETH_CONFIG.TESTNET.AllowedNetwork;
      Constants.WandxExchangeFeeRate = this.ETH_CONFIG.TESTNET.WandxExchangeFeeRate;
      Constants.EthExchangeFeeRate = this.ETH_CONFIG.TESTNET.EthExchangeFeeRate;
      Constants.OtherExchageFeeRate = this.ETH_CONFIG.TESTNET.OtherExchageFeeRate;
      Constants.EtherTokenId = this.ETH_CONFIG.TESTNET.EtherTokenId;
      Constants.EtherTokenAddress = this.ETH_CONFIG.TESTNET.EtherTokenAddress;
      Constants.WandxTokenId = this.ETH_CONFIG.TESTNET.WandxTokenId;
      Constants.WandxTokenAddress = this.ETH_CONFIG.TESTNET.WandxTokenAddress;
      Constants.WandxTokenDecimals = this.ETH_CONFIG.TESTNET.WandxTokenDecimals;
      Constants.OrderBookContractAddress = this.ETH_CONFIG.TESTNET.OrderBookContractAddress;
      Constants.CretaeContractAddress = this.ETH_CONFIG.TESTNET.CretaeContractAddress;
      Constants.protoStorageAddress = this.ETH_CONFIG.TESTNET.protoStorageAddress;
      Constants.TrasfersProxyAddress = this.ETH_CONFIG.TESTNET.TrasfersProxyAddress;
      Constants.BlockExpirationWindow = this.ETH_CONFIG.TESTNET.BlockExpirationWindow;
      Constants.Chainid = 3;
    } else {
      console.log("configure MAINNETETH");
      Constants.TokenVault = this.ETH_CONFIG.MAINNET.TokenVault;
      Constants.TokenHistoryUrl = this.ETH_CONFIG.MAINNET.TokenHistoryUrl;
      Constants.ServiceURL = this.ETH_CONFIG.MAINNET.ServiceURL;
      Constants.CryptoCompareUrl = this.ETH_CONFIG.MAINNET.CryptoCompareUrl;
      Constants.WandxCompareUrl = this.ETH_CONFIG.MAINNET.WandxCompareUrl;
      Constants.ThemedBasketRequest = this.ETH_CONFIG.MAINNET.ThemedBasketRequest;
      Constants.BashketURL =
        "https://basketethmain.wandx.co:8443/api/portfolio/findPortfolio";
      //"https://wanpburlmain.wandx.co/wandxserver/"; //
      // Constants.ethBasketUrl = "https://wanpburlmain.wandx.co/wandxserver/"
      Constants.ethBasketUrl = this.ETH_CONFIG.MAINNET.NodeServer; //"http://35.184.121.85:8008/";
      Constants.TxAppnetURL = this.ETH_CONFIG.MAINNET.TxAppnetURL;
      Constants.AddressAppnetURL = this.ETH_CONFIG.MAINNET.AddressAppnetURL;
      Constants.EthTokenDetailURL = this.ETH_CONFIG.MAINNET.EthTokenDetailURL;
      Constants.ApiManagementSubscriptionKey = this.ETH_CONFIG.MAINNET.ApiManagementSubscriptionKey;
      Constants.AllowedNetwork = this.ETH_CONFIG.MAINNET.AllowedNetwork;
      Constants.WandxExchangeFeeRate = this.ETH_CONFIG.MAINNET.WandxExchangeFeeRate;
      Constants.EthExchangeFeeRate = this.ETH_CONFIG.MAINNET.EthExchangeFeeRate;
      Constants.OtherExchageFeeRate = this.ETH_CONFIG.MAINNET.OtherExchageFeeRate;
      Constants.EtherTokenId = this.ETH_CONFIG.MAINNET.EtherTokenId;
      Constants.EtherTokenAddress = this.ETH_CONFIG.MAINNET.EtherTokenAddress;
      Constants.WandxTokenId = this.ETH_CONFIG.MAINNET.WandxTokenId;
      Constants.WandxTokenAddress = this.ETH_CONFIG.MAINNET.WandxTokenAddress;
      Constants.WandxTokenDecimals = this.ETH_CONFIG.MAINNET.WandxTokenDecimals;
      Constants.OrderBookContractAddress = this.ETH_CONFIG.MAINNET.OrderBookContractAddress;
      Constants.CretaeContractAddress = this.ETH_CONFIG.MAINNET.CretaeContractAddress;
      Constants.protoStorageAddress = this.ETH_CONFIG.MAINNET.protoStorageAddress;
      Constants.TrasfersProxyAddress = this.ETH_CONFIG.MAINNET.TrasfersProxyAddress;
      Constants.BlockExpirationWindow = this.ETH_CONFIG.MAINNET.BlockExpirationWindow;
      Constants.Chainid = 1;
    }
  }

  configureWan() {
    if (this.store.get("network") === "TESTNET") {
      console.log("configure TESTNETWAN", this.WAN_CONFIG.TESTNET);
      // if (this.WAN_CONFIG && this.WAN_CONFIG.TESTNET) {
      Constants.BashketURLWAN = this.WAN_CONFIG.TESTNET.BashketURLWAN;
      Constants.ServiceURLWAN = this.WAN_CONFIG.TESTNET.ServiceURLWAN;
      Constants.TxAppnetURLWAN = this.WAN_CONFIG.TESTNET.TxAppnetURLWAN;
      Constants.AddressAppnetURLWAN = this.WAN_CONFIG.TESTNET.AddressAppnetURLWAN;
      Constants.EthTokenDetailURLWAN = this.WAN_CONFIG.TESTNET.EthTokenDetailURLWAN;
      Constants.ApiManagementSubscriptionKeyWAN = this.WAN_CONFIG.TESTNET.ApiManagementSubscriptionKeyWAN;
      Constants.AllowedNetworkWAN = this.WAN_CONFIG.TESTNET.AllowedNetworkWAN;
      Constants.WandxExchangeFeeRateWAN = this.WAN_CONFIG.TESTNET.WandxExchangeFeeRateWAN;
      Constants.EthExchangeFeeRateWAN = this.WAN_CONFIG.TESTNET.EthExchangeFeeRateWAN;
      Constants.OtherExchageFeeRateWAN = this.WAN_CONFIG.TESTNET.OtherExchageFeeRateWAN;
      Constants.EtherTokenIdWAN = this.WAN_CONFIG.TESTNET.EtherTokenIdWAN;
      Constants.EtherTokenAddressWAN = this.WAN_CONFIG.TESTNET.EtherTokenAddressWAN;
      Constants.WandxTokenIdWAN = this.WAN_CONFIG.TESTNET.WandxTokenIdWAN;
      Constants.WandxTokenAddressWAN = this.WAN_CONFIG.TESTNET.WandxTokenAddressWAN;
      Constants.WandxTokenDecimalsWAN = this.WAN_CONFIG.TESTNET.WandxTokenDecimalsWAN;
      Constants.OrderBookContractAddressWAN = this.WAN_CONFIG.TESTNET.OrderBookContractAddressWAN;
      Constants.CretaeContractAddressWAN = this.WAN_CONFIG.TESTNET.CretaeContractAddressWAN;
      Constants.protoStorageAddressWAN = this.WAN_CONFIG.TESTNET.protoStorageAddressWAN;
      Constants.TrasfersProxyAddressWAN = this.WAN_CONFIG.TESTNET.TrasfersProxyAddressWAN;
      Constants.BlockExpirationWindowWAN = this.WAN_CONFIG.TESTNET.BlockExpirationWindowWAN;
      Constants.providerwanURL = this.WAN_CONFIG.TESTNET.providerwanURL;
      Constants.chainid = this.WAN_CONFIG.TESTNET.chainid;
      Constants.gaslimit = this.WAN_CONFIG.TESTNET.gaslimit;
      //    }
    } else {
      console.log("configure MAINNETWAN");
      //  if (this.WAN_CONFIG && this.WAN_CONFIG.MAINNET) {
      Constants.BashketURLWAN = this.WAN_CONFIG.MAINNET.BashketURLWAN;
      Constants.ServiceURLWAN = this.WAN_CONFIG.MAINNET.ServiceURLWAN;
      Constants.TxAppnetURLWAN = this.WAN_CONFIG.MAINNET.TxAppnetURLWAN;
      Constants.AddressAppnetURLWAN = this.WAN_CONFIG.MAINNET.AddressAppnetURLWAN;
      Constants.EthTokenDetailURLWAN = this.WAN_CONFIG.MAINNET.EthTokenDetailURLWAN;
      Constants.ApiManagementSubscriptionKeyWAN = this.WAN_CONFIG.MAINNET.ApiManagementSubscriptionKeyWAN;
      Constants.AllowedNetworkWAN = this.WAN_CONFIG.MAINNET.AllowedNetworkWAN;
      Constants.WandxExchangeFeeRateWAN = this.WAN_CONFIG.MAINNET.WandxExchangeFeeRateWAN;
      Constants.EthExchangeFeeRateWAN = this.WAN_CONFIG.MAINNET.EthExchangeFeeRateWAN;
      Constants.OtherExchageFeeRateWAN = this.WAN_CONFIG.MAINNET.OtherExchageFeeRateWAN;
      Constants.EtherTokenIdWAN = this.WAN_CONFIG.MAINNET.EtherTokenIdWAN;
      Constants.EtherTokenAddressWAN = this.WAN_CONFIG.MAINNET.EtherTokenAddressWAN;
      Constants.WandxTokenIdWAN = this.WAN_CONFIG.MAINNET.WandxTokenIdWAN;
      Constants.WandxTokenAddressWAN = this.WAN_CONFIG.MAINNET.WandxTokenAddressWAN;
      Constants.WandxTokenDecimalsWAN = this.WAN_CONFIG.MAINNET.WandxTokenDecimalsWAN;
      Constants.OrderBookContractAddressWAN = this.WAN_CONFIG.MAINNET.OrderBookContractAddressWAN;
      Constants.CretaeContractAddressWAN = this.WAN_CONFIG.MAINNET.CretaeContractAddressWAN;
      Constants.protoStorageAddressWAN = this.WAN_CONFIG.MAINNET.protoStorageAddressWAN;
      Constants.TrasfersProxyAddressWAN = this.WAN_CONFIG.MAINNET.TrasfersProxyAddressWAN;
      Constants.BlockExpirationWindowWAN = this.WAN_CONFIG.MAINNET.BlockExpirationWindowWAN;
      Constants.providerwanURL = this.WAN_CONFIG.MAINNET.providerwanURL;
      Constants.chainid = this.WAN_CONFIG.MAINNET.chainid;
      Constants.gaslimit = this.WAN_CONFIG.MAINNET.gaslimit;
      //  }
    }
  }

  configureAion() {
    if (this.store.get("network") === "TESTNET") {
      console.log("configure TESTNETAION", this.AION_CONFIG.TESTNET);
      //if (this.WAN_CONFIG && this.AION_CONFIG.TESTNET) {
      Constants.OrderBookContractAddressAION = this.AION_CONFIG.TESTNET.OrderBookContractAddressAION;
      Constants.TrasfersProxyaionAddress = this.AION_CONFIG.TESTNET.TrasfersProxyaionAddress;
      Constants.EtherTokenaionAddress = this.AION_CONFIG.TESTNET.EtherTokenaionAddress;
      Constants.VBPExchageAddress = this.AION_CONFIG.TESTNET.VBPExchageAddress;
      Constants.ServiceURLAION = this.AION_CONFIG.TESTNET.ServiceURLAION;
      Constants.AionbasketURL = this.AION_CONFIG.TESTNET.AionbasketURL;
      Constants.GNTTokenaddress = this.AION_CONFIG.TESTNET.GNTTokenaddress;
      Constants.ZRXTokenaddress = this.AION_CONFIG.TESTNET.ZRXTokenaddress;
      Constants.QTUMTokenaddress = this.AION_CONFIG.TESTNET.QTUMTokenaddress;
      Constants.sandTokenaddress = this.AION_CONFIG.TESTNET.sandTokenaddress;
      Constants.powrTokenAddress = this.AION_CONFIG.TESTNET.powrTokenAddress;
      Constants.wandTokenAddress = this.AION_CONFIG.TESTNET.wandTokenAddress;
      Constants.WandxTokenAddressAION = this.AION_CONFIG.TESTNET.WandxTokenAddressAION;
      Constants.providerURL = this.AION_CONFIG.TESTNET.providerURL;
      // }
    } else {
      console.log("configure MAINNETAION");
      // if (this.WAN_CONFIG && this.AION_CONFIG.MAINNET) {
      Constants.OrderBookContractAddressAION = this.AION_CONFIG.MAINNET.OrderBookContractAddressAION;
      Constants.TrasfersProxyaionAddress = this.AION_CONFIG.MAINNET.TrasfersProxyaionAddress;
      Constants.EtherTokenaionAddress = this.AION_CONFIG.MAINNET.EtherTokenaionAddress;
      Constants.VBPExchageAddress = this.AION_CONFIG.MAINNET.VBPExchageAddress;
      Constants.ServiceURLAION = this.AION_CONFIG.MAINNET.ServiceURLAION;
      Constants.AionbasketURL = this.AION_CONFIG.MAINNET.AionbasketURL;
      Constants.GNTTokenaddress = ""; //this.AION_CONFIG.MAINNET.GNTTokenaddress
      Constants.ZRXTokenaddress = ""; //this.AION_CONFIG.MAINNET.ZRXTokenaddress
      Constants.QTUMTokenaddress = ""; //this.AION_CONFIG.MAINNET.QTUMTokenaddress
      Constants.sandTokenaddress = ""; //this.AION_CONFIG.MAINNET.sandTokenaddress
      Constants.powrTokenAddress = ""; //this.AION_CONFIG.MAINNET.powrTokenAddress
      Constants.wandTokenAddress = this.AION_CONFIG.MAINNET.wandTokenAddress;
      Constants.WandxTokenAddressAION = this.AION_CONFIG.MAINNET.WandxTokenAddressAION;
      Constants.providerURL = this.AION_CONFIG.MAINNET.providerURL;
      // }
    }
  }

  // configureWan() {
  //   if (this.store.get('network') === 'TESTNET') {
  //     console.log('configure TESTNETWAN');
  //    // if (this.WAN_CONFIG && this.WAN_CONFIG.TESTNET) {
  //       Constants.BashketURLWAN = 'https://basketwantest.wandx.co/basket/api/portfolio/findPortfolio'//'http://18.216.117.215:3000/api/portfolio/findPortfolio'//this.WAN_CONFIG.TESTNET.BashketURLWAN;
  //       Constants.ServiceURLWAN ='http://ec2-3-16-169-57.us-east-2.compute.amazonaws.com/api/' //this.WAN_CONFIG.TESTNET.ServiceURLWAN;
  //       Constants.TxAppnetURLWAN = 'https://testnet.wanscan.org/tx/'//this.WAN_CONFIG.TESTNET.TxAppnetURLWAN;
  //       Constants.AddressAppnetURLWAN ='https://testnet.wanscan.org/address/' //this.WAN_CONFIG.TESTNET.AddressAppnetURLWAN;
  //       Constants.EthTokenDetailURLWAN = 'https://ropsten.etherscan.io/tokenholdings?a='//this.WAN_CONFIG.TESTNET.EthTokenDetailURLWAN;
  //       Constants.ApiManagementSubscriptionKeyWAN ='c807bf6f64494923862a780a305397a2' //this.WAN_CONFIG.TESTNET.ApiManagementSubscriptionKeyWAN;
  //       Constants.AllowedNetworkWAN = 3//this.WAN_CONFIG.TESTNET.AllowedNetworkWAN;
  //       Constants.WandxExchangeFeeRateWAN =0.00025//this.WAN_CONFIG.TESTNET.WandxExchangeFeeRateWAN;
  //       Constants.EthExchangeFeeRateWAN = 0.001//this.WAN_CONFIG.TESTNET.EthExchangeFeeRateWAN;
  //       Constants.OtherExchageFeeRateWAN =0.0015//this.WAN_CONFIG.TESTNET.OtherExchageFeeRateWAN;
  //       Constants.EtherTokenIdWAN = 7//this.WAN_CONFIG.TESTNET.EtherTokenIdWAN;
  //       Constants.EtherTokenAddressWAN = '0x9e8f2cae092ef2e991cf101329cba5148a81dce9'//this.WAN_CONFIG.TESTNET.EtherTokenAddressWAN;
  //       Constants.WandxTokenIdWAN = 2//this.WAN_CONFIG.TESTNET.WandxTokenIdWAN;
  //       Constants.WandxTokenAddressWAN = '0x9181bf7531faf4f4b488621f1e63dee09e268fe2'//this.WAN_CONFIG.TESTNET.WandxTokenAddressWAN;
  //       Constants.WandxTokenDecimalsWAN = 18//this.WAN_CONFIG.TESTNET.WandxTokenDecimalsWAN;
  //       Constants.OrderBookContractAddressWAN ='0xc93b5f160cfad7199365188e21cfb921563990b3' //this.WAN_CONFIG.TESTNET.OrderBookContractAddressWAN;
  //       Constants.CretaeContractAddressWAN ='0x4437bfb7fa27cd72e7adc2000da35649fd376c01' //this.WAN_CONFIG.TESTNET.CretaeContractAddressWAN;
  //       Constants.protoStorageAddressWAN = '0x11c60465f406b9b67a05a687866c52787f85d51f'//this.WAN_CONFIG.TESTNET.protoStorageAddressWAN;
  //       Constants.TrasfersProxyAddressWAN = '0xbfba523d7561b8e6676ede5066e4127854c7197e'//this.WAN_CONFIG.TESTNET.TrasfersProxyAddressWAN;
  //       Constants.BlockExpirationWindowWAN = 52000//this.WAN_CONFIG.TESTNET.BlockExpirationWindowWAN;
  //       Constants.providerwanURL="https://mywanwallet.nl/testnet"
  //       Constants.chainid=3
  //       Constants.gaslimit=2416780
  //       //    }
  //   } else {
  //     console.log('configure MAINNETWAN');
  //   //  if (this.WAN_CONFIG && this.WAN_CONFIG.MAINNET) {
  //       Constants.BashketURLWAN = "https://wanpburlmain.wandx.co/wanbasket/api/portfolio/findPortfolio"//'http://35.239.13.60:3000/api/portfolio/findPortfolio' //this.WAN_CONFIG.MAINNET.BashketURLWAN;
  //       Constants.ServiceURLWAN = 'https://wansmain.wandx.co/api/'   //'http://ec2-52-14-50-215.us-east-2.compute.amazonaws.com/api/'//this.WAN_CONFIG.MAINNET.ServiceURLWAN;
  //       Constants.TxAppnetURLWAN = 'https://www.wanscan.org/tx/'//this.WAN_CONFIG.MAINNET.TxAppnetURLWAN;
  //       Constants.AddressAppnetURLWAN ='https://www.wanscan.org/address/' //this.WAN_CONFIG.MAINNET.AddressAppnetURLWAN;
  //       Constants.EthTokenDetailURLWAN = 'https://ropsten.etherscan.io/tokenholdings?a='//this.WAN_CONFIG.MAINNET.EthTokenDetailURLWAN;
  //       Constants.ApiManagementSubscriptionKeyWAN = 'c807bf6f64494923862a780a305397a2'//this.WAN_CONFIG.MAINNET.ApiManagementSubscriptionKeyWAN;
  //       Constants.AllowedNetworkWAN = '3'//this.WAN_CONFIG.MAINNET.AllowedNetworkWAN;
  //       Constants.WandxExchangeFeeRateWAN = 0.00025 //this.WAN_CONFIG.MAINNET.WandxExchangeFeeRateWAN;
  //       Constants.EthExchangeFeeRateWAN = 0.001//this.WAN_CONFIG.MAINNET.EthExchangeFeeRateWAN;
  //       Constants.OtherExchageFeeRateWAN = 0.0015//this.WAN_CONFIG.MAINNET.OtherExchageFeeRateWAN;
  //       Constants.EtherTokenIdWAN = 7//this.WAN_CONFIG.MAINNET.EtherTokenIdWAN;
  //       Constants.EtherTokenAddressWAN = '0xdaa968fed3e255c093aa2730c726119cdc275d47'//this.WAN_CONFIG.MAINNET.EtherTokenAddressWAN;
  //       Constants.WandxTokenIdWAN = 2//this.WAN_CONFIG.MAINNET.WandxTokenIdWAN;
  //       Constants.WandxTokenAddressWAN = '0xb247198127ee20e4cd6fe4722b335025004d2b8b'//this.WAN_CONFIG.MAINNET.WandxTokenAddressWAN;
  //       Constants.WandxTokenDecimalsWAN = 18//this.WAN_CONFIG.MAINNET.WandxTokenDecimalsWAN;
  //       Constants.OrderBookContractAddressWAN = '0x29fbdaf7786a75d0b82a25e69108b6361ae634e5'//this.WAN_CONFIG.MAINNET.OrderBookContractAddressWAN;
  //       Constants.CretaeContractAddressWAN = '0x6d89657326c40d05948a200a369ae58b9491dd20'//this.WAN_CONFIG.MAINNET.CretaeContractAddressWAN;
  //       Constants.protoStorageAddressWAN = '0xf1e040ff72ddea8bc66fd9eaa25176d4b6213d5c'//this.WAN_CONFIG.MAINNET.protoStorageAddressWAN;
  //       Constants.TrasfersProxyAddressWAN = '0x32b0620ae6b0ff5ed9f3504ca04581a4b6209cf7'//this.WAN_CONFIG.MAINNET.TrasfersProxyAddressWAN;
  //       Constants.BlockExpirationWindowWAN = 52000//this.WAN_CONFIG.MAINNET.BlockExpirationWindowWAN;
  //       Constants.providerwanURL= 'https://wanpburlmain.wandx.co/wanmainnet/' //'http://35.239.13.60:8545'
  //       Constants.chainid=1
  //       Constants.gaslimit=1200000
  //       //  }
  //   }
  // }

  // configureAion() {
  //   if (this.store.get('network') === 'TESTNET') {
  //     console.log('configure TESTNETAION');
  //     //if (this.WAN_CONFIG && this.AION_CONFIG.TESTNET) {
  //       Constants.OrderBookContractAddressAION ='0xa015BB803706FD50e04bbE52651baBA11667fE9B1fa91cCf79f70DD61f40c716' //this.AION_CONFIG.TESTNET.OrderBookContractAddressAION
  //       Constants.TrasfersProxyaionAddress = '0xa0dB3Aec6247C6Af0d196677547A75Afa834cDa6145C9F097e79a917eAc02980'//this.AION_CONFIG.TESTNET.TrasfersProxyaionAddress
  //       Constants.EtherTokenaionAddress = '0xa0a4091a7e638248DbE0130Cfc30c131548229Ce1b4C316B254c2460d4287843'//this.AION_CONFIG.TESTNET.EtherTokenaionAddress
  //       Constants.VBPExchageAddress = "0xa02857DA377aF85fF41029BFb1C7296A0d144a9D31563c0CeA055Aae88B4B5B0"//0xA084760351b84486BC242B7d37c7f5b98dA4BfF6F8105cADc373b2CCDF789056 this.AION_CONFIG.TESTNET.VBPExchageAddress
  //       Constants.ServiceURLAION = 'http://ec2-3-16-169-57.us-east-2.compute.amazonaws.com:8080/api/'//this.AION_CONFIG.TESTNET.ServiceURLAION
  //       Constants.AionbasketURL = 'https://chaion.wandx.co/basket/api/portfolio/findPortfolio'//'http://ec2-52-15-173-92.us-east-2.compute.amazonaws.com:4000/api/portfolio/findPortfolio'//this.AION_CONFIG.TESTNET.AionbasketURL
  //       Constants.GNTTokenaddress = '0xA045B62E942528F6237D100a4A61fc605F87E9c6dcc5A444aEC6A3Dd4303af5a'//this.AION_CONFIG.TESTNET.GNTTokenaddress
  //       Constants.ZRXTokenaddress = '0xA062f3aAF84eBc32084f7543A6c13f9553948868bC742dd47A13789D9d196975'//this.AION_CONFIG.TESTNET.ZRXTokenaddress
  //       Constants.QTUMTokenaddress ='0xa0dE5F29288E2D98BbAc5b4B42656efC61BdD158CA4BcBb35F70D7d3e90419F9' //this.AION_CONFIG.TESTNET.QTUMTokenaddress
  //       Constants.sandTokenaddress ='0xA050643dF89C272B6e9E46cba62226E24b422FA2A9B1C725c65e60644e332Fe4' //this.AION_CONFIG.TESTNET.sandTokenaddress
  //       Constants.powrTokenAddress ='0xa0ade465e3a26c991659b832d7256EB0FBb695C90e71c55A85652D9814f4408b' //this.AION_CONFIG.TESTNET.powrTokenAddress
  //       Constants.wandTokenAddress ='0xa022abF9Eafa13841Df61Ff2bD5cABCE68f5AbdBE623128828267C0Cc6451CDb' //this.AION_CONFIG.TESTNET.wandTokenAddress
  //       Constants.WandxTokenAddressAION ='0xa022abF9Eafa13841Df61Ff2bD5cABCE68f5AbdBE623128828267C0Cc6451CDb'//this.AION_CONFIG.TESTNET.WandxTokenAddressAION
  //       Constants.providerURL = 'https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=5aabe7dd4071419d92e99f19a1e5b5db' //this.AION_CONFIG.TESTNET.providerURL
  //    // }
  //   } else {
  //     console.log('configure MAINNETAION');
  //    // if (this.WAN_CONFIG && this.AION_CONFIG.MAINNET) {
  //       Constants.OrderBookContractAddressAION = '0xA0f81F72B78197ebe298e2FDd3A1E224F80a4B902D6F6a57E80e4a322E5Db1D1'//this.AION_CONFIG.MAINNET.OrderBookContractAddressAION
  //       Constants.TrasfersProxyaionAddress = '0xa0B75b3DFFE8d4F0E3C5D07f31437E939040593230D6658cAe57b2a0fD2Aa803'//this.AION_CONFIG.MAINNET.TrasfersProxyaionAddress
  //       Constants.EtherTokenaionAddress = '0xa062913C81a71b819E3f8B453Ba65584439c5629A8FF6C34d1A28281fFeE26FD'//this.AION_CONFIG.MAINNET.EtherTokenaionAddress
  //       Constants.VBPExchageAddress = '0xa0C0D2Ce127AAd2D35abf8ABf643B40cBE125AcE76EA65b6d8F1e882C51e3633'//this.AION_CONFIG.MAINNET.VBPExchageAddress
  //       Constants.ServiceURLAION = 'https://aionsmain.wandx.co/api/'//'http://ec2-52-14-50-215.us-east-2.compute.amazonaws.com:8080/api/'//this.AION_CONFIG.MAINNET.ServiceURLAION
  //       Constants.AionbasketURL = 'https://wanpburlmain.wandx.co/aionbasket/api/portfolio/findPortfolio' //'http://35.239.13.60:4000/api/portfolio/findPortfolio'//this.AION_CONFIG.MAINNET.AionbasketURL
  //       Constants.GNTTokenaddress = ""//this.AION_CONFIG.MAINNET.GNTTokenaddress
  //       Constants.ZRXTokenaddress = ""//this.AION_CONFIG.MAINNET.ZRXTokenaddress
  //       Constants.QTUMTokenaddress = ""//this.AION_CONFIG.MAINNET.QTUMTokenaddress
  //       Constants.sandTokenaddress = ""//this.AION_CONFIG.MAINNET.sandTokenaddress
  //       Constants.powrTokenAddress = ""//this.AION_CONFIG.MAINNET.powrTokenAddress
  //       Constants.wandTokenAddress = '0xa081848bA2854CB906D9C14892cB0f8d08DA46b57CD44E47e6cb273e9a4685A1' //this.AION_CONFIG.MAINNET.wandTokenAddress
  //       Constants.WandxTokenAddressAION = '0xa081848bA2854CB906D9C14892cB0f8d08DA46b57CD44E47e6cb273e9a4685A1'//this.AION_CONFIG.MAINNET.WandxTokenAddressAION
  //       Constants.providerURL = 'https://aion.api.nodesmith.io/v1/mainnet/jsonrpc?apiKey=5aabe7dd4071419d92e99f19a1e5b5db'//this.AION_CONFIG.MAINNET.providerURL
  //    // }
  //   }
  // }
}
// import {Injectable} from '@angular/core';
// import {Constants} from '../models/constants';
// import {NeotokenService} from './neotoken.service';
// import {Http, RequestOptions, Headers} from '@angular/http';
// let server_config = require('../../../config/server-config.json');
// const Store = window.require('electron-store');
// declare var window: any;

// @Injectable()
// export class ConfigService {
//   public store = new Store();
//   private NEO_CONFIG: any;
//   private ETH_CONFIG: any;
//   private WAN_CONFIG : any;
//   private AION_CONFIG : any;

//   constructor(private neotokenService: NeotokenService, private http: Http) {
//     console.log('NETWORK', this.store.get('network'));
//     console.log('BLOCKCHAIN', this.store.get('blockchain'));
//     // console.log(server_config)

//   }

//   getSettings() {
//     return new Promise((resolve, reject) => {
//       this.http.get('https://s3.us-east-2.amazonaws.com/wandxdesktopappconfig/config.json').subscribe(
//         res => {
//           //  var d = res.json();
//           var d = server_config;
//           // console.log(res.json(),"server_config ",server_config);
//           this.NEO_CONFIG = d.desktopConfig.blockchain['NEO'];
//           this.ETH_CONFIG = d.desktopConfig.blockchain['ETH'];
//           this.WAN_CONFIG = d.desktopConfig.blockchain['WAN'];
//           this.AION_CONFIG = d.desktopConfig.blockchain['AION'];
//           this.configureETH();
//           this.configureNeo();
//           this.configureWan();
//           this.configureAion();
//           resolve({data: d});
//         },
//         err => {
//           reject(err);
//         }
//       );
//     });
//   }

//   configureNeo() {
//     if (this.store.get('network') === 'TESTNET') {
//       console.log('configure TESTNETNEO');
//       Constants.RPC_URL = this.NEO_CONFIG.TESTNET.NEO_TESTNET_RPC_URL;
//       Constants.NEOSCAN_URL = this.NEO_CONFIG.TESTNET.NEOSCAN_URL;
//       Constants.contractScriptHash = this.NEO_CONFIG.TESTNET.contractScriptHash;
//       Constants.NEO_SERVER_URL = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_TESTNET;
//       Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_STAKE_TESTNET;
//       Constants.NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_ASSET_ID;
//       Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_GAS_ASSET_ID;
//       Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.WAND_NEO_ASSET_ID;
//       this.neotokenService.setNeonTokenList(this.NEO_CONFIG.TESTNET.tokens);
//     } else if (this.store.get('network') === 'PRIVATENET') {
//       console.log('configure PRIVATENET');
//       Constants.RPC_URL = this.NEO_CONFIG.PRIVATENET.NEO_TESTNET_RPC_URL;
//       Constants.NEOSCAN_URL = this.NEO_CONFIG.PRIVATENET.NEOSCAN_URL;
//       Constants.contractScriptHash = this.NEO_CONFIG.PRIVATENET.contractScriptHash;
//       Constants.NEO_SERVER_URL = this.NEO_CONFIG.PRIVATENET.NEO_SERVER_URL_TESTNET;
//       Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.PRIVATENET.NEO_SERVER_URL_STAKE_TESTNET;
//       Constants.NEO_ASSET_ID = this.NEO_CONFIG.PRIVATENET.NEO_ASSET_ID;
//       Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.PRIVATENET.NEO_GAS_ASSET_ID;
//       Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.PRIVATENET.WAND_NEO_ASSET_ID;
//       this.neotokenService.setNeonTokenList(this.NEO_CONFIG.PRIVATENET.tokens);
//     } else {
//       console.log('configure MAINNET');
//       //since don't have neo main net have to config with test net in future will chainge it into main net
//       Constants.RPC_URL = this.NEO_CONFIG.TESTNET.NEO_TESTNET_RPC_URL;
//       Constants.NEOSCAN_URL = this.NEO_CONFIG.TESTNET.NEOSCAN_URL;
//       Constants.contractScriptHash = this.NEO_CONFIG.TESTNET.contractScriptHash;
//       Constants.NEO_SERVER_URL = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_TESTNET;
//       Constants.NEO_SERVER_URL_STAKE = this.NEO_CONFIG.TESTNET.NEO_SERVER_URL_STAKE_TESTNET;
//       Constants.NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_ASSET_ID;
//       Constants.NEO_GAS_ASSET_ID = this.NEO_CONFIG.TESTNET.NEO_GAS_ASSET_ID;
//       Constants.WAND_NEO_ASSET_ID = this.NEO_CONFIG.TESTNET.WAND_NEO_ASSET_ID;
//       this.neotokenService.setNeonTokenList(this.NEO_CONFIG.TESTNET.tokens);
//     }
//   }

//   configureETH() {
//     if (this.store.get('network') === 'TESTNET' || this.store.get('network') === 'PRIVATENET') {
//       console.log('configure TESTNETETH');
//       Constants.TokenVault = this.ETH_CONFIG.TESTNET.TokenVault;
//       Constants.TokenHistoryUrl = this.ETH_CONFIG.TESTNET.TokenHistoryUrl;
//       Constants.ServiceURL = this.ETH_CONFIG.TESTNET.ServiceURL;
//       Constants.CryptoCompareUrl = this.ETH_CONFIG.TESTNET.CryptoCompareUrl;
//       Constants.WandxCompareUrl = this.ETH_CONFIG.TESTNET.WandxCompareUrl;
//       Constants.ThemedBasketRequest = this.ETH_CONFIG.TESTNET.ThemedBasketRequest;
//       Constants.BashketURL = this.ETH_CONFIG.TESTNET.BashketURL;
//       Constants.TxAppnetURL = this.ETH_CONFIG.TESTNET.TxAppnetURL;
//       Constants.AddressAppnetURL = this.ETH_CONFIG.TESTNET.AddressAppnetURL;
//       Constants.EthTokenDetailURL = this.ETH_CONFIG.TESTNET.EthTokenDetailURL;
//       Constants.ApiManagementSubscriptionKey = this.ETH_CONFIG.TESTNET.ApiManagementSubscriptionKey;
//       Constants.AllowedNetwork = this.ETH_CONFIG.TESTNET.AllowedNetwork;
//       Constants.WandxExchangeFeeRate = this.ETH_CONFIG.TESTNET.WandxExchangeFeeRate;
//       Constants.EthExchangeFeeRate = this.ETH_CONFIG.TESTNET.EthExchangeFeeRate;
//       Constants.OtherExchageFeeRate = this.ETH_CONFIG.TESTNET.OtherExchageFeeRate;
//       Constants.EtherTokenId = this.ETH_CONFIG.TESTNET.EtherTokenId;
//       Constants.EtherTokenAddress = this.ETH_CONFIG.TESTNET.EtherTokenAddress;
//       Constants.WandxTokenId = this.ETH_CONFIG.TESTNET.WandxTokenId;
//       Constants.WandxTokenAddress = this.ETH_CONFIG.TESTNET.WandxTokenAddress;
//       Constants.WandxTokenDecimals = this.ETH_CONFIG.TESTNET.WandxTokenDecimals;
//       Constants.OrderBookContractAddress = this.ETH_CONFIG.TESTNET.OrderBookContractAddress;
//       Constants.CretaeContractAddress = this.ETH_CONFIG.TESTNET.CretaeContractAddress;
//       Constants.protoStorageAddress = this.ETH_CONFIG.TESTNET.protoStorageAddress;
//       Constants.TrasfersProxyAddress = this.ETH_CONFIG.TESTNET.TrasfersProxyAddress;
//       Constants.BlockExpirationWindow = this.ETH_CONFIG.TESTNET.BlockExpirationWindow;
//     } else {
//       console.log('configure MAINNETETH');
//       Constants.TokenVault = this.ETH_CONFIG.MAINNET.TokenVault;
//       Constants.TokenHistoryUrl = this.ETH_CONFIG.MAINNET.TokenHistoryUrl;
//       Constants.ServiceURL = this.ETH_CONFIG.MAINNET.ServiceURL;
//       Constants.CryptoCompareUrl = this.ETH_CONFIG.MAINNET.CryptoCompareUrl;
//       Constants.WandxCompareUrl = this.ETH_CONFIG.MAINNET.WandxCompareUrl;
//       Constants.ThemedBasketRequest = this.ETH_CONFIG.MAINNET.ThemedBasketRequest;
//       Constants.BashketURL = this.ETH_CONFIG.MAINNET.BashketURL;
//       Constants.TxAppnetURL = this.ETH_CONFIG.MAINNET.TxAppnetURL;
//       Constants.AddressAppnetURL = this.ETH_CONFIG.MAINNET.AddressAppnetURL;
//       Constants.EthTokenDetailURL = this.ETH_CONFIG.MAINNET.EthTokenDetailURL;
//       Constants.ApiManagementSubscriptionKey = this.ETH_CONFIG.MAINNET.ApiManagementSubscriptionKey;
//       Constants.AllowedNetwork = this.ETH_CONFIG.MAINNET.AllowedNetwork;
//       Constants.WandxExchangeFeeRate = this.ETH_CONFIG.MAINNET.WandxExchangeFeeRate;
//       Constants.EthExchangeFeeRate = this.ETH_CONFIG.MAINNET.EthExchangeFeeRate;
//       Constants.OtherExchageFeeRate = this.ETH_CONFIG.MAINNET.OtherExchageFeeRate;
//       Constants.EtherTokenId = this.ETH_CONFIG.MAINNET.EtherTokenId;
//       Constants.EtherTokenAddress = this.ETH_CONFIG.MAINNET.EtherTokenAddress;
//       Constants.WandxTokenId = this.ETH_CONFIG.MAINNET.WandxTokenId;
//       Constants.WandxTokenAddress = this.ETH_CONFIG.MAINNET.WandxTokenAddress;
//       Constants.WandxTokenDecimals = this.ETH_CONFIG.MAINNET.WandxTokenDecimals;
//       Constants.OrderBookContractAddress = this.ETH_CONFIG.MAINNET.OrderBookContractAddress;
//       Constants.CretaeContractAddress = this.ETH_CONFIG.MAINNET.CretaeContractAddress;
//       Constants.protoStorageAddress = this.ETH_CONFIG.MAINNET.protoStorageAddress;
//       Constants.TrasfersProxyAddress = this.ETH_CONFIG.MAINNET.TrasfersProxyAddress;
//       Constants.BlockExpirationWindow = this.ETH_CONFIG.MAINNET.BlockExpirationWindow;
//     }
//   }

//   configureWan() {
//     if (this.store.get('network') === 'TESTNET') {
//       console.log('configure TESTNETWAN');
//       if (this.WAN_CONFIG && this.WAN_CONFIG.TESTNET) {
//         Constants.BashketURLWAN = this.WAN_CONFIG.TESTNET.BashketURLWAN;
//         Constants.ServiceURLWAN = this.WAN_CONFIG.TESTNET.ServiceURLWAN;
//         Constants.TxAppnetURLWAN = this.WAN_CONFIG.TESTNET.TxAppnetURLWAN;
//         Constants.AddressAppnetURLWAN = this.WAN_CONFIG.TESTNET.AddressAppnetURLWAN;
//         Constants.EthTokenDetailURLWAN = this.WAN_CONFIG.TESTNET.EthTokenDetailURLWAN;
//         Constants.ApiManagementSubscriptionKeyWAN = this.WAN_CONFIG.TESTNET.ApiManagementSubscriptionKeyWAN;
//         Constants.AllowedNetworkWAN = this.WAN_CONFIG.TESTNET.AllowedNetworkWAN;
//         Constants.WandxExchangeFeeRateWAN = this.WAN_CONFIG.TESTNET.WandxExchangeFeeRateWAN;
//         Constants.EthExchangeFeeRateWAN = this.WAN_CONFIG.TESTNET.EthExchangeFeeRateWAN;
//         Constants.OtherExchageFeeRateWAN = this.WAN_CONFIG.TESTNET.OtherExchageFeeRateWAN;
//         Constants.EtherTokenIdWAN = this.WAN_CONFIG.TESTNET.EtherTokenIdWAN;
//         Constants.EtherTokenAddressWAN = this.WAN_CONFIG.TESTNET.EtherTokenAddressWAN;
//         Constants.WandxTokenIdWAN = this.WAN_CONFIG.TESTNET.WandxTokenIdWAN;
//         Constants.WandxTokenAddressWAN = this.WAN_CONFIG.TESTNET.WandxTokenAddressWAN;
//         Constants.WandxTokenDecimalsWAN = this.WAN_CONFIG.TESTNET.WandxTokenDecimalsWAN;
//         Constants.OrderBookContractAddressWAN = this.WAN_CONFIG.TESTNET.OrderBookContractAddressWAN;
//         Constants.CretaeContractAddressWAN = this.WAN_CONFIG.TESTNET.CretaeContractAddressWAN;
//         Constants.protoStorageAddressWAN = this.WAN_CONFIG.TESTNET.protoStorageAddressWAN;
//         Constants.TrasfersProxyAddressWAN = this.WAN_CONFIG.TESTNET.TrasfersProxyAddressWAN;
//         Constants.BlockExpirationWindowWAN = this.WAN_CONFIG.TESTNET.BlockExpirationWindowWAN;
//       }
//     } else {
//       console.log('configure MAINNETWAN');
//       if (this.WAN_CONFIG && this.WAN_CONFIG.MAINNET) {
//         Constants.BashketURLWAN = this.WAN_CONFIG.MAINNET.BashketURLWAN;
//         Constants.ServiceURLWAN = this.WAN_CONFIG.MAINNET.ServiceURLWAN;
//         Constants.TxAppnetURLWAN = this.WAN_CONFIG.MAINNET.TxAppnetURLWAN;
//         Constants.AddressAppnetURLWAN = this.WAN_CONFIG.MAINNET.AddressAppnetURLWAN;
//         Constants.EthTokenDetailURLWAN = this.WAN_CONFIG.MAINNET.EthTokenDetailURLWAN;
//         Constants.ApiManagementSubscriptionKeyWAN = this.WAN_CONFIG.MAINNET.ApiManagementSubscriptionKeyWAN;
//         Constants.AllowedNetworkWAN = this.WAN_CONFIG.MAINNET.AllowedNetworkWAN;
//         Constants.WandxExchangeFeeRateWAN = this.WAN_CONFIG.MAINNET.WandxExchangeFeeRateWAN;
//         Constants.EthExchangeFeeRateWAN = this.WAN_CONFIG.MAINNET.EthExchangeFeeRateWAN;
//         Constants.OtherExchageFeeRateWAN = this.WAN_CONFIG.MAINNET.OtherExchageFeeRateWAN;
//         Constants.EtherTokenIdWAN = this.WAN_CONFIG.MAINNET.EtherTokenIdWAN;
//         Constants.EtherTokenAddressWAN = this.WAN_CONFIG.MAINNET.EtherTokenAddressWAN;
//         Constants.WandxTokenIdWAN = this.WAN_CONFIG.MAINNET.WandxTokenIdWAN;
//         Constants.WandxTokenAddressWAN = this.WAN_CONFIG.MAINNET.WandxTokenAddressWAN;
//         Constants.WandxTokenDecimalsWAN = this.WAN_CONFIG.MAINNET.WandxTokenDecimalsWAN;
//         Constants.OrderBookContractAddressWAN = this.WAN_CONFIG.MAINNET.OrderBookContractAddressWAN;
//         Constants.CretaeContractAddressWAN = this.WAN_CONFIG.MAINNET.CretaeContractAddressWAN;
//         Constants.protoStorageAddressWAN = this.WAN_CONFIG.MAINNET.protoStorageAddressWAN;
//         Constants.TrasfersProxyAddressWAN = this.WAN_CONFIG.MAINNET.TrasfersProxyAddressWAN;
//         Constants.BlockExpirationWindowWAN = this.WAN_CONFIG.MAINNET.BlockExpirationWindowWAN;
//       }
//     }
//   }

//   configureAion() {
//     if (this.store.get('network') === 'TESTNET') {
//       console.log('configure TESTNETAION');
//       if (this.WAN_CONFIG && this.AION_CONFIG.TESTNET) {
//         Constants.OrderBookContractAddressAION = this.AION_CONFIG.TESTNET.OrderBookContractAddressAION
//         Constants.TrasfersProxyaionAddress = this.AION_CONFIG.TESTNET.TrasfersProxyaionAddress
//         Constants.EtherTokenaionAddress = this.AION_CONFIG.TESTNET.EtherTokenaionAddress
//         Constants.VBPExchageAddress = this.AION_CONFIG.TESTNET.VBPExchageAddress
//         Constants.ServiceURLAION = this.AION_CONFIG.TESTNET.ServiceURLAION
//         Constants.AionbasketURL = this.AION_CONFIG.TESTNET.AionbasketURL
//         Constants.GNTTokenaddress = this.AION_CONFIG.TESTNET.GNTTokenaddress
//         Constants.ZRXTokenaddress = this.AION_CONFIG.TESTNET.ZRXTokenaddress
//         Constants.QTUMTokenaddress = this.AION_CONFIG.TESTNET.QTUMTokenaddress
//         Constants.sandTokenaddress = this.AION_CONFIG.TESTNET.sandTokenaddress
//         Constants.powrTokenAddress = this.AION_CONFIG.TESTNET.powrTokenAddress
//         Constants.wandTokenAddress = this.AION_CONFIG.TESTNET.wandTokenAddress
//         Constants.WandxTokenAddressAION = this.AION_CONFIG.TESTNET.WandxTokenAddressAION
//         Constants.providerURL = this.AION_CONFIG.TESTNET.providerURL
//       }
//     } else {
//       console.log('configure MAINNETAION');
//       if (this.WAN_CONFIG && this.AION_CONFIG.MAINNET) {
//         Constants.OrderBookContractAddressAION = this.AION_CONFIG.MAINNET.OrderBookContractAddressAION
//         Constants.TrasfersProxyaionAddress = this.AION_CONFIG.MAINNET.TrasfersProxyaionAddress
//         Constants.EtherTokenaionAddress = this.AION_CONFIG.MAINNET.EtherTokenaionAddress
//         Constants.VBPExchageAddress = this.AION_CONFIG.MAINNET.VBPExchageAddress
//         Constants.ServiceURLAION = this.AION_CONFIG.MAINNET.ServiceURLAION
//         Constants.AionbasketURL = this.AION_CONFIG.MAINNET.AionbasketURL
//         Constants.GNTTokenaddress = this.AION_CONFIG.MAINNET.GNTTokenaddress
//         Constants.ZRXTokenaddress = this.AION_CONFIG.MAINNET.ZRXTokenaddress
//         Constants.QTUMTokenaddress = this.AION_CONFIG.MAINNET.QTUMTokenaddress
//         Constants.sandTokenaddress = this.AION_CONFIG.MAINNET.sandTokenaddress
//         Constants.powrTokenAddress = this.AION_CONFIG.MAINNET.powrTokenAddress
//         Constants.wandTokenAddress = this.AION_CONFIG.MAINNET.wandTokenAddress
//         Constants.WandxTokenAddressAION = this.AION_CONFIG.MAINNET.WandxTokenAddressAION
//         Constants.providerURL = this.AION_CONFIG.MAINNET.providerURL
//       }
//     }
//   }
// }
