import {
  Component,
  NgZone,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from "@angular/core";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { AmChart, AmChartsService } from "@amcharts/amcharts3-angular";
import { Constants } from "../../models/constants";
import {
  MessageContentType,
  MessageModel,
  MessageType
} from "../../models/message.model";
import { ChartService } from "../../services/chart.service";
import { NotificationManagerService } from "../../services/notification-manager.service";
import { PortfolioService } from "../../services/portfolio.service";
import { AssetAnalysis } from "../../models/asset.model";
import { UserRegistrationResponse } from "../../models/user-registration.model";
import { Web3Service } from "../../services/web3.service";
import { TokenService } from "../../services/token.service";
import { SellablePortfolio } from "../../models/portfolio.model";
import { Headers, Http, RequestOptions } from "@angular/http";
import { HttpParams } from "@angular/common/http";
import { SwitchThemeService } from "../../services/switch-theme.service";
import { Subscription } from "rxjs/Subscription";
import { WalletService } from "../../services/wallet.service";
import * as _ from "underscore";
import { BigNumber } from "bignumber.js";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { CORS } from "../../services/cors.service";
import { tokensData } from "../../artifacts/tokensData";
import { buyToken, sellToken } from "../../artifacts/baskettokenTemplate";
import { UniswapServiceService } from "../../services/uniswap-service.service";
import { ZrxServiceService } from "../../services/0x-service.service";
import { erc20Artifact } from "../../artifacts/erc20";
import { ExchangeArtifact } from "../../artifacts/exchange";
import * as BigNumbers from "../../../assets/newBigNumber.js";
import { devModeEqual } from "@angular/core/src/change_detection/change_detection";
import { CustomWalletService } from "../../services/custom-wallet.service";

import { EthBasketService } from "../../services/eth-basket.service";
import { Test } from "tslint";
let base = BigNumbers(10);
var Tx = require("ethereumjs-tx");
var Web3 = require("web3");
var _web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/f133272be23d4b718c9e36b693f6d267"
  )
  // Web3.givenProvider
);
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

@Component({
  selector: "app-basket-new",
  templateUrl: "./basket-new.component.html",
  styleUrls: ["./basket-new.component.css"]
})
export class BasketNewComponent implements OnInit, OnDestroy {
  assetAnalysisResult: AssetAnalysis = new AssetAnalysis();
  portfolio: Array<any> = new Array();
  showAnalysisLoader: boolean = false;
  showDropdownLoader: boolean = false;
  showLoader: boolean = false;
  portfolioName: string = "";
  amChartPieOptions: Object = {};
  itemList = [];
  selectedItems = [];
  settings = {};
  amChartPieData = [];
  amChartPie: AmChart;
  totalQuanity: number = 0;
  totalETH: number = 0;
  totalUSD: number = 0;
  totalWAND: number = 0;
  createPortfolioForm: boolean = false;
  usd: any;
  //wizard
  wizard1: boolean = true;
  wizard2: boolean = false;
  wizard3: boolean = false;
  wizard4: boolean = false;
  userAccountSummary: Array<any> = [];
  public data = {};
  valumes: Array<any> = new Array();
  assets: Array<any> = new Array();
  public trackPortfolioCreate = false;
  public trackPortfolioCreatebtn: any;
  public updatePorfolioFlag = false;
  public pendingPorfolioFlag = false;
  public currentPortfolioAddress: any;
  public curentBlock: any;
  public existingToken = [];
  public currentThemeName: any;
  private tokenSubscription: Subscription;
  private editPortfolio: Subscription;
  private walletTokenSubscription: Subscription;
  private userAccountChange: Subscription;
  private despositToken: Subscription;
  private despositdata: Subscription;
  private selectedTokens: Array<string> = new Array();
  private assetAnalysisDone: boolean = false;
  private askingPriceInWand: number;
  private creationPriceInWand: number;
  private currentSellablePortfolios: Array<SellablePortfolio> = new Array<
    SellablePortfolio
  >();
  private usedTokens = {};
  private orderBookRefreshTimer: any;
  private despositRefreshTimer: any;
  private txHash: any;
  private txHashSuccess: any;
  private savedWalletChangeSubscription: any;
  public portfolioTokenWithValue: any;
  public showdata = false;
  private trackBtn = true;
  public overallETH = 0;
  public overallUSD = 0;
  public publishData = [];
  public displayGif = "none";
  public displayGif1 = "none";
  public displayGif2 = "none";
  public displayRequest = "none";
  public showChart = false;
  public tokenContract: any;
  public validateAllowance: any;
  public error: any;
  public totalprice = 0;
  public totalDepositPrice = 0;
  public createBasket: boolean = false;
  public form: FormGroup;
  public canMultiSelect: boolean = false;
  public LabelControl: object = {
    portfolioName: false,
    askingPrice: false
  };
  public placeholderControl: object = {
    portfolioName: "Name your basket",
    askingPrice: "Selling Price in WXETH"
  };
  noBalanceTokens: number = 0;
  public bestrate: boolean = false;
  public besttrade: boolean = false;
  public traderate: boolean = true;
  public insatantBuyModal: boolean = false;
  public intialModal: boolean = false;
  public demo: any = [];
  public trade: any = [];
  public submit_trade: any = [];
  public Remain_Bal: number = 0;
  public total: number = 0;
  public totalamount: any = [];
  public serialized_data: any = [];
  public deposit_serialized_data: any = [];
  ///
  public selectedExchange: any = "";
  public selectedWallet: any = "";
  private marketBroadcastServiceSub: any;
  private savedWalletsServiceSub: any;
  public dummy: any;
  public sell_token = {
    symbol: "0",
    decimals: 0,
    address: "0",
    balance: 0,
    value: 0,
    kyber_address: "0",
    bancor_id: "0",
    uniswap_exchange_address: "0",
    uniswap_exchange_artifact: this.dummy
  };
  account: string;

  configSell = {
    search: true,
    placeholder: "Input Token:",
    noResultsFound: "No results found!",
    searchPlaceholder: "Search..."
  };

  configBuy = {
    search: true,
    placeholder: "Output Token:",
    noResultsFound: "No results found!",
    searchPlaceholder: "Search..."
  };

  web3Instance: any;
  trtokenContract: any;

