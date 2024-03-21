import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
//import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
import { Constants } from '../../models/constants';
import { MessageContentType, MessageModel, MessageType } from '../../models/message.model';
import { ChartService } from '../../services/chart.service';
import { NotificationManagerService } from '../../services/notification-manager.service';
//import { PortfolioService } from '../../services/portfolio.service';
import { AssetAnalysis } from '../../models/asset.model';
import { UserRegistrationResponse } from '../../models/user-registration.model';
import { AionWeb3Service } from '../../services/aion-web3.service';
//import { TokenService } from '../../services/token.service';
import { SellablePortfolio } from '../../models/portfolio.model';
import { Headers, Http, RequestOptions } from '@angular/http';
import { SwitchThemeService } from '../../services/switch-theme.service';
import { Subscription } from 'rxjs/Subscription';
//import { WalletService } from '../../services/wallet.service';
import * as _ from 'underscore';
import { BigNumber } from 'bignumber.js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { UserAionService } from '../../services/user-aion.service';
import { PortfolioAionService } from '../../services/portfolio-aion.service';
import { TokenAionService } from '../../services/token-aion.service';
import { WalletAionService } from '../../services/wallet-aion.service';
// import{JSONAionWallet,AionWalletHelper} from '../wallets/jsonwallet_aion';
//import { Web3Service } from '../../services/web3.service';
declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}
@Component({
  selector: 'app-basket-newaion',
  templateUrl: './basket-newaion.component.html',
  styleUrls: ['./basket-newaion.component.css']
})

export class BasketNewaionComponent implements OnInit {
  ccadd: any
  aionWalletHelper: any
  assetAnalysisResult: AssetAnalysis = new AssetAnalysis();
  portfolio: Array<any> = new Array();
  showAnalysisLoader: boolean = false;
  showDropdownLoader: boolean = false;
  showLoader: boolean = false;
  portfolioName: string = '';
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
  public block: any;
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
  private selectedTokens: Array<string> = new Array();
  private assetAnalysisDone: boolean = false;
  private askingPriceInWand: number;
  private creationPriceInWand: number;
  private currentSellablePortfolios: Array<SellablePortfolio> = new Array<SellablePortfolio>();
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
  public displayGif = 'none';
  public displayRequest = 'none';
  public showChart = false;
  public tokenContract: any;
  public validateAllowance: any;
  public error: any;
  public totalprice = 0;
  public totalDepositPrice = 0;
  public createBasket: boolean = false;
  public form: FormGroup;

  constructor(private http: Http,
    private web3: AionWeb3Service,
    private zone: NgZone,
    private chartService: ChartService,
    private portfolioService: PortfolioAionService,
    readonly switchThemeService: SwitchThemeService,
    private router: Router,
    private notificationsService: NotificationManagerService,
    private tokenService: TokenAionService,
    private walletService: WalletAionService,
    private userService: UserAionService,
    private fb: FormBuilder,
    private savedWalletsService: SavedWalletsService,
    private AmCharts: AmChartsService,
    //private web3service: Web3Service
    ) {
    // this.aionWalletHelper = new AionWalletHelper(this.web3service,this.web3);
    console.log("publish data", this.publishData);
    //console.log('Portfolio create component');

    if (!this.tokenService.getToken() || this.tokenService.getToken().Jwt.length === 0)
      this.tokenService.fetchToken();
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
    this.createComponentInit = this.createComponentInit.bind(this);
    this.tokenSubscription = this.tokenService.token$.subscribe(data => this.tokenDataChange(data));
    this.editPortfolio = this.portfolioService.updatePortfolioData$.subscribe(data => this.updatePortfolio(data));
    this.walletTokenSubscription = this.walletService.tokenContractChange$.subscribe(data => this.tokenContractChange(data));
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(data => this.handleUserAccountSummaryChange(data));
    this.despositToken = this.portfolioService.depositToken$.subscribe(data => this.deposit(data));
    this.amChartPieOptions = {
      'type': 'pie',
      'theme': 'light',
      'dataProvider': [],
      'titleField': 'title',
      'valueField': 'value',
      'labelRadius': 0,
      'responsive': true,
      'color': 'white',
      'balloon': {
        'fixedPosition': true
      },
      'innerRadius': '60%',
      autoMargins: false,
      marginTop: 0,
      marginBottom: 10,
      marginLeft: 0,
      marginRight: 0,
      pullOutRadius: 0,
    };
    (async () => {
      await this.web3.getWeb3().eth.getBlockNumber((err, res) => {
        if (res) {
          // console.log('block', res);
          this.curentBlock = (parseInt(res) + 50000);
        }
      });
    })();
    if (this.updatePorfolioFlag === false && this.pendingPorfolioFlag === false) {
      this.wizard1 = true;
    }
    this.getAskingPriceIn('WXETH');
    this.showChart = false;
  }

