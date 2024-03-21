import {Component, NgZone, OnInit, OnDestroy} from '@angular/core';
//import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import {AmChart, AmChartsService} from '@amcharts/amcharts3-angular';
import {Constants} from '../../models/constants';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {ChartService} from '../../services/chart.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
//import {PortfolioService} from '../../services/portfolio.service';
import {AssetAnalysis} from '../../models/asset.model';
import {UserRegistrationResponse} from '../../models/user-registration.model';
//import {Web3Service} from '../../services/web3.service';
//import {TokenService} from '../../services/token.service';
import {SellablePortfolio} from '../../models/portfolio.model';
import {Headers, Http, RequestOptions} from '@angular/http';
import {SwitchThemeService} from '../../services/switch-theme.service';
import {Subscription} from 'rxjs/Subscription';
//import {WalletService} from '../../services/wallet.service';
import * as _ from 'underscore';
import {BigNumber} from 'bignumber.js';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import * as Web3 from 'web3';
import { WanWeb3Service } from '../../services/wan-web3.service';
import { TokenWanService } from '../../services/token-wan.service';
import { PortfolioWanService } from '../../services/portfolio-wan.service';
import { WalletWanService } from '../../services/wallet-wan.service';
import { UserWanService } from '../../services/user-wan.service';

var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;
declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-basket-new-wan',
  templateUrl: './basket-new-wan.component.html',
  styleUrls: ['./basket-new-wan.component.css']
})
export class BasketNewWanComponent implements OnInit, OnDestroy {
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
  public publishData1 = [];
  public displayGif = 'none';
  public displayRequest = 'none';
  public showChart = false;
  public tokenContract: any;
  public validateAllowance: any;
  public error: any;
  public totalprice = 0;
  public totalDepositPrice = 0;
  public intial;
  public createBasket: boolean = false;
  public form: FormGroup;
  _web3:any;
  web3:any;
  constructor(private http: Http,
              //private web3: Web3Service,
              private zone: NgZone,
              private chartService: ChartService,
              private portfolioService: PortfolioWanService,
              readonly switchThemeService: SwitchThemeService,
              private router: Router,
              private notificationsService: NotificationManagerService,
              private tokenService: TokenWanService,
              private walletService: WalletWanService,
              private userService: UserWanService,
              private fb: FormBuilder,
              private savedWalletsService: SavedWalletsService,
              private AmCharts: AmChartsService,
              private WanWeb3Service : WanWeb3Service) {
    //console.log('Portfolio create component');
   // console.log(this.web3.priv)
  
    // this._web3=web3._getWeb3();
    this._web3=WanWeb3Service._getWeb3();
console.log(this._web3);

    if (!this.tokenService.getToken() || this.tokenService.getToken().Jwt.length === 0)
      this.tokenService.fetchToken();
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();

      
    }
    let tokenEth = this._web3.eth.contract(Constants.TokenAbiWAN);
    console.log(Constants.EtherTokenAddressWAN,Constants.providerwanURL,Constants.ServiceURLWAN,Constants.TrasfersProxyAddressWAN);
    
