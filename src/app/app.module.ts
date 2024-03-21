import { BrowserModule, Title } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { SelectDropDownModule } from "ngx-select-dropdown";

import { RouterModule, Routes } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MainContentComponent } from "./components/main-content/main-content.component";
import { HeaderComponent } from "./components/header/header.component";
import { ExchangeComponent } from "./components/exchange/exchange.component";
import { WalletInfoComponent } from "./components/wallet-info/wallet-info.component";
import { ExchangeOrderbookSidepaneComponent } from "./components/exchange-orderbook-sidepane/exchange-orderbook-sidepane.component";
import { ExchangeGraphComponent } from "./components/exchange-graph/exchange-graph.component";
import { ExchangeTradehistorySidepaneComponent } from "./components/exchange-tradehistory-sidepane/exchange-tradehistory-sidepane.component";
import { TabsComponent } from "./components/tabs/tabs.component";
import { ExchangeDepositewithdrawComponent } from "./components/exchange-depositewithdraw/exchange-depositewithdraw.component";
import { ExchangeOrderhistoryComponent } from "./components/exchange-orderhistory/exchange-orderhistory.component";
import { ExchangeOpenordersComponent } from "./components/exchange-openorders/exchange-openorders.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { ScrollToModule } from "ng2-scroll-to-el";
// import { ClipboardModule } from "ngx-clipboard";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown/angular2-multiselect-dropdown";

import { AppRoutingModule } from "./app-routing.module";
import { PortfolioGraphComponent } from "./components/portfolio-graph/portfolio-graph.component";
import { PortfolioBreakdownComponent } from "./components/portfolio-breakdown/portfolio-breakdown.component";
import { DashboardWalletComponent } from "./components/dashboard-wallet/dashboard-wallet.component";
import { DashboardDepositewithdrawComponent } from "./components/dashboard-depositewithdraw/dashboard-depositewithdraw.component";
import { DashboardQuicktradeComponent } from "./components/dashboard-quicktrade/dashboard-quicktrade.component";
import { DashboardRecentactivityComponent } from "./components/dashboard-recentactivity/dashboard-recentactivity.component";

// import {SlimScroll} from 'angular4-slimscroll';
import {
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatInputModule,
  MatDialogModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSnackBarModule,
  MatOptionModule
} from "@angular/material";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthService } from "./services/auth.service";
import { Web3Service } from "./services/web3.service";
import { AionWeb3Service } from "./services/aion-web3.service";
import { AuthGuard } from "./services/auth-guard";
import { ConfigService } from "./services/config.service";
import { NavigationService } from "./services/nav.service";
import { PortfolioService } from "./services/portfolio.service";
import { UserService } from "./services/user.service";
import { WalletService } from "./services/wallet.service";
import { NotificationManagerService } from "./services/notification-manager.service";
import { OrdersService } from "./services/orders.service";
import { PlatformTokenService } from "./services/platform-token.service";
import { ChartService } from "./services/chart.service";
import { TokenHistoryService } from "./services/token-history.service";
import { PortfolioAssetsService } from "./services/portfolio-assets.service";
import { SwitchThemeService } from "./services/switch-theme.service";
import { SwitchGraphService } from "./services/switch-graph.service";
import { TokenService } from "./services/token.service";
import { CustomWalletService } from "./services/custom-wallet.service";
import { TransactionService } from "./services/transaction.service";
import { InfuraNetworkService } from "./services/infura-network.service";
import {
  NgxChartsModule,
  AreaChartModule
} from "@swimlane/ngx-charts/release/index.js";
import { QRCodeModule } from "angular2-qrcode";
import { SavedWalletsService } from "./services/saved-wallets.service";
import { EthExchangeService } from "./services/eth-exchange.service";
import { NeotokenService } from "./services/neotoken.service";
import { NeoService } from "./services/neo.service";