  createComponentInit() {
    this.selectedItems = [];
    this.itemList = [];
    this.portfolio = [];
    this.selectedTokens = [];
    this.getPlatformTokens();
    this.wizard3 = false;
    this.walletService.fetchAccountSummary();
    this.settings = {
      singleSelection: false,
      text: 'Select Token',
      enableSearchFilter: false,
      enableCheckAll: false
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
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.createComponentInit();

      }
    });
    this.createComponentInit();
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

    //console.log('called destroy');
    this.wizard2 = false;
    this.wizard1 = false;
    this.wizard3 = false;
  }

  handleUserAccountSummaryChange(data) {
    if (data === undefined)
      return;
    this.userAccountSummary = data.Balances;
    //console.log('aaaaa', this.userAccountSummary);
  }

  addOrRemoveCoin(symbol: string, coinName: string, balance, decimals) {
    var symbolIndex = this.selectedTokens.indexOf(symbol);
    if (symbolIndex === -1) {
      this.chartService.getUSDETHWAND(symbol, (err, result) => {
        //   console.log('result', result);
        this.portfolio.push({
          Symbol: symbol,
          CoinName: coinName,
          Reqbalance: 0,
          balance: balance,
          price: result['AION'],
          priceUSD: result['USD'],
          decimals: decimals
        });
        this.calculateTotalinquantity();
      });
      this.selectedTokens.push(symbol);
    } else {
      this.selectedTokens.splice(symbolIndex, 1);
      var portfolioIndex = -1;
      for (let i: number = 0; i < this.portfolio.length; i++) {
        if (this.portfolio[i].Symbol === symbol) {
          portfolioIndex = i;
          break;
        }
      }
      if (portfolioIndex !== -1)
        this.portfolio.splice(portfolioIndex, 1);

      this.generatePieChartAtCreatePortFolio();
      this.calculateTotalinquantity();
    }
  }

  calculateTotalinquantity() {
    this.totalprice = 0;
    // console.log(portfolio)
    this.portfolio.map((key) => {
      this.totalprice = this.totalprice + (key.price * key.Reqbalance);
    });
  }

  isPortfolioValid(): boolean {
    // if (this.data['portfolioName'] === null || this.error === undefined || this.error !== '' || this.error === null || this.data['portfolioName'] === undefined || this.validateAllowance === null || this.validateAllowance === undefined || this.validateAllowance === false || this.data['portfolioName'].length === 0 || this.data['askingPriceInWand'] === undefined || this.data['askingPriceInWand'] === null || this.data['askingPriceInWand'] === 0)
    //   return false;
    // for (var i = 0; i < this.portfolio.length; i++) {
    //   if (this.portfolio[i].Reqbalance <= 0 || this.portfolio[i].balance === '0')
    //     return false;
    // }
    return true;
  }

  enablePublish(): boolean {
    return this.isPortfolioValid() && this.askingPriceInWand > 0 && this.assetAnalysisDone;
  }

  getAvailableTokens() {
    var returnData = new Array<any>();
    var allAvailableContracts = this.walletService.getContracts();
    if (allAvailableContracts === undefined)
      return returnData;
    for (var i = 0; i < allAvailableContracts.length; i++) {
      if (allAvailableContracts[i].isTokenContract && allAvailableContracts[i].symbol !== 'WXETH') {
        returnData.push(allAvailableContracts[i]);
      }
    }
    return returnData;
  }

  analyzePortfolio() {
    if (!this.isPortfolioValid())
      return;

    // console.log('USD', this.usd);
    this.assetAnalysisDone = false;
    this.showAnalysisLoader = true;
    this.totalETH = 0;
    this.totalQuanity = 0;
    this.totalUSD = 0;
    this.totalWAND = 0;
    let assetAnalysisInput = [];
    for (var i = 0; i < this.portfolio.length; i++) {
      assetAnalysisInput.push({ 'Symbol': this.portfolio[i].Symbol, 'Amount': this.portfolio[i].Reqbalance });
    }
    let headers = new Headers({
      'content-type': 'application/json',
      // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http.post(Constants.ServiceURLAION + 'portfolio/analyze', assetAnalysisInput, requestOptions).subscribe(
      data => {
        this.assetAnalysisResult = data.json();
        // console.log('data', this.assetAnalysisResult);
        this.amChartPieData = [];
        this.assetAnalysisResult.assets.map((key) => {
          let temp = {};
          this.totalQuanity = this.totalQuanity + key['reqbalance'];
          this.totalETH = this.totalETH + key['summary'].AION;
          this.totalUSD = this.totalETH + key['summary'].USD;
          this.totalWAND = this.totalETH + key['summary'].WAND;
          // console.log('total', this.totalQuanity, this.totalETH, this.totalUSD, this.totalWAND);
          temp['title'] = key['coin'];
          temp['value'] = key['reqbalance'];
          this.amChartPieData.push(temp);
          if (this.amChartPieData.length === this.assetAnalysisResult.assets.length) {
            this.generatePieChart();
          }
        });
        this.showAnalysisLoader = false;
        this.assetAnalysisDone = true;
        this.askingPriceInWand = parseFloat(this.assetAnalysisResult.overall.ETH.toFixed(6));
        this.creationPriceInWand = parseFloat(this.assetAnalysisResult.overall.ETH.toFixed(6));
      },
      err => {
        //  console.log(err);
        this.showAnalysisLoader = false;
      }
    );
  }

  // publishPortfolio() {
  //   this.portfolioService.publishPortfolio(this.portfolioName, this.askingPriceInWand, this.creationPriceInWand, this.portfolio);
  //   this.router.navigateByUrl('/portfolio/sell');
  // }

  signAndPublishPortfolio() {
    this.portfolioService.signAndPublishPortfolio(this.portfolioName, this.askingPriceInWand, this.creationPriceInWand, this.portfolio, this.assetAnalysisResult);
    this.router.navigateByUrl('/portfolio/sell');
  }

  // getPlatformTokens() {
  //   // let headers = new Headers({
  //   //   'content-type': 'application/json',
  //   //   'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
  //   //   'Token': this.tokenService.getToken().Jwt
  //   // });
  //   // let requestOptions = new RequestOptions({headers: headers});
  //   // this.http.get(Constants.ServiceURL + 'PlatformToken', requestOptions).subscribe(
  //   //   data => {
  //   //     this.showAnalysisLoader = true;
  //   //     var tokens = data.json();
  //   //     //var tokens = Constants.platfromToken;
  //   //     console.log('tokes', data.json());
  //   //     let itemLists = [];
  //   //     for (var i = 0; i < tokens.length; i++) {
  //   //       if (tokens[i].symbol !== 'WXETH') {
  //   //         let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
  //   //         let toeknContract = tokenEth.at(tokens[i].address);
  //   //         let _data = tokens[i];
  //   //         toeknContract.balanceOf(this.web3.getWeb3().eth.coinbase, (err, res) => {
  //   //           if (res) {
  //   //             this.zone.run(() => {
  //   //               itemLists.push({
  //   //                 'id': _data.symbol,
  //   //                 'itemName': _data.symbol,
  //   //                 'address': _data.address,
  //   //                 'contract': tokenEth,
  //   //                 'balance': (new BigNumber(res).dividedBy(new BigNumber(10).pow(_data.decimals))).toJSON(),
  //   //                 'decimals': _data.decimals
  //   //               });
  //   //               this.itemList = _.sortBy(_.uniq(itemLists, 'address'), 'itemName');
  //   //             });
  //   //           }
  //   //         });
  //   //       }
  //   //     }
  //   //   });
  //   var self=this;

  //   let itemLists = [];
  //   let web3Instance=this.web3.getWeb3();
  //   // let address = ['0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b'];
  //   // let symbol =['WAND','ZRX'];
  //   // let address =['0xa091e20594ab76252649e4e5e848cb40a5d0cb21ad05e8945a392e17c3fcd057','0xa0e71480dc375887dc9b7d0f7218dad7d1586552f4e2ff2648182f4573a329cc','0xa0a905ad1dbfcff5cf88fb791e71cc167c3b9b49a748f02874fdb0ec69a38bd0','0xa0d591c3eca48957888bc7711499caa71a7a88d4bff8f489faa2133a08ecc8d2','0xa073512a09cfdcb6f747044e9e17772aa24c9b213dfe8e598582353ded01ece1','0xa0bf82c9042e3d87a089515afadeacf0b3f10c604289d515571ba9eb1a3890dd'];
  //   let address=[Constants.wandTokenAddress,Constants.ZRXTokenaddress,Constants.GNTTokenaddress,Constants.powrTokenAddress,Constants.sandTokenaddress,Constants.QTUMTokenaddress]
  //   let symbol =['WAND','ZRX','GNT','POWR','SAND','QTUM'];
  // //  console.log(symbol[0])
  //   for (var i = 0; i < symbol.length; i++) {
  //     if (symbol[i] !== 'ETHER') {
  //       let toeknContract = new web3Instance.eth.Contract(Constants.EtherTokenAbi,address[i], {
  //         // from: this.account,
  //         gasLimit: 3000000,
  //       })
  //       let _symbol=symbol[i];
  //       let _address=address[i];
  //       toeknContract.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (err, res) {
  //         if (err) {
  //           self.zone.run(() => {
  //             itemLists.push({
  //               'id': _symbol,
  //               'itemName':_symbol ,
  //               'address': _address,
  //               'contract': Constants.EtherTokenAbi,
  //               'balance':err/1000000000000000000
  //             });
  //             self.itemList = _.sortBy(_.uniq(itemLists, 'address'), 'itemName');
  //           });
  //         }
  //       });
  //     }
  //   }
  //  // console.log("total data ",itemLists)
  // }


  getPlatformTokens() {
    let headers = new Headers({
      'content-type': 'application/json',
      // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let web3Instance = this.web3.getWeb3();

    let requestOptions = new RequestOptions({ headers: headers });
    this.http.get(Constants.ServiceURLAION + 'PlatformToken', requestOptions).subscribe(
      data => {
        this.showAnalysisLoader = true;
        var tokens = data.json();
        console.log('tokens', tokens);

        let itemLists = [];

        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].symbol !== 'WXAION' && tokens[i].symbol !== 'AION') {
            let toeknContract = new web3Instance.eth.Contract(Constants.EtherTokenAbi, tokens[i].address);
            let _data = tokens[i];
            toeknContract.methods.balanceOf(sessionStorage.getItem('walletAddress')).call().then((res) => {
              if (res) {
                this.zone.run(() => {
                  itemLists.push({
                    'id': _data.symbol,
                    'itemName': _data.symbol,
                    'address': _data.address,
                    'contract': toeknContract,
                    'balance': (new BigNumber(res).dividedBy(new BigNumber(10).pow(_data.decimals))).toJSON(),
                    'decimals': _data.decimals
                  });
                  this.itemList = _.sortBy(_.uniq(itemLists, 'address'), 'itemName');
                });
              }
            });
          }
        }
      });
  }

  tokenContractChange(data: any) {
    let itemLists = [];
    let webInstance = this.web3.getWeb3();
    // console.log('token contract', data);
    this.tokenContract = data;
    if (data === undefined)
      return;
    // for (var i = 0; i < data.length; i++) {
    //   if (data[i].isTokenContract && data[i].symbol !== 'WXETH') {
    //     let tokenEth = webInstance.eth.contract(JSON.parse(data[i].abi));
    //     let toeknContract = tokenEth.at(data[i].address);
    //     let _data = data[i];
    //     toeknContract.balanceOf(webInstance.eth.coinbase, (err, res) => {
    //       if (res) {itemLists.push({'id': _data.symbol, 'itemName': _data.symbol, 'address': _data.address, 'contract': tokenEth, 'balance': (new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON()});
    //           console.log(_.uniq(itemLists, 'address'));
    //           this.itemList = _.uniq(itemLists, 'address');
    //         }
    //     });
    //   }
    // }
  }

  tokenDataChange(data: any) {
    if (data !== undefined && data !== null) {
      if (!data.Jwt || data.Jwt.length === 0) {
        //  console.log('portfolio create component token error');
        this.router.navigateByUrl('/');
        return;
      }
      this.getPlatformTokens();
    }
  }

  userRegistrationStatusChange(data: UserRegistrationResponse) {
    if (data !== undefined && data !== null) {
      if (!data.UserEmailVerified) {
        //   console.log('portfolio create component token error');
        this.router.navigateByUrl('/');
        return;
      }
      this.walletService.fetchContracts();
      this.currentSellablePortfolios = this.portfolioService.currentSellablePortfolios();
      for (var i = 0; i < this.currentSellablePortfolios.length; i++) {
        for (var j = 0; j < this.currentSellablePortfolios[i].Assets.length; j++) {
          if (this.usedTokens[this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()] !== undefined) {
            this.usedTokens[this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()] = this.usedTokens[this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()] + this.currentSellablePortfolios[i].Assets[j].Reqbalance;
          }
          else {
            this.usedTokens[this.currentSellablePortfolios[i].Assets[j].Symbol.toUpperCase()] = this.currentSellablePortfolios[i].Assets[j].Reqbalance;
          }
        }
      }
    }
  }
  public count: any = "0";
  public count1: any;
  OnItemSelect($event) {
    this.showDropdownLoader = true;
    this.addOrRemoveCoin($event.id, $event.itemName, $event.balance, $event.decimals);
    var a = ++this.count;
    // console.log(a);
    this.count1 = a;
    sessionStorage.setItem('tokenlength', this.count1);
  }

  OnItemDeSelect($event) {
    //  console.log($event);
    this.addOrRemoveCoin($event.id, $event.itemName, $event.balance, $event.decimals);
    var b = --this.count;
    this.count1 = b;
    //console.log(b);
    sessionStorage.setItem('tokenlength', this.count1);
  }

  trackWithTokenBalance(requireBalance, balance) {
    if (parseFloat(balance) === 0) {
      this.zone.run(() => {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance of this Token on your Wallet address to create a Token Basket'), MessageContentType.Text);
        return;
      });
    } else if (parseFloat(requireBalance) > parseFloat(balance)) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to create this Basket'), MessageContentType.Text);
      return;
    } else {
      if (this.portfolio.length > 0) {
        let chartData = [];
        this.portfolio.map((key) => {
          let temp = {};
          temp['title'] = key['Symbol'];
          temp['value'] = key['Reqbalance'] / key['price'];
          chartData.push(temp);
          this.generatePieChartAtCreatePortFolio();
          this.calculateTotalinquantity();
        });
      }
    }
  }

  generatePieChart() {
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart('piechartdiv', this.amChartPieOptions);
      //console.log(this.amChartPie);
      this.AmCharts.updateChart(this.amChartPie, () => {
        this.amChartPie.dataProvider = _.uniq(this.amChartPieData, 'title');

      });
    }, 500);
  }

  generatePieChartAtCreatePortFolio() {
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart('piechartdiv1', this.amChartPieOptions);
      let chartData = [];
      this.portfolio.map((key) => {
        if (key['Reqbalance'] > 0) {
          this.showChart = true;
          let temp = {};
          temp['title'] = key['Symbol'];
          temp['value'] = key['Reqbalance'] / key['price'];
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
      this.amChartPie = this.AmCharts.makeChart('piechartdeposite', this.amChartPieOptions);
      let chartData = [];
      this.portfolioTokenWithValue.map((key) => {
        if (key['value'] > 0) {
          this.showChart = true;
          let temp = {};
          temp['title'] = key['symbol'];
          temp['value'] = key['value'] / key.currentPrice;
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
    // console.log('trackTokenvalue', data);
    if (data.Available > 0) {
      if (data.tokenHave === 0) {
        //   console.log('have balance');
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Token has not been authorized. Please authorize the Token in the Wallet page'), MessageContentType.Text);
      }
    } else {
      // console.log('don\'t have balance ');
    }
    // console.log('data', data);

  }

  createPortfolio(data) {
    console.log(data);

    var self = this;
    let currentWallet = this.savedWalletsService.getCurrentWallet();
    var privatekey = currentWallet.getPrivateKeyHex()
    let webInstance = self.web3.getWeb3();
    let toeknContract = new webInstance.eth.Contract(Constants.EtherTokenAbi, Constants.EtherTokenaionAddress, {
      gasLimit: 3000000,
    })

   webInstance.eth.getBlockNumber().then(BlockNumber=>{
    toeknContract.methods.allowance(sessionStorage.getItem("walletAddress"), Constants.TrasfersProxyaionAddress).call().then(function (result) {
      console.log("allowance " + result)
      if (result == 0) {
        self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Allowance is 0'), MessageContentType.Text);
      }
      else {
        self.wizard1 = false;
        self.showLoader = true;
        self.displayGif = 'block'
        let web3Instance = self.web3.getWeb3();
        let _askValue1 = data.askingPriceInWand.toString();
        let _askValue = web3Instance.utils.toNAmp(_askValue1);
        let _expiryBlock = BlockNumber+1100;
        let _name = webInstance.utils.fromAscii(data.portfolioName);
        self.selectedItems.map((key) => {
          self.assets.push(key.address);
        });
        self.portfolio.map((key) => {
          let a = key.Reqbalance.toString();
          self.valumes.push(web3Instance.utils.toNAmp(a));
        });
        let _maker = sessionStorage.getItem("walletAddress");
        let tx_hash;
        let finalData = {
          _askValue: _askValue,
          _expiryBlock: _expiryBlock,
          _name: '0x6131000000000000000000000000000000000000000000000000000000000000',
          _assets: self.assets,
          _volumes: self.valumes,
          _maker: _maker
        };
        console.log('Constants.VBPExchageAddress', Constants.VBPExchageAddress);
        let rawTransaction;
        let portContract = new webInstance.eth.Contract(Constants.VBPExchangeAbi, Constants.VBPExchageAddress, {
          from: _maker,
          gasLimit: 3000000,
        })

        const userAccount = sessionStorage.getItem("walletAddress");
        let add1 = userAccount
        console.log(add1, self.assets, self.valumes, _askValue, _expiryBlock, _name);
        const contractFunction = portContract.methods.createPortfolio(add1, self.assets, self.valumes, _askValue, _expiryBlock, _name)
        const functionAbi = contractFunction.encodeABI();
        const tx = {
          gas: 1999999,
          to: Constants.VBPExchageAddress,
          data: functionAbi
        };
        var rawtt;
        console.log('tx', tx, privatekey);
        webInstance.eth.accounts.signTransaction(tx, privatekey, function (err, res) {
          rawtt = res.rawTransaction;
          if (res) { console.log(res) }
          console.log("rawTransaction " + res.rawTransaction);
          var tx_hash;
          webInstance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash', (txHash) => {
            
            console.log("txhash.......", txHash);
            tx_hash = txHash;
          }).on('receipt', receipt => {
            console.log("receipt.......", receipt);
            self.block = receipt.blockNumber;
            toeknContract.methods.allowance(sessionStorage.getItem("walletAddress"), Constants.TrasfersProxyaionAddress).call().then(function (result) {
              //console.log("allowance " + result)
              if (result) {
                console.log("result.......", result);
                //  portContract.methods.getlength().call().then(function (resultl){
                length = result
                self.txHash = receipt.transactionHash;
                var status = receipt.status;
                self.block = receipt.blockNumber
                self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
                self.trackCreatePortfolioTransaction(status, web3Instance);
                // })   
              }
              else {
                self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
              }
            })
          }).catch(err => {
            console.log(err);
            //  console.log(tx_hash)
            self.check_portfolio(tx_hash, toeknContract, portContract)
          })
        })
      }
    })
  })
  }
  check_portfolio(hash, tokenContract, portContract) {
    var self = this;
    let web3Instance = self.web3.getWeb3();
    web3Instance.eth.getTransactionReceipt(hash, function (err, receipt) {
      if (receipt === null) {
        self.check_portfolio(hash, tokenContract, portContract)
      }
       console.log(receipt);
      tokenContract.methods.allowance(sessionStorage.getItem("walletAddress"), Constants.TrasfersProxyaionAddress).call().then(function (result) {
        // console.log("allowance " + result)
        if (result) {
          portContract.methods.getlength().call().then(function (resultl) {
            length = result
            self.txHash = receipt.transactionHash;
            var status = receipt.status;
            self.block = receipt.blockNumber
            self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
            self.trackCreatePortfolioTransaction(status, web3Instance);
          })
        }
        else {
          self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
        }
      })
    })
  }

  deposit(data) {
    //  console.log('called inside component', data);
    if (data === true) {
      if (this.walletService.getNewPortfolioTokenWithValue()) {
        //  console.log('token with value', this.walletService.getNewPortfolioTokenWithValue());
        this.portfolioTokenWithValue = this.walletService.getNewPortfolioTokenWithValue();
        if (this.portfolioTokenWithValue.length === 0) {
          this.portfolioService.publishComplete();
        } else {
          this.wizard1 = false;
          this.wizard2 = false;
          this.wizard3 = true;
          this.portfolioTokenWithValue.map((key) => {
            key.message = '';
            this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
              if (result) {
                key.currentPrice = result['AION'];
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

  getTotalDeposit() {
    this.totalDepositPrice = 0;
    this.portfolioTokenWithValue.map((key) => {
      this.totalDepositPrice = this.totalDepositPrice + (parseFloat(key.value) * key.currentPrice);
    });
  }

  getAskingPriceIn(token) {
    //  console.log('got token', token);
    let userAccountDetail = this.walletService.getUserAccountSummary();
    if (userAccountDetail) {
      let assetsStatus = _.where(userAccountDetail.Balances, { Symbol: token });
      if (assetsStatus[0]['Balance'] == 0 || assetsStatus[0]['Balance'] < 0) {
        this.validateAllowance = false;
        this.trackPortfolioCreatebtn = true;
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Not enough WXAION balance to create a Basket, please deposit AION in the Wallet Tab'), MessageContentType.Text);
        this.trackPortfolioCreatebtn = 'WXAION not have enough balance to make this transaction';
        return;
      } else {
        this.tokenContract.map((key) => {
          if (key.symbol === 'WXETH') {
            var myTokenContract = this.web3.getWeb3().eth.contract(JSON.parse(key['abi']));
            var instanceMyTokenContract = myTokenContract.at(key['address']);
            var userAccount = this.web3.getWeb3().eth.coinbase;
            let wexth = Constants.TrasfersProxyAddress;
            instanceMyTokenContract.allowance(userAccount, wexth, (err, result) => {
              if (result.lt(assetsStatus[0]['Balance'])) {
                this.validateAllowance = false;
                this.trackPortfolioCreatebtn = 'Token has not been authorized. Please authorize the Token in the Wallet page';
                return;
              } else {
                this.validateAllowance = true;
              }
            });
          }
        });
      }
    }
  }

  trackvalue(data, i) {
    if (data) {
      if (JSON.stringify(data.enter) === (typeof data.value === 'number' ? JSON.stringify(data.value) : data.value)) {
        this.portfolioTokenWithValue.map((key, value) => {
          if (value === i) {
            key.message = '';
            this.trackButton();
          }
        });
      } else {
        this.portfolioTokenWithValue.map((key, value) => {
          if (value === i) {
            key.message = 'error';
            this.trackButton();
          }
        });
      }
    }
  }

  trackButton() {
    let length = this.portfolioTokenWithValue.length;
    let i = 0;
    this.portfolioTokenWithValue.map((key) => {
      if (key.enter) {
        if (key.message === '') {
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
  public count2: any;
  basketDeposit() {
    var self = this;
    let currentWallet = this.savedWalletsService.getCurrentWallet();
    var privatekey = currentWallet.getPrivateKeyHex()
    var self = this;
    self.wizard1 = false;
    self.showLoader = true;
    self.displayGif = 'block';
    self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Please submit all the authorizations on wallet with sufficient Gwei to ensure that the transaction goes through.'), MessageContentType.Text);
    //console.log('data', self.portfolioTokenWithValue);
    let contractAddress = self.walletService.getPortfolioAddress();
    //console.log('address',contractAddress);
    let web3Instance = self.web3.getWeb3();
    let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion, contractAddress, {
      //from:sessionStorage.getItem('walletAddress'),
      gasLimit: 3000000,
    })
    let i = 0;
    var non;
    let aad = sessionStorage.getItem("walletAddress");
    web3Instance.eth.getTransactionCount(aad).then(_nonce => {
      non = _nonce;
      self.count2 = sessionStorage.getItem("tokenlength");
      //console.log("loooooop",self.count2)

      for (let a = 0; a < self.count2; a++) {
        const userAccount = sessionStorage.getItem("walletAddress");
        let value = self.portfolioTokenWithValue[a]['value'].toString();//key.value;
        let addr = self.portfolioTokenWithValue[a]['address'];//.toLowerCase();//key.address.toLowerCase();
        //  console.log(addr)
        //   console.log(value)
        //    console.log(userAccount)
        var add;
        var tx_hash;
        var address;
        add = sessionStorage.getItem("walletAddress");
        address = sessionStorage.getItem("walletAddress");
        // console.log(address);
        let aca = web3Instance.utils.toNAmp(value)
        // console.log("aca",aca)
        const contractFunction = vsbContract.methods.depositTokens(addr, aca);
        // console.log(contractFunction);
        const functionAbi = contractFunction.encodeABI();
        //  console.log("Nonce: " ,non);
        //  console.log("Nonce a: " , non+a);

        const txParams = {
          gas: 1999999,
          to: contractAddress,
          data: functionAbi,
          //from: address,
          nonce: (non + a)
        };
        //console.log("txparams",txParams)
        web3Instance.eth.accounts.signTransaction(txParams, privatekey, function (err, res) {

          // console.log(res.rawTransaction)
          vsbContract.methods.balanceOfToken(address, addr).call().then(v => console.log("Value before increment: " + v));
          //console.log(web3Instance);
          web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash', txHash => {
            // console.log(txHash);
            tx_hash = txHash;
          }).on('receipt', receipt => {
            //  console.log(receipt);
            vsbContract.methods.balanceOfToken(address, addr).call().then(function (result) {
              //  console.log("Value after increment: " + result)
            })
            if (receipt) {
              self.showLoader = false;
              self.displayGif = 'none';
              self.wizard1 = true;
              //console.log(receipt.status);
              self.portfolioTokenWithValue[a]['status'] = false;
              i++;

              self.portfolioTokenWithValue[a]['txnAddress'] = receipt.transactionHash;
              // console.log('this.portfolioTokenWithValue', self.portfolioTokenWithValue);
              self.showLoader = true;
              self.wizard3 = false;
              // console.log(i)
              // console.log(self.portfolioTokenWithValue.length)
              if (i === self.portfolioTokenWithValue.length) {
                self.trackDepsitTrasanction(web3Instance);
              }
            } else {
              self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction rejected'), MessageContentType.Text);
            }
          }).catch(err => {
            // console.log(err);
            web3Instance.eth.getTransactionReceipt(tx_hash, function (error, result) {
              //   console.log(error,result);
              vsbContract.methods.balanceOfToken(address, addr).call().then(function (result) {
                // console.log("Value after increment: " + result)
              })
              if (result['status']) {
                self.showLoader = false;
                self.displayGif = 'none';
                self.wizard1 = true;
                //console.log(result['status']);
                self.portfolioTokenWithValue[a]['status'] = false;
                i++;
                self.portfolioTokenWithValue[a]['txnAddress'] = result['transactionHash'];
                //console.log('this.portfolioTokenWithValue', self.portfolioTokenWithValue);
                self.showLoader = true;
                self.wizard3 = false;
                //  console.log(i)
                //  console.log(self.portfolioTokenWithValue.length)
                if (i === self.portfolioTokenWithValue.length) {
                  self.trackDepsitTrasanction(web3Instance);
                }
              } else {
                self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction rejected'), MessageContentType.Text);
              }
            })
          })
        });
      }
    })
  }

  trackDepsitTrasanction(web3Instance) {

    var self = this;
    let _web3 = this.web3.getWeb3();
    //  console.log('deposit tracking');
    // if (this.despositRefreshTimer)
    // clearTimeout(this.despositRefreshTimer);
    self.portfolioTokenWithValue.map((key) => {
      //  console.log(key)
      _web3.eth.getTransactionReceipt(key.txnAddress, (err, res) => {
        //  console.log(res);

        if (res.status) {
          // console.log(res)
          if (res.status === true) {
            //  console.log('deposite', key.txnAddress, res.transactionHash);
            if (key.txnAddress === res.transactionHash) {
              key.status = true;
              this.tractButton();
            }
          } else if (res.status === false) {
            clearTimeout(this.despositRefreshTimer);
          }
        }
      });
    });
  }

  publish() {
    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Once transaction is confirmed, the Basket is published onto the Blockchain'), MessageContentType.Text);
    var self = this;
    self.wizard4 = false;
    self.showLoader = true;
    self.displayGif = 'block';
    let currentWallet = this.savedWalletsService.getCurrentWallet();
    var privatekey = currentWallet.getPrivateKeyHex()

    let contractAddress = self.walletService.getPortfolioAddress();
    localStorage.setItem('contractAddress', contractAddress);
    let web3Instance = self.web3.getWeb3();
    let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion, contractAddress, {
      // from: this.account,
      gasLimit: 3000000,
    })
    if (self.updatePorfolioFlag === false) {
      const userAccount = sessionStorage.getItem("walletAddress");
      //  console.log(userAccount)
      var add;
      add = sessionStorage.getItem("walletAddress");
      const contractFunction = vsbContract.methods.publish();
      const functionAbi = contractFunction.encodeABI();
      let estimatedGas;
      let _hash;
      let nonce;
      //  console.log("Getting gas estimate");
      //  console.log("Estimated gas: " + estimatedGas);            
      const txParams = {
        gas: 999999,
        to: contractAddress,
        data: functionAbi,
      };
      web3Instance.eth.accounts.signTransaction(txParams, privatekey, function (err, res) {
        //console.log(res);

        vsbContract.methods.currentPortfolio().call().then(v => console.log("Value currentPortfolio before increment: ", v));

        web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash', hash => {
          _hash = hash;
        }).
          on('receipt', receipt => {
            // console.log(receipt);
            vsbContract.methods.currentPortfolio().call().then(function (result) {
              //   console.log("Value currentPortfolio after increment: " ,result)
            })
            if (receipt.status) {
              self.showLoader = true;
              self.wizard4 = false;
              //  console.log(receipt.status);
              self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Wait for the transaction to complete on the Blockchain'), MessageContentType.Text);
              self.zone.run(() => {
              });
              self.tractPublish(receipt.transactionHash, web3Instance);
            } else {
              self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction rejected'), MessageContentType.Text);
            }
          }).catch(err => {
            web3Instance.eth.getTransactionReceipt(_hash, (err, receipt) => {
              // console.log(receipt);
              vsbContract.methods.currentPortfolio().call().then(function (result) {
                //console.log("Value currentPortfolio after increment: " ,result)
              })
              if (receipt.status) {
                self.showLoader = true;
                self.wizard4 = false;
                // console.log(receipt.status);
                self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Wait for the transaction to complete on the Blockchain'), MessageContentType.Text);
                self.zone.run(() => {
                });
                self.tractPublish(receipt.transactionHash, web3Instance);
              } else {
                self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction rejected'), MessageContentType.Text);
              }
            })
          })
      });
    }
  }

  trackDeposittAndPulish() {
    if (this.updatePorfolioFlag === true) {
      this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = false;
      this.portfolioService.publishComplete();
      this.zone.run(() => {
      });
    } else {
      this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = true;
      this.generatepublishChart(this.portfolioTokenWithValue, 'create');
      this.zone.run(() => {
      });
    }
  }

  updatePortfolio(data) {
    if (data) {
      if (data.flag === 'update') {
        this.wizard1 = true;
        this.error = '';
        this.updatePorfolioFlag = true;
        this.trackPortfolioCreatebtn = false;
        this.currentPortfolioAddress = data.portfolio.contractAddress;
        // console.log('update', data.portfolio);
        // console.log('portfolio.name', data.portfolio.name.trim().length);
        this.data['portfolioName'] = data.portfolio.name.trim();
        this.data['askingPriceInWand'] = data.portfolio.valueInEther;
        data.portfolio.token.map((key) => {
          let temp = {};
          temp['address'] = key.tokenAddress;
          temp['itemName'] = key.Symbol;
          temp['id'] = key.Symbol;
          this.existingToken.push({ address: key.tokenAddress, value: key.value });
          this.selectedItems.push(temp);
          this.selectedTokens.push(key.Symbol);
          let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
          let toeknContract = tokenEth.at(key.tokenAddress);
          toeknContract.balanceOf(this.web3.getWeb3().eth.coinbase, (err, res) => {
            this.chartService.getUSDETHWAND(key.Symbol, (err, result) => {
              this.zone.run(() => {
                this.portfolio.push({
                  Symbol: key.Symbol,
                  CoinName: key.Symbol,
                  Reqbalance: key.value,
                  price: result['AION'],
                  priceUSD: result['USD'],
                  decimals: key.decimals,
                  balance: (new BigNumber(res).dividedBy(new BigNumber(10).pow(key.decimals))).toJSON(),
                });
              });
            });
          });
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
  };

  updateCurrentPortfolio(data) {
    if (this.currentPortfolioAddress) {
      localStorage.setItem('contractAddress', this.currentPortfolioAddress);
      this.showLoader = true;
      this.displayGif = 'block';
      this.wizard1 = false;
      //console.log('data', data);
      let newTokens = [];
      let web3Instance = this.web3.getWeb3();
      let _askValue = web3Functions.toBaseUnitAmount(data.askingPriceInWand, 18);
      let _expiryBlock = 3149112;
      let t = data.portfolioName.trim();
      let _name = web3Instance.toHex(data.portfolioName);
      this.selectedItems.map((key) => {
        this.assets.push(key.address);
      });
      this.portfolio.map((key) => {
        this.valumes.push(web3Functions.toBaseUnitAmount(key.Reqbalance, parseInt(key.decimals)));
      });
      this.assets.map((key, value) => {
        this.valumes.map((key1, value1) => {
          if (value === value1) {
            newTokens.push({ value: (new BigNumber(key1).dividedBy(new BigNumber(10).pow(18))).toJSON(), address: key });
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
      //console.log('check', _(this.existingToken).isEqual(newTokens));
      let portEth = web3Instance.eth.contract(Constants.VBPABI);
      let portContract = portEth.at(this.currentPortfolioAddress);
      //console.log('data', finalData);
      portContract.updatePortfolio(_askValue, this.curentBlock, this.assets, this.valumes, _name, (err, result) => {
        // console.log(result);
        this.txHash = result;
        if (!result) {
          this.showLoader = false;
          this.displayGif = 'none';
          this.wizard1 = true;
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
        } else {
          this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to blockchain please wait until it is complete'), MessageContentType.Text);
          this.trackTransaction(result, web3Instance, newTokens, data);
        }
      });
    }
  }

  calling(data) {
    //console.log('Data', data);
    if (data.length > 26) {
      this.error = 'Basket Name should not larger than 26';
      return;
    } else {
      this.error = '';
    }
  }

  validateAssets(portfolio, newTokens, callback) {
    //console.log('validate token ');
    let web3Instance = this.web3.getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.address);
    newTokens.map((key, value) => {
      vsbContract.methods.balanceOfToken(this.web3.getWeb3().eth.coinbase, key.address, (err, res) => {
        if (!res) {
          return;
        } else {
          // console.log('respons e', res);
          // console.log('response', (new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() === '0');
          if ((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() === '0') {
            callback(false);
          }
        }
      });
    });
  }

  private trackCreatePortfolioTransaction(address, web3Instance) {
    // if (this.orderBookRefreshTimer)
    //   clearTimeout(this.orderBookRefreshTimer);
    // web3Instance.eth.getTransactionReceipt(address, (err, res) => {
    //   if (res) {
    //     if (res.status === '0x1') {
    //       console.log('transaction successful', res);
    //       let portEth = this.web3.getWeb3().eth.contract(Constants.createPortfolio);
    //       let portContract = portEth.at(Constants.CretaeContractAddress);
    //       this.initiateAutoRefresh(portContract);
    //     } else if (res.status === '0x0') {
    //       clearTimeout(this.orderBookRefreshTimer);
    //       this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
    //       console.log('transaction unsuccessful', res);
    //     }
    //   }
    // });
    // this.orderBookRefreshTimer = setTimeout(() => {
    //   this.trackCreatePortfolioTransaction(address, web3Instance);
    // }, 1000);
    var self = this;
    var web3Instance = this.web3.getWeb3();
    console.log("trackCreatePortfolioTransaction address"+web3Instance)
    var res = address;
    if (this.orderBookRefreshTimer)
      clearTimeout(this.orderBookRefreshTimer);
    console.log("a111")
    if (res) {
      if (res === true) {
        let portContract = new web3Instance.eth.Contract(Constants.VBPExchangeAbi, Constants.VBPExchageAddress, {
          gasLimit: 3000000,
        })
        this.initiateAutoRefresh(portContract);
      } else if (res === false) {
        clearTimeout(this.orderBookRefreshTimer);
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
        //console.log('transaction unsuccessful', res);
      }
    }
  }

  private initiateAutoRefresh(portContract) {

    var self = this;
    var web3Instance = self.web3.getWeb3();
    var tokenListAddress1 = []
    let port = new web3Instance.eth.Contract(Constants.VBPExchangeAbi, Constants.VBPExchageAddress, {
      // from: this.account,
      gasLimit: 3000000,
    })
    var a = self.block// - 1000;
    port.getPastEvents('Exchange', { fromBlock: a, toBlock: 'latest' }, function (error, result) {
      console.log("self block is......",self.block,result);
      console.log(result);
      let index = 0;
      for (; index < result["length"]; index++) {
        if (result[index]["transactionHash"] == self.txHash) {
          console.log(result[index]["transactionHash"]);
          clearTimeout(this.orderBookRefreshTimer);

          this.trackPortfolioCreate = true;
          self.wizard2 = true;
          self.showLoader = false;
          self.displayGif = 'none';
          self.txHashSuccess = result;
          self.walletService.setPortfolioAddress(result[index]['returnValues']['_portfolio']);
          let aa = result[index]['returnValues']['_portfolio'].toLowerCase();
          // console.log(" aaaaaa portfolio Address"+aa)
          // console.log(" initiateAutoRefresh portfolio Address")
          // console.log(result[index]['returnValues']['_portfolio'])
          self.zone.run(() => { });
          // break;
        }
      }
    });
  }

  private trackTransaction(address, web3Instance, newTokens, data) {
    if (this.orderBookRefreshTimer)
      clearTimeout(this.orderBookRefreshTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === '0x1') {
          clearTimeout(this.orderBookRefreshTimer);
          // console.log('check Array', this.existingToken, newTokens);
          // console.log('check', _(this.existingToken).isEqual(newTokens));
          if (_(this.existingToken).isEqual(newTokens) === false) {
            //  console.log('res', res);
            let track = 0;
            newTokens.map((keys, value) => {
              this.existingToken.map((key) => {
                if (keys.address === key.address) {
                  if (parseFloat(keys.value) === parseFloat(key.value)) {
                    //     console.log('called track');
                    track++;
                  }
                  ;
                }
                ;
              });
              if (value === newTokens.length - 1) {
                if (newTokens.length === track) {
                  clearTimeout(this.orderBookRefreshTimer);
                  this.validateAssets(data, newTokens, (resss) => {
                    if (resss === false) {
                      this.walletService.setPortfolioAddress(res.to);
                      this.portfolioService.setNewTokenValue(newTokens);
                      this.showLoader = false;
                      this.displayGif = 'none';
                      this.wizard2 = true;
                      clearTimeout(this.orderBookRefreshTimer);
                      this.zone.run(() => {
                        //  console.log('enabled time travel');
                      });
                    } else {
                      this.portfolioService.closeEditModal();
                      this.zone.run(() => {
                        // console.log('enabled time travel');
                      });
                    }
                  });
                } else {
                  this.walletService.setPortfolioAddress(res.to);
                  this.portfolioService.setNewTokenValue(newTokens);
                  this.showLoader = false;
                  this.displayGif = 'none';
                  this.wizard2 = true;
                  clearTimeout(this.orderBookRefreshTimer);
                  this.zone.run(() => {
                    // console.log('enabled time travel');
                  });
                }
              }
            });
          } else {
            //  console.log('updated successfully');
            clearTimeout(this.orderBookRefreshTimer);
            this.validateAssets(data, newTokens, (resss) => {
              if (resss === false) {
                this.walletService.setPortfolioAddress(res.to);
                this.portfolioService.setNewTokenValue(newTokens);
                this.showLoader = false;
                this.displayGif = 'none';
                this.wizard2 = true;
                clearTimeout(this.orderBookRefreshTimer);
                this.zone.run(() => {
                  //  console.log('enabled time travel');
                });
              } else {
                this.zone.run(() => {
                  //  console.log('enabled time travel');
                });
              }
            });
          }
        } else if (res.status === '0x0') {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
          //  console.log('transaction unsuccessful', res);
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.trackTransaction(address, web3Instance, newTokens, data);
    }, 1000);
  }

  private trackPendindPortfolio(portfolio) {
    // let web3Instance = this.web3.getWeb3();
    // let trackAsset = 0;
    // // let vsb = web3Instance.eth.contract(Constants.VBPABI);
    // // let vsbContract = vsb.at(portfolio.contractAddress);
    // console.log(portfolio);
    // let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,portfolio.contractAddress, {
    //   // from: this.account,
    //   gasLimit: 3000000,
    // })
    // setTimeout(() => {
    //   portfolio.tokens.map((key) => {
    //     vsbContract.methods.balanceOfToken(sessionStorage.getItem('walletAddress'), key.tokenAddress).call().then((res,err) => {
    //       console.log(res,err);
    //       if (!res) {
    //         return;
    //       } else {
    //         console.log('res', res);
    //         let tokens = this.itemList.filter((token) => token.address.toLowerCase() === key.tokenAddress.toLowerCase());
    //         if (tokens && tokens.length === 1) {
    //           console.log((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON());
    //           console.log((new BigNumber(res).dividedBy(new BigNumber(10).pow(18)).toJSON() !== key.value));
    //           //if ((new BigNumber(res).dividedBy(new BigNumber(10).pow(tokens[0].decimals))).toJSON() !== key.value) {
    //             if ((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() !== key.value) {  
    //           this.zone.run(() => {
    //               this.walletService.setPortfolioAddress(portfolio.contractAddress);
    //               this.portfolioService.setNewTokenValue(portfolio.tokens);
    //               this.showLoader = false;
    //               this.wizard1 = false;
    //               this.wizard2 = true;
    //               clearTimeout(this.orderBookRefreshTimer);
    //               console.log('tracking portfololio');
    //             });
    //           } else {
    //             trackAsset++;
    //             this.walletService.setPortfolioAddress(portfolio.contractAddress);
    //             if (trackAsset === portfolio.tokens.length) {
    //               this.zone.run(() => {
    //                 console.log('go to publish');
    //                 this.showLoader = false;
    //                 this.wizard3 = false;
    //                 this.wizard1 = false;
    //                 this.wizard4 = true;
    //                 this.generatepublishChart(portfolio, 'pending');
    //               });
    //             }
    //           }
    //         }

    //       }
    //       ;
    //     });
    //   });
    // }, 1500);
    var self = this;
    let web3Instance = self.web3.getWeb3();
    let trackAsset = 0;
    //let vsb = web3Instance.eth.contract(Constants.VBPABI);
    //let vsbContract = vsb.at(portfolio.contractAddress);
    let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion, portfolio.contractAddress, {
      // from: this.account,
      gasLimit: 3000000,
    })
    portfolio.tokens.map((key) => {
      vsbContract.methods.balanceOfToken(sessionStorage.getItem("walletAddress"), key.tokenAddress).call().then(function (res, err) {
        if (!res) {
          return;
        } else {
          //  console.log(res)
          // console.log(res.toJSON());
          //  console.log((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON());
          if ((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() !== key.value) {
            self.walletService.setPortfolioAddress(portfolio.contractAddress);
            self.portfolioService.setNewTokenValue(portfolio.tokens);
            self.showLoader = false;
            self.wizard1 = false;
            self.wizard2 = true;
            clearTimeout(self.orderBookRefreshTimer);
            self.zone.run(() => {
              //   console.log('enabled time travel');
            });
          } else {
            trackAsset++;
            // console.log(trackAsset)
            self.walletService.setPortfolioAddress(portfolio.contractAddress);
            if (trackAsset === portfolio.tokens.length) {
              //  console.log('go to publish');
              self.showLoader = false;
              self.wizard3 = false;
              self.wizard1 = false;
              self.wizard4 = true;
              self.generatepublishChart(portfolio, 'pending');
              self.zone.run(() => {
              });
            }
          }
        }
        ;
      });
    });
  }

  private tractPublish(address, web3Instance) {
    if (this.orderBookRefreshTimer)
      clearTimeout(this.orderBookRefreshTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === true) {
          this.showLoader = false;
          clearTimeout(this.orderBookRefreshTimer);
          this.portfolioService.publishComplete();
          this.walletService.setNewPortfolioTokenWithValue(null);
          this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
          this.zone.run(() => {
          });
        } else if (res.status === '0x0') {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
        }
      }
    });
    // this.orderBookRefreshTimer = setTimeout(() => {
    //   this.tractPublish(address, web3Instance);
    // }, 1000);
  }

  public tractButton() {
    //   console.log('tractButton', this.portfolioTokenWithValue);
    let assetLength = this.portfolioTokenWithValue.length;
    let i = 0;
    this.portfolioTokenWithValue.map((key) => {
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
    // console.log('called generatePieChart', portfolio, status);
    if (status === 'pending') {
      //  console.log()
      portfolio['tokens'].map((key, value) => {
        key.message = '';
        //this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
        //if (result) {
        let temp = {};
        temp['title'] = key['symbol'];
        temp['value'] = key['value'];
        this.totalQuanity = this.totalQuanity + parseFloat(key['value']);
        this.amChartPieData.push(temp);
        this.publishData.push(temp);
        if (value === portfolio['tokens'].length - 1) {
          //  console.log('called', this.amChartPieData);
          this.generatePieChart();
          this.publishData.map((key, value2) => {
            console.log("publishdata", this.publishData)
            this.chartService.getUSDETHWAND(key.title, (err, res) => {
              key['alltoken'] = res;
              this.showdata = true;
              this.showLoader = false;
              this.calculateTotal();
            });
          });
          //   console.log("PublishedData",this.publishData);

        }
        //}
        // });
      });
    } else {
      // console.log('else', portfolio);
      let pendingData = portfolio;
      let basket = pendingData.filter((basket) => basket.contractAddress === this.walletService.getPortfolioAddress());
      // console.log('basket', basket);
      this.publishData = [];
      this.amChartPieData = [];
      this.totalQuanity = 0;
      portfolio.map((key, value) => {
        key.message = '';
        // this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
        // if (result) {
        let temp = {};
        temp['title'] = key['symbol'];
        temp['value'] = key['value'];
        this.totalQuanity = this.totalQuanity + parseFloat(key['value']);
        //   console.log('totalQuanity', this.totalQuanity);
        this.publishData.push(temp);
        //   console.log("else publishData",this.publishData)
        this.amChartPieData.push(temp);
        if (value === portfolio.length - 1) {
          this.generatePieChart();
          this.publishData.map((key, value2) => {
            this.chartService.getUSDETHWAND(key.title, (err, res) => {
              if (res) {
                key['alltoken'] = res;
                this.calculateTotal();
              }
            });
          });
        }
        // }
        // });
      });
    }
  }

  private calculateTotal() {
    this.overallUSD = 0;
    this.overallETH = 0;
    this.publishData = _.uniq(this.publishData, 'title');
    this.publishData.map((key) => {
      if (key.alltoken['AION']) {
        this.overallETH = this.overallETH + key.alltoken['AION'];
      }
      if (key.alltoken['USD']) {
        this.overallUSD = this.overallUSD + key.alltoken['USD'];
      }
      this.showdata = true;
      this.showLoader = false;
    });
    this.zone.run(() => {

    });
  }

  skipIntro() {
    this.createBasket = true;
  }


  // themed basket
  createWithThemedToken(flag) {
    this.selectedItems = [];
    this.portfolio = [];
    if (window.location.hostname === 'exchange.wandx.co') {
      if (flag === 'exchange') {
        const decentralised_exchange_tokens = Constants.Decentralised_exhchange_tokens;
        this.getThemesBasket(decentralised_exchange_tokens);
      } else if (flag === 'insurance') {
        const decentralised_supply_chain_tokens = Constants.Decentralised_insurance_tokens;
        this.getThemesBasket(decentralised_supply_chain_tokens);
      } else if (flag === 'identity') {
        const decentralised_storage_tokens = Constants.Decentralised_identity_tokens;
        this.getThemesBasket(decentralised_storage_tokens);
      } else if (flag === 'marketcap') {
        const decentralised_storage_tokens = Constants.Low_market_cap_ERC20_tokens;
        this.getThemesBasket(decentralised_storage_tokens);
      }
    } else {
      if (flag === 'exchange') {
        const decentralised_exchange_tokens = Constants.Decentralised_exhchange_tokensApp;
        this.getThemesBasket(decentralised_exchange_tokens);
      } else if (flag === 'supplychain') {
        const decentralised_supply_chain_tokens = Constants.Decentralised_insurance_tokensApp;
        this.getThemesBasket(decentralised_supply_chain_tokens);
      } else if (flag === 'storagetokens') {
        const decentralised_storage_tokens = Constants.Decentralised_identity_tokensApp;
        this.getThemesBasket(decentralised_storage_tokens);

      }
    }

  }

  getThemesBasket(themeToken) {
    //  console.log('themeToken', themeToken, this.itemList);
    themeToken.map((key) => {
      this.itemList.map((k) => {
        if (k.address === key) {
          this.chartService.getUSDETHWAND(k.itemName, (err, result) => {
            if (result) {
              const temp = {};
              temp['address'] = k.address;
              temp['itemName'] = k.itemName;
              temp['id'] = k.itemName;
              this.selectedItems.push(temp);
              this.selectedTokens.push(k.itemName);
              //    console.log('selectedItems token', this.selectedItems);
              this.portfolio.push({
                Symbol: k.itemName,
                CoinName: k.itemName,
                Reqbalance: 0,
                balance: k.balance,
                price: result['ETH'],
                priceUSD: result['USD'],
                decimals: k.decimals
              });
              //    console.log('selectedItems token', this.portfolio);
              this.calculateTotalinquantity();
            }
          });
        }
      });
    });
  }

  requestForTheme(name) {
    this.currentThemeName = name;
    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
    } else {
      this.displayRequest = 'none';
    }
  }

  createForm() {
    this.form = this.fb.group({
      PortfolioPriceInEth: ['', Validators.required],
      PortfolioMaxPriceInEth: ['', Validators.required],
    });
  }

  onSubmit() {
    const formStatus = this.form.status;
    if (formStatus == 'INVALID') {
      return;
    }
    // this.form.setErrors({
    //   passwordInvalid : true
    // })
    const formModel = this.form.value;
    //  console.log('formModel', formModel);
    formModel.name = this.currentThemeName;

    this.portfolioService.requestPortfolio(formModel).then((res) => {
      if (res)
        this.displayRequest = 'none';
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Submitted Basket themed request.'), MessageContentType.Text);
    }, (err) => {
      // console.log('err', err);
    });

  }

}
