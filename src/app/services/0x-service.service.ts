import { Injectable } from '@angular/core';
import {Web3Service} from './web3.service';

import { HttpClient } from '@angular/common/http';

// var contract_addresses_1 = require("@0x/contract-addresses");
// var ContractWrappers = require("@0x/contract-wrappers").ContractWrappers;
// var contract_artifacts_1 = require("@0x/contract-artifacts");
// var order_utils_1 = require("@0x/order-utils");
// var utils_1 = require("@0x/utils");
// var subproviders_1 = require("@0x/subproviders");
// import { SignerSubprovider, RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { getHeapSpaceStatistics } from 'v8';
import { resolve } from 'url';
// var Web3Wrapper = require("@0x/web3-wrapper").Web3Wrapper;
// var http = require('@0x/connect').HttpClient;

let network_config = {
//  httpradar: new http("https://api.radarrelay.com/0x/v3"),
  RPC_PROVIDER: "https://mainnet.infura.io/v3/425313c6627e43ddb43324a9419c9508",
  NETWORK_ID: 1,
  ASSET_URL: "https://api.radarrelay.com/v3/markets/",
  ETHERSCAN_TX: "https://etherscan.io/tx/"
}


@Injectable()

export class ZrxServiceService {
  zrxTokenAddress: string; etherTokenAddress: string; exchangeAddress: string;
  weth: any; zrx: any; exchange: any;
  providerEngine: any; web3Wrapper: any; contractWrappers: any;


  constructor(private web3Service: Web3Service, private http: HttpClient) {
    // get important addresses
    // const contractAddresses = contract_addresses_1.getContractAddressesForNetworkOrThrow(network_config.NETWORK_ID);
    // this.zrxTokenAddress = contractAddresses.zrxToken;
    // this.etherTokenAddress = contractAddresses.etherToken;
    // this.exchangeAddress = contractAddresses.exchange;

    //get abis for weth, zrx, and exchange contracts
    // var abiexchange = contract_artifacts_1.Exchange.compilerOutput.abi;
    // var abizrx = contract_artifacts_1.ZRXToken.compilerOutput.abi;
    // var abiweth = contract_artifacts_1.WETH9.compilerOutput.abi;

    // get the contract instances 
    const web3Instance = this.web3Service.getWeb3();
    // this.weth = web3Instance.eth.contract(abiweth).at(this.etherTokenAddress);
    // this.zrx = web3Instance.eth.contract(abizrx).at(this.zrxTokenAddress);
    // this.exchange = web3Instance.eth.contract(abiexchange).at(this.exchangeAddress);

    //setting up the provider engine. using the injected web3 by metamask for signing.
    // this.providerEngine = new subproviders_1.Web3ProviderEngine();
    // this.providerEngine.addProvider(new SignerSubprovider(this.web3Service));
    // this.providerEngine.addProvider(new subproviders_1.RPCSubprovider(network_config.RPC_PROVIDER));
    // this.providerEngine.start();
    // this.web3Wrapper = new Web3Wrapper(this.providerEngine);
    // this.contractWrappers = new ContractWrappers(this.providerEngine, { networkId: network_config.NETWORK_ID });
  }

