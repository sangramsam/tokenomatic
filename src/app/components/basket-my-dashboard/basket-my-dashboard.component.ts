import { Component, OnInit, OnDestroy, NgZone } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { Http, RequestOptions, Headers } from "@angular/http";
import { DecimalPipe } from "@angular/common";
import * as _ from "underscore";
import {
  BuyablePortfolio,
  SellablePortfolio,
  Portfolio
} from "../../models/portfolio.model";
import {
  MessageModel,
  MessageType,
  MessageContentType
} from "../../models/message.model";
import { Quote } from "../../models/quote.model";
import { Constants } from "../../models/constants";
import { SwitchThemeService } from "../../services/switch-theme.service";
import { NavigationService } from "../../services/nav.service";
import { PortfolioService } from "../../services/portfolio.service";
import { WalletService } from "../../services/wallet.service";
import { Web3Service } from "../../services/web3.service";
import { NotificationManagerService } from "../../services/notification-manager.service";
import { TokenService } from "../../services/token.service";
import { TokenHistoryService } from "../../services/token-history.service";
import { PortfolioAssetsService } from "../../services/portfolio-assets.service";
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { AuthService } from "../../services/auth.service";
import { ChartService } from "../../services/chart.service";
import { JwtToken } from "../../models/token.model";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { CustomWalletService } from "../../services/custom-wallet.service";
import { UserService } from "../../services/user.service";
import { UserTokensService } from "../../services/user-tokens.service";
import { EthBasketService } from "../../services/eth-basket.service";
var Tx = require("ethereumjs-tx");
var txDecoder = require('ethereum-tx-decoder');
const electron = window.require("electron");
var shell = window.require("electron").shell;
declare var window: any;

@Component({
  selector: "app-my-basket-dashboard",
  templateUrl: "./basket-my-dashboard.component.html",
  styleUrls: ["./basket-my-dashboard.component.css"]
})
export class BasketMyDashboardComponent implements OnInit, OnDestroy {
  private userAccountChangeSubscription: Subscription;
  private savedWalletChangeSubscription: Subscription;
  visibleTab: string = "sell";
  Math: any;
  availableQuotes: Array<number> = [];
  userAccountValueInEther: number = 0;
  showSellablePortfolioQuotesModal: boolean = false;
  sellablePortfolioQuotes: Array<Quote> = new Array<Quote>();
  currentlySelectedSellablePortfolio: SellablePortfolio = undefined;
  showBuyLoader: boolean = false;
  showSellLoader: boolean = false;
  searchText: string = "";
  // 12th Feb changes
  shouldShowBuyPortfolioModal: boolean = false;
  editPortfolio: boolean = false; d
  selectedBuyAblePorfolio: any;
  /*need to declare interface*/
  toSymbols: Array<string> = ["ETH", "USD"];
  selectedBuyPorfolioIndex: number;
  amChartPie: AmChart;
  amChartPieOptions: Object = {};
  amChartPieData: Array<Object> = [];
  amChartPieLegendMap = {};
  amChartStock: AmChart;
  amChartStockOptions: Object = {};
  buycompletedtracking = undefined;
  stockTF: string = "DD";
  portFolioTimer: any;
  colorScheme = {
    domain: ["#ffedc6"]
  };
  themeColor = "#672482";
  darkTheme = "dark";
  backgroundColor = "#672482";
  color = "black";
  portfolioAmChartOptions: any = {};
  myBasketModal: boolean = false;
  trackLiquidateModal: boolean = false;
  insatantBuyModal: boolean = false;
  private getBasketTimer: any;
  subscription: Subscription;
  theme: any;
  public switchTheme;
  showModal: boolean = false;
  usd: any;
  renderChart: boolean = false;
  tradeDetails: any = [];
  private portfolioData: Subscription;
  private sellportfolioData: Subscription;
  private portfolioPendingData: Subscription;
  private portfolioActiveList: Subscription;
  private tokenContractChange: Subscription;
  private closeModal: Subscription;
  private changeTab: Subscription;
  private buycomplete: Subscription;
  private closeBuyPopup: Subscription;
  private tokenChangeSubscription: Subscription;
  newPortfolioData: any;
  allAvailableContracts: any;
  tempChartData: any;
  public portfolioDataFilered: Array<Object> = new Array<Object>();
  public portfolioDataFileredsellable: Array<Object> = new Array<Object>();
  public totalTokens: any;
  public selectedPortfolioToken: any;
  public userAddress: any;
  public portfolioPendingList: Array<Object> = new Array<Object>();
  public pendingTab = false;
  public cancelTab = false;
  public activeTab = "Active";
  public trackLocalStorageRender = false;
  public trackLocalStoragePendingRender = false;
  public trackLocalStorageCancelRender = false;
  public trackBuyButton = false;
  public trackLiquidateButton = false;
  public trackCancelModal = false;
  public selectCancelPortfolio: any;
  public estimateGas: any;
  public selectedBuyBasket: any;
  public shareModal: boolean = false;
  link: string;
  isCopied1: boolean = false;
  private authToken: any;
  public shell = shell;
  private tokenSubscription;
  private tokenSubscription1;
  public themedBasketRequest = [];
  public gasPrice: any;

  //New UI works

