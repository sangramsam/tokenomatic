import { Injectable } from "@angular/core";
import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";
import { Constants } from "../models/constants";
import {
  MessageContentType,
  MessageModel,
  MessageType
} from "../models/message.model";
import { NavigationService } from "../services/nav.service";
import { WalletService } from "../services/wallet.service";
import { Web3Service } from "../services/web3.service";
import { NotificationManagerService } from "../services/notification-manager.service";
import { SwitchThemeService } from "../services/switch-theme.service";
import { TokenService } from "../services/token.service";
import { ChartService } from "../services/chart.service";
import * as _ from "underscore";
import { PortfolioService } from "../services/portfolio.service";
import { BigNumber } from "bignumber.js";
import { validate } from "codelyzer/walkerFactory/walkerFn";
import { resetFakeAsyncZone } from "@angular/core/testing";
import { constants } from "os";
import { UserService } from "./user.service";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
var txDecoder = require('ethereum-tx-decoder');
var Tx = require("ethereumjs-tx");
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
export class EthBasketService {
  selectedToken: string = "WAND";
  allAvailableContracts: Array<any> = [];
  allAvailableTokenContracts: Array<any> = [];
  userAccountSummary: Array<any> = [];
  showWalletLoader = true;
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance = 0.0;
  wxETHBalance = 0.0;
  usd: any;
  contractAddress: any;
  tokenListAddress: Array<any> = [];
  tokenWithbalance: Array<any> = [];
  vsbContract: any;
  trackDepositeToken = 0;
  private availableTokensType: Array<string> = [
    "WAND",
    "ZRX",
    "QTUM",
    "VERI",
    "GNT",
    "DEX"
  ];
  private tokenContracts: any;
  private tokenContractChange: Subscription;
  private userAccountChange: Subscription;
  private transactionInProgress: boolean = false;
  private authorizeTokenList = [];
  private authorizeTransactionTimer: any;
  public showLoader = true;
  public track = 0;
  public platformTokens: any;
  public privateKey: any;
  public serialized_data: any = [];
  public portfolioTokenWithValue: any;
  public wizard3: boolean = false;
  public deposit_serialized_data: any = [];
  public displaybask_loader: any = "none";
  public assets: any = [];
  public valumes: any = [];
  public basketid: number = 0;
  public deposit_api_status: number = 0;
  public publish_api_status: number = 0;
  public safeGasPrice: any;
  public tradeaddress:any=null;
  public tradedata=[];
  private _tradesWithoutBasketDetails = new BehaviorSubject<any>(null);
  tradesWithoutBasketDetails$ = this._tradesWithoutBasketDetails.asObservable();
  constructor(
    private navService: NavigationService,
    private http: Http,
    private portfolioService: PortfolioService,
    private zone: NgZone,
    private walletService: WalletService,
    private notificationsService: NotificationManagerService,
    readonly switchThemeService: SwitchThemeService,
    private web3: Web3Service,
    private router: Router,
    private tokenService: TokenService,
    private chartService: ChartService,
    private userService: UserService
  ) {
    console.log("cuurent nav", navService.getCurrentActiveTab());
    // this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(data => this.handleContractChange(data));
    // this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(data => this.handleUserAccountSummaryChange(data));
  }

  ngOnInit() {
    // this.showWalletLoader = true;
    // this.authorizeTokenList = [];
    // let web3 = this.web3.getWeb3();
    // web3.eth.getBalance(web3.eth.coinbase, (err, data) => {
    //   this.currentEtherBalance = web3.fromWei(data).toFixed(4);
    // });
    // if (this.tokenService.getToken() === undefined) {
    //   this.tokenService.fetchToken();
    // }
    // else {
    //   this.loadData();
    //   this.isWalletActive();
    // }
    // let __this = this;
    // this.chartService.setUSD(function (err, result) {
    //   if (!err) {
    //     __this.usd = __this.chartService.getUSD();
    //   }
    // });
    // this.track = 0;
    // this.getPlatformTokens();
  }

  // ngOnDestroy(): void {
  //   this.tokenContractChange.unsubscribe();
  //   this.userAccountChange.unsubscribe();
  //   if (this.authorizeTransactionTimer) {
  //     clearTimeout(this.authorizeTransactionTimer);
  //   }
  // }