  public async checkRate(sell_token: any, buy_token: any){
    return new Promise(async resolve => {
      let zrxDetails = {
        "tokens_bought": "0",
        "signedOrder": undefined
      }
      let assetPairs = <any>await this.getAssets();
      if(assetPairs === "Error"){
        resolve(zrxDetails);
        return;
      }
      let pair_valid = false;
      let bids_flag = false;

      // If a token is ETH, during trade, it will automatically be converted first to WETH and then be 
      // swapped because 0x protocol deals with WETH instead of ETH. Thus, while checking rates also, we
      // get orderbooks corresponding to WETH and the other token.
      let sell_token_symbol: string, buy_token_symbol: string, sell_token_address: string, buy_token_address: string;
      if(sell_token.symbol === "ETH"){
        sell_token_symbol = "WETH";
        sell_token_address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      }
      else{
        sell_token_symbol = sell_token.symbol;
        sell_token_address = sell_token.address;
      }

      if(buy_token.symbol === "ETH"){
        buy_token_symbol = "WETH";
        buy_token_address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      }
      else{
        buy_token_symbol = buy_token.symbol;
        buy_token_address = buy_token.address;
      }
      for(let i = 0; i < assetPairs.length; i++){
        if(assetPairs[i]["id"] === sell_token_symbol + "-" + buy_token_symbol){
          pair_valid = true;
          bids_flag = true;
          break;
        }
        else if(assetPairs[i]["id"] === buy_token_symbol + "-" + sell_token_symbol){
          pair_valid = true;
          break;
        }
      }
      if(pair_valid == false){
        resolve(zrxDetails);
        return;
      }
      let baseTokenAddress: string, quoteTokenAddress: string;
      if (bids_flag) {
        baseTokenAddress = sell_token_address;
        quoteTokenAddress = buy_token_address;
      }
      else {
          baseTokenAddress = buy_token_address;
          quoteTokenAddress = sell_token_address;
      }
      let request = {
        baseAssetData: this.getAssetData(baseTokenAddress),
        quoteAssetData: this.getAssetData(quoteTokenAddress)
      } 
      zrxDetails = <any>await this.getOrderBook(request, bids_flag, sell_token.value);
      // console.log("checkRate: ", zrxDetails)
      resolve(zrxDetails);
    })

  }
  public async checkRatebsktrd(sell_token: any, buy_token: any){
    console.log('checkRatebsktrd',sell_token,buy_token);
    
    return new Promise(async resolve => {
      let zrxDetails = {
        "tokens_bought": "0",
        "signedOrder": undefined
      }
      let assetPairs = <any>await this.getAssets();
      if(assetPairs === "Error"){
        resolve(zrxDetails);
        return;
      }
      let pair_valid = false;
      let bids_flag = false;

      // If a token is ETH, during trade, it will automatically be converted first to WETH and then be 
      // swapped because 0x protocol deals with WETH instead of ETH. Thus, while checking rates also, we
      // get orderbooks corresponding to WETH and the other token.
      let sell_token_symbol: string, buy_token_symbol: string, sell_token_address: string, buy_token_address: string;
      if(sell_token.symbol === "ETH"){
        sell_token_symbol = "WETH";
        sell_token_address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      }
      else{
        sell_token_symbol = sell_token.symbol;
        sell_token_address = sell_token.address;
      }

      if(buy_token.symbol === "ETH"){
        buy_token_symbol = "WETH";
        buy_token_address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      }
      else{
        buy_token_symbol = buy_token.symbol;
        buy_token_address = buy_token.address;
      }
      for(let i = 0; i < assetPairs.length; i++){
        if(assetPairs[i]["id"] === sell_token_symbol + "-" + buy_token_symbol){
          pair_valid = true;
          bids_flag = true;
          break;
        }
        else if(assetPairs[i]["id"] === buy_token_symbol + "-" + sell_token_symbol){
          pair_valid = true;
          break;
        }
      }
      if(pair_valid == false){
        resolve(zrxDetails);
        return;
      }
      let baseTokenAddress: string, quoteTokenAddress: string;
      if (!bids_flag) {
        baseTokenAddress = sell_token_address;
        quoteTokenAddress = buy_token_address;
      }
      else {
          baseTokenAddress = buy_token_address;
          quoteTokenAddress = sell_token_address;
      }
      let request = {
        baseAssetData: this.getAssetData(baseTokenAddress),
        quoteAssetData: this.getAssetData(quoteTokenAddress)
      } 
      console.log('req',request);
      
      zrxDetails = <any>await this.getOrderBookbsktrd(request, bids_flag, sell_token.value);
       console.log("checkRate: ", zrxDetails)
      resolve(zrxDetails);
    })

  }
  private getAssetData(tokenAddress: string) {
    // return order_utils_1.assetDataUtils.encodeERC20AssetData(tokenAddress);
  }

