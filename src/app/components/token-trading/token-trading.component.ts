import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { MarketBroadcastService } from '../../services/market-broadcast.service';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { CustomWalletService } from '../../services/custom-wallet.service';

import { NotificationManagerService } from '../../services/notification-manager.service';
import { MessageContentType, MessageModel, MessageType } from '../../models/message.model';
import { CORS } from '../../services/cors.service';
import { UniswapServiceService } from '../../services/uniswap-service.service';
import { ZrxServiceService } from '../../services/0x-service.service';

import { tokensData } from "../../artifacts/tokensData";
import { buyToken, sellToken } from "../../artifacts/tokenTemplate";

import { erc20Artifact } from '../../artifacts/erc20';
import { ExchangeArtifact } from '../../artifacts/exchange';

import * as BigNumber from '../../../assets/newBigNumber.js';
let base = BigNumber(10);

var Tx = require('ethereumjs-tx');

@Component({
  selector: 'app-token-trading',
  templateUrl: './token-trading.component.html',
  styleUrls: ['./token-trading.component.css']
})
export class TokenTradingComponent implements OnInit {
  
  public selectedExchange: any = "";
  public selectedWallet : any = "";
  private marketBroadcastServiceSub : any;
  private savedWalletsServiceSub : any;

  account: string;

  configSell = {
    search: true,
    placeholder: "Input Token:",
    noResultsFound: "No results found!",
    searchPlaceholder: "Search...",
  }

  configBuy = {
    search: true,
    placeholder: "Output Token:",
    noResultsFound: "No results found!",
    searchPlaceholder: "Search..."
  }

  web3Instance: any;
  tokenContract: any;

  tokensAvailable: any[] = [];  // Store database of all tokens that could be swapped
  sell_token: sellToken;        // Details of token to be sold
  buy_token: buyToken;   // Details of tokens to be bought
  txnHashes: string[] = [];     // Store transaction hashes that can be viewed on Etherscan

  isDisplayCheckRate = false;

  numTokensCheckedBancor = 0;
  numTokensCheckedKyber = 0;
  numTokensCheckedUniswap = 0;
  numTokensChecked0xRelayer = 0;
  bancorFailed = false;
  kyberFailed = false;
  uniswapFailed = false;
  zrxRelayerFailed = false;
  numTradesPrepared = 0;
  startTradePrep = false;
  tradesFailed = false;
  ethBalance:String = "";
  isSelected:boolean = false;
  displayGif:String = "none";

  constructor(
    private marketBroadcastService: MarketBroadcastService,
    private savedWalletsService: SavedWalletsService,
    private zone : NgZone,
    private web3: Web3Service,
    private wallet: CustomWalletService,
    private notificationManagerService: NotificationManagerService,
    private uniswapService: UniswapServiceService,
    private zrxService: ZrxServiceService
  ) {
    for(let k in tokensData.ethereumTokens)
      this.tokensAvailable.push(k);
    this.tokensAvailable.sort();
  }