  createPortfoliodata(
    data,
    selectedItems,
    demo,
    portfoliodata,
    finalbasket_id,
    curentBlock,
    privatekey
  ) {
    console.log(
      "data",
      data,
      selectedItems,
      demo,
      portfoliodata,
      finalbasket_id,
      curentBlock,
      privatekey
    );
    this.deposit_api_status = 0;
    this.publish_api_status = 0;
    this.notificationsService.showNotification(
      new MessageModel(
        MessageType.Info,
        "The 'Create Basket' button would be enabled once your current basket gets published to the blockchain."
      ),
      MessageContentType.Text
    );
    this.portfolioService.basketid = finalbasket_id;
    var portfolio = data;
    // this.portfolio_status = "unsent";
    // this.test();
    // this.showLoader = true;
    // this.displayGif = "block";
    // this.wizard1 = false;
    var foo = this;
    let web3Instance = this.web3.getWeb3();
    let _askValue = web3Functions.toBaseUnitAmount(data.askingPriceInWand, 18);
    let _expiryBlock = 3149112;
    let _name = web3Instance.fromAscii(data.portfolioName, 32);
    let _assets = [];
    let _volumes = [];
    let tokendetails = [];
    let tradecount = 0;
    //////console.log(this.selectedToke'http://localhost:3000/basket',objns);
    selectedItems.map(key => {
      if (key.balance > 0) {
        this.assets.push(key.address);
      } else {
        demo.map(key1 => {
          if (key1.trade_data.length > 0 && key1.address == key.address) {
            tradecount += 1;
            this.assets.push(key.address);
          }
        });
      }
    });
    //console.log("basketdata", this.selectedItems, this.portfolio, this.demo);

    portfoliodata.map(key => {
      if (key.balance > 0) {
        this.valumes.push(
          web3Functions.toBaseUnitAmount(key.Reqbalance, parseInt(key.decimals))
        );
        tokendetails.push({
          tokenSymbol: key.Symbol,
          amount: key.Reqbalance,
          tradeStatus: "confirmed",
          transferStatus: "unsent"
        });
      } else {
        demo.map(key1 => {
          if (key1.trade_data.length > 0 && key1.symbol == key.Symbol) {
            this.valumes.push(
              web3Functions.toBaseUnitAmount(
                key.Reqbalance,
                parseInt(key.decimals)
              )
            );
            tokendetails.push({
              tokenSymbol: key.Symbol,
              amount: key.Reqbalance,
              tradeStatus: "unsent",
              transferStatus: "unsent"
            });
          }
        });
      }
    });
    let _maker = this.userService.getCurrentUser().UserAccount;
    let finalData = {
      _askValue: _askValue,
      _expiryBlock: _expiryBlock,
      _name: _name,
      _assets: this.assets,
      _volumes: this.valumes,
      _maker: _maker
    };
    //console.log("data", finalData);
    var privateKey = privatekey;
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    var count;

    this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
        web3Instance.eth.getTransactionCount(_maker, (err, res) => {
          //web3Instance.eth.getTransactionCount(_maker,(res)=>{
          //count = res;
          ////console.log('nonce',res);

          let portEth = web3Instance.eth.contract(Constants.createPortfolio);
          let portContract = portEth.at(Constants.CretaeContractAddress);
          var data = portContract.createPortfolio.getData(
            _maker,
            this.assets,
            this.valumes,
            _askValue,
            curentBlock,
            _name,
            { from: _maker }
          );
          web3Instance.eth.estimateGas(
            {
              to: Constants.CretaeContractAddress,
              data: data
            },
            (err, res) => {
              console.log("estimategas", res);
            }
          );
          this.web3.getWeb3().eth.getGasPrice((err, gp) => {
            console.log("GasPrice", gp.toString(10));
          });
          console.log(data);

          if (Constants.Chainid == 1) {
            this.safeGasPrice = web3Instance.toHex(
              oracle.json().average * 100000000
            );
          } else {
            this.safeGasPrice = "0x4A817C800";
          }

          const txParams = {
            gasPrice: this.safeGasPrice,
            gasLimit: 4000000,
            to: Constants.CretaeContractAddress,
            data: data,
            from: _maker,
            chainId: Constants.Chainid,
            Txtype: 0x01,
            //value:convertedAmount,
            nonce: res + tradecount
          };

          //nonce = nonce + 1;
          const tx = new Tx(txParams);
          tx.sign(privateKey);
          ////console.log('tx',tx);

          const serializedTx = tx.serialize();
          ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));

          const obj = {
            serializedTx: "0x" + serializedTx.toString("hex")
          };

          let basketdata = {
            userAddress: this.userService.getCurrentUser().UserAccount,
            currentOwner: this.userService.getCurrentUser().UserAccount,
            basketID: finalbasket_id,
            basketName: portfolio.portfolioName,
            basketPrice: portfolio.askingPriceInWand,
            basketContract: "",
            basketCreationHash: "",
            basketCreationSign: "0x" + serializedTx.toString("hex"),
            basketCreationStatus: "unsent",
            basketPublishHash: "",
            basketPublishSign: "",
            basketPublishStatus: "unsent",
            tokens: tokendetails,
            liquidated: "no",
            tradable: "true",
            expiresAt: curentBlock
          };
          //console.log("basketobj", basketdata);
          // this.notificationsService.showNotification(
          //   new MessageModel(
          //     MessageType.Info,
          //     "DO NOT MAKE ANY TRANSACTIONS USING YOUR ADDRESS:" +
          //       _maker.substring(0, 13) +
          //       "..., UNTIL YOUR BASKET GETS PUBLISHED TO THE BLOCKCHAIN. OTHERWISE IT MAY NOT GET PUBLISHED AT ALL."
          //   ),
          //   MessageContentType.Text
          // );
          return new Promise((resolve, reject) => {
            // this.http.post('http://localhost:3000/basket',obj).subscribe(res =>{

            // return new Promise((resolve, reject) => {
            this.http
              .post(Constants.ethBasketUrl + "addBasket", basketdata)
              .subscribe(
                res => {
                  resolve(res);

                  this.trackCreatePortfolioTransaction(
                    basketdata.userAddress,
                    basketdata.basketID,
                    web3Instance,
                    privatekey
                  );
                  this.notificationsService.showNotification(
                    new MessageModel(
                      MessageType.Info,
                      "The basket publishing may take a while. Meanwhile, you are free to close the desktop app, and come back later to check out your basket under 'My Token Baskets' tab"
                    ),
                    MessageContentType.Text
                  );
                },
                err => {
                  resolve(err);
                }
              );
          });
        });
      });
  }

  public trackCreatePortfolioTransaction(
    userAddress,
    basketID,
    web3Instance,
    privateKey
  ) {
    //if (this.orderBookRefreshTimer) clearTimeout(this.orderBookRefreshTimer);
    // web3Instance.eth.getTransactionReceipt(address, (err, res) => {
    // if (res) {
    // setInterval(fetchContract(userAddress, basketID), 3000);
    let basket;
    new Promise((resolve, reject) => {
      this.http
        .get(
          Constants.ethBasketUrl +
            `basketContractByPair?userAddress=${userAddress}&basketID=${basketID}`
        )
        .subscribe(data => {
       //  console.log('tokes', data.json());
          data = data.json();
          resolve(data);
          basket = data;
         // console.log("BASKET", basket.basketContract);
          if (basket.basketContract.trim()) {
            this.zone.run(() => {
              // clearTimeout(this.orderBookRefreshTimer);
              console.log("trackCreatePortfolioTransaction");

              this.initiateAutoRefresh(
                basket.basketContract,
                basket.basketCreationHash,
                basket.basketID,
                privateKey,
                basket.tokens,
                basket.tokens.length
              );
            });
          } else if(basket.basketCreationStatus!="EVMRevert"&&basket.basketCreationStatus!="nonceTooLow"&&basket.basketCreationStatus!="replacementTxnUnderPriced"&&basket.basketCreationStatus!="insuffETH"){
            this.trackCreatePortfolioTransaction(
              userAddress,
              basketID,
              web3Instance,
              privateKey
            );
          }
          // this.initiateAutoRefresh(data.basketContract);
        });
    });
  }

  private initiateAutoRefresh(
    contractAddress,
    basketCreationHash,
    basketID,
    privateKey,
    tokens,
    tokenlength
  ) {
    var foo=this;
    console.log("initiateAutoRefresh",tokenlength,foo.tokenWithbalance);

    foo.walletService.setPortfolioAddress(contractAddress); 
    foo.walletService.setPortfolioTransactionhash(basketCreationHash);

    foo.tokenauthorization(privateKey,tokenlength, "block");
    var interval = setInterval(function() {
      console.log(foo.tokenWithbalance.length);
      
      if(foo.tokenWithbalance.length==tokenlength)
      {
      foo.authorize_start(basketID,tokens);
      clearInterval(interval);
      }
      // this.showLoader = false;
      // this.displayGif = "none";
      // this.wizard2 = true;
    }, 10000);
    // }
    // this.zone.run(() => {
    //   instructorEvent.stopWatching();
    // });
    // }
    // });
  }

  public initiateAutoRefreshresume(
    contractAddress,
    basketCreationHash,
    basketID,
    privateKey,
    tokens,
    tokenlength
  ) {
    var foo=this;
    console.log(
      "initiateAutoRefreshresume",
      contractAddress,
      basketCreationHash,
      basketID,
      privateKey,
      tokenlength,
      this.tokenWithbalance
    );
    foo.deposit_api_status = 0;
    foo.publish_api_status = 0;
    //let currentWallet = this.savedWalletsService.getCurrentWallet();
    foo.walletService.setPortfolioAddress(contractAddress);
    foo.walletService.setPortfolioTransactionhash(basketCreationHash);
    foo.tokenauthorization(privateKey,tokenlength, "block");

    var interval = setInterval(function() {
      if(foo.tokenWithbalance.length==tokenlength)
      {
      foo.authorize_start(basketID,tokens);
      clearInterval(interval);
      }
      // this.showLoader = false;
      // this.displayGif = "none";
      // this.wizard2 = true;
    }, 10000);
  }

  tokenauthorization(privatekey,tokenlength, status) {
    console.log("tokenauthorization", privatekey, status);

    this.displaybask_loader = status;
    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(
      data => this.handleContractChange(data)
    );
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(
      data => this.handleUserAccountSummaryChange(data)
    );
    this.showWalletLoader = true;
    this.authorizeTokenList = [];
    this.privateKey = privatekey;
    let web3 = this.web3.getWeb3();

    web3.eth.getBalance(web3.eth.coinbase, (err, data) => {
      this.currentEtherBalance = web3.fromWei(data).toFixed(4);
    });

    if (this.tokenService.getToken() === undefined) {
      this.tokenService.fetchToken();
    } else {
      this.loadData();
      this.isWalletActive();
    }
    let __this = this;
    this.chartService.setUSD(function(err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
    this.track = 0;
    this.getPlatformTokens(tokenlength);
  }

  isWalletActive() {
    if (this.navService.getCurrentActiveTab() === "dashboard") {
      this.showContent = true;
    } else {
      this.showContent = false;
    }
  }

  handleContractChange(data) {
    if (data === undefined) return;
    this.allAvailableContracts = data;
    for (var i = 0; i < data.length; i++) {
      if (data[i].isTokenContract) {
        data[i]["AuthorizationAmount"] = 0;
        this.allAvailableTokenContracts.push(data[i]);
      }
    }
    if (!this.hasUASummaryUpdateWithTC) this.updateUASummaryWithTokenContract();
  }

  handleUserAccountSummaryChange(data) {
    this.showWalletLoader = false;
    if (data === undefined) return;
    this.userAccountSummary = data.Balances;
    this.hasUASummaryUpdateWithTC = false;
    this.updateUASummaryWithTokenContract();
  }

  updateUASummaryWithTokenContract() {
    if (!this.allAvailableTokenContracts || !this.userAccountSummary) return;
    var self = this;
    this.hasUASummaryUpdateWithTC = true;
    self.allAvailableTokenContracts.forEach(function(it, i) {
      self.userAccountSummary.forEach(function(jt, j) {
        if (it.symbol && it.symbol == jt.Symbol) jt.tokenContract = it;
      });
    });
  }

  refreshAccountSummary() {
    this.showWalletLoader = true;
    this.walletService.fetchAccountSummary();
  }

  deposit() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(
        new MessageModel(MessageType.Info, "Transaction is in progress"),
        MessageContentType.Text
      );
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (
      userAccount === null ||
      userAccount === undefined ||
      userAccount.length === 0
    ) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get user account, please check wallet"
        ),
        MessageContentType.Text
      );
      return;
    }

    this.notificationsService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Depositing " +
          this.amount +
          " ETH as WXETH to enable basket creation"
      ),
      MessageContentType.Text
    );
    let wxEthData = this.getContract("WXETH");
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get ether token details"
        ),
        MessageContentType.Text
      );
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.deposit(
      userAccount,
      { from: userAccount, value: convertedAmount },
      (err, result) => {
        this.transactionInProgress = false;
        if (!result || result === undefined || result === null) {
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "Transaction cancelled!"
            ),
            MessageContentType.Text
          );
          return;
        }
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Success,
            "Token deposit successful, please wait for transaction to complete"
          ),
          MessageContentType.Text
        );
        return;
      }
    );
  }

  withdraw() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(
        new MessageModel(MessageType.Info, "Transaction is in progress"),
        MessageContentType.Text
      );
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (
      userAccount === null ||
      userAccount === undefined ||
      userAccount.length === 0
    ) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get user account, please check Wallet"
        ),
        MessageContentType.Text
      );
      return;
    }

    this.notificationsService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Withdrawing " + this.amount + " WXETH as ETH"
      ),
      MessageContentType.Text
    );
    let wxEthData = this.getContract("WXETH");
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get ether token details"
        ),
        MessageContentType.Text
      );
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.withdraw(
      convertedAmount,
      { from: userAccount },
      (err, result) => {
        this.transactionInProgress = false;
        if (!result || result === undefined || result === null) {
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Error,
              "Transaction cancelled!"
            ),
            MessageContentType.Text
          );
          return;
        }
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Success,
            "Token withdrawal successful, please wait for transaction to complete"
          ),
          MessageContentType.Text
        );
        return;
      }
    );
  }
  authorize_start(basketID,tokens) {
    this.serialized_data = [];
    console.log("auto-s", this.tokenWithbalance);
    tokens.forEach((data,value) => {
      this.tokenWithbalance.forEach((element) => {
        if(data.tokenSymbol==element.symbol){
        this.authorize(element, element.value, value, element.symbol, basketID);
        }
      }); 
    });
    
  }
  authorize_begin(data, value) {
    console.log("data", data, value);
  }
  authorize(token: any, value: any, count, symbol, basketID) {
    this.showLoader = true;
    var contract, exchange;
    if (
      this.allAvailableContracts === null ||
      this.allAvailableContracts === undefined ||
      this.allAvailableContracts.length === 0
    )
      return;
    var myTokenContract = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
    var instanceMyTokenContract = myTokenContract.at(token.address);
    var userAccount = this.web3.getWeb3().eth.coinbase;
    if (parseFloat(token.AuthorizationAmount) < parseFloat(value)) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Info,
          "Please enter allowance greater then the Token balance"
        ),
        MessageContentType.Text
      );
    } else {
      this.checkAndAuthorize(
        instanceMyTokenContract,
        userAccount,
        this.contractAddress,
        web3Functions.toBaseUnitAmount(
          token.AuthorizationAmount,
          token.data.decimals
        ),
        token.address,
        count,
        symbol,
        basketID
      );
      // this.notificationsService.showNotification(
      //   new MessageModel(MessageType.Info, "Authorization Initiated"),
      //   MessageContentType.Text
      // );
    }
  }

  getWalletInfo(data) {
    let tempArray = data;
    tempArray.map((keys1, value) => {
      this.platformTokens.map(key => {
        if (key.symbol === keys1.symbol) {
          keys1.data = key;
          if (value === tempArray.length - 1) {
            console.log("getWalletInfo", tempArray);
            if (this.portfolioService.getNewTokenValue()) {
              console.log(
                "token value",
                this.portfolioService.getNewTokenValue()
              );
              let newAssets = this.portfolioService.getNewTokenValue();
              this.checkWithBalanceOfToken(tempArray, newAssets, res => {
                if (res) {
                  this.walletService.setNewPortfolioTokenWithValue(res);
                  this.showLoader = false;
                  this.getAllowance(res);
                  if (res.length === 0) {
                    this.next();
                  }
                  this.tractButton();
                }
              });
            } else {
              this.tokenWithbalance = tempArray;
              console.log("final", this.tokenWithbalance);
              this.showLoader = false;
              this.getAllowance(this.tokenWithbalance);
              this.walletService.setNewPortfolioTokenWithValue(
                this.tokenWithbalance
              );
              this.tractButton();
            }
            this.zone.run(() => {});
          }
        }
      });
    });
  }

  checkWithBalanceOfToken(data, newAssets, callback) {
    newAssets.map((key, value1) => {
      data.map((key2, value) => {
        if (
          key2.address ===
          (key.address === undefined ? key.tokenAddress : key.address)
        ) {
          console.log("balance", key.value, key2.balanceOfToken, key2.symbol);
          if (key2.balanceOfToken !== 0) {
            if (key2.balanceOfToken >= key.value) {
              data.splice(value, 1);
              console.log("if", data);
            } else {
              key2.value = key.value - key2.balanceOfToken;
              console.log("else", data);
            }
          }
          if (value1 === newAssets.length - 1) {
            callback(data);
          }
        }
      });
    });
  }

  getTokenAddress(data) {
    let tempArray = data;
    tempArray.map((key2, value) => {
      this.platformTokens.map(key => {
        if (key.address.toLowerCase() === key2.address.toLowerCase()) {
          key2["symbol"] = key.symbol;
          if (value === data.length - 1) {
            console.log("getTokenAddress", tempArray);
            this.getWalletInfo(tempArray);
          }
        }
      });
    });
  }

  getPortfolioToken(tokenlength) {
    console.log("called getPortfolioToken",tokenlength);
    if (this.walletService.getPortfolioAddress()) {
      this.contractAddress = this.walletService.getPortfolioAddress();
      console.log("address", this.walletService.getPortfolioAddress());
      let web3Instance = this.web3.getWeb3();
      let vsb = web3Instance.eth.contract(Constants.VBPABI);
      let vsbContract = vsb.at(this.contractAddress);
      this.vsbContract = vsbContract;
      for (let i = 0; i < 50; i++) {
        vsbContract.listAssets(JSON.stringify(i), (err, data) => {
          if (data) {
            console.log(data,i);
            
            var temp = {};
            temp["address"] = data;
            this.tokenListAddress.push(temp);
            console.log(this.tokenListAddress,temp);
            
            if (this.tokenListAddress.length === 50) {
              let arr = _.filter(this.tokenListAddress, function(item) {
                return item.address !== "0x";
              });
              console.log("getPortfolioToken",arr);

              this.getAssest(arr, vsbContract,tokenlength);
            }
          }
        });
      }
    }
  }

  getAssest(data, vsbContract,tokenlength) {
    let tempArray = [];
    data.map((key, value) => {
      var temp = {};
      vsbContract.assetStatus(key.address, (err, result) => {
        if (result === true) {
          vsbContract.assets(key.address, (err, res) => {
            temp["address"] = key.address;
            let token = this.platformTokens.filter(
              token => token.address.toLowerCase() === key.address.toLowerCase()
            );
            if (token && token.length === 1) {
              let decimals = token[0].decimals;
              temp["value"] = new BigNumber(res)
                .dividedBy(new BigNumber(10).pow(decimals))
                .toJSON();
              tempArray.push(temp);
              if(tokenlength==tempArray.length)
              {
              this.getBalanceOfToken(tempArray, this.vsbContract);
              }
            }
          });
        }
      });
    });
  }

  getBalanceOfToken(data, vsbContract) {
    console.log("getBalanceOfToken", data);
    let tempArray = [];
    data.map(key => {
      var temp = {};
      vsbContract.balanceOfToken(
        this.web3.getWeb3().eth.coinbase,
        key.address,
        (err, res) => {
          if (!res) {
            return;
          }
          temp["address"] = key.address;
          temp["value"] = key.value;
          let token = this.platformTokens.filter(
            token => token.address.toLowerCase() === key.address.toLowerCase()
          );
          if (token && token.length === 1) {
            let decimals = token[0].decimals;
            temp["balanceOfToken"] = new BigNumber(res)
              .dividedBy(new BigNumber(10).pow(decimals))
              .toJSON();
            temp["AuthorizationAmount"] = 1000;
            tempArray.push(temp);
            if (tempArray.length === data.length) {
              this.getTokenAddress(tempArray);
            }
          }
        }
      );
    });
  }

  tractButton() {
    this.zone.run(() => {});
    if (this.track !== this.authorizeTokenList.length) {
      //console.log("called if")
      return true;
    } else {
      //console.log("called if")
      if (this.authorizeTokenList.length > 0) {
        for (var i = 0; i < this.authorizeTokenList.length; i++) {
          if (this.authorizeTokenList[i].status === false) return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  tractButton1() {
    console.log("tractbutton1");

    let count = 0;
    this.zone.run(() => {});
    if (this.track == this.authorizeTokenList.length) {
      for (var i = 0; i < this.authorizeTokenList.length; i++) {
        if (this.authorizeTokenList[i].status === true) count++;
      }
      if (this.authorizeTokenList.length == count) {
        this.next();
      }
    }
  }
  tractButtonTransaction() {
    this.authorizeTokenList.map(key => {
      this.tractTransaction(key.address).then(res => {
        console.log("response", res);
        console.log("called getAllowanceAfterTransactionSuccess");
        //this.getAllowanceAfterTransactionSuccess();
      });
    });
  }

  next() {
    console.log("called");
    if (this.authorizeTransactionTimer) {
      clearTimeout(this.authorizeTransactionTimer);
    }
    this.portfolioService.despoiteToken();
  }

  public getAllowance(data) {
    //console.log("data",data)
    data.map((key, value) => {
      var myTokenContract = this.web3
        .getWeb3()
        .eth.contract(Constants.TokenAbi);
      var instanceMyTokenContract = myTokenContract.at(key.address);
      this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then(
        res => {
          this.zone.run(() => {
            key.allowance = res;
            if (data.length - 1 == value) {
              this.validateAllowance(data);
            }
          });
        }
      );
    });
  }

  public getAllowanceAfterTransactionSuccess() {
    this.tokenWithbalance.map((key, value) => {
      var myTokenContract = this.web3
        .getWeb3()
        .eth.contract(Constants.TokenAbi);
      var instanceMyTokenContract = myTokenContract.at(key.address);
      this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then(
        res => {
          this.zone.run(() => {
            key.allowance = res;
          });
        }
      );
    });
  }

  getAllowanceData(instanceMyTokenContract, contractAddress) {
    return new Promise((resolve, reject) => {
      instanceMyTokenContract.allowance(
        this.web3.getWeb3().eth.coinbase,
        contractAddress,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              new BigNumber(result)
                .dividedBy(new BigNumber(10).pow(18))
                .toJSON()
            );
          }
        }
      );
    });
  }

  private tractTransaction(address) {
    return new Promise((resolve, reject) => {
      let web3Instance = this.web3.getWeb3();
      if (this.authorizeTransactionTimer)
        web3Instance.eth.getTransactionReceipt(address, (err, res) => {
          if (res) {
            if (res.status === "0x1") {
              this.showLoader = false;
              this.getAllowanceAfterTransactionSuccess();
              this.authorizeTokenList.map(key => {
                if (key.address === address) {
                  key.status = true;
                  this.tractButton1();
                }
              });
              resolve(true);
            }
          }
        });
      this.authorizeTransactionTimer = setTimeout(() => {
        this.tractTransaction(address);
      }, 1000);
    });
  }

  private loadData() {
    if (this.walletService.getUserAccountSummary() !== undefined) {
      this.showWalletLoader = false;
      //console.log("userAccountSummary",this.walletService.fetchAccountSummary());
      this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
      // this.tokenListAddress.map((key)=>{
      //   this.userAccountSummary = this.userAccountSummary.filter((data) => data.address === key.address);
      // })
      this.wxETHBalance = this.userAccountSummary.filter(
        wxethbalance => wxethbalance.Symbol === "WXETH"
      )[0].Balance;

      console.log(
        "WXEth Balance: " +
          this.userAccountSummary.filter(
            wxethbalance => wxethbalance.Symbol === "WXETH"
          )[0].Balance
      );
      console.log(
        "userAccountSummary length: " + this.userAccountSummary.length
      );
    } else {
      this.walletService.fetchAccountSummary();
    }

    if (this.walletService.getContracts() !== undefined) {
      this.allAvailableContracts = this.walletService.getContracts();
    } else {
      this.walletService.fetchContracts();
    }
  }

  private checkAndAuthorize(
    instanceTokenContract,
    account,
    authorizedAcc,
    value,
    tokenaddress,
    count,
    symbol,
    basketID
  ) {
    // alert('called checkAndAuthorize')
    instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
      console.log("result", result.lt(value));
      if (result.lt(value)) {
        this.authorizeOne(
          instanceTokenContract,
          account,
          authorizedAcc,
          value,
          tokenaddress,
          count,
          symbol,
          basketID
        );
      } else {
        this.trackDepositeToken++;
        this.tractButtonTransaction();
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Good, you have sufficient allowance for this token"
          ),
          MessageContentType.Text
        );
      }
    });
  }

  private authorizeOne(
    instanceTokenContract,
    account,
    authorizedAcc,
    value,
    tokenaddress,
    count,
    symbol,
    basketID
  ) {
    var foo = this;
    let a = 1;
    let web3Instance = foo.web3.getWeb3();
    var privateKey = foo.privateKey;
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    let finalnonce;

    this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
        web3Instance.eth.getTransactionCount(account, (err, res) => {
          var data = instanceTokenContract.approve.getData(
            authorizedAcc,
            value,
            {
              from: account
            }
          );

          if (Constants.Chainid == 1) {
            this.safeGasPrice = web3Instance.toHex(
              oracle.json().average * 100000000
            );
          } else {
            this.safeGasPrice = "0x4A817C800";
          }

          const txParams = {
            gasPrice: this.safeGasPrice,
            gasLimit: 4000000,
            to: tokenaddress,
            data: data,
            from: account,
            chainId: Constants.Chainid,
            Txtype: 0x01,
            //value:convertedAmount,
            nonce: res + count
          };
          console.log("authtx", txParams);

          //nonce = nonce + 1;
          const tx = new Tx(txParams);
          tx.sign(privateKey);
          //console.log('tx',tx);

          const serializedTx = tx.serialize();
          //console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));

          const obj = {
            serializedTx: "0x" + serializedTx.toString("hex")
          };
          // finalnonce = res + count;
          const auth_sign = {
            token: symbol,
            txType: "approve",
            approval_sign: "0x" + serializedTx.toString("hex"),
            transfer_sign: "",
            approval_status: "unsent",
            transfer_status: "unsent",
            approval_hash: "",
            transfer_hash: ""
          };

          //this.serialized_data.push(auth_sign);
          this.serialized_data[count]=auth_sign;
          console.log(
            count,
            this.tokenWithbalance.length,
            this.serialized_data.length,
            this.serialized_data
          );
          if (this.tokenWithbalance.length == this.serialized_data.length) {
            console.log("Authorization");
            const authorizationdat = {
              userAddress: account,
              basketID: basketID,
              basketCreationHash: this.walletService.getPortfolioTransactionhash(),
              tokens: this.serialized_data
            };
            console.log(finalnonce);

            let deposit_nonce = res + this.tokenWithbalance.length;
            console.log("authdat", authorizationdat, deposit_nonce);
            this.depositauthdata(deposit_nonce, authorizationdat); ////functio call to store deposit data('function name changed for basket bug rectification')
            // return;
            // return new Promise((resolve, reject) => {
            //   //  this.http.post('http://localhost:3000/Authorization',this.serialized_data).subscribe(res =>{
            //   this.http
            //     .post("http://localhost:3000/addBetterBasket", authorizationdat)
            //     .subscribe(
            //       res => {
            //         resolve(res);
            //       },
            //       err => {
            //         resolve(err);
            //       }
            //     );
            // })
            //   .then(res => {
            //     console.log(res);

            //     var response = JSON.parse(res["_body"]);
            //     //console.log(response,response.status,response.data.transactionHash,"RESPONSE1")
            //     console.log("response", response);

            //     // //console.log(response,response['_body'].data.transactionHash,response['_body']['status'],"RESPONSE1")
            //     response.data.forEach(element => {
            //       if (element.status) {
            //         let temp = {};
            //         temp["address"] = element.transactionHash;
            //         temp["status"] = false;
            //         this.authorizeTokenList.push(temp);
            //         this.trackDepositeToken++;
            //         instanceTokenContract.allowance(
            //           account,
            //           authorizedAcc,
            //           (err, result) => {
            //             console.log("allowance", result);
            //             if (result) {
            //               this.notificationsService.showNotification(
            //                 new MessageModel(
            //                   MessageType.Success,
            //                   "Authorization successfully submitted to the Ethereum Blockchain. Please wait till it confirms."
            //                 ),
            //                 MessageContentType.Text
            //               );
            //             }
            //           }
            //         );
            //         this.tractButtonTransaction();
            //       } else {
            //       }
            //     });
            //   })
            //   .catch(e => {});
          }
        });
      });
    // instanceTokenContract.approve(authorizedAcc, value, {from: account}, (err, result) => {
    //   instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
    //     console.log('allowance', result);
    //     if (result) {
    //       this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Authorization successfully submitted to the Ethereum Blockchain. Please wait till it confirms.'), MessageContentType.Text);
    //     }
    //   });
    //   console.log('allowance', result);
    //   let temp = {};
    //   temp['address'] = result;
    //   temp['status'] = false;
    //   this.authorizeTokenList.push(temp);
    //   this.trackDepositeToken++;
    //   this.tractButtonTransaction();
    // });
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
  public authdisable: boolean = true;
  private validateAllowance(data) {
    console.log("data", data);
    let track = 0;
    data.map((key, value) => {
      if (parseFloat(key.allowance) >= parseFloat(key.value)) {
        track++;
        console.log("validate");

        if (track === data.length) {
          console.log("validate1");
          this.showLoader = false;
          this.next();
        }
      }
      if (value === data.length - 1) {
        this.track = data.length - track;
        this.tokenWithbalance = data;
        this.authdisable = false;
        //this.authorize_start(this.tokenWithbalance);
      }
    });
  }

  depositauthdata(deposit_nonce, authorizationdat) {
    //console.log("depositauth", data);
    this.portfolioTokenWithValue = this.walletService.getNewPortfolioTokenWithValue();
    console.log('porttokenlen',this.portfolioTokenWithValue,this.portfolioTokenWithValue.length);

    if (this.portfolioTokenWithValue.length === 0) {
      //  this.portfolioService.publishComplete();
    } else {
      this.basketDeposit(deposit_nonce, authorizationdat);
      this.zone.run(() => {});
    }
  }

  basketDeposit(depositnonce, authorizationdat) {
    let nonce = depositnonce;
    let authdata = authorizationdat;
    // this.notificationsService.showNotification(
    //   new MessageModel(
    //     MessageType.Info,
    //     "Please submit all the authorizations on wallet with sufficient Gwei to ensure that the transaction goes through."
    //   ),
    //   MessageContentType.Text
    // );
    // this.showLoader = true;
    //this.displayGif = 'block';
    this.wizard3 = false;
    //console.log("data", this.portfolioTokenWithValue);
    this.deposit_serialized_data = [];
    let contractAddress = this.walletService.getPortfolioAddress();
    ////console.log('address', this.walletService.getPortfolioAddress());
    let web3Instance = this.web3.getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(contractAddress);
    let j = 0;
    var deposit_nonce;
    var privateKey = this.privateKey;
    privateKey = Buffer.from(privateKey.substr(2), "hex");

    this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
        web3Instance.eth.getTransactionCount(
          this.userService.getCurrentUser().UserAccount,
          (err, res) => {
            this.portfolioTokenWithValue.map((key, i) => {
              //console.log('depositnonce',(nonce+i));

              var data = vsbContract.depositTokens.getData(
                key.address,
                web3Functions.toBaseUnitAmount(key.value, key.data.decimals)
              );
              deposit_nonce = nonce + i;

              if (Constants.Chainid == 1) {
                this.safeGasPrice = web3Instance.toHex(
                  oracle.json().average * 100000000
                );
              } else {
                this.safeGasPrice = "0x4A817C800";
              }

              const txParams = {
                gasPrice: this.safeGasPrice,
                gasLimit: 4000000,
                to: contractAddress,
                data: data,
                from: this.userService.getCurrentUser().UserAccount,
                chainId: Constants.Chainid,
                Txtype: 0x01,
                //value:convertedAmount,
                nonce: nonce + i
              };
              //console.log('deposittx',txParams,key.symbol);

              //nonce = nonce + 1;
              const tx = new Tx(txParams);
              tx.sign(privateKey);
              ////console.log('tx',tx);

              const serializedTx = tx.serialize();
              ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));
              authdata.tokens.forEach(element => {
                //console.log('authdaat',element.token,key.symbol);

                if (element.token === key.symbol) {
                  element.transfer_sign = "0x" + serializedTx.toString("hex");
                }
              });
              const obj = {
                serializedTx: "0x" + serializedTx.toString("hex")
              };
              this.deposit_serialized_data.push(obj);
              // //console.log(count,this.tokenWithbalance.length,this.serialized_data.length,this.serialized_data);
              if (
                this.portfolioTokenWithValue.length ==
                  this.deposit_serialized_data.length &&
                this.deposit_api_status == 0
              ) {
                this.publish(deposit_nonce);
                console.log("Authorization", authdata);

                return new Promise((resolve, reject) => {
                  console.log("deposit");

                  this.http
                    .post(Constants.ethBasketUrl + "addBetterBasket", authdata)
                    .subscribe(
                      res => {
                        this.deposit_api_status = 1;
                        
                        resolve(res);
                      },
                      err => {
                        resolve(err);
                      }
                    );
                });
              }
            });
          }
        );
      });
  }

  publish(nonce) {
    console.log('pubnonce',nonce);
    let meta = this;
    //this.showLoader = true;
    // this.displayGif = "block";
    // this.wizard4 = false;
    let a = 1;
    let contractAddress = this.walletService.getPortfolioAddress();
    localStorage.setItem("contractAddress", contractAddress);
    let web3Instance = this.web3.getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(contractAddress);
    //  if (this.updatePorfolioFlag === false) {
    var privateKey = this.privateKey;
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    var count;

    this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
        web3Instance.eth.getTransactionCount(
          this.userService.getCurrentUser().UserAccount,
          (err, res) => {
            //web3Instance.eth.getTransactionCount(_maker,(res)=>{
            //count = res;
            ////console.log('nonce',res);

            var data = vsbContract.publish.getData();
            //console.log('pubnonce1',nonce+a);

            if (Constants.Chainid == 1) {
              this.safeGasPrice = web3Instance.toHex(
                oracle.json().average * 100000000
              );
            } else {
              this.safeGasPrice = "0x4A817C800";
            }

            const txParams = {
              gasPrice: this.safeGasPrice,
              gasLimit: 4000000,
              to: contractAddress,
              data: data,
              from: this.userService.getCurrentUser().UserAccount,
              chainId: Constants.Chainid,
              Txtype: 0x01,
              //value:convertedAmount,
              nonce: nonce + a
            };
            //nonce = nonce + 1;
            const tx = new Tx(txParams);
            tx.sign(privateKey);
            ////console.log('tx',tx);

            const serializedTx = tx.serialize();
            ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));

            const obj = {
              basketCreationHash: this.walletService.getPortfolioTransactionhash(),
              basketPublishSign: "0x" + serializedTx.toString("hex")
            };
            //console.log('publish',obj);
            if (this.publish_api_status == 0) {
              console.log("publish", obj);
              return new Promise((resolve, reject) => {
                this.http
                  .post(Constants.ethBasketUrl + "addPublishSign/", obj)
                  .subscribe(
                    res => {
                      this.publish_api_status = 1;
                      this.displaybask_loader = "none";
                      resolve(res);
                    },
                    err => {
                      console.log(err);

                      resolve(err);
                    }
                  );
              });
            }
          }
        );
      });
  }

  //////////////////////////nonce too Low/////////////////////////////////////////////////////

