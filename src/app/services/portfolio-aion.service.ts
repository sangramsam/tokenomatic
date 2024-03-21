import { Injectable, Inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { UUID } from 'angular2-uuid';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from 'underscore';
import { PortfolioBuyModel } from '../models/portfolio-buy.model';
import { BuyablePortfolio, SellablePortfolio, Portfolio } from '../models/portfolio.model';
import { PortfolioTokenContribution } from '../models/portfolio-token-contribution';
import { Constants } from '../models/constants';
import { MessageModel, MessageType, MessageContentType } from '../models/message.model';
import { Quote } from '../models/quote.model';
import { UserAionService } from '../services/user-aion.service';
// import { UserService } from '../services/user.service';
//import { Web3Service } from '../services/web3.service';
import { AionWeb3Service } from '../services/aion-web3.service'
//import { WalletService } from '../services/wallet.service';
import { NotificationManagerService } from '../services/notification-manager.service';
import { TokenAionService } from '../services/token-aion.service';
//import { TokenService } from '../services/token.service';
import { JwtToken } from '../models/token.model';
import { Asset, AssetAnalysis } from '../models/asset.model';
import { forEach } from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import { AuthService } from './auth.service';
import { BigNumber } from 'bignumber.js';
import * as Web3 from 'web3';
var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;
import { SavedWalletsService } from './saved-wallets.service';
import { WalletAionService } from './wallet-aion.service';
// import{JSONAionWallet,AionWalletHelper} from '../components/wallets/jsonwallet_aion'
var utils = require('aion-web3-utils');

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Injectable()
export class PortfolioAionService {
  ccadd: any
  aionWalletHelper: any
  showLoader: boolean = false;
  public displayGif = 'none';
  public wizard1 = true;
  private _buyAblePortfolios = new BehaviorSubject<Array<BuyablePortfolio>>(undefined);
  private _sellAblePortfolios = new BehaviorSubject<Array<SellablePortfolio>>(undefined);
  private _currentBuyablePortfolios: Array<BuyablePortfolio>;
  private _currentSellablePortfolios: Array<SellablePortfolio>;
  private transactionInProgress: boolean;
  private tokenRenewalSubscription: Subscription;
  private _portfolioData = new BehaviorSubject<Object>(null);
  private _portfolioPendingData = new BehaviorSubject<Object>(null);
  private _orderBookData = new BehaviorSubject<Object>(null);
  private _orderBookData1 = new BehaviorSubject<Object>(null);
  private _updateportfolioData = new BehaviorSubject<Object>(null);
  private _closeModal = new BehaviorSubject<boolean>(null);
  private _depositToken = new BehaviorSubject<boolean>(null);
  private _publishComplete = new BehaviorSubject<boolean>(null);
  private _buyComplete = new BehaviorSubject<boolean>(null);
  private _portfolioActiveData = new BehaviorSubject<Object>(null);
  private _closebuypopup = new BehaviorSubject<Object>(null);
  public portfolioData$ = this._portfolioData.asObservable();
  public orderBookData$ = this._orderBookData.asObservable();
  public orderBookData1$ = this._orderBookData1.asObservable();
  public portfolioActiveData$ = this._portfolioActiveData.asObservable();
  public updatePortfolioData$ = this._updateportfolioData.asObservable();
  public buyComplete$ = this._buyComplete.asObservable();
  public closeModal$ = this._closeModal.asObservable();
  public depositToken$ = this._depositToken.asObservable();
  public PublishComplete$ = this._publishComplete.asObservable();
  public PortfolioPendingData$ = this._portfolioPendingData.asObservable();
  public Closebuypopup$ = this._closebuypopup.asObservable();
  private portfolioList = [];
  private portfolioDetails = [];
  public buyAblePortfolios: any;
  public sellAblePortfolios: any;
  public assets: any;
  public allPortfolio = [];
  public allplatformtoken = [];
  public pendingPortfolio: any;
  public orderBookPortfolio: any;
  public buyTimer: any;
  private platformTokens: any;
  //_web3: any;
  constructor(private userService: UserAionService,
    private http: Http,
    //private web3: Web3Service,
    private aionweb3: AionWeb3Service,
    private walletService: WalletAionService,
    private notificationService: NotificationManagerService,
    private tokenService: TokenAionService,
    private savedWalletsService: SavedWalletsService,
    private auth: AuthService,
    //private web3service: Web3Service
    )
     {
    // this.aionWalletHelper = new AionWalletHelper(this.web3service,this.aionweb3);
    //this._web3 = web3._getWeb3();
    this._currentBuyablePortfolios = new Array<BuyablePortfolio>();
    this._currentSellablePortfolios = new Array<SellablePortfolio>();
  }

  getCurrentSellAblePortfolios(): void {
    if (!this.auth.isAuthenticated())
      return;
    this._currentBuyablePortfolios = [];
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http.get(Constants.ServiceURL + '/portfolio/sellable', requestOptions).subscribe(
      data => {
        this._currentSellablePortfolios = data.json();
        this._sellAblePortfolios.next(this._currentSellablePortfolios);
      },
      err => {
        console.log(err);
      }
    );
  }

  currentSellablePortfolios(): Array<SellablePortfolio> {
    return this._currentSellablePortfolios;
  }

  buyPortfolio(portfolio) {
    let self = this;
    self.displayGif = 'block';
    self.wizard1 = false;
    if (!this.auth.isAuthenticated())
      return;
    if (this.transactionInProgress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Alert, 'Transactions is in progress, please wait.'), MessageContentType.Text);
      return;
    }
    //this.transactionInProgress = true;
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Buying  ' + portfolio.name + ' has been initiated on the Blockchain. Please accept the Wallet transaction to buy the basket'), MessageContentType.Text);
    this.validateAssetsForSeller(portfolio);
  }

  sellPortfolio(portfolio: SellablePortfolio, quote: Quote) {
    if (!this.auth.isAuthenticated())
      return;
    if (this.transactionInProgress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction in progress'), MessageContentType.Text);
      return;
    }
    var contracts = this.walletService.getContracts();
    if (contracts === null || contracts === undefined || contracts.length === 0) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get token contracts'), MessageContentType.Text);
      return;
    }
    this.validateAssetsForBuyer(portfolio, quote);
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiated sale, Verifying assets of both seller and buyer'), MessageContentType.Text);
  }

  publishPortfolio(portfolioName: string, askingPriceInWand: number, creationPriceInWand: number, portfolio: Array<any>) {
    if (sessionStorage.getItem('exchange') == 'eth' || sessionStorage.getItem('exchange') == 'aion') {
      if (!this.auth.isAuthenticated())
        return;
      var publishRequestObject = {};
      publishRequestObject['PortfolioName'] = portfolioName;
      publishRequestObject['UserAccount'] = this.aionweb3.getWeb3().eth.coinbase;
      publishRequestObject['Assets'] = portfolio;
      publishRequestObject['AskPriceInWand'] = askingPriceInWand;
      publishRequestObject['CreationPriceInWand'] = creationPriceInWand;
      this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Submitted portfolio creation request.'), MessageContentType.Text);
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });

      this.http.post(Constants.ServiceURL + '/portfolio/create', publishRequestObject, requestOptions).subscribe(
        data => {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Successfully published ' + portfolioName), MessageContentType.Text);
          this.getCurrentSellAblePortfolios();
        },
        err => {
          console.log(err);
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to publish ' + portfolioName), MessageContentType.Text);
          this.getCurrentSellAblePortfolios();
        }
      );
    }
   
  }

  signAndPublishPortfolio(portfolioName: string, askingPriceInWand: number, creationPriceInWand: number,
    portfolio: Array<any>, assetAnalysis: any) {
    if (!this.auth.isAuthenticated())
      return;
    var publishRequestObject = {};
    var maker = this.aionweb3.getWeb3().eth.coinbase;
    var orderID = UUID.UUID();
    var web3Instance = this.aionweb3.getWeb3();
    let dexContractValue = this.getContract('DEX');
    let wxEthContractValue = this.getContract('WXETH');
    if (dexContractValue === undefined) {
      console.log('Unknown DEX contract');
      return;
    }
    var dexContract = web3Instance.eth.contract(JSON.parse(dexContractValue.abi));
    var instanceDexContract = dexContract.at(dexContractValue.address);
    let _sellerTokens = [];
    let _sellerValues = []; // Wand equivalent of token values
    let _orderValues = new Array<any>(5);
    let _orderAddresses = new Array<any>(5);
    for (var i = 0; i < assetAnalysis.assets.length; i++) {
      let contract = this.getContract(assetAnalysis.assets[i].coin);
      if (contract === undefined) {
        continue;
      }
      _sellerTokens.push(contract.address);
      _sellerValues.push(web3Functions.toBaseUnitAmount(assetAnalysis.assets[i].reqbalance, 18));
    }
    _orderValues[0] = web3Functions.toBaseUnitAmount(askingPriceInWand.toFixed(6), 18);//fee Value (in fee token.. )
    _orderValues[3] = web3Functions.toBaseUnitAmount(askingPriceInWand.toFixed(6), 18);
    _orderAddresses[0] = maker;
    _orderAddresses[1] = maker;
    _orderAddresses[3] = wxEthContractValue.address;
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    instanceDexContract.getOrderHash(_sellerTokens, _sellerValues, _orderValues[3], _orderValues[0], _orderAddresses[3], _orderAddresses[0], _orderAddresses[1], sanitizedOrderId, (err, result) => {
      var sellOrderHash = result;
      var payload = {
        jsonrpc: '2.0',
        method: 'eth_sign',
        params: [maker, sellOrderHash]
      };
      web3Instance.currentProvider.sendAsync(payload, (err, result) => {
        var signature = result.result;
        var ecSignature = web3Functions.extractECSignature(signature, sellOrderHash, maker);
        if (web3Functions.clientVerifySign(ecSignature, sellOrderHash, maker)) {
          instanceDexContract.isOrderSigned(sellOrderHash, ecSignature.v, ecSignature.r, ecSignature.s, maker, (err, result) => {
            if (result && result !== undefined && result !== null) {
              publishRequestObject['PortfolioName'] = portfolioName;
              publishRequestObject['PortfolioId'] = orderID;
              publishRequestObject['UserAccount'] = maker;
              publishRequestObject['Assets'] = portfolio;
              publishRequestObject['AskPriceInWand'] = askingPriceInWand;
              publishRequestObject['CreationPriceInWand'] = creationPriceInWand;
              publishRequestObject['SellerSignature'] = signature;
              publishRequestObject['SellerHash'] = sellOrderHash;
              let headers = new Headers({
                'content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                'Token': this.tokenService.getToken().Jwt
              });
              let requestOptions = new RequestOptions({ headers: headers });

              this.http.post(Constants.ServiceURL + '/portfolio/create', publishRequestObject, requestOptions).subscribe(
                data => {
                  this.getCurrentSellAblePortfolios();
                  this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Successfully published ' + portfolioName), MessageContentType.Text);
                },
                err => {
                  console.log(err);
                  this.getCurrentSellAblePortfolios();
                  this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to publish ' + portfolioName), MessageContentType.Text);
                }
              );
            }
            else {
              this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
            }
          });
        }
        else {
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Signature check verification failed'), MessageContentType.Text);
        }
      });
    });
  }

  private validateAssetsForBuyer(portfolio: SellablePortfolio, quote: Quote) {
   

      let loggedInUserWalletStatus = this.walletService.getUserAccountSummary();
      if (!loggedInUserWalletStatus || loggedInUserWalletStatus === undefined || loggedInUserWalletStatus === null) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Logged in user wallet status not available'), MessageContentType.Text);
        return;
      }
      for (let i: number = 0; i < portfolio.Assets.length; i++) {
        let asset = portfolio.Assets[i];
        let assetsStatus = _.where(loggedInUserWalletStatus.Balances, { Symbol: asset.Symbol });
        if (!assetsStatus || assetsStatus === undefined || assetsStatus === null || assetsStatus.length <= 0) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to validate assets'), MessageContentType.Text);
          return;
        }
        let assetStatus = assetsStatus[0];
        if (Number(asset.Reqbalance) > Number(assetStatus['Balance']) || Number(asset.Reqbalance) > Number(assetStatus['Allowance']['Allowance'])) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient ' + assetStatus['Symbol'] + ' tokens/allowance'), MessageContentType.Text);
          return;
        }
      }
      let headers = new Headers({
        'content-type': 'application/json',
        // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      let data = ['WXETH'];
      this.http.post(Constants.ServiceURLAION + 'manage/token/summary/' + portfolio.PortfolioId + '/' + quote.UserAccount, data, requestOptions).subscribe(
        data => {
          let summaryData = data.json();
          let wandBalance = summaryData.Balances[0].Balance;
          if (Number(quote.Value) > Number(wandBalance) || Number(quote.Value) > Number(summaryData.Balances[0].Allowance.Allowance)) {
            this.transactionInProgress = false;
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Buyer/Bidder does not have sufficient Ether tokens/allowance'), MessageContentType.Text);
            return;
          }
          else {
            this.processSell(portfolio, quote);
          }
        },
        err => {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get buyer/bidder\'s Ether balance'), MessageContentType.Text);
          return;
        }
      );
    
    
  }

  private validateAssetsForSeller(portfolio) {

    // if(sessionStorage.getItem('exchange')=='aion'){
    //   var self=this;
    //   let web3Instance = this.aionweb3.getWeb3();
    //  let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,portfolio.contractAddress, {
    //   gasLimit: 3000000,
    // })
    // vsbContract.methods.balanceOfToken('0xa06a0edce631017c6138adb23b52e049300cbdcc0e9e5887c61f15a832258122','0xa0a905ad1dbfcff5cf88fb791e71cc167c3b9b49a748f02874fdb0ec69a38bd0').call().then(res=>{console.log(res)}    );

    // let assets = 0;
    // let owner = portfolio.owner;
    // console.log(portfolio,vsbContract,owner);
    // self.validateAssets(portfolio.tokens, vsbContract, owner).then((res) => {
    //   console.log('rs', res);
    //   if (res === true) {
    //     console.log('buy');
    //     this.processBuy(portfolio);
    //   } else {
    //     // console.log('not buy');
    //     //self.showLoader = false;
    //     self.displayGif = 'none';
    //     // console.log(self.showLoader,self.displayGif);

    //    self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient tokens/allowance'), MessageContentType.Text);
    //   }
    // });
    // }
    // else{
    //   this.processBuy(portfolio);
    // }
    this.processBuy(portfolio);

    /* let web3Instance = this.web3.getWeb3();
     let vsb = web3Instance.eth.contract(Constants.VBPABI);
     let vsbContract = vsb.at(portfolio.contractAddress);
     let assets = 0;
     let owner = portfolio.owner;
     this.validateAssets(portfolio.tokens, vsbContract, owner).then((res) => {
       console.log('rs', res);
       if (res === true) {
         console.log('buy');
         this.processBuy(portfolio);
       } else {
         console.log('not buy');
         this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient tokens/allowance'), MessageContentType.Text);
       }
     });*/
  }

  validateAssets(tokens, vsbContract, owner) {
    return new Promise((resolve, reject) => {
      let assets = 0;
      tokens.map((key, value) => {
        console.log(owner, key);
        vsbContract.methods.balanceOfToken(owner, key.tokenAddress).call().then((response) => {
          console.log("checking token ", response);
          if (response) {
            if ((new BigNumber(response).dividedBy(new BigNumber(10).pow(18))).toJSON() === key.value) {
              assets++;
              resolve(true);
            } else {
              resolve(false);
            }
            if (value === tokens.length - 1) {
              console.log(value);
              if (assets === tokens.length) {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          }
        });
      });
    });
  }

  private processBuy(portfolio) {
    // if(sessionStorage.getItem('exchange')=='aion') {
    //   console.log("data enter into aion",portfolio);
    //   var self=this;
    //   let currentWallet=this.savedWalletsService.getCurrentWallet();
    //   var privatekey=currentWallet.getPrivateKeyHex()
    //   console.log("deposit private key",privatekey)
    //   var self=this;
    //   self.showLoader = true;
    //   self.displayGif = 'block';
    //   let web3Instance = this.aionweb3.getWeb3();
    //   if (web3Instance === null || web3Instance === undefined ||sessionStorage.getItem("walletAddress") === null || sessionStorage.getItem("walletAddress") === undefined || sessionStorage.getItem("walletAddress").length === 0) {
    //     this.transactionInProgress = false;
    //     this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get Wallet Instance'), MessageContentType.Text);
    //     return;
    //   }
    //   let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,portfolio.contractAddress, {
    //     gasLimit: 3000000,
    //   })
    //   // let vsb = web3Instance.eth.contract(Constants.VBPABI);
    //   // let vsbContract = vsb.at(portfolio.contractAddress);
    //   const userAccount = sessionStorage.getItem("walletAddress");
    //   console.log(userAccount)
    //   var add;
    //   var address;
    //   add = sessionStorage.getItem("walletAddress");
    //   address = sessionStorage.getItem("walletAddress");
    //   console.log(address);
    //   const contractFunction = vsbContract.methods.buy();
    //   const functionAbi = contractFunction.encodeABI();
    //   const txParams = {
    //     gas: 900000,
    //     to:portfolio.contractAddress,
    //     data: functionAbi,
    //     from: address,
    //     value:portfolio.valueInEther*1000000000000000000,
    //   };    
    //   console.log(txParams, privatekey)
    //   web3Instance.eth.accounts.signTransaction(txParams, privatekey, function(err, res) {
    //     vsbContract.methods.currentPortfolio().call().then(v => console.log("Value before increment: " , v));
    //     console.log(res)
    //     console.log("sign error",err)
    //     web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('receipt', receipt => {
    //       console.log(receipt);
    //       vsbContract.methods.currentPortfolio().call().then(function (result) {
    //         console.log("Value after increment: " ,result)
    //       })
    //       if (receipt['status']) {
    //         console.log(" self.displayGif, self.showLoader", self.displayGif,self.showLoader)
    //         // self.showLoader = false;
    //         self._closebuypopup.next(true);
    //         self.showLoader = false;
    //         self.displayGif = 'none';
    //         self.wizard1=true;

    //         self.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
    //         self.trackBuyTransaction(receipt['transactionHash'], web3Instance);
    //       } else {
    //         self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction not Submitted'), MessageContentType.Text);
    //       }
    //     })
    //     // .on('error',err=>console.log("send sign error",err));
    //   });
    // }
   
      console.log("ififif")
      var self = this;
      let currentWallet = this.savedWalletsService.getCurrentWallet();
      var privatekey = currentWallet.getPrivateKeyHex()
      //self.showLoader = true;
      let web3Instance = this.aionweb3.getWeb3();
      web3Instance.eth.getTransactionCount(sessionStorage.getItem("walletAddress")).then(count => {
        if (web3Instance === null || web3Instance === undefined || sessionStorage.getItem("walletAddress") === null || sessionStorage.getItem("walletAddress") === undefined || sessionStorage.getItem("walletAddress").length === 0) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get Wallet Instance'), MessageContentType.Text);
          return;
        }
        let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion, portfolio.contractAddress, {
          gasLimit: 3000000,
        })

        const AionFunction = vsbContract.methods.getAion();
        const AionAbi = AionFunction.encodeABI();
        const tx = {

          gas: 900000,
          to: portfolio.contractAddress,
          data: AionAbi,
          nonce: count,
          from: sessionStorage.getItem("walletAddress"),
          value: portfolio.valueInEther * 1000000000000000000,

        };
        web3Instance.eth.getBalance(sessionStorage.getItem("walletAddress"), function (err, res) {
          let balance = web3Instance.utils.fromNAmp(res.toString());
          if (balance == 0 && balance > (portfolio.valueInEther * 1000000000000000000)) {
            // self.displayGif1 = 'none';
            self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance to buy token'), MessageContentType.Text);
          }
          else {
            web3Instance.eth.accounts.signTransaction(tx, privatekey, function (err, res) {
              // self.displayGif1 = 'block';
              console.log("sign error pre ", err)
              console.log('test')
              // let rawTransaction=res.rawTransaction;
              web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionhash', hash => {
                var tx = hash;
              }).on('receipt', receipt => {
                console.log(receipt);
                if (receipt['status'] == true) {
                  console.log("recstatsu" + receipt[status]);
                  var add;
                  var address;
                  add = sessionStorage.getItem("walletAddress");
                  address = sessionStorage.getItem("walletAddress");
                  const contractFunction = vsbContract.methods.buy();
                  const functionAbi = contractFunction.encodeABI();
                  const txParams = {

                    gas: 900000,
                    to: portfolio.contractAddress,
                    nonce: (count + 1),
                    data: functionAbi,
                    from: address,
                  };
                  var tx1;
                  web3Instance.eth.accounts.signTransaction(txParams, privatekey, function (err, res) {
                    console.log("sign error ", err)
                    vsbContract.methods.currentPortfolio().call().then(v => console.log("Value before increment: ", v));
                    web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash', hash1 => {
                      tx1 = hash1;
                      // self.displayGif1 = 'none';

                      console.log("***indisde buy")
                      console.log(hash1)
                    }).on('receipt', receipt => {
                      console.log('receipt', receipt)
                      // if (receipt['status' ]) {
                      console.log('receipt', receipt)
                      self._closebuypopup.next(true);
                      // self.showLoader = false;
                      // self.displayGif = 'none';
                      // self.wizard1=true;
                      // self.displayGif1 = 'none';
                      self.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
                      self.trackBuyTransaction(tx1, web3Instance);
                      // }
                    }).catch(err => {
                      console.log(err)
                      web3Instance.eth.getTransactionReceipt(tx1, (err, receipt) => {
                        if (receipt) {
                          self._closebuypopup.next(true);
                          // self.showLoader = false;
                          // self.displayGif = 'none';
                          // self.wizard1=true;
                          // self.displayGif1 = 'none';
                          self.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
                          self.trackBuyTransaction(tx1, web3Instance);

                        }

                        else {
                          // self.displayGif1 = 'none';
                          self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction not Submitted'), MessageContentType.Text);
                        }
                      })
                    })
                  });
                }
                else {
                  // self.displayGif1 = 'none';
                  self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction not Submitted'), MessageContentType.Text);
                }
              })
            })
          }

        })
      })
    }
  
  // buycheck(hash) {
  //   // console.log('buycheck')
  //   this._web3.eth.getTransactionReceipt(hash, (err, hash1) => {
  //     //  console.log(hash1)
  //     if (hash1 === null) {
  //       this.buycheck(hash);
  //     }
  //     else {
  //       if (hash1['status'] == 0x0) {
  //         this.displayGif='none';
  //         this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction not Submitted'), MessageContentType.Text);
  //       }
  //       else {
  //         this._closebuypopup.next(true);
  //         this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
  //         this.trackBuyTransactionwan(hash);
  //       }
  //     }
  //   });
  // }

  // private trackBuyTransactionwan(address) {
  //   if (this.buyTimer)
  //     clearTimeout(this.buyTimer);
  //   this._web3.eth.getTransactionReceipt(address, (err, res) => {
  //     if (res) {
  //       if (res.status === '0x1') {
  //         this.buyComplete();
  //         clearTimeout(this.buyTimer);
  //       } else if (res.status === '0x0') {
  //         this.displayGif='none'
  //         clearTimeout(this.buyTimer);
  //         this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
  //       }
  //     }
  //   });
  //   this.buyTimer = setTimeout(() => {
  //     this.trackBuyTransactionwan(address);
  //   }, 1000);
  // }

  private trackBuyTransaction(address, web3Instance) {
    if (this.buyTimer)
      clearTimeout(this.buyTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      console.log(res);
      
      if (res) {
        if (res.status === true) {
          console.log('tractbutton');
          
          this.buyComplete();
          clearTimeout(this.buyTimer);
        } else if (res.status === false) {
          clearTimeout(this.buyTimer);
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
        }
      }
    });
    this.buyTimer = setTimeout(() => {
      this.trackBuyTransaction(address, web3Instance);
    }, 1000);
  }

  private processSell(portfolio: SellablePortfolio, quote: Quote) {
    let web3Instance = this.aionweb3.getWeb3();
    if (web3Instance === null || web3Instance === undefined || web3Instance.eth.coinbase === null || web3Instance.eth.coinbase === undefined || web3Instance.eth.coinbase.length === 0) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get Web3 Instance. Please reload'), MessageContentType.Text);
      return;
    }
    var seller = this.aionweb3.getWeb3().eth.coinbase;
    let dexContractValue = this.getContract('DEX');
    let wxEthContractValue = this.getContract('WXETH');
    if (dexContractValue === undefined) {
      this.transactionInProgress = false;
      console.log('Unknown DEX contract');
      return;
    }
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = portfolio.PortfolioId.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var dexContract = web3Instance.eth.contract(JSON.parse(dexContractValue.abi));
    var instanceDexContract = dexContract.at(dexContractValue.address);

    var _buyerTokens = [wxEthContractValue.address];
    var _buyerValues = [web3Functions.toBaseUnitAmount(quote.Value, 18)];
    let _orderValues = new Array<any>(5);
    let _orderAddresses = new Array<any>(5);

    let _sellerTokens = [];
    let _sellerValues = []; // Wand equivalent of token values

    for (var i = 0; i < portfolio.Assets.length; i++) {
      let contract = this.getContract(portfolio.Assets[i].Symbol);
      if (contract === undefined) {
        continue;
      }
      _sellerTokens.push(contract.address);
      _sellerValues.push(web3Functions.toBaseUnitAmount(portfolio.Assets[i].Reqbalance, 18));
    }

    _orderValues[0] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[1] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[2] = portfolio.CreationTimestamp + 15780000;
    _orderValues[3] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[4] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderAddresses[0] = portfolio.UserAccount;
    _orderAddresses[1] = portfolio.UserAccount;
    _orderAddresses[2] = quote.UserAccount;
    _orderAddresses[3] = wxEthContractValue.address;
    _orderAddresses[4] = wxEthContractValue.address;
    instanceDexContract.getOrderHash(_sellerTokens, _sellerValues, _orderValues[3], _orderValues[0], _orderAddresses[3], _orderAddresses[0], _orderAddresses[1], sanitizedOrderId, (err, result) => {
      var sellOrderHash = result;
      var payload = {
        jsonrpc: '2.0',
        method: 'eth_sign',
        params: [seller, sellOrderHash]
      };
      web3Instance.currentProvider.sendAsync(payload, (err, result) => {
        var signature = result.result;
        var ecBuyerSignature = web3Functions.extractECSignature(quote.BuyerSignature, quote.BuyerHash, quote.UserAccount);
        var ecSellerSignature = web3Functions.extractECSignature(signature, sellOrderHash, portfolio.UserAccount);
        if (web3Functions.clientVerifySign(ecSellerSignature, sellOrderHash, seller)) {
          instanceDexContract.isOrderSigned(sellOrderHash, ecSellerSignature.v, ecSellerSignature.r, ecSellerSignature.s, seller, (err, result) => {
            if (result) {
              //instanceDexContract.oneWayFulfillPO.estimateGas(_sellerTokens, _buyerTokens, _sellerValues, _buyerValues, _orderAddresses, _orderValues,
              //[ecSellerSignature.v, ecBuyerSignature.v], ecBuyerSignature.r, ecBuyerSignature.s, ecSellerSignature.r, ecSellerSignature.s, sanitizedOrderId,
              //(err, result) => {
              //    var estimatedGas = result;
              instanceDexContract.oneWayFulfillPO(_sellerTokens, _buyerTokens, _sellerValues, _buyerValues, _orderAddresses, _orderValues,
                [ecSellerSignature.v, ecBuyerSignature.v], ecBuyerSignature.r, ecBuyerSignature.s, ecSellerSignature.r, ecSellerSignature.s, sanitizedOrderId,
                {
                  from: seller
                  //    , gas: estimatedGas
                }, (err, result) => {
                  if (!result || result === undefined || result === null) {
                    this.transactionInProgress = false;
                    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
                    return;
                  }
                  let headers = new Headers({
                    'content-type': 'application/json',
                    'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                    'Token': this.tokenService.getToken().Jwt
                  });
                  let requestOptions = new RequestOptions({ headers: headers });
                  let transactionId = result;
                  let body = {};
                  body['TransactionId'] = transactionId;
                  body['BuyerUserAccountId'] = quote.UserAccount;
                  body['SellerUserAccountId'] = portfolio.UserAccount;
                  body['PortfolioId'] = portfolio.PortfolioId;
                  this.http.post(Constants.ServiceURL + 'transaction/create', body, requestOptions).subscribe(
                    data => {
                      var html = '<div class=\'standard-text\'>' +
                        '<p>Sell Initiated</p>' +
                        '<p><a href=';
                      ' + Constants.TxAppnetURL + ';
                      ' + result + ';
                      ' target=\'_blank\'>Click here to check status</a></p>' +
                        '</div>';
                      this.notificationService.showNotification(new MessageModel(MessageType.Success, html), MessageContentType.Html);
                      this.getCurrentSellAblePortfolios();
                    },
                    err => {
                      console.log(err);
                      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to log sale'), MessageContentType.Text);
                      this.getCurrentSellAblePortfolios();
                    }
                  );
                  this.transactionInProgress = false;
                });
              //});
            }
            else {
              this.transactionInProgress = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
            }
          });
        }
        else {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
        }
      });
    });
  }

  private extractMetadata(array: any, symbol: string) {
    for (var i = 0; i < array.length; i++) {
      if (symbol === array[i]['symbol'])
        return array[i];
    }
    return undefined;
  }


  private getContract(symbol: string) {
    let availableContracts = this.walletService.getContracts();
    for (var i = 0; i < availableContracts.length; i++) {
      if (availableContracts[i].symbol === symbol) {
        return availableContracts[i];
      }
    }
    return undefined;
  }

  //new Portfolio date :- 25/04/2018
  getList() {

       if (!this.tokenService.getToken()) {
        return;
      }
      let web3Instance = this.aionweb3.getWeb3();
      let headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      console.log("aiooooooooooooooooo")
      console.log(utils.toChecksumAddress(sessionStorage.getItem('walletAddress')))
      let body = new URLSearchParams();
      let body1 = new URLSearchParams();
      let query = { currentOwnerOrSeller: utils.toChecksumAddress(sessionStorage.getItem('walletAddress')) };
      let query1 = { owner: utils.toChecksumAddress(sessionStorage.getItem('walletAddress')) };
      body.set('query', JSON.stringify(query));
      body1.set('query', JSON.stringify(query1));
      //console.log('form data', body.toString());
      let requestOptions = new RequestOptions({ headers: headers });
      this.http.post(Constants.AionbasketURL, body.toString(), requestOptions).subscribe(data => {

        //  console.log('basketlistposst ', data.json());
        let baskets = data.json();

        if (baskets.length !== 0) {
          this.allplatformtoken.forEach((res) => {
            let tokenList;
            tokenList = res;
            baskets.map((k, v) => {
              k['tokens'].map((k2, v2) => {
                tokenList.map((k1, v1) => {
                  if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
                    k2['symbol'] = k1.symbol;
                  }
                });
              });
            });
            let pending = [];
            let active = [];
            let buy = [];
            baskets.map((key, value) => {
              // console.log(key)
              // console.log("key status***")
              // console.log(key['status'] )
              key['tokens'].map((k2, v2) => {
                if (key['status'] === '0' && k2.symbol !== undefined) {
                  //               console.log("pending***")
                  // console.log(key)
                  pending.push(key);
                } else if (key['status'] === '1' && k2.symbol !== undefined) {
                  //   console.log("active***"+key)
                  //  console.log(key)
                  active.push(key);
                } else if (key['status'] === '3' && k2.symbol !== undefined) {
                  //  console.log('buy'+  key)
                  //  console.log(key)
                  buy.push(key);
                }
                if (value === baskets.length - 1) {
                  this.setSellAblePortfolios(_.uniq(active));
                  this.setOrderbookPortfolio(_.uniq(buy));
                  this.setPendingPortfolio(_.uniq(pending));
                  this._portfolioActiveData.next(_.uniq(active));
                  this._portfolioPendingData.next(_.uniq(pending));
                  this._orderBookData.next(_.uniq(buy));
                }
              });
            });
          }, (err) => {
            this.setSellAblePortfolios([]);
            this.setOrderbookPortfolio([]);
            this.setPendingPortfolio([]);
            this._portfolioActiveData.next([]);
            this._portfolioPendingData.next([]);
            this._orderBookData.next([]);
          });
        }

        this.http.post(Constants.AionbasketURL, body1.toString(), requestOptions).subscribe(data1 => {
          // console.log("basket list querty")
          let baskets1 = data1.json();
          // console.log(baskets1)
          if (baskets1.length !== 0) {
            this.allplatformtoken.forEach((res) => {
              let tokenList;
              tokenList = res;
              baskets1.map((k, v) => {
                k['tokens'].map((k2, v2) => {
                  tokenList.map((k1, v1) => {
                    if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
                      k2['symbol'] = k1.symbol;
                    }
                  });
                });
              });
              let pending = [];
              let active = [];
              let buy = [];
              baskets1.map((key, value) => {
                key['tokens'].map((k2, v2) => {
                  // if (key['status'] === '0' && k2.symbol !== undefined) {
                  //   pending.push(key);
                  // } else if (key['status'] === '1' && k2.symbol !== undefined) {
                  //   active.push(key);
                  // } 
                  if (key['status'] === '3' && k2.symbol !== undefined) {
                    // console.log('buy'+  key)
                    buy.push(key);
                  }
                  if (value === baskets1.length - 1) {
                    // this.setSellAblePortfolios(_.uniq(active));
                    // this.setOrderbookPortfolio(_.uniq(buy));
                    // this.setPendingPortfolio(_.uniq(pending));
                    // this._portfolioActiveData.next(_.uniq(active));
                    // this._portfolioPendingData.next(_.uniq(pending));
                    this._orderBookData1.next(_.uniq(buy));
                  }
                });
              });
            }, (err) => {
              // this.setSellAblePortfolios([]);
              // this.setOrderbookPortfolio([]);
              // this.setPendingPortfolio([]);
              // this._portfolioActiveData.next([]);
              // this._portfolioPendingData.next([]);
              this._orderBookData1.next([]);
            });
          }
          else {
            // this.setSellAblePortfolios([]);
            // this.setOrderbookPortfolio([]);
            // this.setPendingPortfolio([]);
            // this._portfolioActiveData.next([]);
            // this._portfolioPendingData.next([]);
            // this._orderBookData.next([]);
            this._orderBookData1.next([]);
          }
        });
      });

    
  }

  getBasketList() {
    if (!this.tokenService.getToken()) {
      return;
    }
   
      let web3Instance = this.aionweb3.getWeb3();
      let headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      let body = new URLSearchParams();
      let query = { currentOwnerOrSeller: '' };
      body.set('query', JSON.stringify(query));
      let requestOptions = new RequestOptions({ headers: headers });
      console.log("exchange aion getlist")
      this.http.post(Constants.AionbasketURL, {}, requestOptions).subscribe(data => {
        let temp = data.json();
        console.log("getBasketlist", data.json())
        let baskets = _.filter(temp, function (key) {
          return key['currentOwnerOrSeller'].toLowerCase() !== sessionStorage.getItem('walletAddress').toLowerCase();
        });
        console.log(baskets);
        
        if (baskets.length !== 0) {
          this.allplatformtoken.forEach((res) => {
            let tokenList;
            tokenList = res;
            baskets.map((k, v) => {
              k['tokens'].map((k2, v2) => {
                tokenList.map((k1, v1) => {
                  if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
                    k2['symbol'] = k1.symbol;
                  }
                });
              });
            });
            let buy = [];
            baskets.map((key, value) => {
              key['tokens'].map((k2, v2) => {
                if (key['status'] === '1' && k2.symbol !== undefined) {
                  buy.push(key);
                }
              });
              if (value === baskets.length - 1) {
                this.setBuyAblePortfolios(_.uniq(buy));
                this._portfolioData.next(_.uniq(buy));              
              }
            });
          }, (err) => {
            this.setBuyAblePortfolios([]);
            this._portfolioData.next([]);
          });
        } else {
          this.setBuyAblePortfolios([]);
          this._portfolioData.next([]);
        }
      });
    
  }


  getBuyAblePortfolios() {
    return this.buyAblePortfolios;
  }

  setBuyAblePortfolios(data) {
    this.buyAblePortfolios = data;
  }

  getSellAblePortfolios() {
    return this.sellAblePortfolios;
  }

  setSellAblePortfolios(data) {
    this.sellAblePortfolios = data;
  }

  updatePorfolio(portfolio) {
    this._updateportfolioData.next(portfolio);
  }

  setNewTokenValue(assest) {
    console.log('new assest set', assest);
    this.assets = assest;
  }

  getNewTokenValue() {
    return this.assets;
  }

  closeEditModal() {
    this._closeModal.next(true);
  }

  despoiteToken() {
    this._depositToken.next(true);
  }

  publishComplete() {
    this._publishComplete.next(true);
  }

  buyComplete() {
    console.log('called buyComplete');
    this.displayGif='none';
    this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
    clearTimeout(this.buyTimer);
    this._buyComplete.next(true);
  }

  closeButPopup() {
    this._buyComplete.next(true);
  }

  getPendingPortfolio() {
    return this.pendingPortfolio;
  }

  setPendingPortfolio(data) {
    this.pendingPortfolio = data;
  }

  getOrderbookPortfolio() {
    return this.orderBookPortfolio;
  }

  setOrderbookPortfolio(data) {
    this.orderBookPortfolio = data;
  }

  getPlatformTokens() {
  
      return new Promise((resolve, reject) => {
        console.log(sessionStorage.getItem('id_token'));
          
        if (!sessionStorage.getItem('id_token')) {
          reject(false);
        }
        let headers = new Headers({
          'content-type': 'application/json',
          // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
          'Token': sessionStorage.getItem('id_token')
        });
        let requestOptions = new RequestOptions({ headers: headers });
        this.http.get(Constants.ServiceURLAION + 'PlatformToken', requestOptions).subscribe(
          data => {
            // console.log('tokes', data.json());
            this.allplatformtoken.push(data.json());
            console.log('tokes', this.allplatformtoken);
            resolve(data.json());
          });
      });
    
  }

  requestPortfolio(theme) {
    return new Promise((resolve, reject) => {
      if (!this.auth.isAuthenticated())
        return;
      const publishRequestObject = {};
      publishRequestObject['PortfolioId'] = UUID.UUID();
      publishRequestObject['PortfolioTheme'] = theme.name;
      publishRequestObject['PortfolioPriceInEth'] = theme.PortfolioPriceInEth;
      publishRequestObject['PortfolioMaxPriceInEth'] = theme.PortfolioMaxPriceInEth;
      publishRequestObject['UserAccount'] = this.aionweb3.getWeb3().eth.coinbase;
      publishRequestObject['ExpiryDate'] = moment().add(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      publishRequestObject['Created'] = moment().format('yyyy-MM-dd\'T\'HH:mm:ss.SSSZ');
      publishRequestObject['UserId'] = sessionStorage.getItem('user_id');
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http.post(Constants.ThemedBasketRequest + 'api/portfoliorequests/create', publishRequestObject, requestOptions).subscribe(
        data => {
          resolve(data.json());
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  getrequestPortfolio() {
    return new Promise((resolve, reject) => {
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http.get(Constants.ThemedBasketRequest + 'api/portfoliorequests/getuserrequests', requestOptions).subscribe(
        data => {
          resolve({ data: data.json() });
        }, err => {
          console.log(err);
          reject(err);
        });
    });
  }
}
