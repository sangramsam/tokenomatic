import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { UUID } from "angular2-uuid";
import { Http, RequestOptions, Headers } from "@angular/http";
import * as _ from "underscore";
//import {AionWeb3Service} from '../../services/aion-web3.service';
import { PortfolioBuyModel } from "../models/portfolio-buy.model";
import {
  BuyablePortfolio,
  SellablePortfolio,
  Portfolio,
} from "../models/portfolio.model";
import { PortfolioTokenContribution } from "../models/portfolio-token-contribution";
import { Constants } from "../models/constants";
import {
  MessageModel,
  MessageType,
  MessageContentType,
} from "../models/message.model";
import { Quote } from "../models/quote.model";

import { UserService } from "../services/user.service";
import { Web3Service } from "../services/web3.service";
import { AionWeb3Service } from "../services/aion-web3.service";
import { WalletService } from "../services/wallet.service";
import { NotificationManagerService } from "../services/notification-manager.service";
import { TokenService } from "../services/token.service";
import { JwtToken } from "../models/token.model";
import { Asset, AssetAnalysis } from "../models/asset.model";
import { forEach } from "@angular/router/src/utils/collection";
import * as moment from "moment";
import { AuthService } from "./auth.service";
import { BigNumber } from "bignumber.js";
import * as Web3 from "web3";
// var wanUtil = require('wanchain-util')
// var Tx = wanUtil.wanchainTx;
var Tx = require("ethereumjs-tx");
import { SavedWalletsService } from "./saved-wallets.service";
import { WanWeb3Service } from "./wan-web3.service";
//import { EthBasketService } from '../services/eth-basket.service';

// import{JSONAionWallet,AionWalletHelper} from '../components/wallets/jsonwallet_aion'
var utils = require("aion-web3-utils");

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(
    ecSignature: any,
    orderHash: any,
    signer: any
  );
}

@Injectable()
export class PortfolioService {
  ccadd: any;
  aionWalletHelper: any;
  showLoader: boolean = false;
  public displayGif = "none";
  public wizard1 = true;
  private _buyAblePortfolios = new BehaviorSubject<Array<BuyablePortfolio>>(
    undefined
  );
  private _sellAblePortfolios = new BehaviorSubject<Array<SellablePortfolio>>(
    undefined
  );
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
  private _depositdata = new BehaviorSubject<object>(null);
  private _resumedata = new BehaviorSubject<object>(null);
  private _logoutdata = new BehaviorSubject<object>(null);

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
  public depositdata$ = this._depositdata.asObservable();
  public resumedata$ = this._resumedata.asObservable();
  public logoutdata$ = this._logoutdata.asObservable();

  public PublishComplete$ = this._publishComplete.asObservable();
  public PortfolioPendingData$ = this._portfolioPendingData.asObservable();
  public Closebuypopup$ = this._closebuypopup.asObservable();
  private portfolioList = [];
  private portfolioDetails = [];
  public buyAblePortfolios: any;
  public sellAblePortfolios: any;
  public assets: any;
  public allPortfolio = [];
  public allplatformtokenWan = [];
  public pendingPortfolio: any;
  public orderBookPortfolio: any;
  public buyTimer: any;
  public gasPrice: any;
  private platformTokens: any;
  public balance: any;
  _web3: any;
  isResumeProcessing: boolean = false;
  public basketid: number = 0;
  public sentbasketid: number = 0;
  public liquidate_contract: any = null;
  public buy_contract: any = null;
  finalbasket_id: number = 0;
  basketstatus: boolean = false;
  resumeStatus: boolean = false;
  tradedata = [];
  baskettime: any = null;
  publishtime: any = null;
  approvaldata = [];
  transferdata = [];
  sentavgtime: number = 900;
  constructor(
    private userService: UserService,
    private http: Http,
    private web3: Web3Service,
    private aionweb3: AionWeb3Service,
    private walletService: WalletService,
    private notificationService: NotificationManagerService,
    private tokenService: TokenService,
    private savedWalletsService: SavedWalletsService,
    private auth: AuthService,
    //private web3service: Web3Service,
    private WanWeb3Service: WanWeb3Service
  ) {
    // this.aionWalletHelper = new AionWalletHelper(this.web3service,this.aionweb3);
    // this._web3 = web3._getWeb3();
    this._web3 = WanWeb3Service._getWeb3();
    this._currentBuyablePortfolios = new Array<BuyablePortfolio>();
    this._currentSellablePortfolios = new Array<SellablePortfolio>();
    let meta = this;
    setTimeout(function () {
      meta.refreshGasPrice();
      meta.refereshbalance();
    }, 2000);
    this.test();
    setInterval(() => {
      this.test();
    }, 10000);
  }
  public async test(): Promise<any> {
    if (this.userService.getCurrentUser()) {
      return new Promise((resolve, reject) => {
        var maxid = 0;
        this.http
          .get(
            Constants.ethBasketUrl +
            "basketsByUser/" +
            this.userService.getCurrentUser().UserAccount
          )
          .subscribe(
            (res) => {
              //console.log(res);
              let data = JSON.parse(res["_body"]);
              console.log(data);
              var basketid = [];
              data.forEach((element) => {
                basketid.push(element.basketID);
              });
              maxid = parseInt(
                basketid.reduce((a, b) => Math.max(a, b)),
                10
              );
              console.log("TYPE: ", maxid);
              this.finalbasket_id = maxid + 1;
              console.log(maxid, this.finalbasket_id);
            },
            (err) => {
              if (err.status === 404) {
                this.finalbasket_id = maxid + 1;
              }
              //console.log(err);
            }
          );
      });
    }

  }
  refereshbalance() {
    let meta = this;
    setInterval(function () {
      let web3 = meta.web3.getWeb3();
      if (web3) {
        web3.eth.getBalance(
          sessionStorage.getItem("walletAddress"),
          (err, data) => {
            meta.balance = parseFloat(web3.fromWei(data).toFixed(4));
          }
        );
      }

    }, 2000);
  }

  refreshGasPrice() {
    if (this.web3.getWeb3()) {
      this.web3.getWeb3().eth.getGasPrice((err, gp) => {
        this.gasPrice = gp.c[0];
        //console.log("GAS_PRICE", this.gasPrice)
      });
    }

  }

  getCurrentSellAblePortfolios(): void {
    if (!this.auth.isAuthenticated()) return;
    this._currentBuyablePortfolios = [];
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt,
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
      .get(Constants.ServiceURL + "/portfolio/sellable", requestOptions)
      .subscribe(
        (data) => {
          this._currentSellablePortfolios = data.json();
          this._sellAblePortfolios.next(this._currentSellablePortfolios);
        },
        (err) => {
          ////console.log(err);
        }
      );
  }

  currentSellablePortfolios(): Array<SellablePortfolio> {
    return this._currentSellablePortfolios;
  }