createbasket(basketdata,privatekey,nonceadder)
{
  console.log(basketdata,nonceadder);
  
  let web3Instance = this.web3.getWeb3();
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(basketdata.currentOwner, (err, res) => {
    if(basketdata.basketCreationStatus=="nonceTooLow"||basketdata.basketCreationStatus=="replacementTxnUnderPriced"||basketdata.basketCreationStatus=="EVMRevert"||(basketdata.basketCreationStatus=="sent"&&basketdata.basketsent))
    {
    var decodedTx = txDecoder.decodeTx(basketdata.basketCreationSign);
    console.log(decodedTx,res);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: Constants.CretaeContractAddress,
    data: decodedTx.data,
    from: basketdata.currentOwner,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res+nonceadder
  };

  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  var data={
    
      userAddress: basketdata.userAddress,
      basketID: basketdata.basketID,
      basketCreationSign: "0x" + serializedTx.toString("hex")
    
  }
  return new Promise((resolve, reject) => {
    this.http
      .post(Constants.ethBasketUrl+"updateBasketSign/", data)
      .subscribe(
        res => {
          resolve(res);

          this.trackCreatePortfolioTransaction(
            basketdata.userAddress,
            basketdata.basketID,
            web3Instance,
            privatekey
          );
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The basket publishing may take a while. Meanwhile, you are free to close the desktop app, and come back later to check out your basket under 'My Token Baskets' tab"
            ),
            MessageContentType.Text
          );
        },
        err => {
          console.log(err);

          resolve(err);
        }
      );
  });
}
  })
})
}

