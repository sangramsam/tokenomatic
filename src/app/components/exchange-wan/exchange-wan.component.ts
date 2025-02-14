import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Constants} from '../../models/constants';
//import {PlatformTokenService} from '../../services/platform-token.service';
//import {Web3Service} from '../../services/web3.service';
//import {UserService} from '../../services/user.service';
//import {TokenService} from '../../services/token.service';
//import {EthExchangeService} from '../../services/eth-exchange.service';


import {PrivateKeyWallet} from '../wallets/privatewallet';
import {CustomWalletService} from '../../services/custom-wallet.service';

import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import { WanExchangeService } from '../../services/wan-exchange.service';
import { PlatformTokenWanService } from '../../services/platform-token-wan.service';
import { TokenWanService } from '../../services/token-wan.service';
import { UserWanService } from '../../services/user-wan.service';
import { WanWeb3Service } from '../../services/wan-web3.service';

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);

  export function convertToBigNumber(amount: any);
}

declare namespace tradingViewFunctions {
  export function initialize(data: string);

  export function changeSymbol(data: string);
}
@Component({
  selector: 'app-exchange-wan',
  templateUrl: './exchange-wan.component.html',
  styleUrls: ['./exchange-wan.component.css']
})
export class ExchangeWanComponent implements OnInit {
  public password = '';
  private authToken: any;
  public selectedWalletTab: string = 'depositewithdraw';
  public selectedOrdersTab: string = 'openorders';
  public markets = [{name: 'WAN', symbol : 'WAN'}];
  public selectedMarket= this.markets[0];
  public selectedPlatformToken: any;
  private savedWalletsServiceSub : any;
  private marketBroadcastServiceSub : any;
  private tokenSubscription;

  constructor(private platformTokenService: PlatformTokenWanService,
              private userService: UserWanService,
              private wallet: CustomWalletService,
              private tokenService: TokenWanService,
              private web3: WanWeb3Service,
              private marketBroadcastService: MarketBroadcastService,
              private exchangeService: WanExchangeService,
              private savedWalletsService: SavedWalletsService) {

    this.handleMarketSelect = this.handleMarketSelect.bind(this);
    this.handleWalletChange = this.handleWalletChange.bind(this);
    this.setWalletTab = this.setWalletTab.bind(this);
    this.setOrderTab = this.setOrderTab.bind(this);



  }

  handleMarketSelect() {
    this.marketBroadcastService.setSelectedMarket(this.selectedMarket);
  }

  guestLogin() {
   // console.log('Logging in as guest');
    var date = new Date();
    var date2 = new Date(date);
    date2.setHours(date.getHours() + 10);
    sessionStorage.setItem('expires_at', date2.getTime().toString());
    sessionStorage.setItem('email', 'guest@wandx.co');
    sessionStorage.setItem('name', 'guest');
    localStorage.removeItem('portfolio');
    localStorage.removeItem('buy');
    this.userService.registerUserUsingSession();

  }

  handleWalletChange() {
    var wallet = this.savedWalletsService.getCurrentWallet();
   // console.log(wallet)
    if (!wallet || wallet.exchange != 'wan')
      return;
    this.wallet.setWallet(wallet);
    this.web3.setDefaultAccount();
    sessionStorage.setItem('walletType', '1');
    this.tokenService.stopTokenService();
    this.guestLogin();
    this.userService.userRegistrationStatus$.subscribe(data => {
      this.tokenService.fetchToken();
      if (this.tokenSubscription) {
        this.tokenSubscription.unsubscribe()
      }
      this.tokenSubscription = this.tokenService.token$.subscribe((token) => {
        if (token && this.authToken != token) {
          this.authToken = token;
          this.getPlatformTokens();
          this.exchangeService.completeRefresh();

        }
      });
    });
  }

  getPlatformTokens() {
    this.platformTokenService.getPlatformTokens();
  }

  ngOnInit(): void {
    // Need to move all this into wallet component
    //this.web3.initialize();
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.tokenService.stopTokenService()
        this.handleWalletChange();
        this.handleMarketSelect()
      }
    });
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken();
    });
    this.handleMarketSelect()

  }

  ngOnDestroy(): void {
    // Need to stop web3 calls
    this.tokenService.stopTokenService()
    this.savedWalletsServiceSub.unsubscribe()
    this.marketBroadcastServiceSub.unsubscribe()
  }

  setWalletTab(tab) {
    this.selectedWalletTab = tab;
  }

  setOrderTab(tab) {
    this.selectedOrdersTab = tab;
  }

}