  buyPortfolio(portfolio) {
    let self = this;
    self.displayGif = "block";
    self.wizard1 = false;
    let web3 = self.web3.getWeb3();
    let feeprice = parseFloat(
      web3.fromWei(
        this.gasPrice * 400000 + portfolio.basketPrice * 1000000000000000000
      )
    );
    this.buy_contract = portfolio.basketContract;
    if (self.balance < feeprice) {
      this.buy_contract = null;
      this.notificationService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Not enough ETH balance to buy the basket"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (!this.auth.isAuthenticated()) {
      this.buy_contract = null;
      return;
    }
    if (this.transactionInProgress) {
      this.buy_contract = portfolio.basketContract;
      this.notificationService.showNotification(
        new MessageModel(
          MessageType.Alert,
          "Transactions is in progress, please wait."
        ),
        MessageContentType.Text
      );
      return;
    }
    //this.transactionInProgress = true;
    this.notificationService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Basket buying has been initiated, please DO NOT CLOSE THE DESKTOP-APP, until it gets confirmed."
      ),
      MessageContentType.Text
    );
    //  'Buying  ' + portfolio.name + ' has been initiated on the Blockchain. Please accept the Wallet transaction to buy the basket'), MessageContentType.Text);
    this.validateAssetsForSeller(portfolio);
  }

  sellPortfolio(portfolio: SellablePortfolio, quote: Quote) {
    if (!this.auth.isAuthenticated()) return;
    if (this.transactionInProgress) {
      this.notificationService.showNotification(
        new MessageModel(MessageType.Info, "Transaction in progress"),
        MessageContentType.Text
      );
      return;
    }
    var contracts = this.walletService.getContracts();
    if (
      contracts === null ||
      contracts === undefined ||
      contracts.length === 0
    ) {
      this.notificationService.showNotification(
        new MessageModel(MessageType.Error, "Failed to get token contracts"),
        MessageContentType.Text
      );
      return;
    }
    this.validateAssetsForBuyer(portfolio, quote);
    this.notificationService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Initiated sale, Verifying assets of both seller and buyer"
      ),
      MessageContentType.Text
    );
  }

  publishPortfolio(
    portfolioName: string,
    askingPriceInWand: number,
    creationPriceInWand: number,
    portfolio: Array<any>
  ) {
    if (
      sessionStorage.getItem("exchange") == "eth" ||
      sessionStorage.getItem("exchange") == "aion"
    ) {
      if (!this.auth.isAuthenticated()) return;
      var publishRequestObject = {};
      publishRequestObject["PortfolioName"] = portfolioName;
      publishRequestObject["UserAccount"] = this.web3.getWeb3().eth.coinbase;
      publishRequestObject["Assets"] = portfolio;
      publishRequestObject["AskPriceInWand"] = askingPriceInWand;
      publishRequestObject["CreationPriceInWand"] = creationPriceInWand;
      this.notificationService.showNotification(
        new MessageModel(
          MessageType.Info,
          "Submitted portfolio creation request."
        ),
        MessageContentType.Text
      );
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });

      this.http
        .post(
          Constants.ServiceURL + "/portfolio/create",
          publishRequestObject,
          requestOptions
        )
        .subscribe(
          (data) => {
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Success,
                "Successfully published " + portfolioName
              ),
              MessageContentType.Text
            );
            this.getCurrentSellAblePortfolios();
          },
          (err) => {
            ////console.log(err);
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to publish " + portfolioName
              ),
              MessageContentType.Text
            );
            this.getCurrentSellAblePortfolios();
          }
        );
    }
    if (sessionStorage.getItem("exchange") == "wan") {
      if (!this.auth.isAuthenticated()) return;
      var publishRequestObject = {};
      publishRequestObject["PortfolioName"] = portfolioName;
      publishRequestObject["UserAccount"] = sessionStorage.getItem(
        "walletAddress"
      );
      publishRequestObject["Assets"] = portfolio;
      publishRequestObject["AskPriceInWand"] = askingPriceInWand;
      publishRequestObject["CreationPriceInWand"] = creationPriceInWand;
      this.notificationService.showNotification(
        new MessageModel(
          MessageType.Info,
          "Submitted portfolio creation request."
        ),
        MessageContentType.Text
      );
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });

      this.http
        .post(
          Constants.ServiceURLWAN + "/portfolio/create",
          publishRequestObject,
          requestOptions
        )
        .subscribe(
          (data) => {
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Success,
                "Successfully published " + portfolioName
              ),
              MessageContentType.Text
            );
            this.getCurrentSellAblePortfolios();
          },
          (err) => {
            //   ////console.log(err);
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to publish " + portfolioName
              ),
              MessageContentType.Text
            );
            this.getCurrentSellAblePortfolios();
          }
        );
    }
  }

  signAndPublishPortfolio(
    portfolioName: string,
    askingPriceInWand: number,
    creationPriceInWand: number,
    portfolio: Array<any>,
    assetAnalysis: any
  ) {
    if (!this.auth.isAuthenticated()) return;
    var publishRequestObject = {};
    var maker = this.web3.getWeb3().eth.coinbase;
    var orderID = UUID.UUID();
    var web3Instance = this.web3.getWeb3();
    let dexContractValue = this.getContract("DEX");
    let wxEthContractValue = this.getContract("WXETH");
    if (dexContractValue === undefined) {
      ////console.log('Unknown DEX contract');
      return;
    }
    var dexContract = web3Instance.eth.contract(
      JSON.parse(dexContractValue.abi)
    );
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
      _sellerValues.push(
        web3Functions.toBaseUnitAmount(assetAnalysis.assets[i].reqbalance, 18)
      );
    }
    _orderValues[0] = web3Functions.toBaseUnitAmount(
      askingPriceInWand.toFixed(6),
      18
    ); //fee Value (in fee token.. )
    _orderValues[3] = web3Functions.toBaseUnitAmount(
      askingPriceInWand.toFixed(6),
      18
    );
    _orderAddresses[0] = maker;
    _orderAddresses[1] = maker;
    _orderAddresses[3] = wxEthContractValue.address;
    var find = "-";
    var re = new RegExp(find, "g");
    var sanitizedOrderId = orderID.replace(re, "");
    sanitizedOrderId = "0x" + sanitizedOrderId;
    instanceDexContract.getOrderHash(
      _sellerTokens,
      _sellerValues,
      _orderValues[3],
      _orderValues[0],
      _orderAddresses[3],
      _orderAddresses[0],
      _orderAddresses[1],
      sanitizedOrderId,
      (err, result) => {
        var sellOrderHash = result;
        var payload = {
          jsonrpc: "2.0",
          method: "eth_sign",
          params: [maker, sellOrderHash],
        };
        web3Instance.currentProvider.sendAsync(payload, (err, result) => {
          var signature = result.result;
          var ecSignature = web3Functions.extractECSignature(
            signature,
            sellOrderHash,
            maker
          );
          if (
            web3Functions.clientVerifySign(ecSignature, sellOrderHash, maker)
          ) {
            instanceDexContract.isOrderSigned(
              sellOrderHash,
              ecSignature.v,
              ecSignature.r,
              ecSignature.s,
              maker,
              (err, result) => {
                if (result && result !== undefined && result !== null) {
                  publishRequestObject["PortfolioName"] = portfolioName;
                  publishRequestObject["PortfolioId"] = orderID;
                  publishRequestObject["UserAccount"] = maker;
                  publishRequestObject["Assets"] = portfolio;
                  publishRequestObject["AskPriceInWand"] = askingPriceInWand;
                  publishRequestObject[
                    "CreationPriceInWand"
                  ] = creationPriceInWand;
                  publishRequestObject["SellerSignature"] = signature;
                  publishRequestObject["SellerHash"] = sellOrderHash;
                  let headers = new Headers({
                    "content-type": "application/json",
                    "Ocp-Apim-Subscription-Key":
                      Constants.ApiManagementSubscriptionKey,
                    Token: this.tokenService.getToken().Jwt,
                  });
                  let requestOptions = new RequestOptions({ headers: headers });

                  this.http
                    .post(
                      Constants.ServiceURL + "/portfolio/create",
                      publishRequestObject,
                      requestOptions
                    )
                    .subscribe(
                      (data) => {
                        this.getCurrentSellAblePortfolios();
                        this.notificationService.showNotification(
                          new MessageModel(
                            MessageType.Success,
                            "Successfully published " + portfolioName
                          ),
                          MessageContentType.Text
                        );
                      },
                      (err) => {
                        ////console.log(err);
                        this.getCurrentSellAblePortfolios();
                        this.notificationService.showNotification(
                          new MessageModel(
                            MessageType.Error,
                            "Failed to publish " + portfolioName
                          ),
                          MessageContentType.Text
                        );
                      }
                    );
                } else {
                  this.notificationService.showNotification(
                    new MessageModel(
                      MessageType.Info,
                      "Transaction not finished"
                    ),
                    MessageContentType.Text
                  );
                }
              }
            );
          } else {
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Info,
                "Signature check verification failed"
              ),
              MessageContentType.Text
            );
          }
        });
      }
    );
  }

  private validateAssetsForBuyer(portfolio: SellablePortfolio, quote: Quote) {
    if (sessionStorage.getItem("exchange") == "eth") {
      let loggedInUserWalletStatus = this.walletService.getUserAccountSummary();
      if (
        !loggedInUserWalletStatus ||
        loggedInUserWalletStatus === undefined ||
        loggedInUserWalletStatus === null
      ) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Logged in user wallet status not available"
          ),
          MessageContentType.Text
        );
        return;
      }
      for (let i: number = 0; i < portfolio.Assets.length; i++) {
        let asset = portfolio.Assets[i];
        let assetsStatus = _.where(loggedInUserWalletStatus.Balances, {
          Symbol: asset.Symbol,
        });
        if (
          !assetsStatus ||
          assetsStatus === undefined ||
          assetsStatus === null ||
          assetsStatus.length <= 0
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(MessageType.Error, "Failed to validate assets"),
            MessageContentType.Text
          );
          return;
        }
        let assetStatus = assetsStatus[0];
        if (
          Number(asset.Reqbalance) > Number(assetStatus["Balance"]) ||
          Number(asset.Reqbalance) >
          Number(assetStatus["Allowance"]["Allowance"])
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(
              MessageType.Error,
              "Seller does not have sufficient " +
              assetStatus["Symbol"] +
              " tokens/allowance"
            ),
            MessageContentType.Text
          );
          return;
        }
      }
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });
      let data = ["WXETH"];
      this.http
        .post(
          Constants.ServiceURL +
          "manage/token/summary/" +
          portfolio.PortfolioId +
          "/" +
          quote.UserAccount,
          data,
          requestOptions
        )
        .subscribe(
          (data) => {
            let summaryData = data.json();
            let wandBalance = summaryData.Balances[0].Balance;
            if (
              Number(quote.Value) > Number(wandBalance) ||
              Number(quote.Value) >
              Number(summaryData.Balances[0].Allowance.Allowance)
            ) {
              this.transactionInProgress = false;
              this.notificationService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "Buyer/Bidder does not have sufficient Ether tokens/allowance"
                ),
                MessageContentType.Text
              );
              return;
            } else {
              this.processSell(portfolio, quote);
            }
          },
          (err) => {
            this.transactionInProgress = false;
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get buyer/bidder's Ether balance"
              ),
              MessageContentType.Text
            );
            return;
          }
        );
    }
    if (sessionStorage.getItem("exchange") == "aion") {
      let loggedInUserWalletStatus = this.walletService.getUserAccountSummary();
      if (
        !loggedInUserWalletStatus ||
        loggedInUserWalletStatus === undefined ||
        loggedInUserWalletStatus === null
      ) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Logged in user wallet status not available"
          ),
          MessageContentType.Text
        );
        return;
      }
      for (let i: number = 0; i < portfolio.Assets.length; i++) {
        let asset = portfolio.Assets[i];
        let assetsStatus = _.where(loggedInUserWalletStatus.Balances, {
          Symbol: asset.Symbol,
        });
        if (
          !assetsStatus ||
          assetsStatus === undefined ||
          assetsStatus === null ||
          assetsStatus.length <= 0
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(MessageType.Error, "Failed to validate assets"),
            MessageContentType.Text
          );
          return;
        }
        let assetStatus = assetsStatus[0];
        if (
          Number(asset.Reqbalance) > Number(assetStatus["Balance"]) ||
          Number(asset.Reqbalance) >
          Number(assetStatus["Allowance"]["Allowance"])
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(
              MessageType.Error,
              "Seller does not have sufficient " +
              assetStatus["Symbol"] +
              " tokens/allowance"
            ),
            MessageContentType.Text
          );
          return;
        }
      }
      let headers = new Headers({
        "content-type": "application/json",
        // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });
      let data = ["WXETH"];
      this.http
        .post(
          Constants.ServiceURLAION +
          "manage/token/summary/" +
          portfolio.PortfolioId +
          "/" +
          quote.UserAccount,
          data,
          requestOptions
        )
        .subscribe(
          (data) => {
            let summaryData = data.json();
            let wandBalance = summaryData.Balances[0].Balance;
            if (
              Number(quote.Value) > Number(wandBalance) ||
              Number(quote.Value) >
              Number(summaryData.Balances[0].Allowance.Allowance)
            ) {
              this.transactionInProgress = false;
              this.notificationService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "Buyer/Bidder does not have sufficient Ether tokens/allowance"
                ),
                MessageContentType.Text
              );
              return;
            } else {
              this.processSell(portfolio, quote);
            }
          },
          (err) => {
            this.transactionInProgress = false;
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get buyer/bidder's Ether balance"
              ),
              MessageContentType.Text
            );
            return;
          }
        );
    }
    if (sessionStorage.getItem("exchange") == "wan") {
      let loggedInUserWalletStatus = this.walletService.getUserAccountSummary();
      if (
        !loggedInUserWalletStatus ||
        loggedInUserWalletStatus === undefined ||
        loggedInUserWalletStatus === null
      ) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Logged in user wallet status not available"
          ),
          MessageContentType.Text
        );
        return;
      }
      for (let i: number = 0; i < portfolio.Assets.length; i++) {
        let asset = portfolio.Assets[i];
        let assetsStatus = _.where(loggedInUserWalletStatus.Balances, {
          Symbol: asset.Symbol,
        });
        if (
          !assetsStatus ||
          assetsStatus === undefined ||
          assetsStatus === null ||
          assetsStatus.length <= 0
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(MessageType.Error, "Failed to validate assets"),
            MessageContentType.Text
          );
          return;
        }
        let assetStatus = assetsStatus[0];
        if (
          Number(asset.Reqbalance) > Number(assetStatus["Balance"]) ||
          Number(asset.Reqbalance) >
          Number(assetStatus["Allowance"]["Allowance"])
        ) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(
            new MessageModel(
              MessageType.Error,
              "Seller does not have sufficient " +
              assetStatus["Symbol"] +
              " tokens/allowance"
            ),
            MessageContentType.Text
          );
          return;
        }
      }
      let headers = new Headers({
        "content-type": "application/json",
        // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });
      let data = ["WXETH"];
      this.http
        .post(
          Constants.ServiceURLWAN +
          "manage/token/summary/" +
          portfolio.PortfolioId +
          "/" +
          quote.UserAccount,
          data,
          requestOptions
        )
        .subscribe(
          (data) => {
            let summaryData = data.json();
            let wandBalance = summaryData.Balances[0].Balance;
            if (
              Number(quote.Value) > Number(wandBalance) ||
              Number(quote.Value) >
              Number(summaryData.Balances[0].Allowance.Allowance)
            ) {
              this.transactionInProgress = false;
              this.notificationService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "Buyer/Bidder does not have sufficient Ether tokens/allowance"
                ),
                MessageContentType.Text
              );
              return;
            } else {
              this.processSell(portfolio, quote);
            }
          },
          (err) => {
            this.transactionInProgress = false;
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get buyer/bidder's Ether balance"
              ),
              MessageContentType.Text
            );
            return;
          }
        );
    }
  }

  private validateAssetsForSeller(portfolio) {
    // if(sessionStorage.getItem('exchange')=='aion'){
    //   var self=this;
    //   let web3Instance = this.aionweb3.getWeb3();
    //  let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,portfolio.contractAddress, {
    //   gasLimit: 3000000,
    // })
    // vsbContract.methods.balanceOfToken('0xa06a0edce631017c6138adb23b52e049300cbdcc0e9e5887c61f15a832258122','0xa0a905ad1dbfcff5cf88fb791e71cc167c3b9b49a748f02874fdb0ec69a38bd0').call().then(res=>{////console.log(res)}    );

    // let assets = 0;
    // let owner = portfolio.owner;
    // ////console.log(portfolio,vsbContract,owner);
    // self.validateAssets(portfolio.tokens, vsbContract, owner).then((res) => {
    //   ////console.log('rs', res);
    //   if (res === true) {
    //     ////console.log('buy');
    //     this.processBuy(portfolio);
    //   } else {
    //     // ////console.log('not buy');
    //     //self.showLoader = false;
    //     self.displayGif = 'none';
    //     // ////console.log(self.showLoader,self.displayGif);

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
       ////console.log('rs', res);
       if (res === true) {
         ////console.log('buy');
         this.processBuy(portfolio);
       } else {
         ////console.log('not buy');
         this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient tokens/allowance'), MessageContentType.Text);
       }
     });*/
  }

  validateAssets(tokens, vsbContract, owner) {
    return new Promise((resolve, reject) => {
      let assets = 0;
      tokens.map((key, value) => {
        ////console.log(owner, key);
        vsbContract.methods
          .balanceOfToken(owner, key.tokenAddress)
          .call()
          .then((response) => {
            ////console.log("checking token ", response);
            if (response) {
              if (
                new BigNumber(response)
                  .dividedBy(new BigNumber(10).pow(18))
                  .toJSON() === key.value
              ) {
                assets++;
                resolve(true);
              } else {
                resolve(false);
              }
              if (value === tokens.length - 1) {
                ////console.log(value);
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
    let web3Instance = this.web3.getWeb3();
    this.buy_contract = portfolio.basketContract;
    portfolio["buystatus"] = true;
    if (
      web3Instance === null ||
      web3Instance === undefined ||
      web3Instance.eth.coinbase === null ||
      web3Instance.eth.coinbase === undefined ||
      web3Instance.eth.coinbase.length === 0
    ) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(
        new MessageModel(MessageType.Error, "Failed to get Wallet Instance"),
        MessageContentType.Text
      );
      return;
    }
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.basketContract);
    let currentWallet = this.savedWalletsService.getCurrentWallet();
    var privateKey = currentWallet.getPrivateKeyHex();
    //console.log("be",privateKey)
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    //var count = web3Instance.eth.getTransactionCount(sessionStorage.getItem("walletAddress"));
    //console.log("af",privateKey)
    web3Instance.eth.getTransactionCount(
      sessionStorage.getItem("walletAddress"),
      (err, res) => {
        var data = vsbContract.buy.getData({
          from: sessionStorage.getItem("walletAddress"),
          value: portfolio.basketPrice * 1000000000000000000,
        });
        //console.log('data',data,portfolio);
        this.web3.getWeb3().eth.getGasPrice((err, gp) => {
          this.gasPrice = gp.c[0];
          const txParams = {
            gasPrice: this.gasPrice,
            gasLimit: 400000,
            to: portfolio.basketContract,
            data: data,
            from: sessionStorage.getItem("walletAddress"),
            value: portfolio.basketPrice * 1000000000000000000,
            chainId: Constants.Chainid,
            Txtype: 0x01,
            nonce: res,
          };
          //console.log('txparams',txParams);

          const tx = new Tx(txParams);
          tx.sign(privateKey);
          const serializedTx = tx.serialize();
          web3Instance.eth.sendRawTransaction(
            "0x" + serializedTx.toString("hex"),
            (err, hash) => {
              if (err) {
                this.buy_contract = null;
                this.displayGif = "none";
                console.log("transfer error: ", err);
              } else {
                this.buy_contract = portfolio.basketContract;
                //console.log(hash);

                this.trackBuyTransaction(hash, web3Instance, portfolio);
              }
            }
          );
        });
      }
    );
  }

  buycheck(hash) {
    // ////console.log('buycheck')
    this._web3.eth.getTransactionReceipt(hash, (err, hash1) => {
      //  ////console.log(hash1)
      if (hash1 === null) {
        this.buycheck(hash);
      } else {
        if (hash1["status"] == 0x0) {
          this.displayGif = "none";
          this.notificationService.showNotification(
            new MessageModel(MessageType.Error, "Transaction not Submitted"),
            MessageContentType.Text
          );
        } else {
          this._closebuypopup.next(true);
          this.notificationService.showNotification(
            new MessageModel(MessageType.Info, "Transaction is in progress"),
            MessageContentType.Text
          );
          this.trackBuyTransactionwan(hash);
        }
      }
    });
  }

  private trackBuyTransactionwan(address) {
    if (this.buyTimer) clearTimeout(this.buyTimer);
    this._web3.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === "0x1") {
          //this.buyComplete();
          clearTimeout(this.buyTimer);
        } else if (res.status === "0x0") {
          this.displayGif = "none";
          clearTimeout(this.buyTimer);
          this.notificationService.showNotification(
            new MessageModel(MessageType.Error, "Transaction failed"),
            MessageContentType.Text
          );
        }
      }
    });
    this.buyTimer = setTimeout(() => {
      this.trackBuyTransactionwan(address);
    }, 1000);
  }

  private trackBuyTransaction(address, web3Instance, portfolio) {
    this.buyTimer = setInterval(() => {
      web3Instance.eth.getTransactionReceipt(address, (err, res) => {
        //console.log(res);
        if (res) {
          clearInterval(this.buyTimer);
          if (res.status === "0x1") {
            this.refreshGasPrice();
            this.buyComplete(portfolio);
          } else if (res.status === "0x0") {
            this.buy_contract = portfolio.basketContract;
            this.notificationService.showNotification(
              new MessageModel(MessageType.Error, "Transaction failed"),
              MessageContentType.Text
            );
          }
        }
      });
    }, 1000);
  }

  private processSell(portfolio: SellablePortfolio, quote: Quote) {
    let web3Instance = this.web3.getWeb3();
    if (
      web3Instance === null ||
      web3Instance === undefined ||
      web3Instance.eth.coinbase === null ||
      web3Instance.eth.coinbase === undefined ||
      web3Instance.eth.coinbase.length === 0
    ) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get Web3 Instance. Please reload"
        ),
        MessageContentType.Text
      );
      return;
    }
    var seller = this.web3.getWeb3().eth.coinbase;
    let dexContractValue = this.getContract("DEX");
    let wxEthContractValue = this.getContract("WXETH");
    if (dexContractValue === undefined) {
      this.transactionInProgress = false;
      ////console.log('Unknown DEX contract');
      return;
    }
    var find = "-";
    var re = new RegExp(find, "g");
    var sanitizedOrderId = portfolio.PortfolioId.replace(re, "");
    sanitizedOrderId = "0x" + sanitizedOrderId;
    var dexContract = web3Instance.eth.contract(
      JSON.parse(dexContractValue.abi)
    );
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
      _sellerValues.push(
        web3Functions.toBaseUnitAmount(portfolio.Assets[i].Reqbalance, 18)
      );
    }

    _orderValues[0] = web3Functions.toBaseUnitAmount(
      quote.Value.toFixed(6),
      18
    );
    _orderValues[1] = web3Functions.toBaseUnitAmount(
      quote.Value.toFixed(6),
      18
    );
    _orderValues[2] = portfolio.CreationTimestamp + 15780000;
    _orderValues[3] = web3Functions.toBaseUnitAmount(
      quote.Value.toFixed(6),
      18
    );
    _orderValues[4] = web3Functions.toBaseUnitAmount(
      quote.Value.toFixed(6),
      18
    );
    _orderAddresses[0] = portfolio.UserAccount;
    _orderAddresses[1] = portfolio.UserAccount;
    _orderAddresses[2] = quote.UserAccount;
    _orderAddresses[3] = wxEthContractValue.address;
    _orderAddresses[4] = wxEthContractValue.address;
    instanceDexContract.getOrderHash(
      _sellerTokens,
      _sellerValues,
      _orderValues[3],
      _orderValues[0],
      _orderAddresses[3],
      _orderAddresses[0],
      _orderAddresses[1],
      sanitizedOrderId,
      (err, result) => {
        var sellOrderHash = result;
        var payload = {
          jsonrpc: "2.0",
          method: "eth_sign",
          params: [seller, sellOrderHash],
        };
        web3Instance.currentProvider.sendAsync(payload, (err, result) => {
          var signature = result.result;
          var ecBuyerSignature = web3Functions.extractECSignature(
            quote.BuyerSignature,
            quote.BuyerHash,
            quote.UserAccount
          );
          var ecSellerSignature = web3Functions.extractECSignature(
            signature,
            sellOrderHash,
            portfolio.UserAccount
          );
          if (
            web3Functions.clientVerifySign(
              ecSellerSignature,
              sellOrderHash,
              seller
            )
          ) {
            instanceDexContract.isOrderSigned(
              sellOrderHash,
              ecSellerSignature.v,
              ecSellerSignature.r,
              ecSellerSignature.s,
              seller,
              (err, result) => {
                if (result) {
                  //instanceDexContract.oneWayFulfillPO.estimateGas(_sellerTokens, _buyerTokens, _sellerValues, _buyerValues, _orderAddresses, _orderValues,
                  //[ecSellerSignature.v, ecBuyerSignature.v], ecBuyerSignature.r, ecBuyerSignature.s, ecSellerSignature.r, ecSellerSignature.s, sanitizedOrderId,
                  //(err, result) => {
                  //    var estimatedGas = result;
                  instanceDexContract.oneWayFulfillPO(
                    _sellerTokens,
                    _buyerTokens,
                    _sellerValues,
                    _buyerValues,
                    _orderAddresses,
                    _orderValues,
                    [ecSellerSignature.v, ecBuyerSignature.v],
                    ecBuyerSignature.r,
                    ecBuyerSignature.s,
                    ecSellerSignature.r,
                    ecSellerSignature.s,
                    sanitizedOrderId,
                    {
                      from: seller,
                      //    , gas: estimatedGas
                    },
                    (err, result) => {
                      if (!result || result === undefined || result === null) {
                        this.transactionInProgress = false;
                        this.notificationService.showNotification(
                          new MessageModel(
                            MessageType.Info,
                            "Transaction not finished"
                          ),
                          MessageContentType.Text
                        );
                        return;
                      }
                      let headers = new Headers({
                        "content-type": "application/json",
                        "Ocp-Apim-Subscription-Key":
                          Constants.ApiManagementSubscriptionKey,
                        Token: this.tokenService.getToken().Jwt,
                      });
                      let requestOptions = new RequestOptions({
                        headers: headers,
                      });
                      let transactionId = result;
                      let body = {};
                      body["TransactionId"] = transactionId;
                      body["BuyerUserAccountId"] = quote.UserAccount;
                      body["SellerUserAccountId"] = portfolio.UserAccount;
                      body["PortfolioId"] = portfolio.PortfolioId;
                      this.http
                        .post(
                          Constants.ServiceURL + "transaction/create",
                          body,
                          requestOptions
                        )
                        .subscribe(
                          (data) => {
                            var html =
                              "<div class='standard-text'>" +
                              "<p>Sell Initiated</p>" +
                              "<p><a href=";
                            " + Constants.TxAppnetURL + ";
                            " + result + ";
                            " target='_blank'>Click here to check status</a></p>" +
                              "</div>";
                            this.notificationService.showNotification(
                              new MessageModel(MessageType.Success, html),
                              MessageContentType.Html
                            );
                            this.getCurrentSellAblePortfolios();
                          },
                          (err) => {
                            ////console.log(err);
                            this.notificationService.showNotification(
                              new MessageModel(
                                MessageType.Error,
                                "Failed to log sale"
                              ),
                              MessageContentType.Text
                            );
                            this.getCurrentSellAblePortfolios();
                          }
                        );
                      this.transactionInProgress = false;
                    }
                  );
                  //});
                } else {
                  this.transactionInProgress = false;
                  this.notificationService.showNotification(
                    new MessageModel(
                      MessageType.Info,
                      "Transaction not finished"
                    ),
                    MessageContentType.Text
                  );
                }
              }
            );
          } else {
            this.transactionInProgress = false;
            this.notificationService.showNotification(
              new MessageModel(MessageType.Info, "Transaction not finished"),
              MessageContentType.Text
            );
          }
        });
      }
    );
  }

  private extractMetadata(array: any, symbol: string) {
    for (var i = 0; i < array.length; i++) {
      if (symbol === array[i]["symbol"]) return array[i];
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

  // getList() {
  //   ////console.log("wandx");

  //   return
  // }

  //new Portfolio date :- 25/04/2018
  basketevmrevert: boolean = false;
  getList() {
    if (!sessionStorage.getItem("id_token")) {
      return;
    }
    if (sessionStorage.getItem("exchange") == "eth") {
      let walletAddress = sessionStorage.getItem("walletAddress");
      // requestOptions
      this.http
        .get(Constants.ethBasketUrl + "myTokenBaskets/" + walletAddress)
        .subscribe(
          (data) => {
            //console.log('basketlist', data.json());
            let basketDatas = data.json();
            let baskets = basketDatas.baskets;
            let betterData = basketDatas.betterDataExistanceArray;
            let pendingvalue = 0;
            if (baskets.length !== 0) {
              let pending = [];
              let active = [];
              // let buy = [];basketPublishStatus

              baskets.map((basket, valueKey) => {
                if (
                  basket["basketPublishStatus"] === "confirmed" &&
                  walletAddress.toLowerCase() ===
                  basket["currentOwner"].toLowerCase() &&
                  basket["liquidated"] === "no"
                ) {
                  // if(basket["basketCreationStatus"]== "EVMRevert"&&basket["basketID"]==(this.finalbasket_id-1))
                  // {
                  //   console.log('outofgas');
                  //   this.isResumeProcessing = false;
                  //   this.basketevmrevert=true;
                  //   //pending.push(basket);
                  //  // this.notificationService.showNotification(new MessageModel(MessageType.Error, 'outofgas error in basket trading'), MessageContentType.Text);
                  // }
                  // else{
                  //   this.basketevmrevert=false;
                  // }
                  if (
                    this.liquidate_contract == null ||
                    basket["basketContract"] != this.liquidate_contract
                  ) {
                    basket["liquidatestatus"] = false;
                  } else {
                    basket["liquidatestatus"] = true;
                  }
                  // if(basket["basketCreationStatus"]!= "EVMRevert")
                  // {
                  active.push(basket);
                  // }
                } else if (
                  walletAddress.toLowerCase() ===
                  basket["currentOwner"].toLowerCase() &&
                  basket["liquidated"] === "no"
                ) {
                  // this.isResumeProcessing = true;
                  console.log(
                    "basketid",
                    this.basketid,
                    basket,
                    walletAddress.toLowerCase()
                  );
                  pendingvalue = 1;
                  this.basketstatus = false;
                  if (basket["basketContract"] === "") {
                    console.log("l1");
                    this.basketstatus = true;
                    // if(basket["basketCreationStatus"]=="nonceTooLow")
                    // {
                    //   basket["canResume"] = 'pending';
                    // }
                    // else{
                    //   basket["canResume"] = 'nonceTooLow';
                    // }
                    basket["canResume"] = basket["basketCreationStatus"];
                  } else if (betterData[valueKey] == "true") {
                    console.log("l2");
                    basket["canResume"] = "processing";
                    this.resumeStatus = false;
                    this.isResumeProcessing = true;
                  } else if (betterData[valueKey] == "false") {
                    console.log("l3", this.basketid);
                    if (basket["basketID"] == this.basketid) {
                      this.resumeStatus = true;
                    } else {
                      this.resumeStatus = false;
                    }
                    basket["canResume"] = "resume";
                  }
                  // pending.push(basket);
                  this.http
                    .get(
                      Constants.ethBasketUrl +
                      `allData?userAddress=${basket[
                        "currentOwner"
                      ].toLowerCase()}&basketID=${basket["basketID"]}`
                    )
                    .subscribe((data) => {
                      var temp1 = data.json();
                      console.log(temp1);

                      var retryshow = 0;
                      temp1.basket["canResume"] = basket["canResume"];

                      if (temp1.trades.length > 0) {
                        temp1.trades.forEach((data, i) => {
                          temp1.basket.tokens.forEach((element, i1) => {
                            if (element.tradeStatus != "confirmed") {
                              if (data.buyToken == element.tokenSymbol) {
                                element["status"] = data.status;
                                if (basket["basketID"] == this.sentbasketid) {
                                  console.log(this.tradedata[i]);

                                  if (
                                    data.status == "sent" &&
                                    this.tradedata[i] == undefined
                                  ) {
                                    this.tradedata[i] = {
                                      symbol: data.buyToken,
                                      status: data.status,
                                      time: Math.round(
                                        new Date().getTime() / 1000
                                      ),
                                    };
                                    console.log(this.tradedata[i]);
                                  } else if (
                                    data.status == "sent" &&
                                    Math.round(new Date().getTime() / 1000) -
                                    this.tradedata[i].time >
                                    this.sentavgtime
                                  ) {
                                    console.log(
                                      Math.round(new Date().getTime() / 1000) -
                                      this.tradedata[i].time
                                    );

                                    element["tradesent"] = true;
                                  } else {
                                    element["tradesent"] = false;
                                  }
                                } else {
                                  this.tradedata = [];
                                  this.sentbasketid = basket["basketID"];
                                  element["tradesent"] = false;
                                }
                              }
                            } else {
                              element["status"] = element.tradeStatus;
                            }
                          });
                        });
                      } else {
                        temp1.basket.tokens.forEach((element, i) => {
                          element["status"] = element.tradeStatus;
                        });
                      }
                      if (betterData[valueKey] == "false") {
                        temp1.basket.tokens.forEach((element, i) => {
                          if (
                            (element.status == "nonceTooLow" ||
                              element.status == "replacementTxnUnderPriced") &&
                            retryshow == 0
                          ) {
                            element["retrybutton"] = true;
                            retryshow = 1;
                          } else {
                            element["retrybutton"] = false;
                          }

                          if (temp1.basket.tokens.length == i + 1) {
                            if (
                              (temp1.basket.basketCreationStatus ==
                                "nonceTooLow" ||
                                temp1.basket.basketCreationStatus ==
                                "replacementTxnUnderPriced") &&
                              retryshow == 0
                            ) {
                              temp1.basket["retrybutton"] = true;
                              retryshow = 1;
                              console.log("rb1", temp1);
                            } else {
                              temp1.basket["retrybutton"] = false;
                              console.log("rb2", temp1);
                            }
                            if (basket["basketID"] == this.sentbasketid) {
                              console.log(this.baskettime);

                              if (
                                temp1.basket.basketCreationStatus == "sent" &&
                                this.baskettime == null
                              ) {
                                this.baskettime = Math.round(
                                  new Date().getTime() / 1000
                                );
                                console.log(this.baskettime);
                              } else if (
                                temp1.basket.basketCreationStatus == "sent" &&
                                Math.round(new Date().getTime() / 1000) -
                                this.baskettime >
                                this.sentavgtime
                              ) {
                                console.log(
                                  Math.round(new Date().getTime() / 1000) -
                                  this.baskettime
                                );

                                temp1.basket["basketsent"] = true;
                              } else {
                                temp1.basket["basketsent"] = false;
                              }
                            } else {
                              this.baskettime = null;
                              this.sentbasketid = basket["basketID"];
                              temp1.basket["basketsent"] = false;
                            }
                          }
                        });
                      } else {
                        var index = 0;
                        for (var i = 0; i < 2; i++) {
                          temp1.betters.forEach((element, j) => {
                            index = index + 1;
                            if (i == 0) {
                              if (
                                (element.approval_status == "nonceTooLow" ||
                                  element.approval_status ==
                                  "replacementTxnUnderPriced") &&
                                retryshow == 0
                              ) {
                                element["approvalretrybutton"] = true;
                                retryshow = 1;
                              } else {
                                element["approvalretrybutton"] = false;
                              }
                              if (basket["basketID"] == this.sentbasketid) {
                                console.log(this.approvaldata[j]);

                                if (
                                  element.approval_status == "sent" &&
                                  this.approvaldata[j] == undefined
                                ) {
                                  this.approvaldata[j] = {
                                    symbol: element.token,
                                    status: element.approval_status,
                                    time: Math.round(
                                      new Date().getTime() / 1000
                                    ),
                                  };
                                  console.log(this.approvaldata[j]);
                                } else if (
                                  element.approval_status == "sent" &&
                                  Math.round(new Date().getTime() / 1000) -
                                  this.approvaldata[j].time >
                                  this.sentavgtime
                                ) {
                                  console.log(
                                    Math.round(new Date().getTime() / 1000) -
                                    this.approvaldata[j].time
                                  );

                                  element["approvalsent"] = true;
                                } else {
                                  element["approvalsent"] = false;
                                }
                              } else {
                                this.approvaldata = [];
                                this.sentbasketid = basket["basketID"];
                                element["approvalsent"] = false;
                              }
                            } else if (i == 1) {
                              if (
                                (element.transfer_status == "nonceTooLow" ||
                                  element.transfer_status ==
                                  "replacementTxnUnderPriced") &&
                                retryshow == 0
                              ) {
                                element["transferretrybutton"] = true;
                                retryshow = 1;
                              } else {
                                element["transferretrybutton"] = false;
                              }
                              if (basket["basketID"] == this.sentbasketid) {
                                console.log(this.transferdata[j]);

                                if (
                                  element.transfer_status == "sent" &&
                                  this.transferdata[j] == undefined
                                ) {
                                  this.transferdata[j] = {
                                    symbol: element.token,
                                    status: element.transfer_status,
                                    time: Math.round(
                                      new Date().getTime() / 1000
                                    ),
                                  };
                                  console.log(this.transferdata[j]);
                                } else if (
                                  element.transfer_status == "sent" &&
                                  Math.round(new Date().getTime() / 1000) -
                                  this.transferdata[j].time >
                                  this.sentavgtime
                                ) {
                                  console.log(
                                    Math.round(new Date().getTime() / 1000) -
                                    this.transferdata[j].time
                                  );

                                  element["transfersent"] = true;
                                } else {
                                  element["transfersent"] = false;
                                }
                              } else {
                                this.transferdata = [];
                                this.sentbasketid = basket["basketID"];
                                element["transfersent"] = false;
                              }
                            }
                            if (index == temp1.betters.length * 2) {
                              if (
                                (temp1.basket.basketPublishStatus ==
                                  "nonceTooLow" ||
                                  temp1.basket.basketPublishStatus ==
                                  "replacementTxnUnderPriced") &&
                                retryshow == 0
                              ) {
                                temp1.basket["publishretrybutton"] = true;
                                console.log("prb1", temp1, retryshow);
                                retryshow = 1;
                              } else {
                                temp1.basket["publishretrybutton"] = false;
                                console.log("prb2", temp1, retryshow);
                              }
                              if (basket["basketID"] == this.sentbasketid) {
                                console.log(this.publishtime);

                                if (
                                  temp1.basket.basketPublishStatus == "sent" &&
                                  this.publishtime == null
                                ) {
                                  this.publishtime = Math.round(
                                    new Date().getTime() / 1000
                                  );
                                  console.log(this.publishtime);
                                } else if (
                                  temp1.basket.basketPublishStatus == "sent" &&
                                  Math.round(new Date().getTime() / 1000) -
                                  this.publishtime >
                                  this.sentavgtime
                                ) {
                                  console.log(
                                    Math.round(new Date().getTime() / 1000) -
                                    this.publishtime
                                  );

                                  temp1.basket["publishsent"] = true;
                                } else {
                                  temp1.basket["publishsent"] = false;
                                }
                              } else {
                                this.publishtime = null;
                                this.sentbasketid = basket["basketID"];
                                temp1.basket["publishsent"] = false;
                              }
                            }
                          });
                        }
                      }

                      console.log("basketlist", temp1);
                      pending.push(temp1);
                      console.log("pending", pending);

                      this.setPendingPortfolio(_.uniq(pending));
                      this._portfolioPendingData.next(_.uniq(pending));
                    });
                }
                if (valueKey === baskets.length - 1 && pendingvalue == 0) {
                  console.log("pendingvalue", pendingvalue, pending);

                  this.setPendingPortfolio(_.uniq(pending));
                  this._portfolioPendingData.next(_.uniq(pending));
                }
                if (valueKey === baskets.length - 1) {
                  this.setSellAblePortfolios(_.uniq(active));
                  // this.setOrderbookPortfolio(_.uniq(buy));
                  //this.setPendingPortfolio(_.uniq(pending));
                  this._portfolioActiveData.next(_.uniq(active));
                  //this._portfolioPendingData.next(_.uniq(pending));
                  // this._orderBookData.next(_.uniq(buy));
                }
              });
            } else {
              this.setSellAblePortfolios([]);
              // this.setOrderbookPortfolio([]);
              this.setPendingPortfolio([]);
              this._portfolioActiveData.next([]);
              this._portfolioPendingData.next([]);
              // this._orderBookData.next([]);
            }
          },
          (err) => {
            this.setSellAblePortfolios([]);
            // this.setOrderbookPortfolio([]);
            this.setPendingPortfolio([]);
            this._portfolioActiveData.next([]);
            this._portfolioPendingData.next([]);
            this.isResumeProcessing = false;
            // //console.log("eth http error")
          }
        );
    }
  }
  getBasketList() {
    //////console.log("mady");
    var portfoliodata = [];
    //console.log(sessionStorage.getItem('walletAddress'));

    this.http
      .get(
        Constants.ethBasketUrl +
        "tokenBasketsNotMine/" +
        sessionStorage.getItem("walletAddress")
      )
      .subscribe(
        (res) => {
          //console.log(JSON.parse(res["_body"]));
          var portfolio = JSON.parse(res["_body"]);
          //console.log('portlength',portfolio.length);

          if (portfolio.length > 0) {
            portfolio.forEach((element, i) => {
              if (
                element.userAddress !=
                sessionStorage.getItem("walletAddress") &&
                element.currentOwner != sessionStorage.getItem("walletAddress")
              ) {
                if (
                  this.buy_contract == null ||
                  element["basketContract"] != this.buy_contract
                ) {
                  element["buystatus"] = false;
                } else {
                  element["buystatus"] = true;
                }
                portfoliodata.push(element);
              }
              if (portfolio.length === i + 1) {
                this._portfolioData.next(portfoliodata);
                //console.log(this.portfolioData$);
              }
            });
          } else {
            this._portfolioData.next(null);
          }
          //this._portfolioData.next(JSON.parse(res["_body"]))
        },
        (err) => {
          //console.log(err);
        }
      );
  }
  // getBasketList() {
  //   if (!sessionStorage.getItem('id_token')) {
  //     return;
  //   }
  //   if (sessionStorage.getItem('exchange') == 'aion') {
  //     let web3Instance = this.aionweb3.getWeb3();
  //     let headers = new Headers({
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     });
  //     let body = new URLSearchParams();
  //     let query = { currentOwnerOrSeller: '' };
  //     body.set('query', JSON.stringify(query));
  //     let requestOptions = new RequestOptions({ headers: headers });
  //     ////console.log("exchange aion getlist")
  //     this.http.post(Constants.AionbasketURL, {}, requestOptions).subscribe(data => {
  //       let temp = data.json();
  //       ////console.log("getBasketlist", data.json())
  //       let baskets = _.filter(temp, function (key) {
  //         return key['currentOwnerOrSeller'] !== sessionStorage.getItem('walletAddress');
  //       });
  //       if (baskets.length !== 0) {
  //         this.getPlatformTokens().then((res) => {
  //           let tokenList;
  //           tokenList = res;
  //           baskets.map((k, v) => {
  //             k['tokens'].map((k2, v2) => {
  //               tokenList.map((k1, v1) => {
  //                 if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
  //                   k2['symbol'] = k1.symbol;
  //                 }
  //               });
  //             });
  //           });
  //           let buy = [];
  //           baskets.map((key, value) => {
  //             key['tokens'].map((k2, v2) => {
  //               if (key['status'] === '1' && k2.symbol !== undefined) {
  //                 buy.push(key);
  //               }
  //             });
  //             if (value === baskets.length - 1) {
  //               this.setBuyAblePortfolios(_.uniq(buy));
  //               this._portfolioData.next(_.uniq(buy));
  //             }
  //           });
  //         }, (err) => {
  //           this.setBuyAblePortfolios([]);
  //           this._portfolioData.next([]);
  //         });
  //       } else {
  //         this.setBuyAblePortfolios([]);
  //         this._portfolioData.next([]);
  //       }
  //     });
  //   } else if (sessionStorage.getItem('exchange') == 'eth') {
  //     let web3Instance = this.web3.getWeb3();
  //     let headers = new Headers({
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     });
  //     let body = new URLSearchParams();
  //     let query = { currentOwnerOrSeller: '' };
  //     body.set('query', JSON.stringify(query));
  //     let requestOptions = new RequestOptions({ headers: headers });
  //     this.http.post(Constants.BashketURL, {}, requestOptions).subscribe(data => {
  //       let temp = data.json();
  //       ////console.log("getBasketlist", data.json())
  //       let baskets = _.filter(temp, function (key) {
  //         return key['currentOwnerOrSeller'] !== sessionStorage.getItem('walletAddress');
  //       });
  //       if (baskets.length !== 0) {
  //         this.getPlatformTokens().then((res) => {
  //           let tokenList;
  //           tokenList = res;
  //           baskets.map((k, v) => {
  //             k['tokens'].map((k2, v2) => {
  //               tokenList.map((k1, v1) => {
  //                 if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
  //                   k2['symbol'] = k1.symbol;
  //                 }
  //               });
  //             });
  //           });
  //           let buy = [];
  //           baskets.map((key, value) => {
  //             key['tokens'].map((k2, v2) => {
  //               if (key['status'] === '1' && k2.symbol !== undefined) {
  //                 buy.push(key);
  //               }
  //             });
  //             if (value === baskets.length - 1) {
  //               this.setBuyAblePortfolios(_.uniq(buy));
  //               this._portfolioData.next(_.uniq(buy));
  //             }
  //           });
  //         }, (err) => {
  //           this.setBuyAblePortfolios([]);
  //           this._portfolioData.next([]);
  //         });
  //       } else {
  //         this.setBuyAblePortfolios([]);
  //         this._portfolioData.next([]);
  //       }
  //     });
  //   } else if (sessionStorage.getItem('exchange') == 'wan') {
  //     let web3Instance = this.web3.getWeb3();
  //     let headers = new Headers({
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     });
  //     let body = new URLSearchParams();
  //     let query = { currentOwnerOrSeller: '' };
  //     body.set('query', JSON.stringify(query));
  //     let requestOptions = new RequestOptions({ headers: headers });
  //     this.http.post(Constants.BashketURLWAN, {}, requestOptions).subscribe(data => {
  //       let temp = data.json();
  //       let baskets = _.filter(temp, function (key) {
  //         return key['currentOwnerOrSeller'] !== sessionStorage.getItem('walletAddress');
  //       });
  //       if (baskets.length !== 0) {
  //         this.allplatformtokenWan.forEach((res) => {
  //           let tokenList;
  //           tokenList = res;
  //           baskets.map((k, v) => {
  //             k['tokens'].map((k2, v2) => {
  //               tokenList.map((k1, v1) => {
  //                 if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
  //                   k2['symbol'] = k1.symbol;
  //                 }
  //               });
  //             });
  //           });
  //           let buy = [];
  //           baskets.map((key, value) => {
  //             key['tokens'].map((k2, v2) => {
  //               if (key['status'] === '1' && k2.symbol !== undefined) {
  //                 buy.push(key);
  //               }
  //             });
  //             if (value === baskets.length - 1) {
  //               this.setBuyAblePortfolios(_.uniq(buy));
  //               this._portfolioData.next(_.uniq(buy));
  //             }
  //           });
  //         }, (err) => {
  //           this.setBuyAblePortfolios([]);
  //           this._portfolioData.next([]);
  //         });
  //       } else {
  //         this.setBuyAblePortfolios([]);
  //         this._portfolioData.next([]);
  //       }
  //     });
  //   }
  // }

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
    ////console.log('new assest set', assest);
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
  //////////////including depositdata/////////////
  despoitedata(nonce, authdata) {
    ////changing function name for basket bug
    let data = {
      nonce: nonce,
      authdata: authdata,
    };
    this._depositdata.next(data);
  }

  resumedataUpdate(contractAddress, basketCreationHash, basketID) {
    let data = {
      contractAddress: contractAddress,
      basketCreationHash: basketCreationHash,
      basketID: basketID,
    };
    this._resumedata.next(data);
  }
  ////////////////////////////////////
  logout(data) {
    this._logoutdata.next(data);
  }
  /////////////null depositdata////////////////
  depositnull() {
    this._depositdata.next(null);
  }
  resumenull() {
    this._resumedata.next(null);
  }
  publishComplete() {
    this._publishComplete.next(true);
  }

  buyComplete(portfolio) {
    //console.log('called buyComplete');
    var obj = {
      basketContract: portfolio.basketContract,
      newOwner: sessionStorage.getItem("walletAddress"),
    };

    this.http
      .post(Constants.ethBasketUrl + "updateCurrentOwner", obj)
      .subscribe(
        (res) => {
          //console.log(res);
          setTimeout(() => {
            this.buy_contract = null;
          }, 3000);
        },
        (err) => {
          //console.log(err);
        }
      );
    this.displayGif = "none";
    this.notificationService.showNotification(
      new MessageModel(
        MessageType.Success,
        "Basket bought successfully! You can check it out under 'My Token Baskets > Active' tab."
      ),
      MessageContentType.Text
    );
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
    if (sessionStorage.getItem("exchange") == "aion") {
      return new Promise((resolve, reject) => {
        if (!this.tokenService.getToken()) {
          reject(false);
        }
        let headers = new Headers({
          "content-type": "application/json",
          // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
          Token: this.tokenService.getToken().Jwt,
        });
        let requestOptions = new RequestOptions({ headers: headers });
        this.http
          .get(Constants.ServiceURLAION + "PlatformToken", requestOptions)
          .subscribe((data) => {
            // ////console.log('tokes', data.json());
            resolve(data.json());
          });
      });
    } else if (sessionStorage.getItem("exchange") == "eth") {
      return new Promise((resolve, reject) => {
        if (!this.tokenService.getToken()) {
          reject(false);
        }
        let headers = new Headers({
          "content-type": "application/json",
          "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
          Token: this.tokenService.getToken().Jwt,
        });
        let requestOptions = new RequestOptions({ headers: headers });
        this.http
          .get(Constants.ServiceURL + "PlatformToken", requestOptions)
          .subscribe((data) => {
            // ////console.log('tokes', data.json());
            resolve(data.json());
          });
      });
    } else if (sessionStorage.getItem("exchange") == "wan") {
      ////console.log('getPlatformTokens4')
      return new Promise((resolve, reject) => {
        ////console.log(sessionStorage.getItem('id_token'));

        if (!sessionStorage.getItem("id_token")) {
          reject(false);
        }
        let headers = new Headers({
          "content-type": "application/json",
          //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
          Token: sessionStorage.getItem("id_token"), //this.tokenService.getToken().Jwt
        });
        let requestOptions = new RequestOptions({ headers: headers });
        this.http
          .get(Constants.ServiceURLWAN + "PlatformToken", requestOptions)
          .subscribe((data) => {
            ////console.log('token',data.json());

            this.allplatformtokenWan.push(data.json());
            ////console.log('tokes', this.allplatformtokenWan);
            resolve(data.json());
          });
      });
    }
  }

  requestPortfolio(theme) {
    return new Promise((resolve, reject) => {
      if (!this.auth.isAuthenticated()) return;
      const publishRequestObject = {};
      publishRequestObject["PortfolioId"] = UUID.UUID();
      publishRequestObject["PortfolioTheme"] = theme.name;
      publishRequestObject["PortfolioPriceInEth"] = theme.PortfolioPriceInEth;
      publishRequestObject["PortfolioMaxPriceInEth"] =
        theme.PortfolioMaxPriceInEth;
      publishRequestObject["UserAccount"] = this.web3.getWeb3().eth.coinbase;
      publishRequestObject["ExpiryDate"] = moment()
        .add(7, "days")
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      publishRequestObject["Created"] = moment().format(
        "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
      );
      publishRequestObject["UserId"] = sessionStorage.getItem("user_id");
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .post(
          Constants.ThemedBasketRequest + "api/portfoliorequests/create",
          publishRequestObject,
          requestOptions
        )
        .subscribe(
          (data) => {
            resolve(data.json());
          },
          (err) => {
            ////console.log(err);
            reject(err);
          }
        );
    });
  }

  getrequestPortfolio() {
    return new Promise((resolve, reject) => {
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt,
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(
          Constants.ThemedBasketRequest +
          "api/portfoliorequests/getuserrequests",
          requestOptions
        )
        .subscribe(
          (data) => {
            resolve({ data: data.json() });
          },
          (err) => {
            ////console.log(err);
            reject(err);
          }
        );
    });
  }
}