authorizationbasket(basketdata,privatekey)
{
  let web3Instance = this.web3.getWeb3();
  var betterdata=basketdata[0].betters;
  var data=[];
  var index=0;
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(basketdata[0].basket.currentOwner, (err, res) => {
    betterdata.forEach((element,i) => {
      
  if(element.approval_status=="nonceTooLow"||element.approval_status=="replacementTxnUnderPriced")
  {
  var decodedTx = txDecoder.decodeTx(element.approval_sign);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: decodedTx.to,
    data: decodedTx.data,
    from: element.userAddress,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res+index
  };
   index=index+1;
  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  data.push({
    token: element.token,
    approval_sign:"0x" + serializedTx.toString("hex"),
    transfer_sign: "" 
  })
}
else if(element.transfer_status=="nonceTooLow"||element.transfer_status=="replacementTxnUnderPriced")
{
  data.push({
    token: element.token,
    approval_sign:"",
    transfer_sign: "" 
  })

}
if((i+1)==betterdata.length)
{
var authdata={
	userAddress: basketdata[0].basket.currentOwner,
	basketID: basketdata[0].basket.basketID,
  tokens: data
}
this.deposittoken(authdata,basketdata,privatekey,index);
}
});
  
  })
})
}

deposittoken(authdata,basketdata,privatekey,nonce)
{
  console.log('depo',nonce);
  
  let web3Instance = this.web3.getWeb3();
  var betterdata=basketdata[0].betters;
  var index=nonce;
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(basketdata[0].basket.currentOwner, (err, res) => {
    var len=0;
    var num=0;
    authdata.tokens.forEach((data,id) => {
    betterdata.forEach((element,i) => {
     len=len+1; 
  if((element.transfer_status=="nonceTooLow"||element.transfer_status=="replacementTxnUnderPriced")&&element.token==data.token)
  {
  var decodedTx = txDecoder.decodeTx(element.transfer_sign);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: decodedTx.to,
    data: decodedTx.data,
    from: element.userAddress,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res+(index+num)
  };
  num=num+1;
   index=index+1;
  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  data.transfer_sign="0x" + serializedTx.toString("hex");
  
}

if(len==(authdata.tokens.length*betterdata.length))
{
  console.log("authdata",authdata,index);
  this.publishtoken(basketdata,privatekey,index);
  return new Promise((resolve, reject) => {
    this.http
      .post(Constants.ethBasketUrl+"updateAuthDepoSigns/", authdata)
      .subscribe(
        res => {
          resolve(res);

          
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The auth and deposit data is updated"
            ),
            MessageContentType.Text
          );
        },
        err => {
          console.log(err);

          resolve(err);
        }
      );
  });
}
});
});
  })
})
}
authtokenevm(betterdata,privatekey)
{
  let web3Instance = this.web3.getWeb3();
  var element=betterdata;
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(element.userAddress, (err, res) => {
   
 
  var decodedTx = txDecoder.decodeTx(element.approval_sign);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: decodedTx.to,
    data: decodedTx.data,
    from: element.userAddress,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res
  };
  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  var authdata={
    userAddress: element.userAddress,
    basketID: element.basketID,
    tokens: [{
      token: element.token,
      approval_sign:"0x" + serializedTx.toString("hex"),
      transfer_sign: ""
    }]
  }
  //data.transfer_sign="0x" + serializedTx.toString("hex");
  



  console.log("authdata",authdata);
  //this.publishtoken(basketdata,privatekey,index);
  return new Promise((resolve, reject) => {
    this.http
      .post(Constants.ethBasketUrl+"updateAuthDepoSigns/", authdata)
      .subscribe(
        res => {
          resolve(res);

          
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The Authorization data is updated"
            ),
            MessageContentType.Text
          );
        },
        err => {
          console.log(err);

          resolve(err);
        }
      );
  });


  })
})
}
deposittokenevm(betterdata,privatekey)
{
  let web3Instance = this.web3.getWeb3();
  var element=betterdata;
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(element.userAddress, (err, res) => {
   
 
  var decodedTx = txDecoder.decodeTx(element.transfer_sign);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: decodedTx.to,
    data: decodedTx.data,
    from: element.userAddress,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res
  };
  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  var authdata={
    userAddress: element.userAddress,
    basketID: element.basketID,
    tokens: [{
      token: element.token,
      approval_sign:"",
      transfer_sign:"0x" + serializedTx.toString("hex") 
    }]
  }
  //data.transfer_sign="0x" + serializedTx.toString("hex");
  



  console.log("authdata",authdata);
  //this.publishtoken(basketdata,privatekey,index);
  return new Promise((resolve, reject) => {
    this.http
      .post(Constants.ethBasketUrl+"updateAuthDepoSigns/", authdata)
      .subscribe(
        res => {
          resolve(res);

          
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The deposit data is updated"
            ),
            MessageContentType.Text
          );
        },
        err => {
          console.log(err);

          resolve(err);
        }
      );
  });


  })
})
}
publishtoken(basketdata,privatekey,nonce)
{
  let web3Instance = this.web3.getWeb3();
  var publishdata=basketdata[0].basket;
  var index=nonce;
  var privateKey = privatekey;
  privateKey = Buffer.from(privateKey.substr(2), "hex")
  this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
  web3Instance.eth.getTransactionCount(publishdata.currentOwner, (err, res) => {
     
      
  if(publishdata.basketPublishStatus=="nonceTooLow"||publishdata.basketPublishStatus=="replacementTxnUnderPriced"||publishdata.basketPublishStatus=="EVMRevert"||(publishdata.basketPublishStatus=="sent"&&publishdata.publishsent))
  {
  var decodedTx = txDecoder.decodeTx(publishdata.basketPublishSign);
  if (Constants.Chainid == 1) {
    this.safeGasPrice = web3Instance.toHex(
      oracle.json().average * 100000000
    );
  } else {
    this.safeGasPrice = "0x4A817C800";
  }
  const txParams = {
    gasPrice: this.safeGasPrice,
    gasLimit: 4000000,
    to: decodedTx.to,
    data: decodedTx.data,
    from: publishdata.userAddress,
    chainId: Constants.Chainid,
    Txtype: 0x01,
    //value:convertedAmount,
    nonce: res+index
  };
  //nonce = nonce + 1;
  const tx = new Tx(txParams);
  tx.sign(privateKey);
  ////console.log('tx',tx);

  const serializedTx = tx.serialize();
  var obj={
    
      basketCreationHash:publishdata.basketCreationHash,
      basketPublishSign:"0x" + serializedTx.toString("hex")
    
  }
  console.log("obj",obj);
  
  return new Promise((resolve, reject) => {
    this.http
      .post(Constants.ethBasketUrl+"updatePublishSign/", obj)
      .subscribe(
        res => {
          resolve(res);

          
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The publish data is updated"
            ),
            MessageContentType.Text
          );
        },
        err => {
          console.log(err);

          resolve(err);
        }
      );
  });
  
}


  })
})
}
  /////////////////////////////////////////////////////////////////////////////////////////////
  
  //////////////////////////////////////////trade sign/////////////////////////////////////////

  updateTradeSign(tradeDetail, privatekey) {
    console.log(tradeDetail);
    
    let web3Instance = this.web3.getWeb3();
    var privateKey = privatekey;
    privateKey = Buffer.from(privateKey.substr(2), "hex")
    var decodedTx = txDecoder.decodeTx(tradeDetail.sign);
    this.http
        .get(`https://ethgasstation.info/json/ethgasAPI.json`)
        .subscribe(oracle => {
    web3Instance.eth.getTransactionCount(tradeDetail.userAddress, (err, res) => {
    if (Constants.Chainid == 1) {
      this.safeGasPrice = web3Instance.toHex(
        oracle.json().average * 100000000
      );
    } else {
      this.safeGasPrice = "0x4A817C800";
    }
    decodedTx.nonce = res;
    decodedTx.gasLimit = decodedTx.gasLimit._hex
    decodedTx.gasPrice = decodedTx.gasPrice._hex
    decodedTx.value = decodedTx.value._hex
    const tx = new Tx(decodedTx);
    tx.sign(privateKey);
    console.log('tx',tx);
    const serializedTx = tx.serialize();
    if(tradeDetail.basketID == "-1"){
      this.updateTradeWithoutBasketSign(tradeDetail,"0x" + serializedTx.toString("hex"));
    }
    else{
      console.log('upyu');
      
      var tradeTokenArr=[];
      tradeTokenArr.push({
        buyToken:tradeDetail.buyToken,
        sign:"0x" + serializedTx.toString("hex")
      })
      this.updateTradeSignsevm(tradeDetail.userAddress,tradeDetail.basketID, tradeTokenArr)
    }
    // console.log("update serializedTx ",serializedTx);
        })})}

        updateTradeSignsevm(userAddress, basketID, tokens) {
          let data = {userAddress, basketID, tokens};
          console.log('updatetrade',data);
          
          this.http
          .post(Constants.ethBasketUrl+"updateTradeSigns/", data)
          .subscribe(
            res => {
                 
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "The Trade data is updated"
            ),
            MessageContentType.Text
          );
           //   this.createbasket(basketdata, privatekey,nonceAddr)
            }
          )
        }
   updateTradeWithoutBasketSign(tradeDetail,newSign) {
          var data={
            sign: tradeDetail.sign,
            newSign: newSign
          }
        return new Promise((resolve, reject) => {
          this.http
            .post(Constants.ethBasketUrl+"updateTradeWithoutBasketSign/", data)
            .subscribe(
              res => {
                this.notificationsService.showNotification(
                  new MessageModel(
                    MessageType.Info,
                    "The Trade data is updated"
                  ),
                  MessageContentType.Text
                );
                resolve(res);
              }
            )
        })
        }
        
  tradesWithoutBasket(userAddress) {
          this.http
          .get(Constants.ethBasketUrl+"tradesWithoutBasket?userAddress="+userAddress)
          .subscribe(
            res => {
              console.log(res.json().msg,res.json());
              
              if(res.json().msg){
                this._tradesWithoutBasketDetails.next([]);
              }
              else {
                var temp=res.json();
                temp.forEach((element,i) => {
                  if(element.userAddress==this.tradeaddress)
                        {
                          console.log(this.tradedata[i]);
                          
                          if(element.status=="sent"&&this.tradedata[i]==undefined)
                          {
                            this.tradedata[i]={
                              symbol:element.buyToken,
                              status:element.status,
                              time:Math.round((new Date()).getTime() / 1000)
                            }
                            console.log(this.tradedata[i]);
                            
                            
                          }
                          else if(element.status=="sent"&&(Math.round((new Date()).getTime() / 1000)-this.tradedata[i].time)>this.portfolioService.sentavgtime){
                            console.log((Math.round((new Date()).getTime() / 1000)-this.tradedata[i].time));
                            
                            element['tradesent']=true;
                          }
                          else{
                            element['tradesent']=false;
                          }
                        }
                        else
                        {
                          this.tradedata=[];
                          this.tradeaddress=element.userAddress;
                          element['tradesent']=false;
                        }
                        if((temp.length-1)==i)
                        {
                          this._tradesWithoutBasketDetails.next(temp);
                        }
                });
                
                
              }
              // resolve(res);
            },
            err => {
              this._tradesWithoutBasketDetails.next([]);
              // resolve(res);
            }
          );
        }