import { AwsService } from "./services/aws.service";
import { UpdatebasketqueueService } from "./services/updatebasketqueue.service";
import { SimpleNotificationsModule } from "angular2-notifications";
import { WalletsManagerComponent } from "./components/wallets-manager/wallets-manager.component";
import { WalletCreateComponent } from "./components/wallet-create/wallet-create.component";
import { WalletDetailComponent } from "./components/wallet-detail/wallet-detail.component";
import { WalletTokensComponent } from "./components/wallet-tokens/wallet-tokens.component";
import { WalletJsonComponent } from "./components/wallet-json/wallet-json.component";
import { WalletPrivatekeyComponent } from "./components/wallet-privatekey/wallet-privatekey.component";
import { ExchangeWalletSelectComponent } from "./components/exchange-wallet-select/exchange-wallet-select.component";
import { ExchangeWalletBuyComponent } from "./components/exchange-wallet-buy/exchange-wallet-buy.component";
import { ExchangeWalletSellComponent } from "./components/exchange-wallet-sell/exchange-wallet-sell.component";
import { ExchangePlatformTokenSelectComponent } from "./components/exchange-platform-token-select/exchange-platform-token-select.component";
import { DetailChartComponent } from "./components/detail-chart/detail-chart.component";
import { AdvancedChartComponent } from "./components/advanced-chart/advanced-chart.component";
import { UiSwitchModule } from "ngx-ui-switch";
import { TransactionConfirmDialogComponent } from "./components/transaction-confirm-dialog/transaction-confirm-dialog.component";
import { SignatureConfirmDialogComponent } from "./components/signature-confirm-dialog/signature-confirm-dialog.component";
import { BasketComponent } from "./components/basket/basket.component";
import { BasketDashboardComponent } from "./components/basket-dashboard/basket-dashboard.component";
import { BasketMyDashboardComponent } from "./components/basket-my-dashboard/basket-my-dashboard.component";
import { BasketNewComponent } from "./components/basket-new/basket-new.component";
import { BasketWalletComponent } from "./components/basket-wallet/basket-wallet.component";
import { BasketOrderComponent } from "./components/basket-order/basket-order.component";
import { BasketAuthorizeTokenComponent } from "./components/basket-authorize-token/basket-authorize-token.component";
import { ExchangeOpenordersNeoComponent } from "./components/exchange-openorders-neo/exchange-openorders-neo.component";
import { ExchangeOrderbookSidepaneNeoComponent } from "./components/exchange-orderbook-sidepane-neo/exchange-orderbook-sidepane-neo.component";
import { ExchangeDepositewithdrawNeoComponent } from "./components/exchange-depositewithdraw-neo/exchange-depositewithdraw-neo.component";
import { ExchangeOrderhistoryNeoComponent } from "./components/exchange-orderhistory-neo/exchange-orderhistory-neo.component";
import { ExchangeTradehistorySidepaneNeoComponent } from "./components/exchange-tradehistory-sidepane-neo/exchange-tradehistory-sidepane-neo.component";
import { ExchangeWalletBuyNeoComponent } from "./components/exchange-wallet-buy-neo/exchange-wallet-buy-neo.component";
import { ExchangeWalletSellNeoComponent } from "./components/exchange-wallet-sell-neo/exchange-wallet-sell-neo.component";
import { ExchangePlatformTokenSelectNeoComponent } from "./components/exchange-platform-token-select-neo/exchange-platform-token-select-neo.component";
import { ExchangeEthComponent } from "./components/exchange-eth/exchange-eth.component";
import { ExchangeNeoComponent } from "./components/exchange-neo/exchange-neo.component";
import { MarketBroadcastService } from "./services/market-broadcast.service";
import { BasketNeoComponent } from "./components/basket-neo/basket-neo.component";
import { NeoBasketNewComponent } from "./components/neo-basket-new/neo-basket-new.component";
import { BasketContainerComponent } from "./components/basket-container/basket-container.component";
import { FirsttimeComponent } from "./components/firsttime/firsttime.component";
import { LoadingSpinnerComponent } from "./components/loading-spinner/loading-spinner.component";
import { ExchangeWalletSelectInlineComponent } from "./components/exchange-wallet-select-inline/exchange-wallet-select-inline.component";
import { NeoStakeComponent } from "./components/neo-stake/neo-stake.component";
import { StakeContainerComponent } from "./components/stake-container/stake-container.component";
import { AirdropComponent } from "./components/airdrop/airdrop.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { ProfileContainerComponent } from "./components/profile-container/profile-container.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { MailingListComponent } from "./components/mailing-list/mailing-list.component";
import { TermsOfServiceComponent } from "./components/terms-of-service/terms-of-service.component";
import { MiniViewComponent } from "./components/mini-view/mini-view.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { DashboadAnouncementsComponent } from "./components/dashboad-anouncements/dashboad-anouncements.component";