  ngOnInit() {

    this.web3.initialize();
    this.web3Instance = this.web3.getWeb3();
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.selectedWallet = this.savedWalletsService.getCurrentWallet();
        this.wallet.setWallet(this.selectedWallet);
        this.web3.setDefaultAccount();
        this.account = [this.selectedWallet.address][0];
        setTimeout(()=>this.setEthBalance(),2000);
      }
    });

    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'exchangeWillChange')
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange();
    });

    this.sell_token = new sellToken();
    this.buy_token = new buyToken();
  }

  setEthBalance() {
    let foo = this;
    foo.isSelected = false;
    foo.web3Instance.eth.getBalance(foo.account, (err, res) => {
      if(res)
      foo.ethBalance = (BigNumber(res).dividedBy(base.pow(18))).toFixed(4);
    });
  }

  ngOnDestroy(): void {
    if(this.marketBroadcastServiceSub)
      this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();
  }

  // Refresh available balance
  refreshBalance() {
    var foo = this;
    if(foo.sell_token.symbol === 'ETH') {
      foo.web3Instance.eth.getBalance(foo.account, (err, res) => {
        foo.sell_token.balance = (BigNumber(res).dividedBy(base.pow(18))).toJSON();
        foo.isDisplayCheckRateButton(false);
      });
    } else {
      foo.tokenContract = foo.web3Instance.eth.contract(erc20Artifact.contractAbi).at(foo.sell_token.address);
      foo.tokenContract.balanceOf(foo.account, (err, res) => {
        foo.sell_token.balance = (BigNumber(res).dividedBy(base.pow(foo.sell_token.decimals))).toJSON();
        foo.isDisplayCheckRateButton(false);
      });
    }
  }

  // Set the details token to be sold
  setSellToken(e) {
    this.isSelected = true;
    var symbol=e.target.value.split(":", 2)
    console.log('setselltoken',String(symbol[1]).replace(/\s/g, ""),tokensData.ethereumTokens[String(symbol[1]).replace(/\s/g, "")]);
    var data = String(symbol[1]).replace(/\s/g, "");
    this.sell_token.balance = undefined;
    if(symbol[1] !== undefined) {
      this.sell_token.symbol = data;
      this.sell_token.address = tokensData.ethereumTokens[data].address;
      this.sell_token.decimals = tokensData.ethereumTokens[data].decimals;
      this.setInitialValues();
      this.refreshBalance();
    }
  }

  // Set the amount of tokens to be sold
  setSellValue(e) {
    console.log(e);
    
    this.sell_token.value = e.target.value;
    this.setInitialValues();
    this.isDisplayCheckRateButton(false);
  }

  // Add details of new token to be bought
  setBuyToken(e) {
    var symbol=e.target.value.split(":", 2)
    console.log('setBuyToken',String(symbol[1]).replace(/\s/g, ""),tokensData.ethereumTokens[String(symbol[1]).replace(/\s/g, "")]);
    var data = String(symbol[1]).replace(/\s/g, "");
    if(symbol[1] !== undefined) {
      this.buy_token.symbol = data;
      this.buy_token.address = tokensData.ethereumTokens[data].address;
      this.buy_token.decimals = tokensData.ethereumTokens[data].decimals;
      this.setInitialValues();
      this.isDisplayCheckRateButton(false);
    }
  }

  // Set default values of global variables
  setInitialValues() {
    this.numTokensCheckedBancor = 0;
    this.numTokensCheckedKyber = 0;
    this.buy_token.kyber_address = '0';
    this.sell_token.kyber_address = '0';
    this.numTokensCheckedUniswap = 0;
    this.numTokensChecked0xRelayer = 0;
    this.numTradesPrepared = 0;
    this.bancorFailed = false;
    this.kyberFailed = false;
    this.uniswapFailed = false;
    this.zrxRelayerFailed = false;
    this.startTradePrep = false;
    this.tradesFailed = false;
    this.txnHashes = [];
  }

  // Decide whether to display 'Check Rate' button
  isDisplayCheckRateButton(canNotify) {
    const sell_token = this.sell_token.symbol;
    const sell_value = this.sell_token.value;
    const buy_token = this.buy_token.symbol;
    const balance = this.sell_token.balance;
    if(sell_token === '' || sell_token === undefined || balance === undefined || buy_token === '' || buy_token === undefined || sell_value === undefined || sell_value == 0 || isNaN(sell_value) || sell_token === buy_token)
      this.isDisplayCheckRate = false;
    else if(sell_value < 0) {
      this.isDisplayCheckRate = false;
    }
    else if(BigNumber(sell_value).isGreaterThan(BigNumber(balance))) {
      this.isDisplayCheckRate = false;
      if(canNotify)
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'You Don\'t have enough '+sell_token+' balance'), MessageContentType.Text);
    }
    else
      this.isDisplayCheckRate = true;
  }

  // Check the return offered on the swap by different exchanges
  checkBuyVal() {
    this.setInitialValues();
    this.isDisplayCheckRateButton(true);
    if(!this.isDisplayCheckRate)
      return;

    this.buy_token.bancor_value = '0';
    this.buy_token.kyber_value = '0';
    this.buy_token.uniswap_value = '0';
    this.buy_token.relayer0x_value = '0';
    this.buy_token.trade_data = null;
    // this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Checking exchange rates on Bancor, Kyber, Uniswap and 0x ...'), MessageContentType.Text);
    this.gifLoaderChange();
    this.checkBancor(this.sell_token.symbol, this.sell_token.value, this.buy_token.symbol);
    this.checkKyber(this.sell_token.symbol, this.sell_token.value, this.buy_token.symbol);
    this.checkUniswap(this.sell_token.address, this.sell_token.value, this.buy_token.address);
    this.check0xRelayer(this.sell_token, this.buy_token);
  }

  // Check tokens received on Bancor
  checkBancor(sell_token: string, sell_value: number, buy_token: string) {
    var foo = this;
    var base_url = 'https://api.bancor.network/0.1/';
    var currency_url = base_url + 'currencies/tokens?limit=140&skip=0&fromCurrencyCode=ETH&includeTotal=false&orderBy=code&sortOrder=asc';
    // Check if the currencies can be exchnaged on Bancor
    CORS.doCORSRequest({ method: 'GET', url: currency_url, data: '' }, function result(status, response) {
      response = (status == 200)? (JSON.parse(response)): response;
      if(status != 200) {
        foo.bancorCheckFail(response);
        return;
      }
      for(var i = 0; i < response['data']['page'].length; i++) {
        if(response['data']['page'][i]['code'] === buy_token)
          foo.buy_token.bancor_id = response['data']['page'][i]['id'];
        if(response['data']['page'][i]['code'] === sell_token)
          foo.sell_token.bancor_id = response['data']['page'][i]['id'];
      }
      // Calculate the new tokens received on selling the given tokens
      var sell_url = base_url+'currencies/'+sell_token+'/ticker?fromCurrencyCode=ETH&displayCurrencyCode=ETH';
      CORS.doCORSRequest({ method: 'GET', url: sell_url, data: '' }, function result(status, response) {
        response = (status == 200)? (JSON.parse(response)): response;
        if(status != 200 || response['errorCode'] != undefined) {
          foo.bancorCheckFail(response);
          return;
        }
        var sell_rate = response['data']['price'];
        var buy_url = base_url+'currencies/'+buy_token+'/ticker?fromCurrencyCode=ETH&displayCurrencyCode=ETH';
        CORS.doCORSRequest({ method: 'GET', url: buy_url, data: '' }, function result(status, response) {
          response = (status == 200)? (JSON.parse(response)): response;
          if(status != 200 || response['errorCode'] != undefined) {
            foo.bancorCheckFail(response);
            return;
          }
          var buy_rate = response['data']['price'];
          var quantity = (sell_rate / buy_rate * sell_value * 0.97).toString();
          foo.buy_token.bancor_value = quantity;
          foo.numTokensCheckedBancor++;
        });
      });
    });
  }

  // Logs the reason for failure while checking transaction on Kyber
  private bancorCheckFail(res: any) {
    this.buy_token.bancor_value = '0'
    console.log('[Error fetching buy rate from Bancor] ', res);
    this.numTokensCheckedBancor++;
    this.bancorFailed = true;
  }

  // Check tokens received on Kyber 
  checkKyber(sell_token: string, sell_value: number, buy_token: string) {
    var foo = this;
    var base_url = 'https://api.kyber.network/';
    var currency_url = base_url + 'currencies/';
    // Check if the currencies can be exchnaged on Kyber
    CORS.doCORSRequest({ method: 'GET', url: currency_url, data: '' }, function result(status, response) {
      response = (status == 200)? (JSON.parse(response)): response;
      if(status != 200) {
        foo.kyberCheckFail(response);
        return;
      }
      for(var i = 0; i < response['data'].length; i++) {
        if(response['data'][i]['symbol'] === buy_token)
          foo.buy_token.kyber_address = response['data'][i]['address'];
        if(response['data'][i]['symbol'] === sell_token)
          foo.sell_token.kyber_address = response['data'][i]['address'];
      }
      // Calculate the new tokens received on selling the given tokens
      var sell_url = base_url + 'sell_rate/?id=' + foo.sell_token.kyber_address + '&qty=' + sell_value;
      CORS.doCORSRequest({ method: 'GET', url: sell_url, data: '' }, function result(status, response) {
        response = (status == 200)? (JSON.parse(response)): response;
        if(status != 200 || (response['error'] == true && sell_token !== 'ETH')) {
          foo.kyberCheckFail(response);
          return;
        }
        var eth_available = (sell_token !== 'ETH')? response['data'][0]['dst_qty'][0]: sell_value;
        var buy_url = base_url + 'buy_rate/?id=' + foo.buy_token.kyber_address + '&qty=1';
        CORS.doCORSRequest({ method: 'GET', url: buy_url, data: ''}, function result(status, response) {
          response = (status == 200)? (JSON.parse(response)): response;
          if(status != 200 || (response['error'] == true && buy_token !== 'ETH')) {
            foo.kyberCheckFail(response);
            return;
          }
          var eth_per_token = 1;
          if(buy_token !== 'ETH')
            eth_per_token = response['data'][0]['src_qty'][0];
          var quantity = (eth_available / eth_per_token * 0.97).toString();
          foo.buy_token.kyber_value = quantity;
          foo.numTokensCheckedKyber++;
        });
      });
    });
  }

  // Logs the reason for failure while checking transaction on Kyber
  private kyberCheckFail(res: any) {
    this.buy_token.kyber_value = '0';
    console.log('[Error fetching buy rate from Kyber] ', res);
    this.numTokensCheckedKyber++;
    this.kyberFailed = true;
  }

  // Check tokens received on Uniswap
  checkUniswap(sell_token_address: string, sell_value: number, buy_token_address: string) {
    var foo = this;
    let new_sell_value = '0x' + (BigNumber(sell_value).multipliedBy(base.pow(foo.sell_token.decimals))).toString(16);
    foo.buy_token.uniswap_exchange_artifact = new ExchangeArtifact();
    foo.sell_token.uniswap_exchange_artifact = new ExchangeArtifact();
    foo.buy_token.uniswap_exchange_artifact.contractAbi = ExchangeArtifact.contractAbi;
    foo.sell_token.uniswap_exchange_artifact.contractAbi = ExchangeArtifact.contractAbi;
    console.log(foo.sell_token);
    
    // If ETH is sold to buy ERC20 tokens
    if(sell_token_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      foo.uniswapService.getExchangeAddress(buy_token_address).then(function(res) {
        foo.buy_token.uniswap_exchange_artifact.contractAddress = res;
        if(res === '0x0000000000000000000000000000000000000000') {
          foo.uniswapCheckFail('no exchange exists on Uniswap!');
          return;
        }
        foo.uniswapService.ethToTokenValue(foo.buy_token.uniswap_exchange_artifact, new_sell_value).then(function(res) {
          foo.buy_token.uniswap_value = ((BigNumber(res).multipliedBy(0.97)).dividedBy(base.pow(foo.buy_token.decimals))).toJSON();
          foo.numTokensCheckedUniswap++;
        });
      });
    }
    // If ERC20 token is sold to buy ETH
    else if(buy_token_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      foo.uniswapService.getExchangeAddress(sell_token_address).then(function(res) {
        foo.sell_token.uniswap_exchange_artifact.contractAddress = res;
        if(res === '0x0000000000000000000000000000000000000000') {
          foo.uniswapCheckFail('no exchange exists on Uniswap!');
          return;
        }
        foo.uniswapService.tokenToEthValue(foo.sell_token.uniswap_exchange_artifact, new_sell_value).then(function(res) {
          foo.buy_token.uniswap_value = ((BigNumber(res).multipliedBy(0.97)).dividedBy(base.pow(foo.buy_token.decimals))).toJSON();
          foo.numTokensCheckedUniswap++;
        });
      });
    }
    // If ERC20 token is sold to buy ERC20 token
    else {
      foo.uniswapService.getExchangeAddress(sell_token_address).then(function(res) {
        foo.sell_token.uniswap_exchange_artifact.contractAddress = res;
        if(res === '0x0000000000000000000000000000000000000000') {
          foo.uniswapCheckFail('no exchange exists on Uniswap!');
          return;
        }
        foo.uniswapService.getExchangeAddress(buy_token_address).then(function(res) {
          foo.buy_token.uniswap_exchange_artifact.contractAddress = res;
          if(res === '0x0000000000000000000000000000000000000000') {
            foo.uniswapCheckFail('no exchange exists on Uniswap!');
            return;
          }
          foo.uniswapService.tokenToTokenValues(foo.sell_token.uniswap_exchange_artifact, new_sell_value, foo.buy_token.uniswap_exchange_artifact).then(function(res) {
            foo.buy_token.uniswap_value = ((BigNumber(res).multipliedBy(0.97)).dividedBy(base.pow(foo.buy_token.decimals))).toJSON();
            foo.numTokensCheckedUniswap++;
          });
        });
      });
    }
  }

  // Logs the reason for failure while checking transaction on Uniswap
  private uniswapCheckFail(res: any) {
    this.buy_token.uniswap_value = '0';
    console.log('[Error fetching buy rate from Uniswap] ', res);
    this.numTokensCheckedUniswap++;
    this.uniswapFailed = true;
  }

  // Check tokens received on 0x Radar Relayer
  check0xRelayer(sell_token: any, buy_token: any) {
    var foo = this;
    foo.zrxService.checkRate(sell_token, buy_token).then(function(res) {
      if(res['signedOrder'] === undefined) {
        foo.zrxCheckFail();
        return;
      }
      foo.buy_token.relayer0x_details = res;
      foo.buy_token.relayer0x_value = res['tokens_bought'];
      foo.numTokensChecked0xRelayer++;
    });
  }

  // Logs the reason for failure while checking transaction on 0xRelayer
  private zrxCheckFail() {
    this.buy_token.relayer0x_value = '0';
    console.log('[Error fetching buy rate from 0xRelayer]');
    this.numTokensChecked0xRelayer++;
    this.zrxRelayerFailed = true;
  }

  // Prepare the trades using the Best Exchanges
  prepTrade() {
    this.numTradesPrepared = 0;
    this.startTradePrep = true;
    this.tradesFailed = false;

    this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Preparing your trade using the best exchange'), MessageContentType.Text);
    this.getBetterExchange();
    // this.buy_token.better_exchange = '0x Relayer';
    if(this.buy_token.better_exchange === 'Bancor')
      this.prepTradeWithBancor();
    else if(this.buy_token.better_exchange === 'Kyber')
      this.prepTradeWithKyber();
    else if(this.buy_token.better_exchange === 'Uniswap')
      this.prepTradeWithUniswap();
    else
      this.prepTradeWith0x();
  }

  // Chose the best exchange based on returns offered by them
  getBetterExchange() {
    let maxReturn = Math.max(parseFloat(this.buy_token.kyber_value), parseFloat(this.buy_token.bancor_value), parseFloat(this.buy_token.uniswap_value), parseFloat(this.buy_token.relayer0x_value));
    if(maxReturn == parseFloat(this.buy_token.kyber_value))
      this.buy_token.better_exchange = 'Kyber';
    else if(maxReturn == parseFloat(this.buy_token.bancor_value))
      this.buy_token.better_exchange = 'Bancor';
    //*** Currently avoid 0x Relayer, as the transaction is taking too much time to complete ***//
    else// if(maxReturn == parseFloat(this.buy_token.uniswap_value))
      this.buy_token.better_exchange = 'Uniswap';
    // else
    //   this.buy_token.better_exchange = '0x Relayer';
  }

  // Use Bancor to prepare a trade
  prepTradeWithBancor() {
    var foo = this;
    var sell_value = (BigNumber(foo.sell_token.value).multipliedBy(base.pow(foo.sell_token.decimals))).toJSON();
    var minRet = (BigNumber(foo.buy_token.bancor_value).multipliedBy(base.pow(foo.buy_token.decimals))).integerValue().toJSON();
    var trade_url = 'https://api.bancor.network/0.1/currencies/convert/';
    var json_body = {
      'blockchainType': 'ethereum',
      'fromCurrencyId': foo.sell_token.bancor_id,
      'toCurrencyId': foo.buy_token.bancor_id,
      'amount': sell_value,
      'minimumReturn': minRet,
      'ownerAddress': foo.account
    }

    CORS.doCORSRequest({ method: 'POST', url: trade_url, data: json_body }, function result(status, response) {
      response = (status == 200)? (JSON.parse(response)): response;
      if(status != 200 || response['errorCode'] != undefined) {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on Bancor; see log.'), MessageContentType.Text);
        console.log(response);
        foo.tradesFailed = true;
        foo.startTradePrep = false;
        return;
      }
      foo.buy_token.trade_data = response['data'];
      foo.numTradesPrepared++;
    });
  }

  // Use Kyber to prepare a trade
  prepTradeWithKyber() {
    var foo = this;
    foo.buy_token.trade_data = [];
    var trade_url = 'https://api.kyber.network/trade_data/?user_address=' + foo.account + '&src_id=' + foo.sell_token.kyber_address + '&dst_id=' + foo.buy_token.kyber_address + '&src_qty=' + foo.sell_token.value + '&min_dst_qty=' + foo.buy_token.kyber_value + '&gas_price=medium';
    CORS.doCORSRequest({ method: 'GET', url: trade_url, data: '' }, function(status, response) {
      response = (status == 200)? (JSON.parse(response)): response;
      if(status != 200 || response['error'] == true) {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to get trade data on Kyber; see log.'), MessageContentType.Text);
        console.log(response);
        foo.tradesFailed = true;
        foo.startTradePrep = false;
        return;
      }
      foo.buy_token.trade_data.push(response['data'][0]);
      if(foo.sell_token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        const sell_value = '0x' + (BigNumber(foo.sell_token.value).multipliedBy(base.pow(foo.sell_token.decimals))).toString(16);
        const data = foo.web3Instance.eth.contract(erc20Artifact.contractAbi).at(foo.sell_token.address).approve.getData(response['data'][0]['to'], sell_value);
        var transaction = { from: foo.account, to: foo.sell_token.address, data: data, value: 0, gasPrice: '0x' + (10 * Math.pow(10, 9)).toString(16), gasLimit: 200000 }
        foo.buy_token.trade_data.push(transaction);
        foo.buy_token.trade_data.reverse();
      }
      foo.numTradesPrepared++;
    });
  }

  // Prepare trade using Uniswap
  prepTradeWithUniswap() {
    var foo = this;
    let sell_value = '0x' + (BigNumber(foo.sell_token.value).multipliedBy(base.pow(foo.sell_token.decimals))).toString(16);
    let buy_value = '0x' + (BigNumber(foo.buy_token.uniswap_value).multipliedBy(base.pow(foo.buy_token.decimals))).toString(16);
    foo.buy_token.trade_data = [];
    if(foo.sell_token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      foo.uniswapService.getApproval(foo.sell_token.address, foo.sell_token.uniswap_exchange_artifact.contractAddress, sell_value).then(function(res) {
        if(res == false) {
          foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on Uniswap; see log.'), MessageContentType.Text);
          console.log('Unable to fetch spending limit of tokens!');
          foo.tradesFailed = true;
          foo.startTradePrep = false;
          return;
        }
        if(res != true)
          foo.buy_token.trade_data.push(res);
        if(foo.buy_token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
          foo.uniswapService.confirmTokenToToken(buy_value, sell_value, foo.sell_token.uniswap_exchange_artifact, foo.buy_token.address).then(function(res) {
            foo.buy_token.trade_data.push(res);
            foo.numTradesPrepared++;
          });
        }
        else {
          foo.uniswapService.confirmTokenToEth(buy_value, sell_value, foo.sell_token.uniswap_exchange_artifact).then(function(res) {
            foo.buy_token.trade_data.push(res);
            foo.numTradesPrepared++;
          });
        }
      });
    }
    else {
      foo.uniswapService.confirmEthToToken(buy_value, sell_value, foo.buy_token.uniswap_exchange_artifact).then(function(res) {
        foo.buy_token.trade_data.push(res);
        foo.numTradesPrepared++;
      });
    }
  }

  // Prepare trade using 0x Relayer
  prepTradeWith0x() {
    var foo = this;
    let sell_value = '0x' + (BigNumber(foo.sell_token.value).multipliedBy(base.pow(foo.sell_token.decimals))).toString(16);
    let buy_value = '0x' + (BigNumber(foo.buy_token.uniswap_value).multipliedBy(base.pow(foo.buy_token.decimals))).toString(16);
    foo.buy_token.trade_data = [];
    // Generate transaction for spending tokens
    let sell_token_address = (foo.sell_token.symbol === 'ETH')? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': foo.sell_token.address;
    foo.zrxService.getApproval(foo.account, sell_token_address, sell_value).then(async function(res) {
      if(res == false) {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on 0x Relayer; see log.'), MessageContentType.Text);
        console.log('Unable to fetch spending limit of tokens!');
        foo.tradesFailed = true;
        foo.startTradePrep = false;
        return;
      }
      if(res != true)
        foo.buy_token.trade_data.push(res);
      if(foo.sell_token.symbol === 'ETH') {
        let res = await foo.zrxService.ethToWeth(foo.account, sell_value);
        foo.buy_token.trade_data.push(res);
      }
      foo.numTradesPrepared++;
    });
  }

  // Confirm the transactions being made
  confirm() {
    var foo = this;
    foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Processing your transaction...'), MessageContentType.Text);
    foo.web3Instance.eth.getTransactionCount(foo.account, (err, res) => {
      if(err !== null) {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Error in confirm; see log.'), MessageContentType.Text);
        console.log(err);
        return;
      }
      const nonce = res;
      if(foo.buy_token.better_exchange !== '0x Relayer')
        foo.confirmBancorKyberUniswap(nonce);
      else
        foo.confirm0xRelayer(nonce);
    });
  }

  // If trading on Bancor, Kyber or Uniswap, confirm the transaction
  confirmBancorKyberUniswap(nonce) {
    var foo = this;
    var privateKey = foo.selectedWallet.getPrivateKeyHex();
    privateKey = Buffer.from(privateKey.substr(2), 'hex');
    for(var i = 0; i < foo.buy_token.trade_data.length; i++) {
      const txCount = i +  1;
      var transaction = {
        from: foo.buy_token.trade_data[i]['from'],
        to: foo.buy_token.trade_data[i]['to'],
        data: foo.buy_token.trade_data[i]['data'],
        value: foo.buy_token.trade_data[i]['value'],
        gasPrice: foo.buy_token.trade_data[i]['gasPrice'],
        nonce: nonce,
        gasLimit: foo.buy_token.trade_data[i]['gasLimit']
      };
      nonce = nonce + 1;
      const tx = new Tx(transaction);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      foo.web3Instance.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), (err, res1) => {
        if(err !== null) {
          foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Error in transaction ' + txCount +'; see log.'), MessageContentType.Text);
          console.log(err);
          return;
        }
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
        foo.txnHashes.push(res1);
        var interval = setInterval(function() {
          foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
            if(res2) {
              clearInterval(interval);
              if(res2.status === '0x1') {
                foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' complete!'), MessageContentType.Text);
                foo.refreshBalance();
              } else if(res2.status === '0x0') {
                foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction ' + txCount + ' failed; see log.'), MessageContentType.Text);
                console.log(res2);
              }
            }
          });
        }, 10000);
      });
    }
  }

  // If trading on 0x Relayer, confirm the transaction
  confirm0xRelayer(nonce) {
    var foo = this, txCount = 0, txVerified = 0, txFailed = false, fillOrder = 0;
    var privateKey = foo.selectedWallet.getPrivateKeyHex();
    privateKey = Buffer.from(privateKey.substr(2), 'hex');
    for(var i = 0; i < foo.buy_token.trade_data.length; i++) {
      txCount = i + 1;
      var transaction = { from: foo.buy_token.trade_data[i]['from'], to: foo.buy_token.trade_data[i]['to'], data: foo.buy_token.trade_data[i]['data'], value: foo.buy_token.trade_data[i]['value'], gasPrice: foo.buy_token.trade_data[i]['gasPrice'], nonce: nonce, gasLimit: foo.buy_token.trade_data[i]['gasLimit'] };
      nonce = nonce + 1;
      const tx = new Tx(transaction);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      foo.web3Instance.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), async (err, res) => {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
        foo.txnHashes.push(res);
      });
    }
    var interval1 = setInterval(function() {
      if(txFailed || (fillOrder == 2 && txVerified == foo.txnHashes.length))
        clearInterval(interval1);
      if(txVerified >= foo.txnHashes.length)
        return;
      foo.web3Instance.eth.getTransactionReceipt(foo.txnHashes[txVerified], (err, res) => {
        if(res) {
          if(res.status === '0x1') {
            foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + (txVerified + 1) + ' complete!'), MessageContentType.Text);
            txVerified++;
          } else if(res.status === '0x0') {
            foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction ' + (txVerified + 1) + ' failed; see log.'), MessageContentType.Text);
            console.log(res);
            txFailed = true;
          }
        }
      });
    }, 10000);
    var interval2 = setInterval(async function() {
      if(txVerified < foo.buy_token.trade_data.length)
        return;
      clearInterval(interval2);
      if(txFailed)
        return;
      const txHash = <string> await foo.zrxService.fillOrder(foo.account, foo.sell_token.value, foo.sell_token.decimals, foo.buy_token.relayer0x_details['signedOrder'], nonce);
      txCount = txCount + 1;
      if(txHash === 'Error') {
        foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction ' + txCount + ' failed; see log.'), MessageContentType.Text);
        txFailed = true;
        return;
      }
      foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
      foo.txnHashes.push(txHash);
      if(foo.buy_token.symbol === 'ETH') {
        txCount = txCount + 1;
        let buy_value = '0x' + (BigNumber(foo.buy_token.uniswap_value).multipliedBy(base.pow(foo.buy_token.decimals))).toString(16);
        var transaction = await foo.zrxService.wethToEth(foo.account, buy_value);
        transaction['nonce'] = nonce + 2;
        const tx = new Tx(transaction);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        foo.web3Instance.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), async (err, res) => {
          foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
          foo.txnHashes.push(res);
        });
      }
      fillOrder = 2;
    }, 10000);
  }

  gifLoaderChange() {
    this.displayGif = "block";
    var timer = setInterval(()=>{
      if(this.numTokensCheckedBancor+this.numTokensCheckedKyber+this.numTokensCheckedUniswap+this.numTokensChecked0xRelayer>3) {
        this.displayGif = "none";
        clearInterval(timer);
      }
    },1000)
  }
}