////////////////////////////////////////////////////////////////////////////////////////////////

// tradeAndBasketCreation(pendingBasket,privatekey) {
// {
//   let web3Instance = this.web3.getWeb3();
//   var betterdata=pendingBasket.trades;
//   var data=[];
//   var index=0;
//   var privateKey = privatekey;
//   privateKey = Buffer.from(privateKey.substr(2), "hex")
//   this.http
//       .get(`https://ethgasstation.info/json/ethgasAPI.json`)
//       .subscribe(oracle => {
//   web3Instance.eth.getTransactionCount(betterdata.userAddress, (err, res) => {
//     betterdata.forEach((element,i) => {
      
//   if(element.status=="nonceTooLow"||element.status=="replacementTxnUnderPriced")
//   {
//   var decodedTx = txDecoder.decodeTx(element.sign);
//   if (Constants.Chainid == 1) {
//     this.safeGasPrice = web3Instance.toHex(
//       oracle.json().average * 100000000
//     );
//   } else {
//     this.safeGasPrice = "0x4A817C800";
//   }
//   const txParams = {
//     gasPrice: this.safeGasPrice,
//     gasLimit: 4000000,
//     to: decodedTx.to,
//     data: decodedTx.data,
//     from: element.userAddress,
//     chainId: Constants.Chainid,
//     Txtype: 0x01,
//     value:decodedTx.value,
//     nonce: res+index
//   };
//    index=index+1;
//   //nonce = nonce + 1;
//   const tx = new Tx(txParams);
//   tx.sign(privateKey);
//   ////console.log('tx',tx);