import { BasketAionComponent } from "./components/basket-aion/basket-aion.component";
import { AionwalletComponent } from "./components/aionwallet/aionwallet.component";
import { BasketNewaionComponent } from "./components/basket-newaion/basket-newaion.component";
import { AionAuthorizeComponent } from "./components/aion-authorize/aion-authorize.component";
import { ExchangeAionComponent } from "./components/exchange-aion/exchange-aion.component";
import { ExchangeDepositewithdrawAionComponent } from "./components/exchange-depositewithdraw-aion/exchange-depositewithdraw-aion.component";
import { ExchangeOpenordersAionComponent } from "./components/exchange-openorders-aion/exchange-openorders-aion.component";
import { ExchangeOrderbookSidepaneAionComponent } from "./components/exchange-orderbook-sidepane-aion/exchange-orderbook-sidepane-aion.component";
import { ExchangeOrderhistoryAionComponent } from "./components/exchange-orderhistory-aion/exchange-orderhistory-aion.component";
import { ExchangePlatformTokenSelectAionComponent } from "./components/exchange-platform-token-select-aion/exchange-platform-token-select-aion.component";
import { ExchangeTradehistorySidepaneAionComponent } from "./components/exchange-tradehistory-sidepane-aion/exchange-tradehistory-sidepane-aion.component";
import { ExchangeWalletBuyAionComponent } from "./components/exchange-wallet-buy-aion/exchange-wallet-buy-aion.component";
import { ExchangeWalletSellAionComponent } from "./components/exchange-wallet-sell-aion/exchange-wallet-sell-aion.component";
import { BasketOrderAionComponent } from "./components/basket-order-aion/basket-order-aion.component";
import { NewDashboardComponent } from "./components/new-dashboard/new-dashboard.component";
import { ScriptHackComponent } from "./components/script-hack/script-hack.component";

import { NgxPaginationModule } from "ngx-pagination";
import { EllipsisModule } from "ngx-ellipsis";
import { DashboardService } from "./services/dashboard.service";
import { SwiperModule } from "ngx-useful-swiper";
import { AmplifyService } from "aws-amplify-angular";

import { BasketWanComponent } from "./components/basket-wan/basket-wan.component";
import { BasketWalletWanComponent } from "./components/basket-wallet-wan/basket-wallet-wan.component";
import { BasketNewWanComponent } from "./components/basket-new-wan/basket-new-wan.component";
import { BasketOrderWanComponent } from "./components/basket-order-wan/basket-order-wan.component";
import { BasketAuthorizeTokenWanComponent } from "./components/basket-authorize-token-wan/basket-authorize-token-wan.component";