  tokensAvailable: any[] = []; // Store database of all tokens that could be swapped
  //sell_token: sellToken;        // Details of token to be sold
  buy_token: buyToken; // Details of tokens to be bought
  txnHashes: any[] = []; // Store transaction hashes that can be viewed on Etherscan

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
  canShow: boolean = false;
  counter: number = 0;
  Tradecounter: number = 0;
  txverified: number = 0;
  timer: any;
  delete_enable: boolean = false;
  finalbasket_id: number = 0;
  public portfolio_data: any;
  public resumedata: any;
  public basket_status_choosed: any;
  tradevalidcount: number = 0; //variable to valid trade token count
  portfolio_nonce: number = 0; //after trade nonce for basket creaion
  portfolio_status: string = null;
  basket_status_interval: any;
  submittoken: any = [];
  balance: number = 0;
  userAccountdetails: Array<any> = [];
  wxETHBalance: number = 0;;
  ///
  @Output() private routeBack = new EventEmitter<string>();
  constructor(
    private http: Http,
    private web3: Web3Service,
    private zone: NgZone,
    private chartService: ChartService,
    private portfolioService: PortfolioService,
    readonly switchThemeService: SwitchThemeService,
    private router: Router,
    private notificationsService: NotificationManagerService,
    private tokenService: TokenService,
    private walletService: WalletService,
    private userService: UserService,
    private fb: FormBuilder,
    private savedWalletsService: SavedWalletsService,
    private AmCharts: AmChartsService,
    private uniswapService: UniswapServiceService,
    private zrxService: ZrxServiceService,
    private wallet: CustomWalletService,
    private EthBasketService: EthBasketService
  ) {
    if (
      !this.tokenService.getToken() ||
      this.tokenService.getToken().Jwt.length === 0
    )
      this.tokenService.fetchToken();
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
    this.createComponentInit = this.createComponentInit.bind(this);
    this.tokenSubscription = this.tokenService.token$.subscribe(data =>
      this.tokenDataChange(data)
    );
    this.editPortfolio = this.portfolioService.updatePortfolioData$.subscribe(
      data => this.updatePortfolio(data)
    );
    this.walletTokenSubscription = this.walletService.tokenContractChange$.subscribe(
      data => this.tokenContractChange(data)
    );
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(
      data => this.handleUserAccountSummaryChange(data)
    );
    this.despositToken = this.portfolioService.depositToken$.subscribe(data =>
      this.deposit(data)
    );

    // this.despositdata = this.portfolioService.depositdata$.subscribe(data =>
    //   this.depositauthdata(data)
    // );

    // this.resumedata = this.portfolioService.resumedata$.subscribe(data =>
    //   this.resumeData(data)
    // );
    this.test();
    this.displayGif2 = "block";
    this.portfolio_data = "";

    this.amChartPieOptions = {
      type: "pie",
      theme: "light",
      dataProvider: [],
      valueField: "value",
      titleField: "title",
      outlineColor: "#24292f",
      outlineThickness: 10,
      outlineAlpha: 7,
      // 'borderAlpha':3,
      // 'labelRadius': 0,
      responsive: true,
      //'color': 'white',
      balloon: {
        fixedPosition: true
      },
      labelsEnabled: false,
      // "pullOutRadius": 60,
      legend: {
        divId: "legenddiv",
        align: "Center",
        markerType: "rectangle",
        position: "bottom",
        autoMargins: false,
        color: "white",
        labelText: "[[title]]",
        valueText: "[[percents]]%",
        valueWidth: 60,
        markerLabelGap: 60
      },
      innerRadius: "60%",
      " autoMargins": false,
      " marginTop": 0,
      " marginBottom": 10,
      marginLeft: 0,
      marginRight: 0,
      pullOutRadius: 0
    };
    (async () => {
      await this.web3.getWeb3().eth.getBlockNumber((err, res) => {
        if (res) {
          ////console.log('block', res);
          this.curentBlock = parseInt(res) + 50000;
        }
      });
    })();
    if (
      this.updatePorfolioFlag === false &&
      this.pendingPorfolioFlag === false
    ) {
      this.wizard1 = true;
    }

    this.web3
      .getWeb3()
      .eth.getBalance(sessionStorage.getItem("walletAddress"), (err, data) => {
        this.balance = parseFloat(
          this.web3
            .getWeb3()
            .fromWei(data)
            .toFixed(4)
        );
        console.log("balance", this.balance, data);
      });
    setTimeout(() => {
      this.canMultiSelect = true;
    }, 100);
    setTimeout(() => {
      this.getAskingPriceIn("WXETH");
    }, 1000);
    setInterval(() => {
      this.web3
        .getWeb3()
        .eth.getBalance(
          sessionStorage.getItem("walletAddress"),
          (err, data) => {
            this.balance = parseFloat(
              this.web3
                .getWeb3()
                .fromWei(data)
                .toFixed(4)
            );
            //console.log('balance',this.balance,data)
          }
        );
      if (this.walletService.getUserAccountSummary() !== undefined) {
        this.userAccountdetails = this.walletService.getUserAccountSummary().Balances;
        //console.log(this.userAccountSummary);
        this.wxETHBalance = this.userAccountSummary.filter(
          wxethbalance => wxethbalance.Symbol === "WXETH"
        )[0].Balance;
      }
      this.isPortfolioValid();
      this.isPortfoliotradeValid();
    }, 1000);

    this.showChart = false;

    this.notificationsService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Please make sure you have at least 0.1 ETH in your ETH address, for a safe basket creation experience."
      ),
      MessageContentType.Text
    );
  }

  //////////////////////Function to find the maximum basket id //////////////////////////////
  public async test(): Promise<any> {
    return new Promise((resolve, reject) => {
      var maxid = 0;
      this.http
        .get(
          Constants.ethBasketUrl +
          "basketsByUser/" +
          this.userService.getCurrentUser().UserAccount
        )
        .subscribe(
          res => {
            // console.log(res);
            let data = JSON.parse(res["_body"]);
            console.log("HURRRAAAAAAAAAAAHH", data);
            var basketid = [];
            data.forEach(element => {
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
          err => {
            if (err.status === 404) {
              this.finalbasket_id = maxid + 1;
            }
            //console.log(err);
          }
        );
    });
  }

  //////////////////////Function to open Trade with Basket Choosing Model///////////////////
  intialtrade(data) {
    //console.log(data);
    this.portfolio_data = data;
    this.basket_status_choosed = "";
    this.intialModal = true;
  }
  createComponentInit() {
    this.selectedItems = [];
    this.itemList = [];
    this.portfolio = [];
    this.selectedTokens = [];
    setTimeout(() => {
      this.getPlatformTokens();
    }, 7000);

    this.wizard3 = false;
    this.walletService.fetchAccountSummary();
    this.settings = {
      singleSelection: false,
      text: "Select Tokens For Your Basket",
      enableSearchFilter: true,
      enableCheckAll: false,
      classes: "myclass custom-class",
      searchPlaceholderText: "Search for tokens"
    };
    let __this = this;
    this.chartService.setUSD(function (err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
    this.createForm();
  }

  ngOnInit(): void {
    console.log("checkers ngonint");
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if (d == "currentWalletChanged") {
          this.selectedWallet = this.savedWalletsService.getCurrentWallet();
          this.wallet.setWallet(this.selectedWallet);
          this.web3.setDefaultAccount();
          this.account = [this.selectedWallet.address][0];
        }
      }
    );
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if (d == "currentWalletChanged") {
          this.createComponentInit();
        }
      }
    );
    this.createComponentInit();
    this.web3Instance = this.web3.getWeb3();
  }

  ngOnDestroy(): void {
    this.tokenSubscription.unsubscribe();
    this.walletTokenSubscription.unsubscribe();
    this.savedWalletChangeSubscription.unsubscribe();
    if (this.orderBookRefreshTimer) {
      clearTimeout(this.orderBookRefreshTimer);
    }
    if (this.despositRefreshTimer) {
      clearTimeout(this.despositRefreshTimer);
    }
    this.editPortfolio.unsubscribe();
    this.walletTokenSubscription.unsubscribe();
    this.userAccountChange.unsubscribe();
    this.despositToken.unsubscribe();
    // this.despositdata.unsubscribe();
    // this.resumedata.unsubscribe();
    this.portfolioService.depositnull(); /////call function to null deposit data ('it is key point to rectify the basket bug')
    this.portfolioService.resumenull();
    //console.log('called destroy');

    this.wizard2 = false;
    this.wizard1 = false;
    this.wizard3 = false;
  }

  handleUserAccountSummaryChange(data) {
    if (data === undefined) return;
    this.userAccountSummary = data.Balances;
    //////console.log('aaaaa', this.userAccountSummary);
  }
  //////////////////////Function to Remove Or Add Basket Selected Token details in array/////////////////////////
  addOrRemoveCoin(symbol: string, coinName: string, balance, decimals) {
    var symbolIndex = this.selectedTokens.indexOf(symbol);
    if (symbolIndex === -1) {
      this.chartService.getUSDETHWAND(symbol, (err, result) => {
        //console.log('getusd',result,this.portfolio);

        if (balance == 0) {
          this.noBalanceTokens++;
          this.portfolio.push({
            Symbol: symbol,
            CoinName: coinName,
            Reqbalance: 0,
            balance: balance,
            price: result["ETH"],
            priceUSD: result["USD"],
            decimals: decimals
          });

          this.calculateTotalinquantity();
        } else {
          // alert( result);
          this.portfolio.push({
            Symbol: symbol,
            CoinName: coinName,
            Reqbalance: 0,
            balance: balance,
            price: result["ETH"],
            priceUSD: result["USD"],
            decimals: decimals
          });
          this.calculateTotalinquantity();
        }
      });
      this.selectedTokens.push(symbol);
    } else {
      this.selectedTokens.splice(symbolIndex, 1);
      var portfolioIndex = -1;
      for (let i: number = 0; i < this.portfolio.length; i++) {
        if (this.portfolio[i].Symbol === symbol) {
          portfolioIndex = i;
          if (balance == 0) {
            this.noBalanceTokens--;
          }
          break;
        }
      }
      if (portfolioIndex !== -1) this.portfolio.splice(portfolioIndex, 1);

      this.generatePieChartAtCreatePortFolio();
      this.calculateTotalinquantity();
    }
  }
  /////////////////////Function to Calculate Total Token Price in Basket/////////////////////////////////
  calculateTotalinquantity() {
    this.totalprice = 0;
    this.portfolio.map(key => {
      console.log("calculate", key);

      if (key.price > 0)
        this.totalprice = this.totalprice + key.price * key.Reqbalance;
    });
  }

  isPortfolioValid(): boolean {
    //////console.log(this.data,this.error,this.validateAllowance);
    // var data;
    // this.http
    // .get(
    //   "http://localhost:3000/basketsByUser/" +
    //     this.userService.getCurrentUser().UserAccount
    // )
    // .subscribe(
    //   res => {
    //     ////console.log(res);
    //      data = JSON.parse(res["_body"]);
    //           ////console.log('isPortfolioValid',data);
    //   });
    if (
      this.balance < 0.02 ||
      this.wxETHBalance <= 0.000002 ||
      this.data["portfolioName"] === null ||
      this.error === undefined ||
      this.error !== "" ||
      this.error === null ||
      this.data["portfolioName"] === undefined ||
      this.validateAllowance === null ||
      this.validateAllowance === undefined ||
      this.validateAllowance === false ||
      this.data["portfolioName"].length === 0 ||
      this.data["askingPriceInWand"] === undefined ||
      this.data["askingPriceInWand"] === null ||
      this.data["askingPriceInWand"] === 0 ||
      this.portfolio_status != "confirmed" ||
      this.portfolio.length === 0
    )
      return false;
    for (var i = 0; i < this.portfolio.length; i++) {
      if (
        this.portfolio[i].Reqbalance <= 0 ||
        this.portfolio[i].balance === "0"
      )
        return false;
    }
    return true;
  }

  isPortfoliotradeValid(): boolean {
    if (
      this.balance < 0.02 ||
      this.wxETHBalance <= 0.000002 ||
      this.data["portfolioName"] === null ||
      this.error === undefined ||
      this.error !== "" ||
      this.error === null ||
      this.data["portfolioName"] === undefined ||
      this.validateAllowance === null ||
      this.validateAllowance === undefined ||
      this.validateAllowance === false ||
      this.data["portfolioName"].length === 0 ||
      this.data["askingPriceInWand"] === undefined ||
      this.data["askingPriceInWand"] === null ||
      this.data["askingPriceInWand"] === 0 ||
      this.portfolio_status != "confirmed" ||
      this.portfolio.length === 0
    )
      return false;
    for (var i = 0; i < this.portfolio.length; i++) {
      if (this.portfolio[i].Reqbalance <= 0) return false;
    }
    return true;
  }
  enablePublish(): boolean {
    return (
      this.isPortfolioValid() &&
      this.askingPriceInWand > 0 &&
      this.assetAnalysisDone
    );
  }

  getAvailableTokens() {
    var returnData = new Array<any>();
    var allAvailableContracts = this.walletService.getContracts();
    if (allAvailableContracts === undefined) return returnData;
    for (var i = 0; i < allAvailableContracts.length; i++) {
      if (
        allAvailableContracts[i].isTokenContract &&
        allAvailableContracts[i].symbol !== "WXETH"
      ) {
        returnData.push(allAvailableContracts[i]);
      }
    }
    return returnData;
  }

  analyzePortfolio() {
    if (!this.isPortfolioValid()) return;

    ////console.log('USD', this.usd);
    this.assetAnalysisDone = false;
    this.showAnalysisLoader = true;
    this.totalETH = 0;
    this.totalQuanity = 0;
    this.totalUSD = 0;
    this.totalWAND = 0;
    let assetAnalysisInput = [];
    for (var i = 0; i < this.portfolio.length; i++) {
      assetAnalysisInput.push({
        Symbol: this.portfolio[i].Symbol,
        Amount: this.portfolio[i].Reqbalance
      });
    }
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
      .post(
        Constants.ServiceURL + "portfolio/analyze",
        assetAnalysisInput,
        requestOptions
      )
      .subscribe(
        data => {
          this.assetAnalysisResult = data.json();
          ////console.log('data', this.assetAnalysisResult);
          this.amChartPieData = [];
          this.assetAnalysisResult.assets.map(key => {
            let temp = {};
            this.totalQuanity = this.totalQuanity + key["reqbalance"];
            this.totalETH = this.totalETH + key["summary"].ETH;
            this.totalUSD = this.totalETH + key["summary"].USD;
            this.totalWAND = this.totalETH + key["summary"].WAND;
            ////console.log('total', this.totalQuanity, this.totalETH, this.totalUSD, this.totalWAND);
            temp["title"] = key["coin"];
            temp["value"] = key["reqbalance"];
            this.amChartPieData.push(temp);
            if (
              this.amChartPieData.length ===
              this.assetAnalysisResult.assets.length
            ) {
              this.generatePieChart();
            }
          });
          this.showAnalysisLoader = false;
          this.assetAnalysisDone = true;
          this.askingPriceInWand = parseFloat(
            this.assetAnalysisResult.overall.ETH.toFixed(6)
          );
          this.creationPriceInWand = parseFloat(
            this.assetAnalysisResult.overall.ETH.toFixed(6)
          );
        },
        err => {
          ////console.log(err);
          this.showAnalysisLoader = false;
        }
      );
  }

  // publishPortfolio() {
  //   this.portfolioService.publishPortfolio(this.portfolioName, this.askingPriceInWand, this.creationPriceInWand, this.portfolio);
  //   this.router.navigateByUrl('/portfolio/sell');
  // }

  signAndPublishPortfolio() {
    this.portfolioService.signAndPublishPortfolio(
      this.portfolioName,
      this.askingPriceInWand,
      this.creationPriceInWand,
      this.portfolio,
      this.assetAnalysisResult
    );
    this.router.navigateByUrl("/portfolio/sell");
  }

  ////////////////////////////Function to Store Token details from backend to Array////////
  getPlatformTokens() {
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
      .get(Constants.ServiceURL + "PlatformToken", requestOptions)
      .subscribe(data => {
        this.showAnalysisLoader = true;
        var tokens = data.json();
        // if(tokens.length>0)
        // {
        //   this.displayGif2="none";
        // }
        //var tokens = Constants.platfromToken;
        //console.log("tokes", data.json());
        let itemLists = [];
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].symbol !== "WXETH" && tokens[i].symbol !== "DICE") { // && tokens[i].symbol !== "POWR"
            let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
            let toeknContract = tokenEth.at(tokens[i].address);
            let _data = tokens[i];
            toeknContract.balanceOf(
              this.web3.getWeb3().eth.coinbase,
              (err, res) => {
                if (res) {
                  this.zone.run(() => {
                    itemLists.push({
                      id: _data.symbol,
                      itemName: _data.symbol,
                      address: _data.address,
                      contract: tokenEth,
                      balance: new BigNumber(res)
                        .dividedBy(new BigNumber(10).pow(_data.decimals))
                        .toJSON(),
                      decimals: _data.decimals
                    });
                    this.itemList = _.sortBy(
                      _.uniq(itemLists, "address"),
                      "itemName"
                    );
                  });
                }
              }
            );
          }
          if (i + 1 == tokens.length) {
            this.changeLabelVisibiltity("portfolioName");
            this.changeLabelVisibiltityPrice("askingPrice");
            this.displayGif2 = "none";
          }
        }
      });
  }

  tokenContractChange(data: any) {
    let itemLists = [];
    let webInstance = this.web3.getWeb3();
    ////console.log('token contract', data);
    this.tokenContract = data;
    if (data === undefined) return;
    // for (var i = 0; i < data.length; i++) {
    //   if (data[i].isTokenContract && data[i].symbol !== 'WXETH') {
    //     let tokenEth = webInstance.eth.contract(JSON.parse(data[i].abi));
    //     let toeknContract = tokenEth.at(data[i].address);
    //     let _data = data[i];
    //     toeknContract.balanceOf(webInstance.eth.coinbase, (err, res) => {
    //       if (res) {itemLists.push({'id': _data.symbol, 'itemName': _data.symbol, 'address': _data.address, 'contract': tokenEth, 'balance': (new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON()});
    //           ////console.log(_.uniq(itemLists, 'address'));
    //           this.itemList = _.uniq(itemLists, 'address');
    //         }
    //     });
    //   }
    // }
  }

  tokenDataChange(data: any) {
    if (data !== undefined && data !== null) {
      if (!data.Jwt || data.Jwt.length === 0) {
        ////console.log('portfolio create component token error');
        this.router.navigateByUrl("/");
        return;
      }
      this.getPlatformTokens();
    }
  }

  userRegistrationStatusChange(data: UserRegistrationResponse) {
    if (data !== undefined && data !== null) {
      if (!data.UserEmailVerified) {
        ////console.log('portfolio create component token error');
        this.router.navigateByUrl("/");
        return;
      }
      this.walletService.fetchContracts();
      this.currentSellablePortfolios = this.portfolioService.currentSellablePortfolios();
      for (var i = 0; i < this.currentSellablePortfolios.length; i++) {
        for (
          var j = 0;
          j < this.currentSellablePortfolios[i].Assets.length;
          j++
        ) {
          if (
            this.usedTokens[
            this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()
            ] !== undefined
          ) {
            this.usedTokens[
              this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()
            ] =
              this.usedTokens[
              this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()
              ] + this.currentSellablePortfolios[i].Assets[j].Reqbalance;
          } else {
            this.usedTokens[
              this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()
            ] = this.currentSellablePortfolios[i].Assets[j].Reqbalance;
          }
        }
      }
    }
  }

  ////////////////////////Event Function to add selected token details in array//////////////////
  OnItemSelect($event) {
    ////console.log('onselect',$event);

    this.showDropdownLoader = true;
    this.addOrRemoveCoin(
      $event.id,
      $event.itemName,
      $event.balance,
      $event.decimals
    );
  }
  ////////////////////////Event Function to delect unselected token details in array//////////////////
  OnItemDeSelect($event) {
    ////console.log('ondeselect',$event);

    ////console.log($event);
    this.addOrRemoveCoin(
      $event.id,
      $event.itemName,
      $event.balance,
      $event.decimals
    );
  }

  // trackWithTokenBalance(requireBalance, balance) {
  //   // if (parseFloat(balance) === 0) {
  //   //   this.zone.run(() => {
  //   //     this.notificationsService.showNotification(
  //   //       new MessageModel(
  //   //         MessageType.Error,
  //   //         "Insufficient balance of this Token on your Wallet address to create a Token Basket"
  //   //       ),
  //   //       MessageContentType.Text
  //   //     );
  //   //     return;
  //   //   });
  //   // }
  //   // else
  //   // if (parseFloat(requireBalance) > parseFloat(balance)) {
  //   //   this.notificationsService.showNotification(
  //   //     new MessageModel(
  //   //       MessageType.Error,
  //   //       "You do not have sufficient balance to create this Basket"
  //   //     ),
  //   //     MessageContentType.Text
  //   //   );
  //   //   return;
  //   // } else {
  //     if (this.portfolio.length > 0) {
  //       let chartData = [];
  //       this.portfolio.map(key => {
  //         let temp = {};
  //         temp["title"] = key["Symbol"];
  //         temp["value"] = key["Reqbalance"] / key["price"];
  //         chartData.push(temp);
  //         this.generatePieChartAtCreatePortFolio();
  //         this.calculateTotalinquantity();
  //       });
  //     }
  //  // }
  // }

  trackWithTokenBalance(requireBalance, balance) {
    this.notificationsService.removeNotification();
    if (parseFloat(balance) === 0) {
      this.zone.run(() => {
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Insufficient balance of this token in your wallet to deposit into the basket"
          ),
          MessageContentType.Text
        );
        if (this.portfolio.length > 0) {
          let chartData = [];
          this.portfolio.map(key => {
            let temp = {};
            temp["title"] = key["Symbol"];
            temp["value"] = key["Reqbalance"] / key["price"];
            chartData.push(temp);
            this.generatePieChartAtCreatePortFolio();
            this.calculateTotalinquantity();
          });
        }
        return;
      });
    } else if (parseFloat(requireBalance) > parseFloat(balance)) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "You do not have sufficient balance to deposit into the basket. You can buy more, in the 'Trading' section on the left sidebar"
        ),
        MessageContentType.Text
      );
      return;
    } else {
      if (this.portfolio.length > 0) {
        let chartData = [];
        this.portfolio.map(key => {
          let temp = {};
          temp["title"] = key["Symbol"];
          temp["value"] = key["Reqbalance"] / key["price"];
          chartData.push(temp);
          this.generatePieChartAtCreatePortFolio();
          this.calculateTotalinquantity();
        });
      }
    }
  }

  generatePieChart() {
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart(
        "piechartdiv",
        this.amChartPieOptions
      );
      ////console.log(this.amChartPie);
      this.AmCharts.updateChart(this.amChartPie, () => {
        this.amChartPie.dataProvider = _.uniq(this.amChartPieData, "title");
      });
    }, 500);
  }

  generatePieChartAtCreatePortFolio() {
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart(
        "piechartdiv1",
        this.amChartPieOptions
      );
      let chartData = [];
      this.portfolio.map(key => {
        if (key["Reqbalance"] > 0) {
          this.showChart = true;
          let temp = {};
          temp["title"] = key["Symbol"];
          temp["value"] = key["Reqbalance"]; // / key['price'];
          chartData.push(temp);
          this.AmCharts.updateChart(this.amChartPie, () => {
            this.amChartPie.dataProvider = chartData;
          });
        }
      });
    }, 500);
  }

  generatePieChartAtdepoitToken() {
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart(
        "piechartdeposite",
        this.amChartPieOptions
      );
      let chartData = [];
      this.portfolioTokenWithValue.map(key => {
        if (key["value"] > 0) {
          this.showChart = true;
          let temp = {};
          temp["title"] = key["symbol"];
          temp["value"] = key["value"] / key.currentPrice;
          chartData.push(temp);
          this.AmCharts.updateChart(this.amChartPie, () => {
            this.amChartPie.dataProvider = chartData;
          });
        }
      });
    }, 500);
  }

  showCreatePortfolioForm() {
    this.createPortfolioForm = true;
  }

  trackTokenvalue(data) {
    ////console.log('trackTokenvalue', data);
    if (data.Available > 0) {
      if (data.tokenHave === 0) {
        ////console.log('have balance');
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Token has not been authorized. Please authorize the Token in the Wallet page"
          ),
          MessageContentType.Text
        );
      }
    } else {
      ////console.log('don\'t have balance ');
    }
    ////console.log('data', data);
  }

  ////////////////////////////Function to create Basket/////////////////////////////////////////

  createPortfolio(data) {
    this.portfolio_status = "unsent";
    this.portfolioService.resumeStatus = false;
    this.portfolioService.isResumeProcessing = false;
    this.test();
    console.log(
      "createPortfolio",
      data,
      this.selectedItems,
      this.demo,
      this.portfolio,
      this.finalbasket_id,
      this.curentBlock,
      this.selectedWallet.getPrivateKeyHex()
    );

    this.EthBasketService.createPortfoliodata(
      data,
      this.selectedItems,
      this.demo,
      this.portfolio,
      this.finalbasket_id,
      this.curentBlock,
      this.selectedWallet.getPrivateKeyHex()
    );
  }

  // createPortfolio1(data) {
  //   //console.log("data", data);
  //   this.notificationsService.showNotification(
  //     new MessageModel(
  //       MessageType.Info,
  //       "The 'Create Basket' button would be enabled once your current basket gets published to the blockchain."
  //     ),
  //     MessageContentType.Text
  //   );
  //   var portfolio = data;
  //   this.portfolio_status = "unsent";
  //   this.test();
  //   // this.showLoader = true;
  //   // this.displayGif = "block";
  //   // this.wizard1 = false;
  //   var foo = this;
  //   let web3Instance = this.web3.getWeb3();
  //   let _askValue = web3Functions.toBaseUnitAmount(data.askingPriceInWand, 18);
  //   let _expiryBlock = 3149112;
  //   let _name = web3Instance.fromAscii(data.portfolioName, 32);
  //   let _assets = [];
  //   let _volumes = [];
  //   let tokendetails = [];
  //   let tradecount = 0;
  //   //////console.log(this.selectedToke'http://localhost:3000/basket',objns);
  //   this.selectedItems.map(key => {
  //     if (key.balance > 0) {
  //       this.assets.push(key.address);
  //     } else {
  //       this.demo.map(key1 => {
  //         if (key1.trade_data.length > 0 && key1.address == key.address) {
  //           tradecount += 1;
  //           this.assets.push(key.address);
  //         }
  //       });
  //     }
  //   });
  //   //console.log("basketdata", this.selectedItems, this.portfolio, this.demo);

  //   this.portfolio.map(key => {
  //     if (key.balance > 0) {
  //       this.valumes.push(
  //         web3Functions.toBaseUnitAmount(key.Reqbalance, parseInt(key.decimals))
  //       );
  //       tokendetails.push({
  //         tokenSymbol: key.Symbol,
  //         amount: key.Reqbalance,
  //         tradeStatus: "confirmed",
  //         transferStatus: "unsent"
  //       });
  //     } else {
  //       this.demo.map(key1 => {
  //         if (key1.trade_data.length > 0 && key1.symbol == key.Symbol) {
  //           this.valumes.push(
  //             web3Functions.toBaseUnitAmount(
  //               key.Reqbalance,
  //               parseInt(key.decimals)
  //             )
  //           );
  //           tokendetails.push({
  //             tokenSymbol: key.Symbol,
  //             amount: key.Reqbalance,
  //             tradeStatus: "unsent",
  //             transferStatus: "unsent"
  //           });
  //         }
  //       });
  //     }
  //   });
  //   let _maker = this.userService.getCurrentUser().UserAccount;
  //   let finalData = {
  //     _askValue: _askValue,
  //     _expiryBlock: _expiryBlock,
  //     _name: _name,
  //     _assets: this.assets,
  //     _volumes: this.valumes,
  //     _maker: _maker
  //   };
  //   //console.log("data", finalData);
  //   var privateKey = foo.selectedWallet.getPrivateKeyHex();
  //   privateKey = Buffer.from(privateKey.substr(2), "hex");
  //   var count;
  //   web3Instance.eth.getTransactionCount(_maker, (err, res) => {
  //     //web3Instance.eth.getTransactionCount(_maker,(res)=>{
  //     //count = res;
  //     ////console.log('nonce',res);

  //     let portEth = web3Instance.eth.contract(Constants.createPortfolio);
  //     let portContract = portEth.at(Constants.CretaeContractAddress);
  //     var data = portContract.createPortfolio.getData(
  //       _maker,
  //       this.assets,
  //       this.valumes,
  //       _askValue,
  //       this.curentBlock,
  //       _name,
  //       { from: _maker }
  //     );
  //     web3Instance.eth.estimateGas(
  //       {
  //         to: Constants.CretaeContractAddress,
  //         data: data
  //       },
  //       (err, res) => {
  //         console.log("estimategas", res);
  //       }
  //     );
  //     this.web3.getWeb3().eth.getGasPrice((err, gp) => {
  //       console.log("GasPrice", gp.toString(10));
  //     });
  //     console.log(data);
  //     const txParams = {
  //       gasPrice: "0x4A817C800",
  //       gasLimit: 4000000,
  //       to: Constants.CretaeContractAddress,
  //       data: data,
  //       from: _maker,
  //       chainId: Constants.Chainid,
  //       Txtype: 0x01,
  //       //value:convertedAmount,
  //       nonce: res + tradecount
  //     };
  //     //nonce = nonce + 1;
  //     const tx = new Tx(txParams);
  //     tx.sign(privateKey);
  //     ////console.log('tx',tx);

  //     const serializedTx = tx.serialize();
  //     ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));

  //     const obj = {
  //       serializedTx: "0x" + serializedTx.toString("hex")
  //     };

  //     let basketdata = {
  //       userAddress: this.userService.getCurrentUser().UserAccount,
  //       currentOwner: this.userService.getCurrentUser().UserAccount,
  //       basketID: this.finalbasket_id,
  //       basketName: portfolio.portfolioName,
  //       basketPrice: portfolio.askingPriceInWand,
  //       basketContract: "",
  //       basketCreationHash: "",
  //       basketCreationSign: "0x" + serializedTx.toString("hex"),
  //       basketCreationStatus: "unsent",
  //       basketPublishHash: "",
  //       basketPublishSign: "",
  //       basketPublishStatus: "unsent",
  //       tokens: tokendetails,
  //       liquidated: "no",
  //       tradable: "true",
  //       expiresAt: this.curentBlock
  //     };
  //     //console.log("basketobj", basketdata);
  //     this.notificationsService.showNotification(
  //       new MessageModel(
  //         MessageType.Info,
  //         "DO NOT MAKE ANY TRANSACTIONS USING YOUR ADDRESS:" +
  //           _maker.substring(0, 13) +
  //           "..., UNTIL YOUR BASKET GETS PUBLISHED TO THE BLOCKCHAIN. OTHERWISE IT MAY NOT GET PUBLISHED AT ALL."
  //       ),
  //       MessageContentType.Text
  //     );
  //     return new Promise((resolve, reject) => {
  //       // this.http.post('http://localhost:3000/basket',obj).subscribe(res =>{

  //       // return new Promise((resolve, reject) => {
  //       this.http
  //         .post(Constants.ethBasketUrl + "addBasket", basketdata)
  //         .subscribe(
  //           res => {
  //             resolve(res);

  //             this.EthBasketService.trackCreatePortfolioTransaction(
  //               basketdata.userAddress,
  //               basketdata.basketID,
  //               web3Instance,
  //               foo.selectedWallet.getPrivateKeyHex()
  //             );
  //             this.notificationsService.showNotification(
  //               new MessageModel(
  //                 MessageType.Info,
  //                 "The basket publishing may take a while. Meanwhile, you are free to close the desktop app, and come back later to check out your basket under 'My Token Baskets' tab"
  //               ),
  //               MessageContentType.Text
  //             );
  //           },
  //           err => {
  //             resolve(err);
  //           }
  //         );
  //     });
  //     // .then(res => {
  //     //   var response = JSON.parse(res["_body"]);
  //     //   ////console.log(response,response.status,response.data.transactionHash,"RESPONSE1")

  //     //   // ////console.log(response,response['_body'].data.transactionHash,response['_body']['status'],"RESPONSE1")
  //     //   if (response.status) {
  //     //     this.notificationsService.showNotification(
  //     //       new MessageModel(
  //     //         MessageType.Info,
  //     //         "The transaction is submitted to the blockchain. Please wait until it is confirmed"
  //     //       ),
  //     //       MessageContentType.Text
  //     //     );
  //     //     this.zone.run(() => {});
  //     //     // this.txHash = response.data.transactionHash;
  //     //     // this.trackCreatePortfolioTransaction(
  //     //     //   basketdata.userAddress,
  //     //     //   basketdata.basketID,
  //     //     //   web3Instance
  //     //     // );
  //     //     //this.initiateAutoRefresh(portContract);
  //     //   } else {
  //     //     this.showLoader = false;
  //     //     this.displayGif = "none";
  //     //     this.wizard1 = true;
  //     //     this.notificationsService.showNotification(
  //     //       new MessageModel(MessageType.Error, "Transaction not submitted"),
  //     //       MessageContentType.Text
  //     //     );
  //     //     this.zone.run(() => {
  //     //       ////console.log('transaction failed');
  //     //     });
  //     //   }
  //     // })
  //     // .catch(e => {
  //     //   ////console.log(e);
  //     //   this.showLoader = false;
  //     //   this.displayGif = "none";
  //     //   this.wizard1 = true;
  //     //   this.notificationsService.showNotification(
  //     //     new MessageModel(MessageType.Error, "Transaction not submitted"),
  //     //     MessageContentType.Text
  //     //   );
  //     //   this.zone.run(() => {
  //     //     ////console.log('transaction failed');
  //     //   });
  //     //   return;
  //     // });
  //     // return this.http.post('http://localhost:3000/basket',obj).subscribe(res=>{
  //     //   ////console.log('response',res);
  //     //    if (res['_body']) {
  //     //   this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
  //     //   this.zone.run(() => {
  //     //   });
  //     //   this.trackCreatePortfolioTransaction(this.txHash, web3Instance);
  //     //   //this.initiateAutoRefresh(portContract);
  //     // } else {
  //     //   this.showLoader = false;
  //     //   this.displayGif = 'none';
  //     //   this.wizard1 = true;
  //     //   this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
  //     //   this.zone.run(() => {
  //     //     ////console.log('transaction failed');
  //     //   });
  //     // }
  //     // })
  //   });

  //   // portContract.createPortfolio(_maker, this.assets, this.valumes, _askValue, this.curentBlock, _name, (err, result) => {
  //   //   ////console.log(result);
  //   //   if (result) {
  //   //     this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
  //   //     this.zone.run(() => {
  //   //     });
  //   //     this.trackCreatePortfolioTransaction(this.txHash, web3Instance);
  //   //     //this.initiateAutoRefresh(portContract);
  //   //   } else {
  //   //     this.showLoader = false;
  //   //     this.displayGif = 'none';
  //   //     this.wizard1 = true;
  //   //     this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
  //   //     this.zone.run(() => {
  //   //       ////console.log('transaction failed');
  //   //     });
  //   //   }
  //   // });
  // }

  deposit(data) {
    ////console.log('called inside component', data);
    if (data === true) {
      if (this.walletService.getNewPortfolioTokenWithValue()) {
        ////console.log('token with value', this.walletService.getNewPortfolioTokenWithValue());
        this.portfolioTokenWithValue = this.walletService.getNewPortfolioTokenWithValue();
        if (this.portfolioTokenWithValue.length === 0) {
          this.portfolioService.publishComplete();
        } else {
          this.wizard1 = false;
          this.wizard2 = false;
          this.wizard3 = true;
          this.portfolioTokenWithValue.map(key => {
            key.message = "";
            this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
              if (result) {
                key.currentPrice = result["ETH"];
                this.getTotalDeposit();
                this.generatePieChartAtdepoitToken();
              }
            });
          });
          this.zone.run(() => { });
        }
      }
    }
  }

  // depositauthdata(data) {
  //   //console.log("depositauth", data);
  //   if (data) {
  //     this.portfolioTokenWithValue = this.walletService.getNewPortfolioTokenWithValue();
  //     //console.log('porttokenlen',this.portfolioTokenWithValue.length);

  //     if (this.portfolioTokenWithValue.length === 0) {
  //       //  this.portfolioService.publishComplete();
  //     } else {
  //       this.basketDeposit(data);
  //       this.zone.run(() => {});
  //     }
  //   }
  // }

  // resumeData(data) {
  //   let meta = this;
  //   if (data) {
  //     console.log("data triggered");
  //     setTimeout(() => {
  //       console.log(
  //         "present",
  //         data,
  //         meta.selectedWallet,
  //         meta.selectedWallet.getPrivateKeyHex()
  //       );
  //       this.initiateAutoRefresh(
  //         data.contractAddress,
  //         data.basketCreationHash,
  //         data.basketID
  //       );
  //     }, 3000);
  //   }
  // }

  getTotalDeposit() {
    this.totalDepositPrice = 0;
    this.portfolioTokenWithValue.map(key => {
      this.totalDepositPrice =
        this.totalDepositPrice + parseFloat(key.value) * key.currentPrice;
    });
  }

  getAskingPriceIn(token) {
    let userAccountDetail = this.walletService.getUserAccountSummary();
    if (userAccountDetail) {
      let assetsStatus = _.where(userAccountDetail.Balances, { Symbol: token });
      this.web3
        .getWeb3()
        .eth.getBalance(
          sessionStorage.getItem("walletAddress"),
          (err, data) => {
            if (
              parseFloat(
                this.web3
                  .getWeb3()
                  .fromWei(data)
                  .toFixed(4)
              ) < 0.02
            ) {
              this.notificationsService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "You do not have the minimum amount of 0.02 ETH in your wallet, to be able to create a basket"
                ),
                MessageContentType.Text
              );
            }
          }
        );
      if (assetsStatus[0]["Balance"] == 0 || assetsStatus[0]["Balance"] < 0) {
        this.validateAllowance = false;
        this.trackPortfolioCreatebtn = true;
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Error,
            "Not enough authorized WXETH balance in your wallet, to create a basket. You can deposit and authorize WXETH in the 'Wallet' tab"
          ),
          MessageContentType.Text
        );
        this.trackPortfolioCreatebtn =
          "Wxeth not have enough balance to make this transaction";
        return;
      } else {
        this.tokenContract.map(key => {
          if (key.symbol === "WXETH") {
            var myTokenContract = this.web3
              .getWeb3()
              .eth.contract(JSON.parse(key["abi"]));
            var instanceMyTokenContract = myTokenContract.at(key["address"]);
            var userAccount = this.web3.getWeb3().eth.coinbase;
            let wexth = Constants.TrasfersProxyAddress;
            instanceMyTokenContract.allowance(
              userAccount,
              wexth,
              (err, result) => {
                if (result.lt(assetsStatus[0]["Balance"])) {
                  this.validateAllowance = false;
                  this.trackPortfolioCreatebtn =
                    "Token has not been authorized. Please authorize the Token in the Wallet page";
                  return;
                } else {
                  this.validateAllowance = true;
                }
              }
            );
          }
        });
      }
    }
  }

  trackvalue(data, i) {
    if (data) {
      if (
        JSON.stringify(data.enter) ===
        (typeof data.value === "number"
          ? JSON.stringify(data.value)
          : data.value)
      ) {
        this.portfolioTokenWithValue.map((key, value) => {
          if (value === i) {
            key.message = "";
            this.trackButton();
          }
        });
      } else {
        this.portfolioTokenWithValue.map((key, value) => {
          if (value === i) {
            key.message = "error";
            this.trackButton();
          }
        });
      }
    }
  }

  trackButton() {
    let length = this.portfolioTokenWithValue.length;
    let i = 0;
    this.portfolioTokenWithValue.map(key => {
      if (key.enter) {
        if (key.message === "") {
          i++;
        }
      }
      if (i === length) {
        this.trackBtn = false;
      } else {
        this.trackBtn = true;
      }
    });
  }
  ////////////////////////////////Function for Token Deposit//////////////////////////////////////
  // basketDeposit(data) {
  //   let nonce = data.nonce;
  //   let authdata = data.authdata;
  //   // this.notificationsService.showNotification(
  //   //   new MessageModel(
  //   //     MessageType.Info,
  //   //     "Please submit all the authorizations on wallet with sufficient Gwei to ensure that the transaction goes through."
  //   //   ),
  //   //   MessageContentType.Text
  //   // );
  //   // this.showLoader = true;
  //   //this.displayGif = 'block';
  //   this.wizard3 = false;
  //   //console.log("data", this.portfolioTokenWithValue);
  //   this.deposit_serialized_data = [];
  //   let contractAddress = this.walletService.getPortfolioAddress();
  //   ////console.log('address', this.walletService.getPortfolioAddress());
  //   let web3Instance = this.web3.getWeb3();
  //   let vsb = web3Instance.eth.contract(Constants.VBPABI);
  //   let vsbContract = vsb.at(contractAddress);
  //   let j = 0;
  //   var deposit_nonce;
  //   var privateKey = this.selectedWallet.getPrivateKeyHex();
  //   privateKey = Buffer.from(privateKey.substr(2), "hex");

  //   web3Instance.eth.getTransactionCount(
  //     this.userService.getCurrentUser().UserAccount,
  //     (err, res) => {
  //       this.portfolioTokenWithValue.map((key, i) => {
  //         //console.log('depositnonce',(nonce+i));

  //         var data = vsbContract.depositTokens.getData(
  //           key.address,
  //           web3Functions.toBaseUnitAmount(key.value, key.data.decimals)
  //         );
  //         deposit_nonce = nonce + i;
  //         const txParams = {
  //           gasPrice: "0x4A817C800",
  //           gasLimit: 4000000,
  //           to: contractAddress,
  //           data: data,
  //           from: this.userService.getCurrentUser().UserAccount,
  //           chainId: Constants.Chainid,
  //           Txtype: 0x01,
  //           //value:convertedAmount,
  //           nonce: nonce + i
  //         };
  //         //console.log('deposittx',txParams,key.symbol);

  //         //nonce = nonce + 1;
  //         const tx = new Tx(txParams);
  //         tx.sign(privateKey);
  //         ////console.log('tx',tx);

  //         const serializedTx = tx.serialize();
  //         ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));
  //         authdata.tokens.forEach(element => {
  //           //console.log('authdaat',element.token,key.symbol);

  //           if (element.token === key.symbol) {
  //             element.transfer_sign = "0x" + serializedTx.toString("hex");
  //           }
  //         });
  //         const obj = {
  //           serializedTx: "0x" + serializedTx.toString("hex")
  //         };
  //         this.deposit_serialized_data.push(obj);
  //         // //console.log(count,this.tokenWithbalance.length,this.serialized_data.length,this.serialized_data);
  //         if (
  //           this.portfolioTokenWithValue.length ==
  //           this.deposit_serialized_data.length
  //         ) {
  //           //console.log("Authorization", authdata);

  //           return new Promise((resolve, reject) => {
  //             this.http
  //               .post(Constants.ethBasketUrl + "addBetterBasket", authdata)
  //               .subscribe(
  //                 res => {
  //                   this.publish(deposit_nonce);
  //                   resolve(res);
  //                 },
  //                 err => {
  //                   resolve(err);
  //                 }
  //               );
  //           });
  //           // .then(res => {
  //           //   //console.log(res);

  //           //   var response = JSON.parse(res["_body"]);
  //           //   ////console.log(response,response.status,response.data.transactionHash,"RESPONSE1")
  //           //   //console.log("response", response);

  //           //   // ////console.log(response,response['_body'].data.transactionHash,response['_body']['status'],"RESPONSE1")
  //           //   response.data.forEach((element, value) => {
  //           //     if (element.status) {
  //           //       key.status = false;
  //           //       j++;
  //           //       key.txnAddress = res;
  //           //       //console.log(
  //           //         "this.portfolioTokenWithValue",
  //           //         j,
  //           //         this.portfolioTokenWithValue.length,
  //           //         this.portfolioTokenWithValue
  //           //       );
  //           //       // this.showLoader = true;
  //           //       //  this.wizard3 = false;
  //           //       if (j === this.portfolioTokenWithValue.length) {
  //           //         // this.trackDepsitTrasanction(web3Instance);
  //           //         this.trackDeposittAndPulish();
  //           //       }
  //           //     } else {
  //           //       this.showLoader = false;
  //           //       this.displayGif = "none";
  //           //       this.wizard1 = true;
  //           //       this.notificationsService.showNotification(
  //           //         new MessageModel(
  //           //           MessageType.Error,
  //           //           "Transaction rejected"
  //           //         ),
  //           //         MessageContentType.Text
  //           //       );
  //           //       this.zone.run(() => {
  //           //         //  //console.log('transaction failed');
  //           //       });
  //           //     }
  //           //   });
  //           // })
  //           // .catch(e => {
  //           //   this.showLoader = false;
  //           //   this.displayGif = "none";
  //           //   this.notificationsService.showNotification(
  //           //     new MessageModel(MessageType.Error, "error"),
  //           //     MessageContentType.Text
  //           //   );
  //           // });
  //         }
  //       });
  //     }
  //   );

  //   // this.portfolioTokenWithValue.map(key => {
  //   //   ////console.log(key.data.decimals);
  //   //   vsbContract.depositTokens(
  //   //     key.address,
  //   //     web3Functions.toBaseUnitAmount(key.value, key.data.decimals),
  //   //     (err, res) => {
  //   //       if (!err) {
  //   //         ////console.log(res);
  //   //         key.status = false;
  //   //         i++;
  //   //         key.txnAddress = res;
  //   //         ////console.log('this.portfolioTokenWithValue', this.portfolioTokenWithValue);
  //   //         this.showLoader = true;
  //   //         this.wizard3 = false;
  //   //         if (i === this.portfolioTokenWithValue.length) {
  //   //           this.trackDepsitTrasanction(web3Instance);
  //   //         }
  //   //       } else {
  //   //         this.notificationsService.showNotification(
  //   //           new MessageModel(MessageType.Error, "Transaction rejected"),
  //   //           MessageContentType.Text
  //   //         );
  //   //       }
  //   //     }
  //   //   );
  //   // });
  // }

  trackDepsitTrasanction(web3Instance) {
    ////console.log('deposit tracking');
    if (this.despositRefreshTimer) clearTimeout(this.despositRefreshTimer);
    this.portfolioTokenWithValue.map(key => {
      web3Instance.eth.getTransactionReceipt(key.txnAddress, (err, res) => {
        if (res) {
          if (res.status === "0x1") {
            ////console.log('deposite', key.txnAddress, res.transactionHash);
            if (key.txnAddress === res.transactionHash) {
              key.status = true;
              this.tractButton();
            }
          } else if (res.status === "0x0") {
            clearTimeout(this.despositRefreshTimer);
          }
        }
      });
    });

    this.despositRefreshTimer = setTimeout(() => {
      this.trackDepsitTrasanction(web3Instance);
    }, 1000);
  }
  ////////////////////////////////Function For Publish Token////////////////////////////////////
  // publish(nonce) {
  //   //console.log('pubnonce',nonce);
  //   let meta = this;
  //   //this.showLoader = true;
  //   // this.displayGif = "block";
  //   // this.wizard4 = false;
  //   let a = 1;
  //   let contractAddress = this.walletService.getPortfolioAddress();
  //   localStorage.setItem("contractAddress", contractAddress);
  //   let web3Instance = this.web3.getWeb3();
  //   let vsb = web3Instance.eth.contract(Constants.VBPABI);
  //   let vsbContract = vsb.at(contractAddress);
  //   if (this.updatePorfolioFlag === false) {
  //     var privateKey = this.selectedWallet.getPrivateKeyHex();
  //     privateKey = Buffer.from(privateKey.substr(2), "hex");
  //     var count;
  //     web3Instance.eth.getTransactionCount(
  //       this.userService.getCurrentUser().UserAccount,
  //       (err, res) => {
  //         //web3Instance.eth.getTransactionCount(_maker,(res)=>{
  //         //count = res;
  //         ////console.log('nonce',res);

  //         var data = vsbContract.publish.getData();
  //         //console.log('pubnonce1',nonce+a);
  //         const txParams = {
  //           gasPrice: "0x4A817C800",
  //           gasLimit: 4000000,
  //           to: contractAddress,
  //           data: data,
  //           from: this.userService.getCurrentUser().UserAccount,
  //           chainId: Constants.Chainid,
  //           Txtype: 0x01,
  //           //value:convertedAmount,
  //           nonce: nonce + a
  //         };
  //         //nonce = nonce + 1;
  //         const tx = new Tx(txParams);
  //         tx.sign(privateKey);
  //         ////console.log('tx',tx);

  //         const serializedTx = tx.serialize();
  //         ////console.log('serial',serializedTx,'0x' + serializedTx.toString('hex'));

  //         const obj = {
  //           basketCreationHash: this.walletService.getPortfolioTransactionhash(),
  //           basketPublishSign: "0x" + serializedTx.toString("hex")
  //         };
  //         //console.log('publish',obj);

  //         return new Promise((resolve, reject) => {
  //           this.http
  //             .post(Constants.ethBasketUrl + "addPublishSign/", obj)
  //             .subscribe(
  //               res => {
  //                 meta.routeBack.emit("sell");
  //               },
  //               err => {
  //                 //console.log(err);

  //                 resolve(err);
  //               }
  //             );
  //         });
  //         // .then(res => {
  //         //   var response = JSON.parse(res["_body"]);
  //         //   ////console.log(response,response.status,response.data.transactionHash,"RESPONSE1")

  //         //   // ////console.log(response,response['_body'].data.transactionHash,response['_body']['status'],"RESPONSE1")
  //         //   if (response.status) {
  //         //     ////console.log(res);
  //         //     this.notificationsService.showNotification(
  //         //       new MessageModel(
  //         //         MessageType.Success,
  //         //         "Wait for the transaction to complete on the Blockchain"
  //         //       ),
  //         //       MessageContentType.Text
  //         //     );
  //         //     this.zone.run(() => {});
  //         //     this.tractPublish(response.data.transactionHash, web3Instance);
  //         //     //this.initiateAutoRefresh(portContract);
  //         //   } else {
  //         //     this.notificationsService.showNotification(
  //         //       new MessageModel(MessageType.Error, "Transaction rejected"),
  //         //       MessageContentType.Text
  //         //     );
  //         //   }
  //         // })
  //         // .catch(e => {
  //         //   ////console.log(e);
  //         //   this.showLoader = false;
  //         //   this.displayGif = "none";
  //         //   this.notificationsService.showNotification(
  //         //     new MessageModel(
  //         //       MessageType.Error,
  //         //       "Transaction not submitted"
  //         //     ),
  //         //     MessageContentType.Text
  //         //   );
  //         //   this.zone.run(() => {
  //         //     ////console.log('transaction failed');
  //         //   });
  //         //   return;
  //         // });
  //       }
  //     );
  //     // vsbContract.publish((err, res) => {
  //     //   if (!err) {
  //     //     this.showLoader = true;
  //     //     this.wizard4 = false;
  //     //     ////console.log(res);
  //     //     this.notificationsService.showNotification(
  //     //       new MessageModel(
  //     //         MessageType.Success,
  //     //         "Wait for the transaction to complete on the Blockchain"
  //     //       ),
  //     //       MessageContentType.Text
  //     //     );
  //     //     this.zone.run(() => {});
  //     //     this.tractPublish(res, web3Instance);
  //     //   } else {
  //     //     this.notificationsService.showNotification(
  //     //       new MessageModel(MessageType.Error, "Transaction rejected"),
  //     //       MessageContentType.Text
  //     //     );
  //     //   }
  //     // });
  //   }
  // }

  trackDeposittAndPulish() {
    if (this.updatePorfolioFlag === true) {
      this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = false;
      //this.displayGif='block'
      this.portfolioService.publishComplete();
      this.zone.run(() => { });
    } else {
      this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = true;
      // this.displayGif='block'
      this.generatepublishChart(this.portfolioTokenWithValue, "create");
      this.zone.run(() => { });
    }
  }

  updatePortfolio(data) {
    if (data) {
      if (data.flag === "update") {
        this.wizard1 = true;
        this.error = "";
        this.updatePorfolioFlag = true;
        this.trackPortfolioCreatebtn = false;
        this.currentPortfolioAddress = data.portfolio.contractAddress;
        ////console.log('update', data.portfolio);
        ////console.log('portfolio.name', data.portfolio.name.trim().length);
        this.data["portfolioName"] = data.portfolio.name.trim();
        this.data["askingPriceInWand"] = data.portfolio.valueInEther;
        data.portfolio.token.map(key => {
          let temp = {};
          temp["address"] = key.tokenAddress;
          temp["itemName"] = key.Symbol;
          temp["id"] = key.Symbol;
          this.existingToken.push({
            address: key.tokenAddress,
            value: key.value
          });
          this.selectedItems.push(temp);
          this.selectedTokens.push(key.Symbol);
          let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
          let toeknContract = tokenEth.at(key.tokenAddress);
          toeknContract.balanceOf(
            this.web3.getWeb3().eth.coinbase,
            (err, res) => {
              this.chartService.getUSDETHWAND(key.Symbol, (err, result) => {
                this.zone.run(() => {
                  this.portfolio.push({
                    Symbol: key.Symbol,
                    CoinName: key.Symbol,
                    Reqbalance: key.value,
                    price: result["ETH"],
                    priceUSD: result["USD"],
                    decimals: key.decimals,
                    balance: new BigNumber(res)
                      .dividedBy(new BigNumber(10).pow(key.decimals))
                      .toJSON()
                  });
                });
              });
            }
          );
        });
      } else {
        //localStorage.setItem('pendingPortfolioAddress', data.portfolio.contractAddress);
        this.wizard1 = false;
        this.showLoader = true;
        this.pendingPorfolioFlag = true;
        this.trackPendindPortfolio(data.portfolio);
      }
    } else {
      this.updatePorfolioFlag = false;
      this.data = {};
      this.portfolio = [];
    }
  }

  updateCurrentPortfolio(data) {
    if (this.currentPortfolioAddress) {
      localStorage.setItem("contractAddress", this.currentPortfolioAddress);
      this.showLoader = true;
      this.displayGif = "block";
      this.wizard1 = false;
      ////console.log('data', data);
      let newTokens = [];
      let web3Instance = this.web3.getWeb3();
      let _askValue = web3Functions.toBaseUnitAmount(
        data.askingPriceInWand,
        18
      );
      let _expiryBlock = 3149112;
      let t = data.portfolioName.trim();
      let _name = web3Instance.toHex(data.portfolioName);
      this.selectedItems.map(key => {
        this.assets.push(key.address);
      });
      this.portfolio.map(key => {
        this.valumes.push(
          web3Functions.toBaseUnitAmount(key.Reqbalance, parseInt(key.decimals))
        );
      });
      this.assets.map((key, value) => {
        this.valumes.map((key1, value1) => {
          if (value === value1) {
            newTokens.push({
              value: new BigNumber(key1)
                .dividedBy(new BigNumber(10).pow(18))
                .toJSON(),
              address: key
            });
          }
        });
      });
      let _maker = this.userService.getCurrentUser().UserAccount;
      let finalData = {
        _askValue: _askValue,
        _expiryBlock: _expiryBlock,
        _name: _name,
        _assets: this.assets,
        _volumes: this.valumes,
        _maker: _maker,
        newTokens: newTokens,
        oldTokens: this.existingToken
      };
      ////console.log('check', _(this.existingToken).isEqual(newTokens));
      let portEth = web3Instance.eth.contract(Constants.VBPABI);
      let portContract = portEth.at(this.currentPortfolioAddress);
      ////console.log('data', finalData);
      portContract.updatePortfolio(
        _askValue,
        this.curentBlock,
        this.assets,
        this.valumes,
        _name,
        (err, result) => {
          ////console.log(result);
          this.txHash = result;
          if (!result) {
            this.showLoader = false;
            this.displayGif = "none";
            this.wizard1 = true;
            this.notificationsService.showNotification(
              new MessageModel(MessageType.Error, "Transaction not submitted"),
              MessageContentType.Text
            );
          } else {
            this.notificationsService.showNotification(
              new MessageModel(
                MessageType.Info,
                "The transaction is submitted to blockchain please wait until it is complete"
              ),
              MessageContentType.Text
            );
            this.trackTransaction(result, web3Instance, newTokens, data);
          }
        }
      );
    }
  }

  calling(data) {
    ////console.log('Data', data);
    this.portfolio_status = null;
    var data;
    this.http
      .get(
        Constants.ethBasketUrl +
        "basketsByUser/" +
        this.userService.getCurrentUser().UserAccount
      )
      .subscribe(
        res => {
          ////console.log(res);
          data = JSON.parse(res["_body"]);
          //    console.log('isPortfolioValid',data);
          this.portfolio_status = data[data.length - 1].basketPublishStatus;
          //console.log('isPortfolioValid',data);
        },
        err => {
          // console.log(err);
          if (err.status === 404) {
            this.portfolio_status = "confirmed";
          }
        }
      );
    if (data.length > 26) {
      this.error = "Basket Name should not larger than 26";
      return;
    } else {
      this.error = "";
    }
    this.basket_status_interval = setInterval(() => {
      this.http
        .get(
          Constants.ethBasketUrl +
          "basketsByUser/" +
          this.userService.getCurrentUser().UserAccount
        )
        .subscribe(
          res => {
            ////console.log(res);
            //console.log( this.data["portfolioName"],this.error,this.validateAllowance,this.data["askingPriceInWand"]);
            data = JSON.parse(res["_body"]);
            this.portfolio_status = data[data.length - 1].basketPublishStatus;
            //console.log('isPortfolioValid',data,this.portfolio_status);
            if (this.portfolio_status === "confirmed") {
              //console.log('isPortfolioValid1',this.portfolio_status);
              clearInterval(this.basket_status_interval);
            }
          },
          err => {
            // console.log(err);
            if (err.status === 404) {
              this.portfolio_status = "confirmed";
            }
          }
        );
    }, 60000);
  }

  validateAssets(portfolio, newTokens, callback) {
    ////console.log('validate token ');
    let web3Instance = this.web3.getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.address);
    newTokens.map((key, value) => {
      vsbContract.balanceOfToken(
        this.web3.getWeb3().eth.coinbase,
        key.address,
        (err, res) => {
          if (!res) {
            return;
          } else {
            ////console.log('respons e', res);
            ////console.log('response', (new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() === '0');
            if (
              new BigNumber(res)
                .dividedBy(new BigNumber(10).pow(18))
                .toJSON() === "0"
            ) {
              callback(false);
            }
          }
        }
      );
    });
  }

  // private trackCreatePortfolioTransaction(userAddress, basketID, web3Instance) {
  //   //if (this.orderBookRefreshTimer) clearTimeout(this.orderBookRefreshTimer);
  //   // web3Instance.eth.getTransactionReceipt(address, (err, res) => {
  //   // if (res) {
  //   // setInterval(fetchContract(userAddress, basketID), 3000);
  //   let basket;
  //   new Promise((resolve, reject) => {
  //     this.http
  //       .get(
  //         Constants.ethBasketUrl +
  //           `basketContractByPair?userAddress=${userAddress}&basketID=${basketID}`
  //       )
  //       .subscribe(data => {
  //         // ////console.log('tokes', data.json());
  //         data = data.json();
  //         resolve(data);
  //         basket = data;
  //         console.log("BASKET", basket);
  //         if (basket.basketContract) {
  //           this.zone.run(() => {
  //            // clearTimeout(this.orderBookRefreshTimer);
  //             console.log('trackCreatePortfolioTransaction');

  //             this.initiateAutoRefresh(
  //               basket.basketContract,
  //               basket.basketCreationHash,
  //               basket.basketID
  //             );
  //           });
  //         }
  //         else{
  //           this.trackCreatePortfolioTransaction(userAddress, basketID, web3Instance);
  //         }
  //         // this.initiateAutoRefresh(data.basketContract);
  //       });
  //   });

  //   // if (res.status === "0x1") {
  //   //   ////console.log('transaction successful', res);
  //   //   // let portEth = this.web3
  //   //   //   .getWeb3()
  //   //   //   .eth.contract(Constants.createPortfolio);
  //   //   // let portContract = portEth.at(Constants.CretaeContractAddress);
  //   //   this.initiateAutoRefresh(portContract);
  //   // } else if (res.status === "0x0") {
  //   //   clearTimeout(this.orderBookRefreshTimer);
  //   //   ////console.log('transaction unsuccessful', res);
  //   // }
  //   // }
  //   // });
  //   // this.orderBookRefreshTimer = setTimeout(() => {
  //   //   this.trackCreatePortfolioTransaction(userAddress, basketID, web3Instance);
  //   // }, 2000);
  // }

  // private initiateAutoRefresh(contractAddress, basketCreationHash, basketID) {
  //  console.log("initiateAutoRefresh");

  //   // let instructorEvent = portContract.Exchange(
  //   //   {},
  //   //   { fromBlock: 0, toBlock: "latest" }
  //   // );
  //   // instructorEvent.watch((error, result) => {
  //   // if (result.transactionHash === this.txHash) {
  //   //   this.trackPortfolioCreate = true;
  //   //   //////console.log('result', result);
  //   //   this.txHashSuccess = result;
  //   //   if (this.txHashSuccess.args._portfolio !== "0x") {
  //   this.walletService.setPortfolioAddress(contractAddress); //
  //   this.walletService.setPortfolioTransactionhash(basketCreationHash);
  //   clearTimeout(this.orderBookRefreshTimer);

  //   this.EthBasketService.tokenauthorization(this.selectedWallet.getPrivateKeyHex(),'none');
  //   setTimeout(() => {
  //     this.EthBasketService.authorize_start(basketID);
  //     // this.showLoader = false;
  //     // this.displayGif = "none";
  //     // this.wizard2 = true;
  //   }, 12000);
  //   // }
  //   // this.zone.run(() => {
  //   //   instructorEvent.stopWatching();
  //   // });
  //   // }
  //   // });
  // }

  private trackTransaction(address, web3Instance, newTokens, data) {
    if (this.orderBookRefreshTimer) clearTimeout(this.orderBookRefreshTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === "0x1") {
          clearTimeout(this.orderBookRefreshTimer);
          ////////console.log('check Array', this.existingToken, newTokens);
          ////////console.log('check', _(this.existingToken).isEqual(newTokens));
          if (_(this.existingToken).isEqual(newTokens) === false) {
            ////////console.log('res', res);
            let track = 0;
            newTokens.map((keys, value) => {
              this.existingToken.map(key => {
                if (keys.address === key.address) {
                  if (parseFloat(keys.value) === parseFloat(key.value)) {
                    //////console.log('called track');
                    track++;
                  }
                }
              });
              if (value === newTokens.length - 1) {
                if (newTokens.length === track) {
                  clearTimeout(this.orderBookRefreshTimer);
                  this.validateAssets(data, newTokens, resss => {
                    if (resss === false) {
                      this.walletService.setPortfolioAddress(res.to);
                      this.portfolioService.setNewTokenValue(newTokens);
                      this.showLoader = false;
                      this.displayGif = "none";
                      this.wizard2 = true;
                      clearTimeout(this.orderBookRefreshTimer);
                      this.zone.run(() => {
                        //////console.log('enabled time travel');
                      });
                    } else {
                      this.portfolioService.closeEditModal();
                      this.zone.run(() => {
                        //////console.log('enabled time travel');
                      });
                    }
                  });
                } else {
                  this.walletService.setPortfolioAddress(res.to);
                  this.portfolioService.setNewTokenValue(newTokens);
                  this.showLoader = false;
                  this.displayGif = "none";
                  this.wizard2 = true;
                  clearTimeout(this.orderBookRefreshTimer);
                  this.zone.run(() => {
                    ////console.log('enabled time travel');
                  });
                }
              }
            });
          } else {
            ////console.log('updated successfully');
            clearTimeout(this.orderBookRefreshTimer);
            this.validateAssets(data, newTokens, resss => {
              if (resss === false) {
                this.walletService.setPortfolioAddress(res.to);
                this.portfolioService.setNewTokenValue(newTokens);
                this.showLoader = false;
                this.displayGif = "none";
                this.wizard2 = true;
                clearTimeout(this.orderBookRefreshTimer);
                this.zone.run(() => {
                  ////console.log('enabled time travel');
                });
              } else {
                this.zone.run(() => {
                  ////console.log('enabled time travel');
                });
              }
            });
          }
        } else if (res.status === "0x0") {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(
            new MessageModel(MessageType.Error, "Transaction failed"),
            MessageContentType.Text
          );
          ////console.log('transaction unsuccessful', res);
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.trackTransaction(address, web3Instance, newTokens, data);
    }, 1000);
  }

  private trackPendindPortfolio(portfolio) {
    let web3Instance = this.web3.getWeb3();
    let trackAsset = 0;
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.contractAddress);
    setTimeout(() => {
      portfolio.tokens.map(key => {
        vsbContract.balanceOfToken(
          this.web3.getWeb3().eth.coinbase,
          key.tokenAddress,
          (err, res) => {
            if (!res) {
              return;
            } else {
              ////console.log('res', res);
              let tokens = this.itemList.filter(
                token =>
                  token.address.toLowerCase() === key.tokenAddress.toLowerCase()
              );
              if (tokens && tokens.length === 1) {
                ////console.log((new BigNumber(res).dividedBy(new BigNumber(10).pow(tokens[0].decimals))).toJSON() !== key.value);
                if (
                  new BigNumber(res)
                    .dividedBy(new BigNumber(10).pow(tokens[0].decimals))
                    .toJSON() !== key.value
                ) {
                  this.zone.run(() => {
                    this.walletService.setPortfolioAddress(
                      portfolio.contractAddress
                    );
                    this.portfolioService.setNewTokenValue(portfolio.tokens);
                    this.showLoader = false;
                    this.wizard1 = false;
                    this.wizard2 = true;
                    clearTimeout(this.orderBookRefreshTimer);
                    ////console.log('tracking portfololio');
                  });
                } else {
                  trackAsset++;
                  this.walletService.setPortfolioAddress(
                    portfolio.contractAddress
                  );
                  if (trackAsset === portfolio.tokens.length) {
                    this.zone.run(() => {
                      ////console.log('go to publish');
                      this.showLoader = false;
                      this.wizard3 = false;
                      this.wizard1 = false;
                      this.wizard4 = true;
                      this.generatepublishChart(portfolio, "pending");
                    });
                  }
                }
              }
            }
          }
        );
      });
    }, 1500);
  }

  private tractPublish(address, web3Instance) {
    if (this.orderBookRefreshTimer) clearTimeout(this.orderBookRefreshTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === "0x1") {
          this.showLoader = false;
          clearTimeout(this.orderBookRefreshTimer);
          this.portfolioService.publishComplete();
          this.walletService.setNewPortfolioTokenWithValue(null);
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Success,
              "Transaction completed Successfully"
            ),
            MessageContentType.Text
          );
          this.zone.run(() => { });
        } else if (res.status === "0x0") {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(
            new MessageModel(MessageType.Error, "Transaction failed"),
            MessageContentType.Text
          );
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.tractPublish(address, web3Instance);
    }, 1000);
  }

  public tractButton() {
    //console.log("tractButton", this.portfolioTokenWithValue);
    let assetLength = this.portfolioTokenWithValue.length;
    let i = 0;
    this.portfolioTokenWithValue.map(key => {
      if (key.status === true) {
        i++;
        if (i === assetLength) {
          clearTimeout(this.despositRefreshTimer);
          this.trackDeposittAndPulish();
        }
      }
    });
  }

  generatepublishChart(portfolio, status) {
    ////console.log('called generatePieChart', portfolio, status);
    if (status === "pending") {
      portfolio["tokens"].map((key, value) => {
        key.message = "";
        this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
          if (result) {
            let temp = {};
            temp["title"] = key["symbol"];
            temp["value"] = key["value"] / result["ETH"];
            this.totalQuanity = this.totalQuanity + parseFloat(key["value"]);
            this.amChartPieData.push(temp);
            this.publishData.push(temp);
            if (value === portfolio["tokens"].length - 1) {
              ////console.log('called', this.amChartPieData);
              this.generatePieChart();
              this.publishData.map((key, value2) => {
                this.chartService.getUSDETHWAND(key.title, (err, res) => {
                  key["alltoken"] = res;
                  this.showdata = true;
                  this.showLoader = false;
                  this.calculateTotal();
                });
              });
            }
          }
        });
      });
    } else {
      ////console.log('else', portfolio);
      let pendingData = portfolio;
      let basket = pendingData.filter(
        basket =>
          basket.contractAddress === this.walletService.getPortfolioAddress()
      );
      ////console.log('basket', basket);
      this.publishData = [];
      this.amChartPieData = [];
      this.totalQuanity = 0;
      portfolio.map((key, value) => {
        key.message = "";
        this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
          if (result) {
            let temp = {};
            temp["title"] = key["symbol"];
            temp["value"] = key["value"] / result["ETH"];
            this.totalQuanity = this.totalQuanity + parseFloat(key["value"]);
            ////console.log('totalQuanity', this.totalQuanity);
            this.publishData.push(temp);
            this.amChartPieData.push(temp);
            if (value === portfolio.length - 1) {
              this.generatePieChart();
              this.publishData.map((key, value2) => {
                this.chartService.getUSDETHWAND(key.title, (err, res) => {
                  if (res) {
                    key["alltoken"] = res;
                    this.calculateTotal();
                  }
                });
              });
            }
          }
        });
      });
    }
  }

  private calculateTotal() {
    this.overallUSD = 0;
    this.overallETH = 0;
    this.publishData = _.uniq(this.publishData, "title");
    this.publishData.map(key => {
      if (key.alltoken["ETH"]) {
        this.overallETH = this.overallETH + key.alltoken["ETH"];
      }
      if (key.alltoken["USD"]) {
        this.overallUSD = this.overallUSD + key.alltoken["USD"];
      }
      this.showdata = true;
      this.showLoader = false;
    });
    this.zone.run(() => { });
  }

  skipIntro() {
    this.createBasket = true;
  }

  // themed basket
  createWithThemedToken(flag) {
    this.selectedItems = [];
    this.portfolio = [];
    if (window.location.hostname === "exchange.wandx.co") {
      if (flag === "exchange") {
        const decentralised_exchange_tokens =
          Constants.Decentralised_exhchange_tokens;
        this.getThemesBasket(decentralised_exchange_tokens);
      } else if (flag === "insurance") {
        const decentralised_supply_chain_tokens =
          Constants.Decentralised_insurance_tokens;
        this.getThemesBasket(decentralised_supply_chain_tokens);
      } else if (flag === "identity") {
        const decentralised_storage_tokens =
          Constants.Decentralised_identity_tokens;
        this.getThemesBasket(decentralised_storage_tokens);
      } else if (flag === "marketcap") {
        const decentralised_storage_tokens =
          Constants.Low_market_cap_ERC20_tokens;
        this.getThemesBasket(decentralised_storage_tokens);
      }
    } else {
      if (flag === "exchange") {
        const decentralised_exchange_tokens =
          Constants.Decentralised_exhchange_tokensApp;
        this.getThemesBasket(decentralised_exchange_tokens);
      } else if (flag === "supplychain") {
        const decentralised_supply_chain_tokens =
          Constants.Decentralised_insurance_tokensApp;
        this.getThemesBasket(decentralised_supply_chain_tokens);
      } else if (flag === "storagetokens") {
        const decentralised_storage_tokens =
          Constants.Decentralised_identity_tokensApp;
        this.getThemesBasket(decentralised_storage_tokens);
      }
    }
  }

  getThemesBasket(themeToken) {
    ////console.log('themeToken', themeToken, this.itemList);
    themeToken.map(key => {
      this.itemList.map(k => {
        if (k.address === key) {
          this.chartService.getUSDETHWAND(k.itemName, (err, result) => {
            if (result) {
              const temp = {};
              temp["address"] = k.address;
              temp["itemName"] = k.itemName;
              temp["id"] = k.itemName;
              this.selectedItems.push(temp);
              this.selectedTokens.push(k.itemName);
              ////console.log('selectedItems token', this.selectedItems);
              this.portfolio.push({
                Symbol: k.itemName,
                CoinName: k.itemName,
                Reqbalance: 0,
                balance: k.balance,
                price: result["ETH"],
                priceUSD: result["USD"],
                decimals: k.decimals
              });
              ////console.log('selectedItems token', this.portfolio);
              this.calculateTotalinquantity();
            }
          });
        }
      });
    });
  }

  requestForTheme(name) {
    this.currentThemeName = name;
    if (this.displayRequest === "none") {
      this.displayRequest = "block";
    } else {
      this.displayRequest = "none";
    }
  }

  createForm() {
    this.form = this.fb.group({
      PortfolioPriceInEth: ["", Validators.required],
      PortfolioMaxPriceInEth: ["", Validators.required]
    });
  }

  onSubmit() {
    const formStatus = this.form.status;
    if (formStatus == "INVALID") {
      return;
    }
    // this.form.setErrors({
    //   passwordInvalid : true
    // })
    const formModel = this.form.value;
    ////console.log('formModel', formModel);
    formModel.name = this.currentThemeName;

    this.portfolioService.requestPortfolio(formModel).then(
      res => {
        if (res) this.displayRequest = "none";
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Submitted Basket themed request."
          ),
          MessageContentType.Text
        );
      },
      err => {
        ////console.log('err', err);
      }
    );
  }

  changeLabelVisibiltity(labelName) {
    let meta = this;
    console.log(meta.data);

    if (meta.data[labelName] != undefined && meta.data[labelName].length > 0) {
      console.log("ch1");

      meta.LabelControl[labelName] = true;
      meta.placeholderControl[labelName] = "";
    } else {
      console.log("ch2");
      meta.LabelControl[labelName] = false;
      meta.placeholderControl[labelName] = "Name your basket";
    }
  }
  changeLabelVisibiltityPrice(labelName) {
    let meta = this;
    console.log(meta.data);

    if (
      meta.data["askingPriceInWand"] !== undefined &&
      meta.data["askingPriceInWand"] !== null
    ) {
      console.log("cha1");

      meta.LabelControl[labelName] = true;
      meta.placeholderControl[labelName] = "";
    } else {
      console.log("cha2");
      meta.LabelControl[labelName] = false;
      meta.placeholderControl[labelName] = "Selling Price in WXETH";
    }
  }
  /////////////////////////////////Function for Trade Modal////////////////////////////////////
  modal(status) {
    //console.log("status", status);
    this.test();
    this.demo = [];
    this.totalamount = [];
    this.total = 0;
    this.bestrate = false;
    this.besttrade = false;
    this.delete_enable = false;
    this.basket_status_choosed = status;
    this.web3
      .getWeb3()
      .eth.getBalance(this.web3.getWeb3().eth.coinbase, (err, balance) => {
        this.Remain_Bal = this.web3.getWeb3().fromWei(balance.toString());
      });
    this.insatantBuyModal = true;
    this.closeInstantbuyModal1();
    //console.log(this.portfolio);
    this.portfolio.map(key => {
      if (key.balance <= 0) {
        //if(key.balance>=0)
        this.totalamount.push(key.Reqbalance);

        this.demo.push({
          symbol: key.Symbol,
          current_price: key.price,
          Reqbalance: key.Reqbalance,
          no_of_token: 0,
          totalprice: 0,
          decimals: key.decimals,
          address: "",
          kyber_address: "",
          kyber_value: "",
          bancor_id: "",
          bancor_value: "",
          uniswap_exchange_address: "",
          uniswap_exchange_artifact: "",
          uniswap_value: "",
          relayer0x_details: "",
          relayer0x_value: "",
          better_exchange: "",
          trade_data: "",
          Bancorcount: 0,
          Kybercount: 0,
          uniswapcount: 0,
          relayer0xcount: 0,
          limit: 0
        });
        this.totalvalue(key.price, key.Symbol);
      }
    });
  }
  /////////////////////////////////Function For close trade modal//////////////////////////////////
  public index: number = 0;
  closeInstantbuyModal() {
    this.insatantBuyModal = false;
    this.traderate = true;
    this.bestrate = false;
  }
  /////////////////////////////////Function For close choosing trade with basket modal//////////////////////////////////
  closeInstantbuyModal1() {
    this.intialModal = false;
    this.traderate = true;
    this.bestrate = false;
  }

  removeByAttr(arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  removetoken(symbol) {
    ////console.log('sym',symbol);
    this.removeByAttr(this.demo, "symbol", symbol);
    this.totalvalue(0, symbol);
    ////console.log('token remove',this.demo);
  }

  /////////////////Function to insert trading api details into array for showing trading details in frontend/////////////////////////////
  checktraderate() {
    ////console.log(this.demo);
    this.submittoken = [];
    this.demo.forEach(data => {
      if (data.bancor_value > 0) {
        this.trade.push({
          symbol: data.symbol,
          trade: "Bancor",
          value: data.bancor_value,
          token_value: data.no_of_token
        });
      }
      if (data.kyber_value > 0) {
        this.trade.push({
          symbol: data.symbol,
          trade: "Kyber",
          value: data.kyber_value,
          token_value: data.no_of_token
        });
      }
      if (data.uniswap_value > 0) {
        this.trade.push({
          symbol: data.symbol,
          trade: "uniswap",
          value: data.uniswap_value,
          token_value: data.no_of_token
        });
      }
      if (data.relayer0x_value > 0) {
        this.trade.push({
          symbol: data.symbol,
          trade: "relayer0x",
          value: data.relayer0x_value,
          token_value: data.no_of_token
        });
      }
      if (
        data.bancor_value <= 0 &&
        data.kyber_value <= 0 &&
        data.uniswap_value <= 0 &&
        data.relayer0x_value <= 0
      ) {
        this.submittoken.push(data.symbol);
        console.log("submittoken", this.submittoken);
      }
    });
  }
  ///////////////////////Function to calculate trade token total price///////////////////////////
  totalvalue(price, symbol) {
    console.log(price, symbol);
    this.total = 0;
    this.demo.forEach((element, i) => {
      //  ////console.log(element,'el1');
      if (element.symbol == symbol) {
        element.no_of_token = this.totalamount[i];
        element.totalprice = this.totalamount[i] * price;
        //this.isTradeValid();
      }
      if (this.demo[i].Reqbalance > this.demo[i].no_of_token) {
        // this.notificationsService.showNotification(
        //   new MessageModel(
        //     MessageType.Error,
        //     "Token quantity is very low for Basket Creation"
        //   ),
        //   MessageContentType.Text
        // );
      }
      // this.total += Number(element);
    });

    this.demo.forEach((element, i) => {
      console.log(element, "el2");
      if (element.totalprice > 0) {
        this.total += Number(element.totalprice);
      }
      //  ////console.log(this.total);
    });

    //  ////console.log(this.total+"getsum")
  }

  /////////////////////////Function to enable or disable create trade button in trade modal //////////////////////
  isTradeValid(): boolean {
    this.tradevalidcount = 0;
    if (this.Remain_Bal < this.total) return false;

    for (var i = 0; i < this.demo.length; i++) {
      if (
        this.demo[i].no_of_token > 0 &&
        this.demo[i].Reqbalance <= this.demo[i].no_of_token
      ) {
        this.tradevalidcount++;
      } else {
        // this.notificationsService.showNotification(
        //   new MessageModel(MessageType.Error, "Token quantity is very low for Basket Creation"),
        //   MessageContentType.Text
        // );
      }
    }

    // ////console.log(this.tradevalidcount,this.demo.length);

    if (this.tradevalidcount != this.demo.length) {
      return false;
    }
    return true;
  }

  refreshBalance() {
    var foo = this;
    if (foo.sell_token.symbol === "ETH") {
      //this.web3.getWeb3().eth.getBalance(this.web3.getWeb3().eth.coinbase,(err,balance)=>{
      foo.web3
        .getWeb3()
        .eth.getBalance(this.web3.getWeb3().eth.coinbase, (err, res) => {
          ////console.log(res);
          foo.sell_token.balance = BigNumbers(res)
            .dividedBy(base.pow(18))
            .toJSON();
          // foo.isDisplayCheckRateButton();
        });
    } else {
      foo.trtokenContract = foo.web3
        .getWeb3()
        .eth.contract(erc20Artifact.contractAbi)
        .at(foo.sell_token.address);
      foo.trtokenContract.balanceOf(
        this.web3.getWeb3().eth.coinbase,
        (err, res) => {
          foo.sell_token.balance = BigNumbers(res)
            .dividedBy(base.pow(foo.sell_token.decimals))
            .toJSON();
          //  foo.isDisplayCheckRateButton();
        }
      );
    }
  }

  // Set the details token to be sold
  setSellToken(index: number) {
    var ea = "ETH";
    //this.sell_token_balance = undefined;
    if (ea !== undefined) {
      this.sell_token.symbol = ea;
      this.sell_token.address = tokensData.ethereumTokens[ea].address;
      this.sell_token.decimals = tokensData.ethereumTokens[ea].decimals;
      this.setInitialValues(index);
      this.refreshBalance();
    }
  }

  // Set the amount of tokens to be sold
  setSellValue(index: number) {
    this.sell_token.value = this.total;
    this.setInitialValues(index);
    // this.isDisplayCheckRateButton();
  }

  // Add details of new token to be bought
  // setBuyToken(e) {
  //   if(e.token !== undefined) {
  //     this.buy_token.symbol = e.token;
  //     this.buy_token.address = tokensData.ethereumTokens[e.token].address;
  //     this.buy_token.decimals = tokensData.ethereumTokens[e.token].decimals;
  //     this.setInitialValues();
  //   //  this.isDisplayCheckRateButton();
  //   }
  // }

  // Set default values of global variables
  setInitialValues(index: number) {
    this.numTokensCheckedBancor = 0;
    this.numTokensCheckedKyber = 0;
    this.demo[index].kyber_address = "0";
    this.sell_token.kyber_address = "0";
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
  // isDisplayCheckRateButton() {
  //   const sell_token = this.sell_token_symbol;
  //   const sell_value = this.sell_token_value;
  //   const buy_token = this.buy_token.symbol;
  //   const balance = this.sell_token_balance;
  //   if(sell_token === '' || sell_token === undefined || balance === undefined || buy_token === '' || buy_token === undefined || sell_value === undefined || sell_value == 0 || isNaN(sell_value) || sell_token === buy_token)
  //     this.isDisplayCheckRate = false;
  //   else if(BigNumbers(sell_value).isGreaterThan(BigNumbers(balance)))
  //     this.isDisplayCheckRate = false;
  //   else
  //     this.isDisplayCheckRate = true;
  // }

  // Check the return offered on the swap by different exchanges

  setbuyvalue() {
    let count = 0;
    this.demo.forEach((buy_token, i) => {
      this.itemList.forEach((data, i) => {
        if (buy_token.symbol == data.itemName) {
          ////console.log('setbuy',buy_token.symbol,data.itemName,data);
          count++;
          buy_token.address = data.address;
          buy_token.decimals = data.decimals;
        }
      });
    });
    if (count == this.demo.length) {
      this.checkBuyVal();
    }
  }

  checkBuyVal() {
    this.counter = 0;
    this.trade = [];
    this.delete_enable = true;
    ////console.log('item',this.itemList);
    ////console.log('demo',this.demo);

    this.demo.forEach((buy_token, i) => {
      this.setSellToken(i);
      this.setSellValue(i);
      // buy_token.address = tokensData.ethereumTokens[buy_token.symbol].address;
      // buy_token.decimals = tokensData.ethereumTokens[buy_token.symbol].decimals;

      this.setInitialValues(i);
      this.refreshBalance();
      //this.isDisplayCheckRateButton();
      // if(!this.isDisplayCheckRate)
      //   return;

      buy_token.bancor_value = "0";
      buy_token.kyber_value = "0";
      buy_token.uniswap_value = "0";
      buy_token.relayer0x_value = "0";
      buy_token.trade_data = null;

      ////console.log(buy_token,this.sell_token);

      //this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Checking exchange rates on Bancor, Kyber, Uniswap and 0x ...'), MessageContentType.Text);
      this.checkBancor(
        this.sell_token.symbol,
        buy_token.current_price * buy_token.no_of_token,
        buy_token.symbol,
        i
      );
      this.checkKyber(
        this.sell_token.symbol,
        buy_token.current_price * buy_token.no_of_token,
        buy_token.symbol,
        i
      );
      this.checkUniswap(
        this.sell_token.address,
        buy_token.no_of_token,
        buy_token.address,
        i
      );
      this.check0xRelayer(this.sell_token, buy_token, i);
      this.showLoader = true;
      this.displayGif1 = "block";

      // this.checktraderate();
      //this.checkUniswap(this.sell_token_address, this.sell_token_value, buy_token.address,i);
      //this.check0xRelayer(this.sell_token,buy_token);
      // this.checkBancor(ea, this.total, e.token);
      // this.checkKyber(ea, this.total, e.token);
      // this.checkUniswap(this.sell_token_address, this.sell_token_value, this.buy_token.address);
      //   this.check0xRelayer(this.sell_token, this.buy_token);
    });
    this.timer = setInterval(() => {
      console.log("counter ", this.counter, 12 * this.demo.length);
      if (this.counter == 12 * this.demo.length) {
        this.checktraderate();
        this.showLoader = false;
        this.displayGif1 = "none";
        this.traderate = false;
        this.bestrate = true;
        this.besttrade = false;
        clearInterval(this.timer);
      }
      //  ////console.log(this.demo);
    }, 1000);
  }

  // Check tokens received on Bancor
  checkBancor(
    sell_token: string,
    sell_value: number,
    buy_token: string,
    index: number
  ) {
    var foo = this;
    var base_url = "https://api.bancor.network/0.1/";
    var currency_url =
      base_url +
      "currencies/tokens?limit=140&skip=0&fromCurrencyCode=ETH&includeTotal=false&orderBy=code&sortOrder=asc";
    // Check if the currencies can be exchnaged on Bancor
    CORS.doCORSRequest(
      { method: "GET", url: currency_url, data: "" },
      function result(status, response) {
        foo.demo[index].limit = foo.demo[index].limit + 1;
        ////console.log('banres',response);
        response = status == 200 ? JSON.parse(response) : response;
        if (status != 200) {
          foo.bancorCheckFail(response, index);
          foo.counter += 3;
          return;
        }
        foo.counter++;
        for (var i = 0; i < response["data"]["page"].length; i++) {
          if (response["data"]["page"][i]["code"] === buy_token)
            foo.demo[index].bancor_id = response["data"]["page"][i]["id"];
          if (response["data"]["page"][i]["code"] === sell_token)
            foo.sell_token.bancor_id = response["data"]["page"][i]["id"];
        }
        // Calculate the new tokens received on selling the given tokens
        var sell_url =
          base_url +
          "currencies/" +
          sell_token +
          "/ticker?fromCurrencyCode=ETH&displayCurrencyCode=ETH";
        CORS.doCORSRequest(
          { method: "GET", url: sell_url, data: "" },
          function result(status, response) {
            foo.demo[index].limit = foo.demo[index].limit + 1;
            ////console.log('bansellres',response);
            response = status == 200 ? JSON.parse(response) : response;
            if (status != 200 || response["errorCode"] != undefined) {
              foo.bancorCheckFail(response, index);
              foo.counter += 2;
              return;
            }
            foo.counter++;
            var sell_rate = response["data"]["price"];
            var buy_url =
              base_url +
              "currencies/" +
              buy_token +
              "/ticker?fromCurrencyCode=ETH&displayCurrencyCode=ETH";
            CORS.doCORSRequest(
              { method: "GET", url: buy_url, data: "" },
              function result(status, response) {
                foo.demo[index].limit = foo.demo[index].limit + 1;
                foo.demo[index].Bancorcount = 1;
                ////console.log('banbuyres',response);
                response = status == 200 ? JSON.parse(response) : response;
                foo.counter++;
                if (
                  status != 200 ||
                  response["errorCode"] != undefined ||
                  foo.demo[index].bancor_id.length == 0
                ) {
                  foo.bancorCheckFail(response, index);
                  return;
                }
                var buy_rate = response["data"]["price"];
                //var quantity = (sell_rate / buy_rate * sell_value* 0.97).toString();
                //var quantity = ((eth_per_token*foo.demo[index].no_of_token)/0.99).toString();
                var quantity = (
                  (buy_rate * foo.demo[index].no_of_token) /
                  0.99
                ).toString();
                //  var quantity = ((buy_rate*foo.demo[index].no_of_token)+0.000000000000003000).toString();
                foo.demo[index].bancor_value = quantity;
                foo.numTokensCheckedBancor++;
                ////console.log('Bancor',foo.demo);
              }
            );
          }
        );
      }
    );
  }

  // Logs the reason for failure while checking transaction on Kyber
  private bancorCheckFail(res: any, index: number) {
    this.demo[index].bancor_value = "0";
    ////console.log('[Error fetching buy rate from Bancor] ', res);
    this.numTokensCheckedBancor++;
    this.bancorFailed = true;
  }

  // Check tokens received on Kyber
  checkKyber(
    sell_token: string,
    sell_value: number,
    buy_token: string,
    index: number
  ) {
    var foo = this;
    var base_url = "https://api.kyber.network/";
    var currency_url = base_url + "currencies/";
    // Check if the currencies can be exchnaged on Kyber
    CORS.doCORSRequest(
      { method: "GET", url: currency_url, data: "" },
      function result(status, response) {
        foo.demo[index].limit = foo.demo[index].limit + 1;
        ////console.log('kyberres',response);
        response = status == 200 ? JSON.parse(response) : response;
        if (status != 200) {
          foo.kyberCheckFail(response, index);
          foo.counter += 3;
          return;
        }
        foo.counter++;
        for (var i = 0; i < response["data"].length; i++) {
          if (response["data"][i]["symbol"] === buy_token)
            foo.demo[index].kyber_address = response["data"][i]["address"];
          if (response["data"][i]["symbol"] === sell_token)
            foo.sell_token.kyber_address = response["data"][i]["address"];
        }
        ////console.log('kyber',foo.demo[index].kyber_address,foo.sell_token);

        // Calculate the new tokens received on selling the given tokens
        var sell_url =
          base_url +
          "sell_rate/?id=" +
          foo.sell_token.kyber_address +
          "&qty=" +
          sell_value;
        CORS.doCORSRequest(
          { method: "GET", url: sell_url, data: "" },
          function result(status, response) {
            foo.demo[index].limit = foo.demo[index].limit + 1;
            ////console.log('kybersellres',response);
            response = status == 200 ? JSON.parse(response) : response;
            if (
              status != 200 ||
              (response["error"] == true && sell_token !== "ETH")
            ) {
              foo.kyberCheckFail(response, index);
              foo.counter += 2;
              return;
            }
            foo.counter++;
            var eth_available =
              sell_token !== "ETH"
                ? response["data"][0]["dst_qty"][0]
                : sell_value;
            var buy_url =
              base_url +
              "buy_rate/?id=" +
              foo.demo[index].kyber_address +
              "&qty=1";
            CORS.doCORSRequest(
              { method: "GET", url: buy_url, data: "" },
              function result(status, response) {
                foo.demo[index].Kybercount = 1;
                foo.demo[index].limit = foo.demo[index].limit + 1;
                ////console.log('kyberbuyres',response);
                response = status == 200 ? JSON.parse(response) : response;
                foo.counter++;
                if (
                  status != 200 ||
                  (response["error"] == true && buy_token !== "ETH")
                ) {
                  foo.kyberCheckFail(response, index);
                  return;
                }
                var eth_per_token = 1;
                if (buy_token !== "ETH")
                  eth_per_token = response["data"][0]["src_qty"][0];
                //var quantity = (eth_available / eth_per_token * 0.97).toString();
                var quantity = (
                  (eth_per_token * foo.demo[index].no_of_token) /
                  0.99
                ).toString();
                //  var quantity = (eth_per_token*foo.demo[index].no_of_token).toString();
                foo.demo[index].kyber_value = quantity;
                foo.numTokensCheckedKyber++;
                ////console.log('kyber',foo.demo);
              }
            );
          }
        );
      }
    );
  }

  // Logs the reason for failure while checking transaction on Kyber
  private kyberCheckFail(res: any, index: number) {
    this.demo[index].kyber_value = "0";
    ////console.log('[Error fetching buy rate from Kyber] ', res);
    this.numTokensCheckedKyber++;
    this.kyberFailed = true;
  }

  // Check tokens received on Uniswap
  checkUniswap(
    sell_token_address: string,
    sell_value: number,
    buy_token_address: string,
    index: number
  ) {
    ////console.log('checkuniswap',sell_token_address,sell_value,buy_token_address,index);

    var foo = this;
    let new_sell_value =
      "0x" +
      BigNumbers(sell_value)
        .multipliedBy(base.pow(foo.demo[index].decimals))
        .toString(16);
    foo.demo[index].uniswap_exchange_artifact = new ExchangeArtifact();
    foo.sell_token.uniswap_exchange_artifact = new ExchangeArtifact();
    foo.demo[index].uniswap_exchange_artifact.contractAbi =
      ExchangeArtifact.contractAbi;
    foo.sell_token.uniswap_exchange_artifact.contractAbi =
      ExchangeArtifact.contractAbi;
    ////console.log('checkuiswap1',foo.demo[index].uniswap_exchange_artifact,foo.sell_token.uniswap_exchange_artifact,foo.demo[index].uniswap_exchange_artifact.contractAbi,foo.sell_token.uniswap_exchange_artifact.contractAbi);

    // If ETH is sold to buy ERC20 tokens
    if (sell_token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      foo.uniswapService
        .getExchangeAddress(buy_token_address)
        .then(function (res) {
          //console.log("uni1", res, foo.sell_token, new_sell_value);
          foo.demo[index].uniswapcount = 1;
          foo.demo[index].uniswap_exchange_artifact.contractAddress = res;
          if (
            res + "0000000000000000000000000000000000000000" ===
            "0x0000000000000000000000000000000000000000"
          ) {
            ////console.log('no exchange exists on Uniswap!');
            foo.uniswapCheckFail("no exchange exists on Uniswap!", index);
            foo.counter += 3;
            return;
          }
          foo.uniswapService
            .tokenToEthValue(
              foo.demo[index].uniswap_exchange_artifact,
              new_sell_value
            )
            .then(function (res) {
              //console.log("uni2", res, foo.sell_token);
              // alert(res.toString())
              foo.counter += 3;
              foo.demo[index].uniswap_value = parseFloat(BigNumbers(res).dividedBy(base.pow(foo.sell_token.decimals)).dividedBy(0.95).toFixed(12));
              // foo.demo[index].uniswap_value = ((BigNumbers(res).multipliedBy(0.97)).dividedBy(base.pow(foo.sell_token.decimals))).toJSON();

              //(((BigNumbers(res)).dividedBy(base.pow(foo.sell_token.decimals))).dividedBy(0.99)).toJSON();
              foo.numTokensCheckedUniswap++;
            });
        });
    }
    // If ERC20 token is sold to buy ETH
    else if (
      buy_token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      foo.uniswapService
        .getExchangeAddress(sell_token_address)
        .then(function (res) {
          ////console.log('uni3',res,foo.sell_token);
          foo.sell_token.uniswap_exchange_artifact.contractAddress = res;
          if (res === "0x0000000000000000000000000000000000000000") {
            foo.uniswapCheckFail("no exchange exists on Uniswap!", index);
            foo.counter += 3;
            return;
          }
          foo.uniswapService
            .tokenToEthValue(
              foo.sell_token.uniswap_exchange_artifact,
              new_sell_value
            )
            .then(function (res) {
              ////console.log('uni4',res,foo.sell_token);
              foo.counter += 3;
              foo.demo[index].uniswap_value = BigNumbers(res)
                .multipliedBy(0.97)
                .dividedBy(base.pow(foo.buy_token.decimals))
                .toJSON();
              foo.numTokensCheckedUniswap++;
            });
        });
    }
    // If ERC20 token is sold to buy ERC20 token
    else {
      foo.uniswapService
        .getExchangeAddress(sell_token_address)
        .then(function (res) {
          ////console.log('uni5',res,foo.sell_token);
          foo.sell_token.uniswap_exchange_artifact.contractAddress = res;
          if (res === "0x0000000000000000000000000000000000000000") {
            foo.uniswapCheckFail("no exchange exists on Uniswap!", index);
            foo.counter += 3;
            return;
          }
          foo.uniswapService
            .getExchangeAddress(buy_token_address)
            .then(function (res) {
              ////console.log('uni6',res,foo.sell_token);
              foo.demo[index].uniswap_exchange_artifact.contractAddress = res;
              if (res === "0x0000000000000000000000000000000000000000") {
                foo.uniswapCheckFail("no exchange exists on Uniswap!", index);
                foo.counter += 3;
                return;
              }
              foo.uniswapService
                .tokenToTokenValues(
                  foo.sell_token.uniswap_exchange_artifact,
                  new_sell_value,
                  foo.demo[index].uniswap_exchange_artifact
                )
                .then(function (res) {
                  ////console.log('uni7',res,foo.sell_token);
                  foo.counter += 3;
                  foo.demo[index].uniswap_value = BigNumbers(res)
                    .multipliedBy(0.97)
                    .dividedBy(base.pow(foo.buy_token.decimals))
                    .toJSON();
                  foo.numTokensCheckedUniswap++;
                });
            });
        });
    }
    ////console.log(foo.demo);
  }

  // Logs the reason for failure while checking transaction on Uniswap
  private uniswapCheckFail(res: any, index: number) {
    this.demo[index].uniswap_value = "0";
    ////console.log('[Error fetching buy rate from Uniswap] ', res);
    this.numTokensCheckedUniswap++;
    this.uniswapFailed = true;
  }

  // Check tokens received on 0x Radar Relayer
  check0xRelayer(sell_token: any, buy_token: any, index: number) {
    var foo = this;
    foo.zrxService.checkRatebsktrd(sell_token, buy_token).then(function (res) {
      //console.log("0xrelayer", res);

      if (res["signedOrder"] === undefined) {
        foo.zrxCheckFail(index);
        foo.counter += 3;
        return;
      }
      foo.counter += 3;
      foo.demo[index].relayer0x_details = res;
      foo.demo[index].relayer0x_value = res["tokens_bought"];
      foo.numTokensChecked0xRelayer++;
    });
  }

  // Logs the reason for failure while checking transaction on 0xRelayer
  private zrxCheckFail(index) {
    this.demo[index].relayer0x_value = "0";
    ////console.log('[Error fetching buy rate from 0xRelayer]');
    this.numTokensChecked0xRelayer++;
    this.zrxRelayerFailed = true;
  }

  submitraderate() {
    ////console.log(this.demo);
    this.submittoken = [];
    this.demo.forEach(data => {
      if (data.better_exchange === "Bancor" && data.trade_data.length > 0) {
        this.submit_trade.push({
          symbol: data.symbol,
          trade: "Bancor",
          value: data.bancor_value,
          token_value: data.no_of_token
        });
      }
      if (data.better_exchange === "Kyber" && data.trade_data.length > 0) {
        this.submit_trade.push({
          symbol: data.symbol,
          trade: "Kyber",
          value: data.kyber_value,
          token_value: data.no_of_token
        });
      }
      if (data.better_exchange === "Uniswap" && data.trade_data.length > 0) {
        this.submit_trade.push({
          symbol: data.symbol,
          trade: "uniswap",
          value: data.uniswap_value,
          token_value: data.no_of_token
        });
      }
      if (data.better_exchange === "0x Relayer" && data.trade_data.length > 0) {
        this.submit_trade.push({
          symbol: data.symbol,
          trade: "relayer0x",
          value: data.relayer0x_value,
          token_value: data.no_of_token
        });
      }
      if (
        (data.better_exchange === "Bancor" ||
          data.better_exchange === "Kyber" ||
          data.better_exchange === "Uniswap" ||
          data.better_exchange === "0x Relayer") &&
        data.trade_data.length === 0
      ) {
        this.submittoken.push(data.symbol);
      }
    });
  }

  // Prepare the trades using the Best Exchanges
  prepTrade() {
    this.delete_enable = true;
    this.submit_trade = [];
    this.account = this.web3.getWeb3().eth.coinbase; //"0x4d43FE6fEa1A3628A926E93e96b9e3301bF5B465";
    //  this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Preparing your trade using the best exchanges...'), MessageContentType.Text);
    this.getBetterExchange();
  }
  completetrade() {
    ////console.log('completetrade');
    this.Tradecounter = 0;
    this.showLoader = true;
    this.displayGif1 = "block";
    this.demo.forEach((buy_token, i) => {
      if (buy_token.better_exchange === "Bancor") this.prepTradeWithBancor(i);
      else if (buy_token.better_exchange === "Kyber")
        this.prepTradeWithKyber(i);
      else if (buy_token.better_exchange === "Uniswap")
        this.prepTradeWithUniswap(i);
      else this.prepTradeWithKyber(i);
    });
    this.timer = setInterval(() => {
      ////console.log("counter ",this.Tradecounter,3*this.demo.length);
      if (this.Tradecounter == 3 * this.demo.length) {
        this.submitraderate();
        this.showLoader = false;
        this.displayGif1 = "none";
        this.besttrade = true;
        this.bestrate = false;
        this.traderate = false;
        ////console.log('completetrade',this.demo);

        clearInterval(this.timer);
      }
      //  ////console.log(this.demo);
    }, 1000);
  }
  // Chose the best exchange based on returns offered by them
  getBetterExchange() {
    ////console.log('getBetterExchange');

    this.demo.forEach((buy_token, i) => {
      let a = Number.MAX_VALUE;
      let temp = parseFloat(buy_token.kyber_value);
      a = temp < a && temp != 0 ? temp : a;

      let b = Number.MAX_VALUE;
      temp = parseFloat(buy_token.bancor_value);
      b = temp < b && temp != 0 ? temp : b;

      let c = Number.MAX_VALUE;
      temp = parseFloat(buy_token.uniswap_value);
      c = temp < c && temp != 0 ? temp : c;

      let d = Number.MAX_VALUE;
      temp = parseFloat(buy_token.relayer0x_value);
      d = temp < d && temp != 0 ? temp : d;

      let minReturn = Math.min(a, b, c, d);

      if (minReturn == parseFloat(buy_token.kyber_value))
        buy_token.better_exchange = "Kyber";
      if (minReturn == parseFloat(buy_token.bancor_value))
        buy_token.better_exchange = "Bancor";
      //*** Currently avoid 0x Relayer, as the transaction is taking too much time to complete ***//
      if (minReturn == parseFloat(buy_token.uniswap_value))
        buy_token.better_exchange = "Uniswap";
      // if (minReturn == parseFloat(buy_token.relayer0x_value))
      //   buy_token.better_exchange = "0x Relayer";
      // else
      //   buy_token.better_exchange = '0x Relayer';
      ////console.log('count',i,this.demo.length);

      if (i === this.demo.length - 1) {
        ////console.log('getbetterExchange',this.demo);
        this.completetrade();
      }
    });
  }

  // Use Bancor to prepare a trade
  prepTradeWithBancor(index) {
    var foo = this;
    //console.log("sellvalue", BigNumbers(foo.demo[index].bancor_value));

    var sell_value = BigNumbers(foo.demo[index].bancor_value).toJSON(); //(BigNumbers(foo.demo[index].bancor_value).multipliedBy(base.pow(foo.sell_token.decimals))).toJSON();
    var minRet = BigNumbers(foo.demo[index].no_of_token).toJSON(); //(BigNumbers(foo.demo[index].no_of_token).multipliedBy(base.pow(foo.demo[index].decimals))).integerValue().toJSON();

    // var trade_url = 'https://api.bancor.network/0.1/currencies/convert/';
    ////console.log('prepTradeWithBancor',sell_value,minRet);

    var trade_url = "https://api.bancor.network/0.1/transactions/convert/";
    var json_body = {
      //'blockchainType': 'ethereum',
      fromCurrencyId: foo.sell_token.bancor_id,
      toCurrencyId: foo.demo[index].bancor_id,
      amount: sell_value,
      minimumReturn: minRet,
      ownerAddress: foo.account,
      format: "json"
    };

    CORS.doCORSRequest(
      { method: "POST", url: trade_url, data: json_body },
      function result(status, response) {
        //console.log("prepTradeWithBancor1", response, json_body);
        response = status == 200 ? JSON.parse(response) : response;
        //console.log(response);

        if (status != 200 || response["errorCode"] != undefined) {
          // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on Bancor; see log.'), MessageContentType.Text);
          foo.Tradecounter += 3;
          ////console.log('prepTradeWithBancor1',response);
          foo.tradesFailed = true;
          foo.startTradePrep = false;
          return;
        }
        //console.log("prepTradeWithBancor2", response);
        let tradedata = [];
        tradedata.push(response.data[0].data.transaction);
        //console.log("tradedata", tradedata);

        foo.demo[index].trade_data = tradedata;
        foo.Tradecounter += 3;
        foo.numTradesPrepared++;
      }
    );
  }

  // Use Kyber to prepare a trade
  prepTradeWithKyber(index) {
    var foo = this;
    foo.demo[index].trade_data = [];
    //let kybervalue=0.001781111577792972;
    var trade_url =
      "https://api.kyber.network/trade_data/?user_address=" +
      foo.account +
      "&src_id=" +
      foo.sell_token.kyber_address +
      "&dst_id=" +
      foo.demo[index].kyber_address +
      "&src_qty=" +
      foo.demo[index].kyber_value +
      "&min_dst_qty=" +
      foo.demo[index].no_of_token +
      "&gas_price=medium"; //foo.demo[index].kyber_value
    CORS.doCORSRequest({ method: "GET", url: trade_url, data: "" }, function (
      status,
      response
    ) {
      response = status == 200 ? JSON.parse(response) : response;
      if (status != 200 || response["error"] == true) {
        // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to get trade data on Kyber; see log.'), MessageContentType.Text);
        ////console.log('prepTradeWithKyber1',response);
        foo.Tradecounter += 3;
        foo.tradesFailed = true;
        foo.startTradePrep = false;

        return;
      }
      ////console.log('prepTradeWithKyber2',response);
      foo.demo[index].trade_data.push(response["data"][0]);
      foo.Tradecounter += 3;
      if (
        foo.sell_token.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ) {
        ////console.log('prepTradeWithKyber3',response);
        const sell_value =
          "0x" +
          BigNumbers(foo.demo[index].kyber_value)
            .multipliedBy(base.pow(foo.sell_token.decimals))
            .toString(16);
        const data = foo.web3Instance.eth
          .contract(erc20Artifact.contractAbi)
          .at(foo.sell_token.address)
          .approve.getData(response["data"][0]["to"], sell_value);
        var transaction = {
          from: foo.account,
          to: foo.sell_token.address,
          data: data,
          value: 0,
          gasPrice: "0x" + (10 * Math.pow(10, 9)).toString(16),
          gasLimit: 200000
        };
        foo.demo[index].trade_data.push(transaction);
        foo.demo[index].trade_data.reverse();
        foo.Tradecounter += 3;
      }
      foo.numTradesPrepared++;
    });
  }

  // Prepare trade using Uniswap
  prepTradeWithUniswap(index) {
    var foo = this;
    let sell_value =
      "0x" +
      BigNumbers(foo.demo[index].uniswap_value)
        .multipliedBy(base.pow(foo.sell_token.decimals))
        .toString(16);
    let buy_value =
      "0x" +
      BigNumbers(foo.demo[index].no_of_token)
        .multipliedBy(base.pow(foo.demo[index].decimals))
        .toString(16);
    foo.demo[index].trade_data = [];
    if (
      foo.sell_token.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      foo.uniswapService
        .getApproval(
          foo.sell_token.address,
          foo.sell_token.uniswap_exchange_artifact.contractAddress,
          sell_value
        )
        .then(function (res) {
          if (res == false) {
            // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on Uniswap; see log.'), MessageContentType.Text);
            ////console.log('Unable to fetch spending limit of tokens!');
            foo.Tradecounter += 3;
            foo.tradesFailed = true;
            foo.startTradePrep = false;
            return;
          }
          if (res != true)
            //console.log("prepTradeWithUniswap1", res);
            foo.demo[index].trade_data.push(res);
          foo.Tradecounter += 3;
          if (
            foo.demo[index].address !==
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ) {
            foo.uniswapService
              .confirmTokenToToken(
                buy_value,
                sell_value,
                foo.sell_token.uniswap_exchange_artifact,
                foo.demo[index].address
              )
              .then(function (res) {
                //console.log("prepTradeWithUniswap2", res);
                foo.demo[index].trade_data.push(res);
                foo.Tradecounter += 3;
                foo.numTradesPrepared++;
              });
          } else {
            foo.uniswapService
              .confirmTokenToEth(
                buy_value,
                sell_value,
                foo.sell_token.uniswap_exchange_artifact
              )
              .then(function (res) {
                //console.log("prepTradeWithUniswap3", res);
                foo.demo[index].trade_data.push(res);
                foo.Tradecounter += 3;
                foo.numTradesPrepared++;
              });
          }
        });
    } else {
      foo.uniswapService
        .confirmEthToToken(
          buy_value,
          sell_value,
          foo.demo[index].uniswap_exchange_artifact
        )
        .then(function (res) {
          //console.log("prepTradeWithUniswap3", res);
          foo.demo[index].trade_data.push(res);
          foo.Tradecounter += 3;
          foo.numTradesPrepared++;
        });
    }
  }

  // Prepare trade using 0x Relayer
  prepTradeWith0x(index) {
    var foo = this;
    let sell_value =
      "0x" +
      BigNumbers(foo.demo[index].relayer0x_value)
        .multipliedBy(base.pow(foo.sell_token.decimals))
        .toString(16);
    //let buy_value = '0x' + (BigNumbers(foo.buy_token.uniswap_value).multipliedBy(base.pow(foo.buy_token.decimals))).toString(16);
    foo.demo[index].trade_data = [];
    // Generate transaction for spending tokens
    let sell_token_address =
      foo.sell_token.symbol === "ETH"
        ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        : foo.sell_token.address;
    let account = "0x58d39Db9175211D70914220213823079D4A7D4e5";
    foo.zrxService
      .getApproval(foo.account, sell_token_address, sell_value)
      .then(async function (res) {
        if (res == false) {
          //  foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Unable to prepare trade on 0x Relayer; see log.'), MessageContentType.Text);
          ////console.log('Unable to fetch spending limit of tokens!');
          ////console.log('prepTradeWith0x1');
          foo.tradesFailed = true;
          foo.startTradePrep = false;
          foo.Tradecounter += 3;
          return;
        }
        if (res != true)
          ////console.log('prepTradeWith0x2',res);
          foo.demo[index].trade_data.push(res);
        foo.Tradecounter += 1;
        if (foo.sell_token.symbol === "ETH") {
          ////console.log('prepTradeWith0x3');
          let res = await foo.zrxService.ethToWeth(foo.account, sell_value);
          foo.demo[index].trade_data.push(res);
          foo.Tradecounter += 2;
        }
        foo.numTradesPrepared++;
      });
  }
  public tradecount: any;
  // Confirm the transactions being made
  confirm() {
    var foo = this;
    foo.txverified = 0;
    foo.tradecount = 0;
    foo.serialized_data = [];
    this.portfolio_nonce = 0;
    let web3Instance = this.web3.getWeb3();
    this.demo.forEach((buy_token, i) => {
      // //console.log('buy_token',buy_token.trade_data.length,buy_token)
      if (buy_token.trade_data.length > 0) {
        foo.tradecount++;
      }
    });
    // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Processing your transaction...'), MessageContentType.Text);
    web3Instance.eth.getTransactionCount(foo.account, (err, res) => {
      ////console.log('count',res);

      if (err !== null) {
        //    foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Error in confirm; see log.'), MessageContentType.Text);
        ////console.log(err);
      }
      //console.log(this.demo);

      this.demo.forEach((buy_token, i) => {
        if (buy_token.trade_data.length > 0) {
          const nonce = res + i;
          if (buy_token.better_exchange !== "0x Relayer") {
            foo.confirmBancorKyberUniswap(nonce, i, buy_token.better_exchange);
          } else {
            foo.confirm0xRelayer(nonce, i);
          }
        }
      });
    });
  }
  // If trading on Bancor, Kyber or Uniswap, confirm the transaction
  confirmBancorKyberUniswap(nonce, index, better_exchange) {
    //console.log("confirmBancorKyberUniswap"); //,nonce,index,better_exchange,foo.demo[index].trade_data[0]);
    var foo = this;
    // var txverified;
    var privateKey = foo.selectedWallet.getPrivateKeyHex();
    // //console.log("PK: ", privateKey)
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    foo.portfolio_nonce = nonce;
    var transaction;
    if (better_exchange != "Bancor") {
      transaction = {
        from: foo.demo[index].trade_data[0]["from"],
        to: foo.demo[index].trade_data[0]["to"],
        data: foo.demo[index].trade_data[0]["data"],
        value: foo.demo[index].trade_data[0]["value"],
        gasPrice: foo.demo[index].trade_data[0]["gasPrice"],
        nonce: nonce,
        gasLimit: foo.demo[index].trade_data[0]["gasLimit"]
      };
    } else {
      transaction = {
        from: foo.demo[index].trade_data[0]["from"],
        to: foo.demo[index].trade_data[0]["to"],
        data: foo.demo[index].trade_data[0]["data"],
        value: foo.demo[index].trade_data[0]["value"],
        gasPrice: foo.demo[index].trade_data[0]["gasPrice"],
        nonce: nonce,
        gasLimit: foo.demo[index].trade_data[0]["gas"]
      };
    }
    //console.log("transaction", transaction);
    nonce = nonce + 1;
    const tx = new Tx(transaction);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    let sign = {
      sellToken: "ETH",
      buyToken: foo.demo[index].symbol,
      sign: "0x" + serializedTx.toString("hex"),
      status: "unsent",
      hash: ""
    };
    this.serialized_data.push(sign);
    if (this.tradecount == this.serialized_data.length) {
      this.test();
      //console.log("Now trading!", this.tradecount, this.serialized_data.length);
      this.showLoader = true;
      this.displayGif = "block";
      return new Promise((resolve, reject) => {
        let obj = {
          userAddress: this.userService.getCurrentUser().UserAccount,
          basketID: 0,
          tokens: this.serialized_data
        };
        //console.log("obj", obj);
        if (this.basket_status_choosed == 1) {
          this.displayGif = "none";
          // foo.closeInstantbuyModal();
          obj.basketID = this.finalbasket_id;
          this.createPortfolio(this.portfolio_data);
        }
        else {
          obj.basketID = -1;
        }
        console.log(obj);
        this.http.post(Constants.ethBasketUrl + "addTrade", obj).subscribe(
          res => {
            foo.closeInstantbuyModal();
            this.displayGif = "none";
            resolve(res);
          },
          err => {
            this.displayGif = "none";
            resolve(err);
          }
        );
      });
    }
  }

  // If trading on 0x Relayer, confirm the transaction
  confirm0xRelayer(nonce, index) {
    var foo = this,
      txCount = 0,
      txVerified = 0,
      txFailed = false,
      fillOrder = 0;
    var privateKey = foo.selectedWallet.getPrivateKeyHex();
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    for (var i = 0; i < foo.buy_token.trade_data.length; i++) {
      txCount = i + 1;
      var transaction = {
        from: foo.buy_token.trade_data[i]["from"],
        to: foo.buy_token.trade_data[i]["to"],
        data: foo.buy_token.trade_data[i]["data"],
        value: foo.buy_token.trade_data[i]["value"],
        gasPrice: foo.buy_token.trade_data[i]["gasPrice"],
        nonce: nonce,
        gasLimit: foo.buy_token.trade_data[i]["gasLimit"]
      };
      nonce = nonce + 1;
      const tx = new Tx(transaction);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      foo.web3Instance.eth.sendRawTransaction(
        "0x" + serializedTx.toString("hex"),
        async (err, res) => {
          //  foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
          foo.txnHashes.push(res);
        }
      );
    }
    var interval1 = setInterval(function () {
      if (txFailed || (fillOrder == 2 && txVerified == foo.txnHashes.length))
        clearInterval(interval1);
      if (txVerified >= foo.txnHashes.length) return;
      foo.web3Instance.eth.getTransactionReceipt(
        foo.txnHashes[txVerified],
        (err, res) => {
          if (res) {
            if (res.status === "0x1") {
              //     foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + (txVerified + 1) + ' complete!'), MessageContentType.Text);
              txVerified++;
            } else if (res.status === "0x0") {
              //     foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction ' + (txVerified + 1) + ' failed; see log.'), MessageContentType.Text);
              ////console.log(res);
              txFailed = true;
            }
          }
        }
      );
    }, 10000);
    var interval2 = setInterval(async function () {
      if (txVerified < foo.buy_token.trade_data.length) return;
      clearInterval(interval2);
      if (txFailed) return;
      const txHash = <string>(
        await foo.zrxService.fillOrder(
          foo.account,
          foo.sell_token.value,
          foo.sell_token.decimals,
          foo.buy_token.relayer0x_details["signedOrder"],
          nonce
        )
      );
      txCount = txCount + 1;
      if (txHash === "Error") {
        // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction ' + txCount + ' failed; see log.'), MessageContentType.Text);
        txFailed = true;
        return;
      }
      //  foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
      foo.txnHashes.push(txHash);
      if (foo.buy_token.symbol === "ETH") {
        txCount = txCount + 1;
        let buy_value =
          "0x" +
          BigNumbers(foo.buy_token.uniswap_value)
            .multipliedBy(base.pow(foo.buy_token.decimals))
            .toString(16);
        var transaction = await foo.zrxService.wethToEth(
          foo.account,
          buy_value
        );
        transaction["nonce"] = nonce + 2;
        const tx = new Tx(transaction);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        foo.web3Instance.eth.sendRawTransaction(
          "0x" + serializedTx.toString("hex"),
          async (err, res) => {
            // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction ' + txCount + ' submitted to blockchain'), MessageContentType.Text);
            foo.txnHashes.push(res);
          }
        );
      }
      fillOrder = 2;
    }, 10000);
  }
}