//   const serializedTx = tx.serialize();
//   data.push({
//     token: element.token,
//     approval_sign:"0x" + serializedTx.toString("hex"),
//     transfer_sign: "" 
//   })
// }

// if((i+1)==betterdata.length)
// {

// }
// });
  
//   })
// })
// }
////////////////////////////////////////////////////////////////////////////////////////////////////
tradeAndBasketCreation(pendingBasket,privatekey) {
  let nonceAddr = 0;
  let tradeTokenArr = [];
  console.log("pendingBasket####",pendingBasket)
  let web3Instance = this.web3.getWeb3();
    var privateKey = privatekey;
    privateKey = Buffer.from(privateKey.substr(2), "hex")
   
    
    this.http
      .get(`https://ethgasstation.info/json/ethgasAPI.json`)
      .subscribe(oracle => {
        web3Instance.eth.getTransactionCount(this.userService.getCurrentUser().UserAccount, (err, res) => {
          pendingBasket.trades.forEach((item,index)=>{
            if(item.status == "nonceTooLow"||item.status == "replacementTxnUnderPriced") {

            var decodedTx = txDecoder.decodeTx(item.sign);
            console.log('decodedTx',decodedTx);
          if (Constants.Chainid == 1) {
            this.safeGasPrice = web3Instance.toHex(
              oracle.json().average * 100000000
            );
          } else {
            this.safeGasPrice = "0x4A817C800";
          }
          decodedTx.nonce = res + nonceAddr;
          decodedTx.gasLimit = decodedTx.gasLimit._hex
          decodedTx.gasPrice = decodedTx.gasPrice._hex
          decodedTx.value = decodedTx.value._hex
          const tx = new Tx(decodedTx);
          tx.sign(privateKey);
          nonceAddr++;
          console.log('tx', tx);
          const serializedTx = tx.serialize();
          console.log("0x" + serializedTx.toString("hex"));
          tradeTokenArr.push({
            buyToken:item.buyToken,
            sign:"0x" + serializedTx.toString("hex")
          })
        
        }
        if(pendingBasket.trades.length-1 == index && tradeTokenArr.length>0) {
         // nonceAddr++;
          this.updateTradeSigns(item.userAddress, item.basketID, tradeTokenArr, pendingBasket.basket, privatekey, nonceAddr)
        }
        //  return resolve("0x" + serializedTx.toString("hex"));
          // console.log("update serializedTx ",serializedTx);
        })
      })
    })
 
}
updateTradeSigns(userAddress, basketID, tokens, basketdata, privatekey, nonceAddr) {
  let data = {userAddress, basketID, tokens};
  console.log('updatetrade',data);
  this.createbasket(basketdata, privatekey,nonceAddr);
  this.http
  .post(Constants.ethBasketUrl+"updateTradeSigns/", data)
  .subscribe(
    res => {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Info,
          "The Trade data is updated"
        ),
        MessageContentType.Text
      );
    }
  )
}