import { ExchangeWanComponent } from "./components/exchange-wan/exchange-wan.component";
import { ExchangeDepositewithdrawWanComponent } from "./components/exchange-depositewithdraw-wan/exchange-depositewithdraw-wan.component";
import { ExchangeOpenordersWanComponent } from "./components/exchange-openorders-wan/exchange-openorders-wan.component";
import { ExchangeOrderbookSidepaneWanComponent } from "./components/exchange-orderbook-sidepane-wan/exchange-orderbook-sidepane-wan.component";
import { ExchangeOrderhistoryWanComponent } from "./components/exchange-orderhistory-wan/exchange-orderhistory-wan.component";
import { ExchangePlatformTokenSelectWanComponent } from "./components/exchange-platform-token-select-wan/exchange-platform-token-select-wan.component";
import { ExchangeTradehistorySidepaneWanComponent } from "./components/exchange-tradehistory-sidepane-wan/exchange-tradehistory-sidepane-wan.component";
import { ExchangeWalletBuyWanComponent } from "./components/exchange-wallet-buy-wan/exchange-wallet-buy-wan.component";
import { ExchangeWalletSellWanComponent } from "./components/exchange-wallet-sell-wan/exchange-wallet-sell-wan.component";
import { StakeSolutionComponent } from "./components/stake-solution/stake-solution.component";
import { LivepeerStakingComponent } from "./components/livepeer-staking/livepeer-staking.component";
import { TezosStakingComponent } from "./components/tezos-staking/tezos-staking.component";
import { TokenTradingComponent } from "./components/token-trading/token-trading.component";
import { WanWeb3Service } from "./services/wan-web3.service";
import { WanExchangeService } from "./services/wan-exchange.service";
import { TokenWanService } from "./services/token-wan.service";
import { UserWanService } from "./services/user-wan.service";
import { PortfolioWanService } from "./services/portfolio-wan.service";
import { WalletWanService } from "./services/wallet-wan.service";
import { PlatformTokenWanService } from "./services/platform-token-wan.service";
import { OrdersWanService } from "./services/orders-wan.service";
import { OrderAionService } from "./services/order-aion.service";
import { PlatformAionTokenService } from "./services/platform-aion-token.service";
import { WalletAionService } from "./services/wallet-aion.service";
import { PortfolioAionService } from "./services/portfolio-aion.service";
import { UserAionService } from "./services/user-aion.service";
import { TokenAionService } from "./services/token-aion.service";
import { AionExchangeService } from "./services/aion-exchange.service";
import { UniswapServiceService } from "./services/uniswap-service.service";
import { ZrxServiceService } from "./services/0x-service.service";
import { EthBasketService } from "./services/eth-basket.service";
import { UserTokensService } from "./services/user-tokens.service";