  public portfolioPendingLists = [];
  isResumeNotified: boolean = false;
  currentShowingPage: number = 1;
  selectedButton: number = 0;
  prevDisable: boolean = false;
  nextDisable: boolean = false;
  pages = [];
  num_of_pages: number = 0;
  currentPortfolioPending = {};
  //for active
  portfolioDataFileredsellables = [];
  currentActivePage: number = 1;
  selectedActiveButton: number = 0;
  prevActiveDisable: boolean = false;
  nextActiveDisable: boolean = false;
  activePages = [];
  num_of_active_pages: number = 0;
  currentPortfolioActive = {};
  // isResumeProcessing:boolean = false;
  isLiquidate: boolean = false;
  accountaddress: any = null;
  basketlength: number = 0;
  pendingBasket: any = [];
  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private zone: NgZone,
    readonly switchThemeService: SwitchThemeService,
    private navService: NavigationService,
    private walletService: WalletService,
    private web3: Web3Service,
    private route: ActivatedRoute,
    private notificationManager: NotificationManagerService,
    private tokenService: TokenService,
    private http: Http,
    private tokenHistoryService: TokenHistoryService,
    private portfolioAssetsService: PortfolioAssetsService,
    private AmCharts: AmChartsService,
    private chartService: ChartService,
    private userService: UserService,
    private wallet: CustomWalletService,
    private savedWalletsService: SavedWalletsService,
    private auth: AuthService,
    private UserTokensService: UserTokensService,
    public EthBasketService: EthBasketService
  ) {
    this.tradeDetails = [
      {
        "basketId": "1",
        "basketName": "ninjaBasket",
        "tokenName": "BAT",
        "tokenCount": "2",
        "tradeStatus": "Completed",
      },
      {
        "basketId": "-",
        "basketName": "-",
        "tokenName": "WAND",
        "tokenCount": "3",
        "tradeStatus": "Completed",
      },
      {
        "basketId": "3",
        "basketName": "MIxBas",
        "tokenName": "LPT",
        "tokenCount": "8",
        "tradeStatus": "Dumped",
      }
    ];
    //console.log('shell', shell);
    // this.pendingBasket = {
    //   name:"TestBas",
    //   creationStatus:"Completed",
    //   PublishStatus:"Dumped",
    //   tokenDetails:[
    //     {
    //       tokenName:"BAT",
    //       tradeStatus:"Completed",
    //       approvalStatus:"Completed",
    //       depositStatus:"Completed"
    //     },
    //     {
    //       tokenName:"ZRX",
    //       tradeStatus:"Completed",
    //       approvalStatus:"Completed",
    //       depositStatus:"Completed"
    //     },
    //     {
    //       tokenName:"WAND",
    //       tradeStatus:"Completed",
    //       approvalStatus:"Completed",
    //       depositStatus:"Completed"
    //     },
    //   ]
    // }
    this.subscription = this.switchThemeService
      .getThemePortfolio()
      .subscribe(message => {
        this.theme = message;
        if (this.theme.theme === false) {
          this.colorScheme = {
            domain: ["#000"]
          };
          this.themeColor = "#672482";
          this.darkTheme = "light";
          this.backgroundColor = "#672482";
          this.color = "black";
        } else {
          this.colorScheme = {
            domain: ["#ffedc6"]
          };
          this.darkTheme = "dark";
          this.themeColor = "#ffedc6";
          this.backgroundColor = "black";
          this.color = "#ffedc6";
        }
      });
    this.Math = Math;
    this.navService.setCurrentActiveTab("portfolios");
    this.portfolioData = this.portfolioService.portfolioData$.subscribe(data =>
      this.portfoliolist(data)
      //this.portfoliolistchange(data)
    );
    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(
      data => this.handleContractChange(data)
    );
    this.userAccountChangeSubscription = this.walletService.userAccountSummaryChange$.subscribe(
      data => this.handleUserAccountChange(data)
    );
    this.closeModal = this.portfolioService.closeModal$.subscribe(data =>
      this.closeEditModal(data)
    );
    this.changeTab = this.portfolioService.PublishComplete$.subscribe(data =>
      this.changeTabtoSell(data)
    );
    this.portfolioPendingData = this.portfolioService.PortfolioPendingData$.subscribe(
      data => this.portfolioPendingChange(data)
    );
    this.portfolioActiveList = this.portfolioService.portfolioActiveData$.subscribe(
      data => this.portfolioActiveChange(data)
    );
    this.buycomplete = this.portfolioService.buyComplete$.subscribe(data =>
      this.buycompleted(data)
    );
    this.closeBuyPopup = this.portfolioService.Closebuypopup$.subscribe(data =>
      this.buysubmited(data)
    );
    this.sellportfolioData = this.portfolioService.orderBookData$.subscribe(
      data => this.sellportfolioDataChange(data)
    );
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
    this.tokenChangeSubscription = this.tokenService.token$.subscribe(data =>
      this.handleTokenChange(data)
    );
    this.route.params.subscribe(params => {
      if (params["tab"]) {
        // changing to specific string for visibletab as this won't
        // affect any change in order in which tabs are listed
        if (params["tab"] === "buy") {
          this.setVisibleTab("buy");
        }
        if (params["tab"] === "sell") {
          this.setVisibleTab("sell");
        }
        if (params["tab"] === "order-history") {
          this.setVisibleTab("order-history");
        }
        if (params["tab"] === "createBashket") {
          this.setVisibleTab("create-portfolio");
        }
        if (params["tab"] === "wallet") {
          this.setVisibleTab("wallet");
        }
      } else {
        if (params["tab"] === "buy") {
          this.setVisibleTab("buy");
        }
      }
    });
    let meta = this;
    setTimeout(function () {
      meta.refreshGasPrice();
    }, 2000);
    this.EthBasketService.tradesWithoutBasketDetails$.subscribe(data => {
      if (data == null) {
        this.setTradeOnlyDetail([])
      }
      else {
        this.setTradeOnlyDetail(data)
      }
    });
  }

  ngOnInit() {
    this.showBuyLoader = true;
    this.showSellLoader = true;
    this.tokenHistoryService.loadTokenHistoryData();
    this.web3.initialize();
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if (d == "currentWalletChanged") {
          this.handleWalletChange();
          this.EthBasketService.tradesWithoutBasket(sessionStorage.getItem('walletAddress'));
        }
      }
    );
    let __this = this;
    this.chartService.setUSD(function (err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
    this.tempChartData = [
      {
        name: "name",
        series: [
          {
            value: 2,
            name: "01/04/2018"
          },
          {
            value: 5,
            name: "04/04/2018"
          },
          {
            value: 6,
            name: "05/04/2018"
          },
          {
            value: 7,
            name: "10/04/2018"
          },
          {
            value: 10,
            name: "12/04/2018"
          },
          {
            value: 15,
            name: "21/04/2018"
          }
        ]
      }
    ];
    setTimeout(() => {
      // this.tradeRecreation();
      this.EthBasketService.tradesWithoutBasket(sessionStorage.getItem('walletAddress'));
    }, 3000);
  }

  triggerNotify() {
    if (this.portfolioPendingLists[0]["canResume"] === 'resume') {
      // pendingPortfolio
      this.notificationManager.showNotification(
        new MessageModel(
          MessageType.Info,
          "Do not click on the 'Resume' button, unless you have seen your correct balances under the 'Wallet' tab"
        ),
        MessageContentType.Text
      );
    }
  }

  // triggerNotify() {
  //   this.notificationManager.showNotification(
  //     new MessageModel(
  //       MessageType.Info,
  //       "Do not click on the 'Resume' button, unless you have seen your correct balances under the 'Wallet' tab"
  //     ),
  //     MessageContentType.Text
  //   );
  // }
  handleTokenChange(data: JwtToken) {
    if (data === undefined) return;
    this.portfolioService.getList();
    this.portfolioService.getBasketList();
    this.EthBasketService.tradesWithoutBasket(sessionStorage.getItem('walletAddress'));
    this.timer();
  }

  ngOnDestroy(): void {
    //console.log('Destroying portfolioComponent');
    if (this.portFolioTimer) {
      clearTimeout(this.portFolioTimer);
    }
    if (this.getBasketTimer) {
      clearTimeout(this.getBasketTimer);
    }
    this.userAccountChangeSubscription.unsubscribe();
    this.tokenChangeSubscription.unsubscribe();
    this.portfolioData.unsubscribe();
    this.changeTab.unsubscribe();
    this.buycomplete.unsubscribe();
    this.closeBuyPopup.unsubscribe();
    this.portfolioActiveList.unsubscribe();
    this.portfolioPendingData.unsubscribe();
    this.tokenContractChange.unsubscribe();
    this.sellportfolioData.unsubscribe();
    this.tokenService.stopTokenService();
    this.savedWalletChangeSubscription.unsubscribe();
  }

  refreshGasPrice() {
    this.web3.getWeb3().eth.getGasPrice((err, gp) => {
      this.gasPrice = gp.c[0];
      //console.log("GasPrice", this.gasPrice);
    });
  }

  setVisibleTab(tabName: string) {
    if (this.portFolioTimer) {
      clearTimeout(this.portFolioTimer);
    }
    this.visibleTab = tabName;
  }

  isTabVisible(tabName: string): boolean {
    return this.visibleTab === tabName;
  }

  changeTabtoSell(tab) {
    if (tab) {
      if (tab === true) {
        this.setVisibleTab("sell");
        if (this.activeTab === "Pending") {
          this.trackLocalStorageRender = true;
          let contract = [localStorage.getItem("contractAddress")];
          this.activeTab = "Active";
          this.portfolioService.getList();
        } else {
          this.trackLocalStorageRender = true;
          this.portfolioService.getList();
        }
      }
    }
  }

  private refresh() {
    //console.log('refreshing basket...');
    this.portfolioService.getList();
    this.portfolioService.getBasketList();
    this.EthBasketService.tradesWithoutBasket(sessionStorage.getItem('walletAddress'));
  }

  search(data) {
    //console.log('data', data);
    this.searchText = data;
    if (this.searchText.length === 0) {
      this.portfolioDataFilered = this.portfolioService.getBuyAblePortfolios();
    } else {
      this.portfolioDataFilered = _.filter(
        this.portfolioService.getBuyAblePortfolios(),
        buyAblePortfolio => {
          /*if (buyAblePortfolio['name'].toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0) {
          return true;
        }*/
          if (
            _.any(buyAblePortfolio["tokens"], asset => {
              return (
                asset["symbol"]
                  .toUpperCase()
                  .indexOf(this.searchText.toUpperCase()) >= 0
              );
            })
          ) {
            return true;
          }
          return false;
        }
      );
    }
  }

  hideSaleQuotesModal() {
    this.sellablePortfolioQuotes = new Array<Quote>();
    this.currentlySelectedSellablePortfolio = undefined;
    this.showSellablePortfolioQuotesModal = false;
  }

  handleUserAccountChange(data: any) {
    if (data === undefined) return;
    let balances = data.Balances;
    for (var i = 0; i < balances.length; i++) {
      if (balances[i]["Symbol"] === "ETH") {
        this.userAccountValueInEther = parseFloat(
          parseFloat(balances[i]["Balance"]).toFixed(6)
        );
        break;
      }
    }
  }

  // Changes for 12th Feb Impl
  showBuyPortfolioModal(index: number, selectedBuyPorfolio, flag) {
    if (this.isLiquidate) {
      this.isLiquidate = false;
      return;
    }
    if (flag === "myBasket") {
      this.myBasketModal = true;
    } else {
      this.myBasketModal = false;
    }
    console.log('got data', selectedBuyPorfolio);
    this.shouldShowBuyPortfolioModal = true;
    this.selectedBuyPorfolioIndex = index;
    /* for quote verification */
    if (selectedBuyPorfolio.currentOwner === this.web3.getWeb3().eth.coinbase && selectedBuyPorfolio.basketPublishStatus === "confirmed") {
      this.trackBuyButton = false;
      this.trackLiquidateButton = true;
    } else if (selectedBuyPorfolio.currentOwner != this.web3.getWeb3().eth.coinbase && selectedBuyPorfolio.basketPublishStatus === "confirmed") {
      this.trackBuyButton = true;
      this.trackLiquidateButton = false;
    }
    this.selectedBuyAblePorfolio = {
      portfolio: selectedBuyPorfolio,
      filteredAssets: [],
      totalVolume: 0,
      twenty4Volume: 0,
      twenty4High: 0,
      twenty4Low: 0,
      totalTokens: 0,
      symbolsMap: {},
      currentTokenPrices: {}
    };
    this.amChartPieData = [];
    this.totalTokens = 0;
    let filteredAssets = selectedBuyPorfolio["tokens"].filter(function (it, i) {
      return parseFloat(it.amount) != 0;
    });
    selectedBuyPorfolio["tokens"].map(key => {
      this.totalTokens += key.amount;
      //console.log("token", this.totalTokens, key.amount, parseInt(key.amount));
    });
    this.selectedBuyAblePorfolio.totalTokens = this.totalTokens;
    this.selectedBuyAblePorfolio.filteredAssets = filteredAssets;
    this.formatAssetInformation();
    this.updatePieChart();
    this.updateAssetPrices();
  }

  formatAssetInformation() {
    // we create totals and asset map and format data for pie chart
    let totalTokens = 0;
    let useThemeColor = false;
    //console.log("formatAssetInformation", this.selectedBuyAblePorfolio);

    if (this.selectedBuyAblePorfolio.filteredAssets.length == 1)
      useThemeColor = true;
    this.selectedBuyAblePorfolio.filteredAssets.forEach((it, i) => {
      this.selectedBuyAblePorfolio.symbolsMap[it.tokenSymbol] = it;
      this.selectedBuyAblePorfolio.totalTokens += it.amount;
      let data = {
        symbol: it.tokenSymbol,
        tokenName: it.tokenSymbol,
        tokenQty: it.amount
      };
      if (useThemeColor) data["color"] = this.themeColor;
      this.amChartPieData.push(data);
    });
  }

  updatePieChart() {
    this.amChartPieOptions = {
      type: "pie",
      theme: this.darkTheme,
      dataProvider: [],
      titleField: "tokenName",
      valueField: "tokenQty",
      colorField: this.color,
      labelRadius: 0,
      balloon: {
        fixedPosition: true
      },
      innerRadius: "60%",
      export: {
        enabled: true
      },
      autoMargins: false,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      pullOutRadius: 0
    };

    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart(
        "piechartdiv",
        this.amChartPieOptions
      );
      this.AmCharts.updateChart(this.amChartPie, () => {
        // Change whatever properties you want
        this.amChartPie.dataProvider = this.amChartPieData;
        // get the colors for legend
        if (this.amChartPieData.length == 1) {
          let symbol = this.amChartPieData[0]["symbol"];
          this.amChartPieLegendMap[symbol] = this.themeColor;
          if (this.switchThemeService.getCuurentTheme) {
          } else {
            this.amChartPieLegendMap[symbol] = this.themeColor;
          }
        } else {
          this.amChartPieData.forEach((it, i) => {
            let symbol = it["symbol"];
            this.amChartPieLegendMap[symbol] = this.amChartPie.colors[i];
          });
        }
      });
    }, 100);
  }

  updateAssetPrices() {
    if (!Object.keys(this.selectedBuyAblePorfolio.symbolsMap).length) return;
    let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
    this.portfolioAssetsService
      .getMultiCurrent(this.toSymbols.join(","), symbolList.join(","))
      .subscribe(res => this.updateMultiCurrent(res));
    this.portfolioAssetsService
      .getMultiTwenty4(symbolList)
      .subscribe(res => this.updateTwenty4Assets(res));
    this.setStockTF(this.stockTF);
  }

  updateMultiCurrent(data) {
    this.selectedBuyAblePorfolio.currentTokenPrices = data;
  }

  updateTwenty4Assets(data) {
    if (data.length) {
      let totalVolume = 0;
      let totalHigh = 0;
      let totalLow = 0;
      let totalTokens = 0;
      let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
      data.forEach((it, i) => {
        if (this.selectedBuyAblePorfolio.symbolsMap[it.tokenid]) {
          let asset = this.selectedBuyAblePorfolio.symbolsMap[it.tokenid];
          let ohclv = it.ohclv;
          totalVolume += asset.Reqbalance * ohclv.volumeto;
          totalHigh += asset.Reqbalance * ohclv.high;
          totalLow += asset.Reqbalance * ohclv.low;
        }
      });
      if (this.selectedBuyAblePorfolio.totalTokens)
        this.selectedBuyAblePorfolio.totalVolume =
          totalVolume / this.selectedBuyAblePorfolio.totalTokens;
      this.selectedBuyAblePorfolio.twenty4Volume = totalVolume;
      this.selectedBuyAblePorfolio.twenty4High =
        totalHigh / this.selectedBuyAblePorfolio.totalTokens;
      this.selectedBuyAblePorfolio.twenty4Low =
        totalLow / this.selectedBuyAblePorfolio.totalTokens;
    }
  }

  updateStockChart(dataList) {
    this.amChartStockOptions = {
      type: "stock",
      theme: this.darkTheme,
      dataSets: [],
      autoMargins: false,
      panels: [
        {
          showCategoryAxis: false,
          title: "Value",
          recalculateToPercents: false,
          percentHeight: 50,
          stockGraphs: [
            {
              id: "g1",
              valueField: "value",
              comparable: true,
              fillColors: "red",
              compareField: "value",
              balloonText: "[[title]]:<b>[[value]]</b>",
              compareGraphBalloonText: "[[title]]:<b>[[value]]</b>",
              type: "line"
            }
          ],
          stockLegend: {
            periodValueTextComparing: "[[percents.value.close]]%",
            periodValueTextRegular: "[[value.close]]"
          }
        }
      ],
      chartScrollbarSettings: {
        enabled: true,
        backgroundColor: this.backgroundColor,
        backgroundAlpha: 1,
        fontSize: 15,
        color: this.color,
        graph: "g1"
      },
      chartCursorSettings: {
        valueBalloonsEnabled: false,
        fullWidth: true,
        cursorAlpha: 0.1,
        valueLineBalloonEnabled: true,
        valueLineEnabled: true,
        valueLineAlpha: 0.5
      }
    };
    this.amChartStock = this.AmCharts.makeChart(
      "stockchartdiv",
      this.amChartStockOptions
    );
    let dataSets = [];
    let portfolioProvider = new Array(dataList[0].ohclvList.length);
    dataList.forEach((it, i) => {
      let dataProvider = [];
      var symbolsMap = this.selectedBuyAblePorfolio.symbolsMap;
      it.ohclvList.forEach((jt, j) => {
        dataProvider.push({
          date: new Date(jt.time * 1000),
          value: jt.close
        });
        if (!portfolioProvider[j]) {
          portfolioProvider[j] = {
            date: new Date(jt.time * 1000),
            value: 0
          };
        }
        // taking percent value of the coin
        portfolioProvider[j]["value"] +=
          (jt.close * symbolsMap[it["tokenid"]].Reqbalance) /
          this.selectedBuyAblePorfolio.totalTokens;
      });
      dataSets.push({
        title: it.tokenid,
        fieldMappings: [
          {
            fromField: "value",
            toField: "value"
          }
        ],
        categoryField: "date",
        dataProvider: dataProvider,
        compared: true
      });
    });
    // make precision
    portfolioProvider.forEach((it, i) => {
      it.value = parseFloat(it.value.toFixed(6));
    });
    dataSets.push({
      title: this.selectedBuyAblePorfolio.portfolio.PortfolioName,
      fieldMappings: [
        {
          fromField: "value",
          toField: "value"
        }
      ],
      categoryField: "date",
      dataProvider: portfolioProvider,
      color: "#672482",
      compared: true
    });
    this.AmCharts.updateChart(this.amChartStock, () => {
      this.amChartStock.dataSets = dataSets;
      this.amChartStock.categoryAxesSettings.minPeriod = this.stockTF;
    });
  }

  setStockTF(stockTF: string) {
    this.stockTF = stockTF;
    let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
    if (this.stockTF == "mm") {
      this.portfolioAssetsService
        .getHistoMinute(symbolList)
        .subscribe(res => this.updateStockChart(res));
    } else if (this.stockTF == "hh") {
      this.portfolioAssetsService
        .getHistoHour(symbolList)
        .subscribe(res => this.updateStockChart(res));
    }
    if (this.stockTF == "DD") {
      this.portfolioAssetsService
        .getHistoDay(symbolList)
        .subscribe(res => this.updateStockChart(res));
    }
  }

  isStockTF(stockTF: string) {
    return this.stockTF === stockTF;
  }

  getAssetValue(asset, type) {
    if (!Object.keys(this.selectedBuyAblePorfolio.currentTokenPrices).length)
      return 0;
    let fromPrice = this.selectedBuyAblePorfolio.currentTokenPrices[
      asset.tokenSymbol
    ];
    if (!fromPrice) return 0;
    return parseFloat(asset.amount) * fromPrice[type];
  }

  getTotalPorfolioValue(type) {
    //  console.log('getTotalPorfolioValue',this.selectedBuyAblePorfolio);

    let total = 0;
    if (!Object.keys(this.selectedBuyAblePorfolio.currentTokenPrices).length)
      return 0;
    this.selectedBuyAblePorfolio.filteredAssets.forEach((it, i) => {
      let fromPrice = this.selectedBuyAblePorfolio.currentTokenPrices[
        it.tokenSymbol
      ];
      if (fromPrice) total += parseFloat(it.amount) * fromPrice[type];
    });
    return total;
  }

  getTotalAssetBalance() {
    if (!this.selectedBuyAblePorfolio.totalTokens) return 0;
    if (this.selectedBuyAblePorfolio.totalTokens == 1) return "1 Token";
    return this.selectedBuyAblePorfolio.totalTokens + " Tokens";
  }

  getPieLegendColor(symbol) {
    if (this.amChartPieLegendMap && this.amChartPieLegendMap[symbol])
      return this.amChartPieLegendMap[symbol];
    return "white";
  }

  hideBuyPorfolioModal() {
    this.shouldShowBuyPortfolioModal = false;
    this.amChartPieLegendMap = {};
    if (this.amChartPie) {
      this.AmCharts.destroyChart(this.amChartPie);
      this.amChartPie = null;
    }
    // need to unsubscribe from observables
  }

  getPortfolioChartData(portfolio): any {
    //  console.log("chart",portfolio)
    let tokenHistoryData = this.tokenHistoryService.getTokenHistoryData();
    let data = new Array<Array<number>>(portfolio.tokens.length);
    for (let i = 0; i < portfolio.tokens.length; i++) {
      data[i] = new Array<number>(7);
      for (let j = 0; j < tokenHistoryData.length; j++) {
        if (
          portfolio.tokens[i].tokenSymbol.toLowerCase() ===
          tokenHistoryData[j].fromsymbol.toLowerCase()
        ) {
          data[i] = tokenHistoryData[j].data.map(
            x => x.close * Number(portfolio.tokens[i].amount)
          );
          break;
        }
      }
    }
    console.log("data", data);

    let chartData = {};
    chartData["name"] = portfolio.basketName;
    chartData["series"] = new Array<any>(7);
    var today = new Date();
    today.setDate(today.getDate() - 7);
    for (let i = 0; i < 7; i++) {
      today.setDate(today.getDate() + 1);
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        sum += isNaN(data[j][i]) ? 0 : data[j][i];
      }
      chartData["series"][i] = {
        value: sum,
        name: today.toLocaleDateString()
      };
    }
    return [chartData];
  }

  // onToggleChange(){
  //   this.switchThemeService.changeGraphColor(!this.switchTheme);
  // }

  getAddressUrl() {
    return Constants.AddressAppnetURL;
  }

  etherscanAddressDetails(ethAddress) {
    shell.openExternal(this.getAddressUrl() + ethAddress);
  }
  portfoliolist(data) {
    if (data != null) {
      if (this.accountaddress == null || this.accountaddress != sessionStorage.getItem('walletAddress')) {
        this.accountaddress = sessionStorage.getItem('walletAddress');
        this.basketlength = data.length;
        this.portfoliolistchange(data);
      }
      else {
        if (this.basketlength != data.length) {
          this.basketlength = data.length;
          this.portfoliolistchange(data);
        }
      }
    }
    else {
      this.portfolioDataFilered = [];
    }
  }
  portfoliolistchange(data) {

    console.log('portfoliolistchange');

    this.zone.run(() => {
      //console.log("length", data);
      if (data != null) {
        //console.log("length", data.length);
        if (data.length > 0) {
          this.portfolioDataFilered = data.slice(0, 3);
          // console.log('portfolioDataFilered', this.portfolioDataFilered);
          this.portfolioDataFilered.map((key, value) => {
            if (key["tokens"]) {
              key["tokens"].map(key2 => {
                if (key2.tokenSymbol != undefined && key2.amount != undefined) {
                  key["ChartData"] = this.getPortfolioChartData(key);
                  //console.log('chart', key["ChartData"]);

                  setTimeout(() => {
                    this.renderChart = true;
                  }, 3000);
                }
              });
            }
          });
          this.showBuyLoader = false;
        } else if (data.length === 0) {
          this.portfolioDataFilered = [];
          this.zone.run(() => {
            this.showBuyLoader = false;
          });
        }
      } else {
        this.portfolioDataFilered = [];
      }
    });
  }

  handleContractChange(data) {
    if (data) {
      this.allAvailableContracts = data;
    }
  }

  buy(buyAblePortfolio) {
    this.selectedBuyBasket = buyAblePortfolio;
    buyAblePortfolio['buystatus'] = true;
    this.portfolioService.buyPortfolio(buyAblePortfolio);
    localStorage.setItem(
      "buyContractAddress",
      buyAblePortfolio.contractAddress
    );
    localStorage.setItem("buyContract", buyAblePortfolio);
    this.closeInstantbuyModal();
    this.shouldShowBuyPortfolioModal = false;
  }

  editPortfoliomodal(portfolio) {
    let temp = {};
    temp["flag"] = "update";
    temp["portfolio"] = portfolio;
    this.setVisibleTab("create-portfolio");
    this.portfolioService.updatePorfolio(temp);
  }

  updatePendingPortfolio(portfolio) {
    //this.editPortfolio = true;
    let temp = {};
    temp["flag"] = "pending";
    temp["portfolio"] = portfolio;
    this.setVisibleTab("create-portfolio");
    this.portfolioService.updatePorfolio(temp);
  }

  newPortfolio() {
    if (this.portFolioTimer) {
      clearTimeout(this.portFolioTimer);
    }
    this.portfolioService.updatePorfolio(null);
  }

  getOrderHistory() {
    if (this.portFolioTimer) {
      clearTimeout(this.portFolioTimer);
    }
    this.portfolioService.getList();
  }

  closeEditPortfoliomodal() {
    //this.editPortfolio = false;
    // this.portfolioService.updatePorfolio(portfolio)
  }

  closeEditModal(flag) {
    if (flag === true) {
      this.editPortfolio = false;
    }
  }

  liquidate(portfolio) {
    this.closeLiquidateModal();
    this.shouldShowBuyPortfolioModal = false;
    this.portfolioService.liquidate_contract = portfolio.basketContract;
    portfolio["liquidatestatus"] = true;
    this.notificationManager.showNotification(
      new MessageModel(
        MessageType.Info,
        "Basket liquidation initiated, please DO NOT CLOSE THE DESKTOP-APP, until it gets confirmed"
      ),
      MessageContentType.Text
    );
    let web3Instance = this.web3.getWeb3();
    let portEth = web3Instance.eth.contract(Constants.VBPABI);
    let portContract = portEth.at(portfolio.basketContract);
    let currentWallet = this.savedWalletsService.getCurrentWallet();
    var privateKey = currentWallet.getPrivateKeyHex();
    //console.log("be", privateKey);
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    //var count = web3Instance.eth.getTransactionCount(sessionStorage.getItem("walletAddress"));
    //console.log("af", privateKey);
    web3Instance.eth.getTransactionCount(
      sessionStorage.getItem("walletAddress"),
      (err, res) => {
        var data = portContract.liquidate.getData({
          from: sessionStorage.getItem("walletAddress")
        });
        //console.log("data", data, portfolio);
        const txParams = {
          gasPrice: this.gasPrice,
          gasLimit: 400000,
          to: portfolio.basketContract,
          data: data,
          from: sessionStorage.getItem("walletAddress"),
          // value: portfolio.basketPrice*1000000000000000000,
          chainId: Constants.Chainid,
          Txtype: 0x01,
          nonce: res
        };
        //console.log("txparams", txParams);
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        web3Instance.eth.sendRawTransaction(
          "0x" + serializedTx.toString("hex"),
          (err, hash) => {
            if (err) {
              // this.displayGif='none';
              //console.log("919", err);
              this.portfolioService.liquidate_contract = null;
              this.notificationManager.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "Transaction is not submitted"
                ),
                MessageContentType.Text
              );
            } else {
              //console.log(hash);
              this.portfolioService.liquidate_contract =
                portfolio.basketContract;
              this.liquidatecheck(hash, portfolio);
              //  this.trackBuyTransaction(hash, web3Instance,portfolio);
            }
          }
        );
      }
    );
    this.refreshGasPrice();
    // portContract.liquidate((err, res) => {
    //   //console.log('res', res);
    //   if (res) {
    //     this.trackLiquidateModal = false;
    //     this.notificationManager.showNotification(
    //       new MessageModel(
    //         MessageType.Info,
    //         "Liquidating is in progress, please wait."
    //       ),
    //       MessageContentType.Text
    //     );
    //     setTimeout(() => {
    //       this.portfolioDataFileredsellable = _.without(
    //         this.portfolioService.getSellAblePortfolios(),
    //         _.findWhere(this.portfolioService.getSellAblePortfolios(), {
    //           contractAddress: portfolio.contractAddress
    //         })
    //       );
    //     }, 3000);
    //     this.portfolioService.setSellAblePortfolios(
    //       this.portfolioDataFileredsellable
    //     );
    //     this.zone.run(() => {
    //       //console.log('modal close');
    //     });
    //   } else {
    //     this.notificationManager.showNotification(
    //       new MessageModel(MessageType.Error, "Transaction not submitted"),
    //       MessageContentType.Text
    //     );
    //   }
    // });
  }

  liquidatecheck(hash, portfolio) {
    //console.log('liquidate')
    let web3Instance = this.web3.getWeb3();
    web3Instance.eth.getTransactionReceipt(hash, (err, hash1) => {
      //  console.log(hash1)
      if (hash1 === null) {
        this.liquidatecheck(hash, portfolio);
      } else {
        if (hash1["status"] == 0x0) {
          this.portfolioService.liquidate_contract = null;
          this.notificationManager.showNotification(
            new MessageModel(MessageType.Error, "Transaction not submitted"),
            MessageContentType.Text
          );
        } else {
          this.trackLiquidateModal = false;
          this.notificationManager.showNotification(
            new MessageModel(
              MessageType.Info,
              "Basket liquidation completed successfully! You can checkout your new tokens under the 'Wallet' tab."
            ),
            MessageContentType.Text
          );
          let data = {
            basketContract: portfolio.basketContract,
            liquidated: "yes"
          };
          this.http
            .post(Constants.ethBasketUrl + "updateLiquidationStatus", data)
            .subscribe(
              res => {
                setTimeout(() => {
                  this.portfolioService.liquidate_contract = null;
                }, 10000);
                //console.log(res);
              },
              err => { }
            );
          setTimeout(() => {
            this.portfolioDataFileredsellable = _.without(
              this.portfolioService.getSellAblePortfolios(),
              _.findWhere(this.portfolioService.getSellAblePortfolios(), {
                contractAddress: portfolio.contractAddress
              })
            );
          }, 3000);
          this.portfolioService.setSellAblePortfolios(
            this.portfolioDataFileredsellable
          );
          this.zone.run(() => {
            //console.log('modal close');
          });
        }
      }
    });
  }
  CancelPortfolio(portfolio) {
    this.closeCancelModal();
    let webInstance = this.web3.getWeb3();
    let portEth = webInstance.eth.contract(Constants.VBPABI);
    let portContract = portEth.at(portfolio.contractAddress);
    portContract.cancelPortfolio((err, res) => {
      //console.log('res', res);
      this.notificationManager.showNotification(
        new MessageModel(
          MessageType.Alert,
          "cancel Portfolio is in progress, please wait."
        ),
        MessageContentType.Text
      );
      this.portfolioDataFileredsellable = _.without(
        this.portfolioService.getSellAblePortfolios(),
        _.findWhere(this.portfolioService.getSellAblePortfolios(), {
          contractAddress: portfolio.contractAddress
        })
      );
      this.portfolioService.setSellAblePortfolios(
        this.portfolioDataFileredsellable
      );
      this.zone.run(() => {
        ////console.log('modal close');
      });
    });
  }

  liquidateModal(portfolio) {
    //console.log("liquidateModal", portfolio);

    this.userAddress = this.web3.getWeb3().eth.accounts[0];
    this.trackLiquidateModal = true;
    this.selectedPortfolioToken = portfolio;
  }

  closeLiquidateModal() {
    this.trackLiquidateModal = false;
  }

  closeCancelModal() {
    this.trackCancelModal = false;
  }

  pendingPortfolio(flag) {
    if (flag === "Pending") {
      this.activeTab = "Pending";
      this.pendingTab = true;
      this.showBuyLoader = true;
      this.trackBuyButton = false;
      this.trackLiquidateButton = false;
      if (this.portfolioService.getPendingPortfolio()) {
        this.portfolioPendingLists = this.portfolioService.getPendingPortfolio();
        console.log(this.portfolioPendingLists);

        if (this.portfolioPendingLists.length > 0 && !this.isResumeNotified) {
          this.isResumeNotified = true;
          this.triggerNotify();
        }
        this.portfolioService.getList();
        this.showBuyLoader = false;
        this.setPagePFP();
      } else {
        this.showBuyLoader = false;
        this.portfolioService.getList();
        this.setPagePFP();
      }
    } else if (flag === "Active") {
      this.showBuyLoader = true;
      this.activeTab = "Active";
      this.pendingTab = false;
      this.trackBuyButton = false;
      if (this.portfolioService.getSellAblePortfolios()) {
        this.portfolioDataFileredsellables = this.portfolioService.getSellAblePortfolios();
        this.portfolioService.getList();
        this.setPagePFA();
        this.showBuyLoader = false;
      } else {
        this.showBuyLoader = false;
        this.portfolioService.getList();
        this.setPagePFA();
      }
      /*if (!data) {
        this.showBuyLoader = true;
        this.portfolioService.getList();
      } else if (data.length > 0) {
        const temp1 = data;
        const temp = this.portfolioService.getOrderbookPortfolio();
        this.portfolioDataFileredsellable = temp1.concat(temp);
        this.showBuyLoader = false;
        this.portfolioService.getList();
      } else if (data.length === 0) {
        if (this.portfolioService.getOrderbookPortfolio().length > 0) {
          this.portfolioDataFileredsellable = this.portfolioService.getOrderbookPortfolio();
        } else {
          this.portfolioDataFileredsellable = [];
        }
        this.showBuyLoader = false;
      }*/
    } else {
      this.activeTab = "quick-buy";
    }
  }

  portfolioPendingChange(data) {

    console.log(data);

    if (data) {
      if (data.length > 0 && data[0].basket['currentOwner'] == sessionStorage.getItem("walletAddress").toLowerCase()) {
        this.portfolioPendingLists = data;
        console.log('pendingbasket', this.portfolioPendingLists);
        //  var decodedTx = txDecoder.decodeTx(this.portfolioPendingLists[0].betters[0].approval_sign);
        //  console.log(decodedTx);


        if (this.portfolioPendingLists.length > 0 && !this.isResumeNotified) {
          this.isResumeNotified = true;
          this.triggerNotify();
        }
        this.portfolioService.setPendingPortfolio(data);
        this.showBuyLoader = false;
        this.setPagePFP();
      } else {
        this.portfolioPendingLists = [];
        this.showBuyLoader = false;
        if (this.portfolioService.isResumeProcessing) {
          this.triggerPublishNotify();
        }
        this.setPagePFP();
      }
    }
  }

  triggerPublishNotify() {
    this.portfolioService.isResumeProcessing = false;
    this.notificationManager.removeNotification();
    this.notificationManager.showNotification(
      new MessageModel(
        MessageType.Info,
        "Your basket has been published successfully! You can click on 'Active' tab to view it"
      ),
      MessageContentType.Text
    );
  }

  portfolioActiveChange(data) {
    if (data) {
      if (data.length > 0) {
        const temp1 = data;
        this.portfolioService.setSellAblePortfolios(data);
        // const temp = this.portfolioService.getOrderbookPortfolio();
        this.portfolioDataFileredsellables = temp1;
        this.showBuyLoader = false;
      } else {
        // if (this.portfolioService.getOrderbookPortfolio().length > 0) {
        //   this.portfolioDataFileredsellables = this.portfolioService.getOrderbookPortfolio();
        // } else {
        this.portfolioDataFileredsellables = [];
        // }
        this.showBuyLoader = false;
      }
    }
  }

  buycompleted(data) {
    if (data === true) {
      //this.buycompletedtracking = 1;
      // if (this.buycompletedtracking === 1) {
      //   this.notificationManager.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
      //   this.buycompletedtracking = undefined;
      // }
      if (localStorage.getItem("buyContractAddress")) {
        this.portfolioDataFilered = _.without(
          this.portfolioService.getBuyAblePortfolios(),
          _.findWhere(this.portfolioService.getBuyAblePortfolios(), {
            contractAddress: localStorage.getItem("buyContractAddress")
          })
        );
        this.portfolioService.setBuyAblePortfolios(this.portfolioDataFilered);
        localStorage.setItem(
          "portfolio",
          JSON.stringify(this.portfolioDataFilered)
        );
        if (this.selectedBuyBasket) {
          this.portfolioDataFileredsellable.unshift(this.selectedBuyBasket);
          this.portfolioService.setSellAblePortfolios(
            this.portfolioDataFileredsellable
          );
        }
      }
    }
  }

  buysubmited(data) {
    if (data === true) {
      this.zone.run(() => {
        this.closeInstantbuyModal();
      });
    }
  }

  sellportfolioDataChange(data) {
    if (data) {
      if (data.length > 0) {
        //console.log('buy', data);
      }
    }
  }

  openIntanseBuyModal(portfolio) {
    this.insatantBuyModal = true;
    this.userAddress = this.web3.getWeb3().eth.accounts[0];
    this.selectedPortfolioToken = portfolio;
  }

  closeInstantbuyModal() {
    this.insatantBuyModal = false;
  }

  openShareModal(contractAddress) {
    this.shareModal = true;
    this.link = this.getAddressUrl() + contractAddress;
  }

  closeShareModal() {
    this.shareModal = false;
    this.isCopied1 = false;
    this.link = undefined;
  }

  timer() {
    if (this.getBasketTimer) clearTimeout(this.getBasketTimer);
    this.refresh();
    this.getBasketTimer = setTimeout(() => {
      this.timer();
    }, 10000);
  }

  guestLogin() {
    //console.log('Logging in as guest');
    var date = new Date();
    var date2 = new Date(date);
    date2.setHours(date.getHours() + 10);
    sessionStorage.setItem("expires_at", date2.getTime().toString());
    sessionStorage.setItem("email", "guest@wandx.co");
    sessionStorage.setItem("name", "guest");
    localStorage.removeItem("portfolio");
    localStorage.removeItem("buy");
    this.userService.registerUserUsingSession();
  }

  handleWalletChange() {
    var wallet = this.savedWalletsService.getCurrentWallet();
    if (!wallet || wallet.exchange !== sessionStorage.getItem("exchange"))
      return;
    this.wallet.setWallet(wallet);
    this.web3.setDefaultAccount();
    sessionStorage.setItem("walletType", "1");
    this.guestLogin();
    this.userService.userRegistrationStatus$.subscribe(data => {
      this.tokenService.fetchToken();
      if (this.tokenSubscription1) {
        this.tokenSubscription1.unsubscribe();
      }
      this.tokenSubscription1 = this.tokenService.token$.subscribe(token => {
        if (token && this.authToken != token) {
          this.authToken = token;
          this.portfolioService.getList();
          this.portfolioService.getBasketList();
          this.EthBasketService.tradesWithoutBasket(sessionStorage.getItem('walletAddress'));
        }
      });
    });
  }
  getThemedBasket() {
    this.portfolioService.getrequestPortfolio().then(
      res => {
        //console.log('res', res['data']);
        this.themedBasketRequest = res["data"];
      },
      err => {
        this.themedBasketRequest = [];
      }
    );
  }

  previousPage() {
    let meta = this;

    if (meta.prevDisable || meta.currentShowingPage < 2) {
      return;
    }

    meta.currentShowingPage--;
    meta.selectedButton = (meta.currentShowingPage - 1) * 5;

    if (meta.currentShowingPage < 2) {
      meta.prevDisable = true;
    }
    // if(meta.currentShowingPage >= meta.num_of_pages){
    meta.nextDisable = false;
    // }
    meta.portfolioPendingSelect(meta.selectedButton);
  }

  setPagePFP() {
    //set page for portfolio pending
    let meta = this;
    if (meta.pages.length > 0) {
      return;
    }
    meta.pages = [];
    meta.num_of_pages = 0;
    let newPage = meta.portfolioPendingLists.length % 5;
    meta.num_of_pages = (meta.portfolioPendingLists.length - newPage) / 5;

    if (newPage != 0) {
      meta.num_of_pages = meta.num_of_pages + 1;
    }
    if (meta.num_of_pages == 0) {
      meta.nextDisable = true;
      meta.prevDisable = true;
      return;
    }

    if (meta.currentShowingPage > 1) {
      return;
    }

    meta.currentPortfolioPending = meta.portfolioPendingLists[0];

    for (let i = 1; i <= meta.num_of_pages; i++) {
      meta.pages.push(i);
    }

    if (meta.currentShowingPage == 1) {
      meta.prevDisable = true;
    }

    if (meta.currentShowingPage == meta.num_of_pages) {
      meta.nextDisable = true;
    }
  }

  nextPage() {
    let meta = this;

    if (meta.nextDisable || meta.currentShowingPage + 1 > meta.num_of_pages) {
      return;
    }
    meta.currentShowingPage++;
    meta.selectedButton = (meta.currentShowingPage - 1) * 5;
    meta.prevDisable = false;
    if (meta.currentShowingPage == meta.num_of_pages) {
      meta.nextDisable = true;
    }
    meta.portfolioPendingSelect(meta.selectedButton);
  }

  portfolioPendingSelect(index) {
    let meta = this;
    meta.currentPortfolioPending = meta.portfolioPendingLists[index];
    //console.log(meta.currentPortfolioPending);
    // meta.currentPortfolioPending = sellAblePortfolio;
  }

  portfolioActiveSelect(index) {
    let meta = this;
    meta.currentPortfolioActive = meta.portfolioDataFileredsellables[index];
  }

  previousActivePage() {
    let meta = this;

    if (meta.prevActiveDisable || meta.currentActivePage < 2) {
      return;
    }

    meta.currentActivePage--;
    meta.selectedActiveButton = (meta.currentActivePage - 1) * 5;

    if (meta.currentActivePage < 2) {
      meta.prevActiveDisable = true;
    }
    // if(meta.currentShowingPage >= meta.num_of_pages){
    meta.nextActiveDisable = false;
    // }
    meta.portfolioActiveSelect(meta.selectedActiveButton);
  }

  setPagePFA() {
    //set page for portfolio Active
    let meta = this;
    if (meta.activePages.length > 0) {
      return;
    }
    meta.activePages = [];
    meta.num_of_active_pages = 0;
    let newPage = meta.portfolioDataFileredsellables.length % 5;
    meta.num_of_active_pages =
      (meta.portfolioDataFileredsellables.length - newPage) / 5;

    if (newPage != 0) {
      meta.num_of_active_pages = meta.num_of_active_pages + 1;
    }
    if (meta.num_of_active_pages == 0) {
      meta.nextActiveDisable = true;
      meta.prevActiveDisable = true;
      return;
    }

    if (meta.currentActivePage > 1) {
      return;
    }

    meta.currentPortfolioActive = meta.portfolioDataFileredsellables[0];

    for (let i = 1; i <= meta.num_of_active_pages; i++) {
      meta.activePages.push(i);
    }

    if (meta.currentActivePage == 1) {
      meta.prevActiveDisable = true;
    }

    if (meta.currentActivePage == meta.num_of_active_pages) {
      meta.nextActiveDisable = true;
    }
  }

  nextActivePage() {
    let meta = this;

    if (
      meta.nextActiveDisable ||
      meta.currentActivePage + 1 > meta.num_of_active_pages
    ) {
      return;
    }
    meta.currentActivePage++;
    meta.selectedActiveButton = (meta.currentActivePage - 1) * 5;
    meta.prevActiveDisable = false;
    if (meta.currentActivePage == meta.num_of_active_pages) {
      meta.nextActiveDisable = true;
    }
    meta.portfolioActiveSelect(meta.selectedActiveButton);
  }

  // resume(contractAddress, basketCreationHash, basketID) {
  //   let meta = this;
  //   meta.portfolioService.resumedataUpdate(
  //     contractAddress,
  //     basketCreationHash,
  //     basketID
  //   );
  //   meta.notificationManager.showNotification(
  //     new MessageModel(
  //       MessageType.Error,
  //       "PLEASE WAIT AND DO NOT SWITCH TO ANY OTHER TAB UNTIL YOU ARE REDIRECTED BACK TO 'MY TOKEN BASKETS' TAB, TO COMPLETE THE BASKET RESUME"
  //     ),
  //     MessageContentType.Text
  //   );
  //   meta.portfolioService.isResumeProcessing = true;
  //   meta.setVisibleTab("create-portfolio");
  //   meta.newPortfolio();
  // }

  private resume(contractAddress, basketCreationHash, basketID, tokens, tokenlength) {
    this.shouldShowBuyPortfolioModal = false;
    this.portfolioService.basketid = basketID;
    this.EthBasketService.initiateAutoRefreshresume(
      contractAddress,
      basketCreationHash,
      basketID,
      this.savedWalletsService.getCurrentWallet().getPrivateKeyHex(),
      tokens,
      tokenlength
    );

    // let currentWallet = this.savedWalletsService.getCurrentWallet();
    // this.walletService.setPortfolioAddress(contractAddress);
    // this.walletService.setPortfolioTransactionhash(basketCreationHash);
    // this.EthBasketService.tokenauthorization(
    //   currentWallet.getPrivateKeyHex(),'block'
    // );
    // setTimeout(() => {
    //   this.EthBasketService.authorize_start(basketID);
    // }, 12000);
  }
  basketrecreation(basketdata) {
    this.EthBasketService.createbasket(basketdata, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex(), 0);
  }
  authdeposit(portfolioPendingLists) {
    this.EthBasketService.authorizationbasket(portfolioPendingLists, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex());
  }

  authevm(betterdata) {
    this.EthBasketService.authtokenevm(betterdata, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex())
  }

  depositevm(betterdata) {
    this.EthBasketService.deposittokenevm(betterdata, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex())
  }
  publishbasket(portfolioPendingLists) {
    this.EthBasketService.publishtoken(portfolioPendingLists, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex(), 0)
  }

  tradeRecreation(tradeDetail) {
    // let sign = "0xf8b10e85051f4d5c0083030d4094abe1e210f2c97ae4bc7b17f8daa2e8db993337f587016d9deb332000b844f39b5b9b00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000001713bc388641ca00346db1bcfdc337a6a6bf4ec18a7cd77708a9993fe2b12e55c9e864efc687a12a01df11f10e1b39549aa2e56f26a43b76d8ada0b9ce755a8f15bea2250de9d2cc8"
    this.EthBasketService.updateTradeSign(tradeDetail, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex());
  }

  tradeAndBasketCreation() {
    this.EthBasketService.tradeAndBasketCreation(this.portfolioPendingLists[0], this.savedWalletsService.getCurrentWallet().getPrivateKeyHex())
  }
  tradeAndBasketCreationevm(symbol) {
    this.portfolioPendingLists[0].trades.forEach(element => {
      if (element.buyToken == symbol && element.status == "EVMRevert") {


        this.EthBasketService.updateTradeSign(element, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex());
      }

    });
  }
  tradeAndBasketCreationsent(symbol) {
    this.portfolioPendingLists[0].trades.forEach(element => {
      if (element.buyToken == symbol && element.status == "sent") {
        console.log(element);
        this.EthBasketService.updateTradeSign(element, this.savedWalletsService.getCurrentWallet().getPrivateKeyHex());
      }

    });
  }
  setTradeOnlyDetail(data) {
    console.log("traderdetail", data)
    this.tradeDetails = data;
  }
  insufficient(symbol, tradedata) {
    tradedata.forEach(element => {
      if (symbol == element.buyToken) {
        this.EthBasketService.insufficientbalance(element.sign, 'trade');
      }

    });
  }
  routeBackToMyTokenBasket(tabName) {
    this.setVisibleTab(tabName);
    this.pendingPortfolio("Pending");
  }
}