// public async updateTradeSign$(userAddress, sign, basketID, privatekey, nonceAddr): Promise<any>  {
//   return new Promise((resolve,reject)=>{
//     console.log('nonceAddr',nonceAddr);
    
//     let web3Instance = this.web3.getWeb3();
//     var privateKey = privatekey;
//     privateKey = Buffer.from(privateKey.substr(2), "hex")
//     var decodedTx = txDecoder.decodeTx(sign);
//     console.log('decodedTx',decodedTx);
    
//     this.http
//       .get(`https://ethgasstation.info/json/ethgasAPI.json`)
//       .subscribe(oracle => {
//         web3Instance.eth.getTransactionCount(userAddress, (err, res) => {
//           if (Constants.Chainid == 1) {
//             this.safeGasPrice = web3Instance.toHex(
//               oracle.json().average * 100000000
//             );
//           } else {
//             this.safeGasPrice = "0x4A817C800";
//           }
//           decodedTx.nonce = res + nonceAddr;
//           decodedTx.gasLimit = decodedTx.gasLimit._hex
//           decodedTx.gasPrice = decodedTx.gasPrice._hex
//           decodedTx.value = decodedTx.value._hex
//           const tx = new Tx(decodedTx);
//           tx.sign(privateKey);
//           console.log('tx', tx);
//           const serializedTx = tx.serialize();
//           console.log("0x" + serializedTx.toString("hex"));
          