  async getOrderBook(request: any, bids_flag: boolean, sell_tokens_amount: number){
    let zrxDetails = {
      "tokens_bought": "0",
      "signedOrder": undefined
    }
    return new Promise(async resolve => {
      // let orderbook = await network_config.httpradar.getOrderbookAsync(request)
      // .catch(err => {
      //   console.log(err);
      //   resolve(zrxDetails);
      //   return;
      // });
      // console.log(orderbook)
      
      let price: number, signedOrder: any;
      //if the sell token was first one in the market pair, look for in bids (bids_flag is true)
      if (bids_flag) {
        // let order_filling_bid = orderbook["bids"]["records"][0]["order"];
        //calculating and showing price to the user. signedOrder contains the order to be filled
        // price = order_filling_bid.makerAssetAmount / (order_filling_bid.takerAssetAmount) * 0.97;
        // console.log("Bid Txn Price: ", price)
        // zrxDetails["signedOrder"] = order_filling_bid      
      }
      else {
          // same as above, just that for ask order.
          // let order_filling_ask = orderbook["asks"]["records"][0]["order"];
          // price = order_filling_ask.makerAssetAmount / (order_filling_ask.takerAssetAmount) * 0.97;
          // console.log("Ask Txn Price: ", price)
          // zrxDetails["signedOrder"] = order_filling_ask;
      }
      zrxDetails["tokens_bought"] = (price * sell_tokens_amount).toString();
      // console.log("getOrderBook: ", zrxDetails)
      resolve(zrxDetails);

    })
  }
  async getOrderBookbsktrd(request: any, bids_flag: boolean, sell_tokens_amount: number){
    console.log('request',request);
    
    let zrxDetails = {
      "tokens_bought": "0",
      "signedOrder": undefined
    }
    return new Promise(async resolve => {
      // let orderbook = await network_config.httpradar.getOrderbookAsync(request)
      // .catch(err => {
      //   console.log(err);
      //   resolve(zrxDetails);
      //   return;
      // });
      // console.log('orderbook',orderbook)
      
      let price: number, signedOrder: any;
      //if the sell token was first one in the market pair, look for in bids (bids_flag is true)
      if (bids_flag) {
        // let order_filling_bid = orderbook["bids"]["records"][0]["order"];
        //calculating and showing price to the user. signedOrder contains the order to be filled
        // price = order_filling_bid.makerAssetAmount / (order_filling_bid.takerAssetAmount);
        // console.log("Bid Txn Price: ", price)
        // zrxDetails["signedOrder"] = order_filling_bid      
      }
      else {
          // same as above, just that for ask order.
          // let order_filling_ask = orderbook["asks"]["records"][0]["order"];
          // price = (order_filling_ask.makerAssetAmount / (order_filling_ask.takerAssetAmount));
          // console.log("Ask Txn Price: ", price,order_filling_ask.makerAssetAmount,order_filling_ask.takerAssetAmount)
          // zrxDetails["signedOrder"] = order_filling_ask;
      }
      zrxDetails["tokens_bought"] = (price).toString();
      // console.log("getOrderBook: ", zrxDetails)
      resolve(zrxDetails);

    })
  }
  async getApproval(account, sellTokenAddress, sellValue){
    return new Promise(async resolve => {
      let allowance = await this.contractWrappers.erc20Token.getProxyAllowanceAsync(
        sellTokenAddress,
        account
      ).catch(err => {
        console.log(err);
        resolve("Error");
        return
      });
      console.log('allowance',allowance)
      let approvalTxHash;
      if (Number(allowance) < Number(sellValue)){
        // Web3Wrapper.eth.getTransactionCount(account, (err, res) => {
        //   var data = this.contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        //     sellTokenAddress,
        //     account,{from: account}
        //   );
        //  // instanceTokenContract.approve.getData(authorizedAcc, value, {from: account});
        //   const txParams = {
        //   gasPrice: '0x4A817C800',
        //   gasLimit: 4000000,
        //     to: tokenaddress,
        //     data:data,
        //     from: account,
        //     chainId: 3,
        //     Txtype: 0x01,
        //     //value:convertedAmount,
        //     nonce: res+count
        //   };
        //   //nonce = nonce + 1;
        //   const tx = new Tx(txParams);
        //   tx.sign(privateKey);
        //   //console.log('tx',tx);
          
        //   const serializedTx = tx.serialize();
        //   //console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));
          
        //   const obj={
        //     serializedTx:'0x' + serializedTx.toString('hex')
        //   }
        
       
        // })
        approvalTxHash = await this.contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
          sellTokenAddress,
          account,
        ).catch(err => {
          console.log(err)
          resolve("Error");
          return
        });
        console.log('approvaltxhash',approvalTxHash);
        
      }
      else{
        approvalTxHash = "Already Approved";
      }
      resolve(approvalTxHash);
    })
  }

  async validateFillingOrder(account, sell_value, signedOrder){
    return new Promise(async resolve => {
      console.log("Checking validity of the order...")
      await this.contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(signedOrder, sell_value, account, { networkId: network_config.NETWORK_ID })
      .catch(err => {
          console.log(err);
          resolve(false);
          return;
      });
      resolve(true);
    })
  }

  async fillOrder(account, sell_value, decimals, signedOrder, nonce){
    return new Promise(async resolve => {
      // let sell_value_bn = Web3Wrapper.toBaseUnitAmount(new utils_1.BigNumber(sell_value), decimals);
      // console.log("Big number: ", sell_value_bn);
      // console.log("Actual Number: ", sell_value_bn.toNumber());
      // let orderValidated = <boolean>await this.validateFillingOrder(account, sell_value_bn, signedOrder);
      // if(!orderValidated){
      //   console.log("The order is not validated. Filling order without validating might result in failing of transaction and loss of the transaction fees")
      //   resolve("Error");
      //   return;
      // }
      let txn = {
        nonce: nonce,
        gasLimit: 8000000,
        networkId: network_config.NETWORK_ID
      }
      // let txHash = await this.contractWrappers.exchange.fillOrderAsync(signedOrder, sell_value_bn, account, txn)
      // .catch(err => {
      //   console.log(err);
      //   resolve("Error");
      //   return;
      // })
      // resolve(txHash)
    })

  }

  public async ethToWeth(account, sell_value) {
    return new Promise(async resolve =>{
      // let sell_value_bn = Web3Wrapper.toBaseUnitAmount(new utils_1.BigNumber(sell_value), 18);
      // const txHash = await this.contractWrappers.etherToken.depositAsync(
      //     this.etherTokenAddress,
      //     sell_value_bn,
      //     account,
      // ).catch(err => {
      //   console.log(err);
      //   resolve("Error");
      //   console.log("Passsed resolve");
      // });
      // console.log('txhash',txHash);
      
      // resolve(txHash);
      // console.log("weth transaction hash : " + txHash);
      // let tx = await this.web3Wrapper.awaitTransactionSuccessAsync(txHash).catch(err => console.log(err));
      // console.log(tx);
    })

    // if (tx3) {
    //     console.log(tx3);
    //     this.setStatus("Transaction Successful!");
    //     await this.updateWethBalance();
    // }

  }

  public async wethToEth(account, buy_value) {
    return new Promise(async resolve =>{
      // let buy_value_bn = Web3Wrapper.toBaseUnitAmount(new utils_1.BigNumber(buy_value), 18);
      // const txHash = await this.contractWrappers.etherToken.withdrawAsync(
      //     this.etherTokenAddress,
      //     buy_value_bn,
      //     account,
      // ).catch(err => {
      //   console.log(err);
      //   resolve("Error");
      // });
      // resolve(txHash);
      // console.log("weth transaction hash : " + txHash);
      // let tx = await this.web3Wrapper.awaitTransactionSuccessAsync(txHash).catch(err => console.log(err));
      // console.log(tx);
    })
  }

  private getAssets(){
    return new Promise(resolve => {
      try{
        this.http.get(network_config.ASSET_URL).subscribe((res) => {
           console.log(res);
          resolve(res);
        })
      }
      catch(e){
        console.log(e);
        resolve("Error");
      }
    })
  }
}