    let toeknContract = tokenEth.at(Constants.EtherTokenAddressWAN);
    toeknContract.balanceOf.call(sessionStorage.getItem('walletAddress'), (err, res) => {
      console.log(res);
      
    })
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
      await  this._web3.eth.getBlockNumber((err, res) => {
        if (res) {
        //  console.log('block', res);
          this.curentBlock = (parseInt(res) + 50000);
        }
      });
    })();
    if (this.updatePorfolioFlag === false && this.pendingPorfolioFlag === false) {
      this.wizard1 = true;
    }
    this.getAskingPriceIn('WXWAN');
    this.showChart = false;
  }

  createComponentInit() {
    if(Constants.chainid === 3)
   {
    this.web3 = new Web3(new Web3.providers.HttpProvider("https://mywanwallet.nl/testnet"));
   }
   else{
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://35.239.13.60:8545"));
   }
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

  //  console.log('called destroy');
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
            price: result['WAN'],
            priceUSD: result['USD'],
            decimals: decimals
          }
        );
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
    this.portfolio.map((key) => {
      this.totalprice = this.totalprice + (key.price * key.Reqbalance);
    });
  }

  isPortfolioValid(): boolean {
    if (this.data['portfolioName'] === null || this.error === undefined || this.error !== '' || this.error === null || this.data['portfolioName'] === undefined || this.validateAllowance === null || this.validateAllowance === undefined || this.validateAllowance === false || this.data['portfolioName'].length === 0 || this.data['askingPriceInWand'] === undefined || this.data['askingPriceInWand'] === null || this.data['askingPriceInWand'] === 0)
    return false;
    for (var i = 0; i < this.portfolio.length; i++) {
      if (this.portfolio[i].Reqbalance <= 0 || this.portfolio[i].balance === '0')
        return false;
    }
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
      assetAnalysisInput.push({'Symbol': this.portfolio[i].Symbol, 'Amount': this.portfolio[i].Reqbalance});
    }
    let headers = new Headers({
      'content-type': 'application/json',
     // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.post(Constants.ServiceURLWAN + 'portfolio/analyze', assetAnalysisInput, requestOptions).subscribe(
      data => {
        this.assetAnalysisResult = data.json();
     //   console.log('data', this.assetAnalysisResult);
        this.amChartPieData = [];
        this.assetAnalysisResult.assets.map((key) => {
          let temp = {};
          this.totalQuanity = this.totalQuanity + key['reqbalance'];
          this.totalETH = this.totalETH + key['summary'].WAN;
          this.totalUSD = this.totalETH + key['summary'].USD;
          this.totalWAND = this.totalETH + key['summary'].WAND;
       //   console.log('total', this.totalQuanity, this.totalETH, this.totalUSD, this.totalWAND);
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
     //   console.log(err);
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

  getPlatformTokens() {

    console.log('getPlatformTokens2')
    let headers = new Headers({
      'content-type': 'application/json',
     // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    console.log(Constants.ServiceURLWAN);
    
    this.http.get(Constants.ServiceURLWAN + 'PlatformToken', requestOptions).subscribe(
      data => {
        console.log(data);
        
        
        this.showAnalysisLoader = true;
        var tokens = data.json();
      
        let itemLists = [];
      
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].symbol !== 'WXWAN' && tokens[i].symbol !== 'WAN' ) {
            let tokenEth = this._web3.eth.contract(Constants.TokenAbiWAN);
            let toeknContract = tokenEth.at(tokens[i].address);
            let _data = tokens[i];
            toeknContract.balanceOf.call(sessionStorage.getItem('walletAddress'), (err, res) => {
              if (res) {
                this.zone.run(() => {
                  itemLists.push({
                    'id': _data.symbol,
                    'itemName': _data.symbol,
                    'address': _data.address,
                    'contract': tokenEth,
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
    //let webInstance = this.web3.getWeb3();
  //  console.log('token contract', data);
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
     //   console.log('portfolio create component token error');
        this.router.navigateByUrl('/');
        return;
      }
      this.getPlatformTokens();
    }
  }

  userRegistrationStatusChange(data: UserRegistrationResponse) {
    if (data !== undefined && data !== null) {
      if (!data.UserEmailVerified) {
       // console.log('portfolio create component token error');
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

  OnItemSelect($event) {
    this.showDropdownLoader = true;
    this.addOrRemoveCoin($event.id, $event.itemName, $event.balance, $event.decimals);
  }

  OnItemDeSelect($event) {
   // console.log($event);
    this.addOrRemoveCoin($event.id, $event.itemName, $event.balance, $event.decimals);
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
    //  console.log(this.amChartPie);
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
 //   console.log('trackTokenvalue', data);
    if (data.Available > 0) {
      if (data.tokenHave === 0) {
   //     console.log('have balance');
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Token has not been authorized. Please authorize the Token in the Wallet page'), MessageContentType.Text);
      }
    } else {
  //    console.log('don\'t have balance ');
    }
  //  console.log('data', data);

  }

  createPortfolio(data) {
    console.log('data', data);
    this.wizard1 = false;
    this.showLoader = true;
    this.displayGif = 'block';
  //  let web3Instance = this.web3.getWeb3();
    let _askValue = data.askingPriceInWand*1000000000000000000;
    let _expiryBlock = 3149112;
    let _name = this._web3.fromAscii(data.portfolioName, 32);
    let _assets = [];
    let _volumes = [];
    //console.log(this.selectedTokens);
    this.selectedItems.map((key) => {
      this.assets.push(key.address);
    });
    this.portfolio.map((key) => {
      this.valumes.push(key.Reqbalance*1000000000000000000);
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
   // console.log('data', finalData);
    let portEth = this._web3.eth.contract(Constants.createPortfolioWAN);
    let portContract = portEth.at(Constants.CretaeContractAddressWAN);

    // const privateKey = Buffer.from(this.web3.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    console.log(privateKey,_maker);
    privateKey = Buffer.from(privateKey.substr(2), 'hex')


    var count = this._web3.eth.getTransactionCount(_maker);

//console.log("Getting gas estimate");
this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
console.log(_maker, this.assets, this.valumes, _askValue, this.curentBlock, _name);

var data = portContract.createPortfolio.getData(_maker, this.assets, this.valumes, _askValue, this.curentBlock, _name,{from: _maker});
    const txParams = {
		gasPrice: '0x09184e79a00',
		gasLimit:Constants.gaslimit,//2416780,//2072892,//1200000,
      to: Constants.CretaeContractAddressWAN,
      data:data,
      from: _maker,
      chainId: Constants.chainid,
      Txtype: 0x01,
      //value:convertedAmount,
      nonce: count
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
		if( err) {
			console.log("transfer error: ", err);
		} else {
   
      this.createportfoliocheck(hash);
		}
	
	 
			
		})

  
  }
  createportfoliocheck(hash)
  {
    console.log('deposit')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      console.log(hash1)
  if(hash1 === null)
  {
    this.createportfoliocheck(hash);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
  //console.log('error')
  this.showLoader = false;
      this.displayGif = 'none';
      this.wizard1 = true;
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction not submitted'), MessageContentType.Text);
      this.zone.run(() => {
     //   console.log('transaction failed');
      });
    }
    else
    {
      this.txHash = hash;
          this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is completed'), MessageContentType.Text);
          this.zone.run(() => {
          });
          this.trackCreatePortfolioTransaction(this.txHash);
          //this.initiateAutoRefresh(portContract);
   }
  }
    });
  }

  deposit(data) {
    //console.log('called inside component', data);
    if (data === true) {
      if (this.walletService.getNewPortfolioTokenWithValue()) {
      //  console.log('token with value', this.walletService.getNewPortfolioTokenWithValue());
        this.portfolioTokenWithValue = this.walletService.getNewPortfolioTokenWithValue();

        if (this.portfolioTokenWithValue.length === 0) {
        //  console.log(this.portfolioTokenWithValue.length)
          this.portfolioService.publishComplete();
        } else {
          this.wizard1 = false;
          this.wizard2 = false;
          this.wizard3 = true;
          this.portfolioTokenWithValue.map((key) => {
            key.message = '';
            this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
              if (result) {
                key.currentPrice = result['WAN'];
                this.getTotalDeposit();
                this.generatePieChartAtdepoitToken();
              }
            });
          });
          this.zone.run(() => {
          });
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
   console.log(userAccountDetail)
    if (userAccountDetail) {
      let assetsStatus = _.where(userAccountDetail.Balances, {Symbol: token});
     console.log(assetsStatus)
     if (assetsStatus[0]['Balance'] == 0 || assetsStatus[0]['Balance'] < 0) {
        this.validateAllowance = false;
        this.trackPortfolioCreatebtn = true;
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Not enough WXETH balance to create a Basket, please deposit WXETH in the Wallet Tab'), MessageContentType.Text);
        this.trackPortfolioCreatebtn = 'WXWAN not have enough balance to make this transaction';
        return;
      } else {
        console.log(assetsStatus)
     console.log(this.tokenContract,userAccountDetail);
     
        this.tokenContract.map((key) => {
          console.log(key,key.symbol);
          
          if (key.symbol === 'WXWAN') {
            var myTokenContract = this._web3.eth.contract(JSON.parse(key['abi']));
            var instanceMyTokenContract = myTokenContract.at(key['address']);
            var userAccount = sessionStorage.getItem("walletAddress");
            let wexth = Constants.TrasfersProxyAddressWAN;
             console.log(instanceMyTokenContract,userAccount,Constants.TrasfersProxyAddressWAN);
            instanceMyTokenContract.allowance.call(userAccount, wexth, (err, result) => {
           //   console.log(assetsStatus[0]['Balance'].toFixed(4));
              if (!err){
                if (result.lt(assetsStatus[0]['Balance'].toFixed(4))) {
                  this.validateAllowance = false;
                  this.trackPortfolioCreatebtn = 'Token has not been authorized. Please authorize the Token in the Wallet page';
                  return;
                } else {
                  this.validateAllowance = true;
                }
              }
              else {
                console.warn(err)
                
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

  basketDeposit() {
    this.showLoader = true;
    this.displayGif = 'block';
    this.wizard3 = false;
    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is submitted to the blockchain. Please wait until it is confirmed'), MessageContentType.Text);
    //  console.log('data', this.portfolioTokenWithValue);
    let contractAddress = this.walletService.getPortfolioAddress();
   // console.log('address', this.walletService.getPortfolioAddress());
    // let web3Instance = this.web3.getWeb3();
    let vsb = this._web3.eth.contract(Constants.VBPABIWAN);
    let vsbContract = vsb.at(contractAddress);
    this.intial=0;
    let i = 0;
    this.portfolioTokenWithValue.map((key,value) => {
     // console.log(key)
    //  console.log(value)
     // console.log(key.data.decimals);
     // const privateKey = Buffer.from(this.web3.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    privateKey = Buffer.from(privateKey.substr(2), 'hex')

     var count = this._web3.eth.getTransactionCount(sessionStorage.getItem("walletAddress"));
     let non = count+value;
 //console.log("Getting gas estimate" +non);
 
 var data = vsbContract.depositTokens.getData(key.address,key.value*1000000000000000000,{from: sessionStorage.getItem("walletAddress")});
     const txParams = {
     gasPrice: '0x09184e79a00',
     gasLimit: 400000,
       to: contractAddress,
       data:data,
       from: sessionStorage.getItem("walletAddress"),
       chainId: Constants.chainid,
       Txtype: 0x01,
       //value:convertedAmount,
       nonce: non
     };
     const tx = new Tx(txParams);
     tx.sign(privateKey);
     const serializedTx = tx.serialize();
 this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
 
    if( err) {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
      // console.log("transfer error: ", err);
     } else {
       console.log(hash);
       console.log(this.portfolioTokenWithValue.length)
       key.status = false;
       key.txnAddress = hash;
       this.depositecheck(hash,this.portfolioTokenWithValue.length);
     }  
     })
     
    });
  }


  depositecheck(hash,length)
  {
   // console.log('deposit')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
   //   console.log(hash1)
  if(hash1 === null)
  {
    this.depositecheck(hash,length);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
  //console.log('error')
  this.showLoader = false;
      this.displayGif = 'none';
      this.wizard1 = true;
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction rejected'), MessageContentType.Text);
      this.zone.run(() => {
     //  console.log('transaction failed');
      });
    }
    else
    {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'The transaction is Completed'), MessageContentType.Text);
      // console.log("completed",hash);
      // console.log(length);
         this.intial++;
         console.log(this.intial)
          if (this.intial === length) {
            //key.status = true;
            console.log('tractButton1')
           // if (hash === res.transactionHash) {
             // key.status = true;
              this.tractButton();
            //}
         }
       // })
   }
  }
    });
  }


  trackDepsitTrasanction() {
  //  console.log('deposit tracking');
    if (this.despositRefreshTimer)
      clearTimeout(this.despositRefreshTimer);
    this.portfolioTokenWithValue.map((key) => {
      this._web3.eth.getTransactionReceipt(key.txnAddress, (err, res) => {
        if (res) {
          if (res.status === '0x1') {
           
    //        console.log('deposite', key.txnAddress, res.transactionHash);
            if (key.txnAddress === res.transactionHash) {
              key.status = true;
              this.tractButton();
            }
          } else if (res.status === '0x0') {
            clearTimeout(this.despositRefreshTimer);
          }
        }
      });
    });

    this.despositRefreshTimer = setTimeout(() => {
      this.trackDepsitTrasanction();
    }, 1000);
  }

  publish() {
   // this.showLoader = true;
    this.displayGif = 'block';
    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Once transaction is confirmed, the Basket is published onto the Blockchain'), MessageContentType.Text);
    let contractAddress = this.walletService.getPortfolioAddress();
    localStorage.setItem('contractAddress', contractAddress);
    let web3Instance = this.WanWeb3Service._getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABIWAN);
    let vsbContract = vsb.at(contractAddress);
    if (this.updatePorfolioFlag === false) {
      // const privateKey = Buffer.from(this.web3.priv, 'hex');
      let currentWallet=this.savedWalletsService.getCurrentWallet();
      var privateKey=currentWallet.getPrivateKeyHex()
      privateKey = Buffer.from(privateKey.substr(2), 'hex')

     var count = this._web3.eth.getTransactionCount(sessionStorage.getItem("walletAddress"));
     
 //console.log("Getting gas estimate");
 
 var data = vsbContract.publish.getData();
     const txParams = {
     gasPrice: '0x09184e79a00',
     gasLimit: 400000,
       to: contractAddress,
       data:data,
       from: sessionStorage.getItem("walletAddress"),
       chainId: Constants.chainid,
       Txtype: 0x01,
       //value:convertedAmount,
       nonce: count
     };
     const tx = new Tx(txParams);
     tx.sign(privateKey);
     const serializedTx = tx.serialize();
 this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
     if( err) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
      // console.log("transfer error: ", err);
     } else {
    
       this.publishcheck(hash);
     }
    
    
       
     })
     
    }
  }
  publishcheck(hash)
  {
  //  console.log('publish')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
   //   console.log(hash1)
  if(hash1 === null)
  {
    this.publishcheck(hash);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
      this.displayGif = 'none'; 
      this.showLoader = false;
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);

    }
    else
    {
          this.wizard4 = false;
          this.showLoader = false;
          this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Wait for the transaction to complete on the Blockchain'), MessageContentType.Text);
          this.portfolioService.publishComplete();
          this.walletService.setNewPortfolioTokenWithValue(null);
          this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
        
   }
  }
    });
  }


  trackDeposittAndPulish() {
    if (this.updatePorfolioFlag === true) {
      console.log('123')
      this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = false;
      this.portfolioService.publishComplete();
      this.zone.run(() => {
      });
    } else {
      console.log('1123')
     // this.showLoader = false;
      this.wizard3 = false;
      this.wizard1 = false;
      this.wizard4 = true;
      console.log(this.portfolioTokenWithValue)
      this.generatepublishChart2(this.portfolioTokenWithValue, 'create');
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
          this.existingToken.push({address: key.tokenAddress, value: key.value});
          this.selectedItems.push(temp);
          this.selectedTokens.push(key.Symbol);
          let tokenEth = this._web3.eth.contract(Constants.TokenAbi);
          let toeknContract = tokenEth.at(key.tokenAddress);
          toeknContract.balanceOf(sessionStorage.getItem('walletAddress'), (err, res) => {
            this.chartService.getUSDETHWAND(key.Symbol, (err, result) => {
              this.zone.run(() => {
                this.portfolio.push({
                  Symbol: key.Symbol,
                  CoinName: key.Symbol,
                  Reqbalance: key.value,
                  price: result['WAN'],
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
        this.displayGif = 'block';
        //this.showLoader = true;
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
      let web3Instance = this.WanWeb3Service._getWeb3();
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
            newTokens.push({value: (new BigNumber(key1).dividedBy(new BigNumber(10).pow(18))).toJSON(), address: key});
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
        //console.log(result);
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
    let web3Instance = this.WanWeb3Service._getWeb3();
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.address);
    newTokens.map((key, value) => {
      vsbContract.balanceOfToken(this.WanWeb3Service._getWeb3().eth.coinbase, key.address, (err, res) => {
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

  private trackCreatePortfolioTransaction(address) {
    if (this.orderBookRefreshTimer)
      clearTimeout(this.orderBookRefreshTimer);
    this._web3.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === '0x1') {
        //  console.log('transaction successful', res);
          let portEth = this._web3.eth.contract(Constants.createPortfolioWAN);
          let portContract = portEth.at(Constants.CretaeContractAddressWAN);
          this.initiateAutoRefresh(portContract);
        } else if (res.status === '0x0') {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
       //   console.log('transaction unsuccessful', res);
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.trackCreatePortfolioTransaction(address);
    }, 1000);
  }

  private initiateAutoRefresh(portContract) {
    let instructorEvent = portContract.Exchange({}, {fromBlock: 0, toBlock: 'latest'});
    instructorEvent.watch((error, result) => {
      if (result.transactionHash === this.txHash) {
        this.trackPortfolioCreate = true;
       // console.log('result', result);
        this.txHashSuccess = result;
        if (this.txHashSuccess.args._portfolio !== '0x') {
          this.walletService.setPortfolioAddress(result.args._portfolio);
          clearTimeout(this.orderBookRefreshTimer);
          setTimeout(() => {
            this.showLoader = false;
            this.displayGif = 'none';
            this.wizard2 = true;
          }, 12000);
        }
        this.zone.run(() => {
          instructorEvent.stopWatching();
        });
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
       //   console.log('check Array', this.existingToken, newTokens);
        //  console.log('check', _(this.existingToken).isEqual(newTokens));
          if (_(this.existingToken).isEqual(newTokens) === false) {
         //   console.log('res', res);
            let track = 0;
            newTokens.map((keys, value) => {
              this.existingToken.map((key) => {
                if (keys.address === key.address) {
                  if (parseFloat(keys.value) === parseFloat(key.value)) {
                  //  console.log('called track');
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
                  //      console.log('enabled time travel');
                      });
                    } else {
                      this.portfolioService.closeEditModal();
                      this.zone.run(() => {
                   //     console.log('enabled time travel');
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
                  //  console.log('enabled time travel');
                  });
                }
              }
            });
          } else {
        //    console.log('updated successfully');
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
               //   console.log('enabled time travel');
                });
              } else {
                this.zone.run(() => {
        //          console.log('enabled time travel');
                });
              }
            });
          }
        } else if (res.status === '0x0') {
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
      //    console.log('transaction unsuccessful', res);
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.trackTransaction(address, web3Instance, newTokens, data);
    }, 1000);
  }

  private trackPendindPortfolio(portfolio) {
    console.log('trackPendindPortfolio')
 //   let web3Instance = this.web3.getWeb3();
    let trackAsset = 0;
    let vsb = this._web3.eth.contract(Constants.VBPABIWAN);
    let vsbContract = vsb.at(portfolio.contractAddress);
    setTimeout(() => {
      console.log('map')
      portfolio.tokens.map((key) => {
        vsbContract.balanceOfToken(sessionStorage.getItem('walletAddress'), key.tokenAddress, (err, res) => {
          console.log(res.toString());
          if (!res) {
            return;
          } else {
        //  console.log('res', res.toString());
        //     let tokens = this.itemList.filter((token) => token.address.toLowerCase() === key.tokenAddress.toLowerCase());
        //   console.log('token',tokens);
           
            if (portfolio.tokens && portfolio.tokens.length) {
             console.log((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() !== key.value);
              if ((new BigNumber(res).dividedBy(new BigNumber(10).pow(18))).toJSON() !== key.value) {
                this.zone.run(() => {
                  this.walletService.setPortfolioAddress(portfolio.contractAddress);
                  this.portfolioService.setNewTokenValue(portfolio.tokens);
                  this.displayGif = 'none';
                  this.showLoader = false;
                  this.wizard1 = false;
                  this.wizard2 = true;
                  clearTimeout(this.orderBookRefreshTimer);
                console.log('tracking portfololio');
                });
              } else {
                console.log('else');
                
                trackAsset++;
                this.walletService.setPortfolioAddress(portfolio.contractAddress);
                if (trackAsset === portfolio.tokens.length) {
                  this.zone.run(() => {
                  console.log('go to publish');
                   this.showLoader = false;
                    this.wizard3 = false;
                    this.wizard1 = false;
                    this.wizard4 = true;
                    this.generatepublishChart1(portfolio, 'pending');
                  });
                }
              }
            }

          }
          ;
        });
      });
    }, 1500);

  }

  private tractPublish(address) {
    if (this.orderBookRefreshTimer)
      clearTimeout(this.orderBookRefreshTimer);
    this._web3.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === '0x1') {
          this.showLoader = false;
          clearTimeout(this.orderBookRefreshTimer);
          this.portfolioService.publishComplete();
          this.walletService.setNewPortfolioTokenWithValue(null);
          this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
          this.zone.run(() => {
          });
        } else if (res.status === '0x0') {
          this.showLoader = false;
          clearTimeout(this.orderBookRefreshTimer);
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
        }
      }
    });
    this.orderBookRefreshTimer = setTimeout(() => {
      this.tractPublish(address);
    }, 1000);
  }

  public tractButton() {
    console.log('tractButton', this.portfolioTokenWithValue);
    let assetLength = this.portfolioTokenWithValue.length;
    let i = 0;
    this.portfolioTokenWithValue.map((key) => {
     // if (key.status === true) {
        i++;
        if (i === assetLength) {
          console.log("I", i);
          
          console.log(assetLength);
          
          clearTimeout(this.despositRefreshTimer);
          this.trackDeposittAndPulish();
      //  }
      }
    });
  }
  generatepublishChart1(portfolio, status) {
   
    portfolio['tokens'].map((key, value) => {
      key.message = '';
      this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
        if (result) {
          let temp = {};
          temp['title'] = key['symbol'];
          temp['value'] = key['value'];
          this.totalQuanity = this.totalQuanity + parseFloat(key['value']);
          console.log('totalQuanity', this.totalQuanity);
          this.amChartPieData.push(temp);
          this.publishData.push(temp);
          console.log(value)
          console.log(portfolio['tokens'].length-1);
          if (value === portfolio['tokens'].length - 1) {
            console.log('called', this.amChartPieData);
            this.generatePieChart();
            setTimeout(()=>{
            this.publishData.map((key, value2) => {
              this.chartService.getUSDETHWAND(key.title, (err, res) => {
                key['alltoken'] = res;
               
              });
            });
          },3000)
          }
        }
      });
    });
    setTimeout(()=>{
    this.calculateTotal();
  },10000)
    console.log(this.publishData)
  }
  generatepublishChart2(portfolio, status) {
    console.log('else', portfolio);
      let pendingData = portfolio;
      let basket = pendingData.filter((basket) => basket.contractAddress === this.walletService.getPortfolioAddress());
      console.log('basket', basket);
      this.publishData = [];
      this.amChartPieData = [];
      this.totalQuanity = 0;
      portfolio.map((key, value) => {
        key.message = '';
        this.chartService.getUSDETHWAND(key.symbol, (err, result) => {
          if (result) {
            let temp = {};
            temp['title'] = key['symbol'];
            temp['value'] = key['value'];
            this.totalQuanity = this.totalQuanity + parseFloat(key['value']);
            console.log('totalQuanity', this.totalQuanity);
            this.publishData.push(temp);
            this.amChartPieData.push(temp);
            console.log(value)
            console.log(portfolio.length - 1);
            console.log(this.publishData);
            if (value === portfolio.length - 1) {
              console.log('called', this.amChartPieData);
              this.generatePieChart();
              setTimeout(()=>{
              this.publishData.map((key) => {
                console.log(key)
                console.log(key.title)
                this.chartService.getUSDETHWAND(key.title, (err, res) => {
                  console.log(res)
                  if (res) {
                    key['alltoken'] = res;
                    console.log(res)
                  }
                });
              });
            },3000)
            }
          }
        });
      });
     setTimeout(()=>{
    this.calculateTotal();
  },10000)
  console.log(this.publishData);
  
  }
  
  private calculateTotal() {
    console.log('calculate')
    //this.showLoader = false;
    //this.displayGif = 'none';
    this.overallUSD = 0;
    this.overallETH = 0;
    this.publishData = _.uniq(this.publishData, 'title');
    console.log(this.publishData)
    setTimeout(()=>{
      this.publishData.forEach(i=>{
        console.log(this.publishData.length,i)
        if (i.alltoken['WAN']) {
          console.log(i.alltoken['WAN'])
          this.overallETH = this.overallETH + i.alltoken['WAN'];
        }
        if (i.alltoken['USD']) {
          this.overallUSD = this.overallUSD + i.alltoken['USD'];
        }
        this.showdata = true;
        this.showLoader = false;
        this.displayGif = 'none';
      })
    },2000)
    
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
   // console.log('themeToken', themeToken, this.itemList);
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
           //   console.log('selectedItems token', this.selectedItems);
              this.portfolio.push({
                Symbol: k.itemName,
                CoinName: k.itemName,
                Reqbalance: 0,
                balance: k.balance,
                price: result['WAN'],
                priceUSD: result['USD'],
                decimals: k.decimals
              });
         //     console.log('selectedItems token', this.portfolio);
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
    //  console.log('err', err);
    });

  }
}