export function get_settings(configService: ConfigService) {
  return () => configService.getSettings();
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    MainContentComponent,
    HeaderComponent,
    ExchangeComponent,
    WalletInfoComponent,
    ExchangeOrderbookSidepaneComponent,
    ExchangeGraphComponent,
    ExchangeTradehistorySidepaneComponent,
    TabsComponent,
    ExchangeDepositewithdrawComponent,
    ExchangeOrderhistoryComponent,
    ExchangeOpenordersComponent,
    DashboardComponent,
    PortfolioGraphComponent,
    PortfolioBreakdownComponent,
    DashboardWalletComponent,
    DashboardDepositewithdrawComponent,
    DashboardQuicktradeComponent,
    DashboardRecentactivityComponent,
    // SlimScroll,
    WalletsManagerComponent,
    WalletCreateComponent,
    WalletDetailComponent,
    WalletTokensComponent,
    WalletJsonComponent,
    WalletPrivatekeyComponent,
    ExchangeWalletSelectComponent,
    ExchangeWalletBuyComponent,
    ExchangeWalletSellComponent,
    ExchangePlatformTokenSelectComponent,
    DetailChartComponent,
    AdvancedChartComponent,
    TransactionConfirmDialogComponent,
    SignatureConfirmDialogComponent,
    BasketComponent,
    BasketNewComponent,
    BasketWalletComponent,
    BasketOrderComponent,
    BasketAuthorizeTokenComponent,
    ExchangeDepositewithdrawNeoComponent,
    ExchangeOrderhistoryNeoComponent,
    ExchangeTradehistorySidepaneNeoComponent,
    ExchangeWalletBuyNeoComponent,
    ExchangeWalletSellNeoComponent,
    ExchangePlatformTokenSelectNeoComponent,
    ExchangeEthComponent,
    ExchangeNeoComponent,
    ExchangeOpenordersNeoComponent,
    ExchangeOrderbookSidepaneNeoComponent,
    BasketNeoComponent,
    NeoBasketNewComponent,
    BasketContainerComponent,
    FirsttimeComponent,
    LoadingSpinnerComponent,
    ExchangeWalletSelectInlineComponent,
    NeoStakeComponent,
    StakeContainerComponent,
    AirdropComponent,
    UserProfileComponent,
    ProfileContainerComponent,
    BasketNewaionComponent,
    AionAuthorizeComponent,
    LoginComponent,
    RegisterComponent,
    MailingListComponent,
    TermsOfServiceComponent,
    MiniViewComponent,
    ForgotPasswordComponent,
    DashboadAnouncementsComponent,
    BasketMyDashboardComponent,
    BasketWanComponent,
    BasketWalletWanComponent,
    BasketNewWanComponent,
    BasketOrderWanComponent,
    BasketAuthorizeTokenWanComponent,
    ExchangeWanComponent,
    ExchangeDepositewithdrawWanComponent,
    ExchangeOpenordersWanComponent,
    ExchangeOrderbookSidepaneWanComponent,
    ExchangeOrderhistoryWanComponent,
    ExchangePlatformTokenSelectWanComponent,
    ExchangeTradehistorySidepaneWanComponent,
    ExchangeWalletBuyWanComponent,
    ExchangeWalletSellWanComponent,
    BasketDashboardComponent,
    BasketAionComponent,
    AionwalletComponent,
    BasketNewaionComponent,
    AionAuthorizeComponent,
    ExchangeAionComponent,
    ExchangeDepositewithdrawAionComponent,
    ExchangeOpenordersAionComponent,
    ExchangeOrderbookSidepaneAionComponent,
    ExchangeOrderhistoryAionComponent,
    ExchangePlatformTokenSelectAionComponent,
    ExchangeTradehistorySidepaneAionComponent,
    ExchangeWalletBuyAionComponent,
    ExchangeWalletSellAionComponent,
    BasketOrderAionComponent,
    StakeSolutionComponent,
    LivepeerStakingComponent,
    TezosStakingComponent,
    TokenTradingComponent,
    NewDashboardComponent,
    ScriptHackComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    MatDialogModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    QRCodeModule,
    UiSwitchModule.forRoot({
      size: "small",
      color: "rgb(0, 189, 99)",
      switchColor: "#80FFA2",
      defaultBgColor: "#00ACFF",
      defaultBoColor: "#476EFF",
      checkedLabel: "on",
      uncheckedLabel: "off"
    }),
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    MatSnackBarModule,
    MatOptionModule,
    MatIconModule,
    NgxChartsModule,
    AreaChartModule,
    MatDialogModule,
    MatTooltipModule,
    AmChartsModule,
    SimpleNotificationsModule.forRoot(),
    ScrollToModule.forRoot(),
    // ClipboardModule,
    AngularMultiSelectModule,
    NgxPaginationModule,
    EllipsisModule,
    SwiperModule,
    SelectDropDownModule,
    MatStepperModule
  ],
  providers: [
    AionWeb3Service,
    WanWeb3Service,
    Web3Service,
    AuthGuard,
    NotificationManagerService,
    NavigationService,
    PortfolioService,
    UserService,
    WalletService,
    OrdersService,
    TokenService,
    PlatformTokenService,
    Title,
    ChartService,
    TokenHistoryService,
    PortfolioAssetsService,
    AuthService,
    AuthGuard,
    SwitchThemeService,
    SwitchGraphService,
    CustomWalletService,
    TransactionService,
    InfuraNetworkService,
    SavedWalletsService,
    EthExchangeService,
    MarketBroadcastService,
    NeotokenService,
    NeoService,
    AmplifyService,
    AwsService,
    ConfigService,
    UpdatebasketqueueService,
    DashboardService,
    WanExchangeService,
    TokenWanService,
    UserWanService,
    PortfolioWanService,
    WalletWanService,
    PlatformTokenWanService,
    OrdersWanService,
    OrderAionService,
    PlatformAionTokenService,
    WalletAionService,
    PortfolioAionService,
    UserAionService,
    TokenAionService,
    AionExchangeService,
    UniswapServiceService,
    ZrxServiceService,
    EthBasketService,
    UserTokensService,
    {
      provide: APP_INITIALIZER,
      useFactory: get_settings,
      deps: [ConfigService],
      multi: true
    }
  ],
  entryComponents: [
    TransactionConfirmDialogComponent,
    SignatureConfirmDialogComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