//           if (basketID == "-1") {
//             this.updateTradeWithoutBasketSign(sign, "0x" + serializedTx.toString("hex"));
//           }
//           return resolve("0x" + serializedTx.toString("hex"));
//           // console.log("update serializedTx ",serializedTx);
//         })
//       })
//   });
// }



        
  /////////////////////////////////////////////////////////////////////////////////////////////
//   evmrevert(basketdata,privatekey)
// {
//   let web3Instance = this.web3.getWeb3();
//   var publishdata=basketdata[0].basket;
//   //var index=nonce;
//   var privateKey = privatekey;
//   privateKey = Buffer.from(privateKey.substr(2), "hex")
//   this.http
//       .get(`https://ethgasstation.info/json/ethgasAPI.json`)
//       .subscribe(oracle => {
//   web3Instance.eth.getTransactionCount(publishdata.currentOwner, (err, res) => {
     
      
//   if(publishdata.basketPublishStatus=="nonceTooLow")
//   {
//   var decodedTx = txDecoder.decodeTx(publishdata.basketPublishSign);
//   if (Constants.Chainid == 1) {
//     this.safeGasPrice = web3Instance.toHex(
//       oracle.json().average * 100000000
//     );
//   } else {
//     this.safeGasPrice = "0x4A817C800";
//   }
//   const txParams = {
//     gasPrice: this.safeGasPrice,
//     gasLimit: 4000000,
//     to: decodedTx.to,
//     data: decodedTx.data,
//     from: publishdata.userAddress,
//     chainId: Constants.Chainid,
//     Txtype: 0x01,
//     //value:convertedAmount,
//     nonce: res
//   };
//   //nonce = nonce + 1;
//   const tx = new Tx(txParams);
//   tx.sign(privateKey);
//   ////console.log('tx',tx);

//   const serializedTx = tx.serialize();
//   var obj={
    
//       basketCreationHash:publishdata.basketCreationHash,
//       basketPublishSign:"0x" + serializedTx.toString("hex")
    
//   }
//   console.log("obj",obj);
  
//   return new Promise((resolve, reject) => {
//     this.http
//       .post("http://35.184.121.85:8009/updatePublishSign/", obj)
//       .subscribe(
//         res => {
//           resolve(res);

          
//           this.notificationsService.showNotification(
//             new MessageModel(
//               MessageType.Info,
//               "The publish data is updated"
//             ),
//             MessageContentType.Text
//           );
//         },
//         err => {
//           console.log(err);

//           resolve(err);
//         }
//       );
//   });
  
// }


//   })
// })
// }
  
  
  
  insufficientbalance(signature,collection_name)
  {
    var obj={
      sign: signature,
      collection: collection_name
      
    };
    return new Promise((resolve, reject) => {
      this.http
        .post(Constants.ethBasketUrl+"updateInsuffETHStatus/", obj)
        .subscribe(
          res => {
            resolve(res);
  
            
            this.notificationsService.showNotification(
              new MessageModel(
                MessageType.Info,
                "The insufficient balance data is updated"
              ),
              MessageContentType.Text
            );
          },
          err => {
            console.log(err);
  
            resolve(err);
          }
        );
    });
  }
  
  getPlatformTokens(tokenlength) {
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
      .get(Constants.ServiceURL + "PlatformToken", requestOptions)
      .subscribe(data => {
        var tokens = data.json();
        this.platformTokens = tokens;
        this.getPortfolioToken(tokenlength);
      });
  }
}
