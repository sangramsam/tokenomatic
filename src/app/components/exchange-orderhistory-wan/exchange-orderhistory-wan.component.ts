import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {PlatformToken} from '../../models/platform-tokens';
import {Constants} from '../../models/constants';
//import {TokenService} from '../../services/token.service';
//import {PlatformTokenService} from '../../services/platform-token.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {UserOrders} from '../../models/order.model';
import {Subscription} from 'rxjs/Subscription';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service';
//import {EthExchangeService} from '../../services/eth-exchange.service';
import { WanExchangeService } from '../../services/wan-exchange.service';
import { TokenWanService } from '../../services/token-wan.service';
import { PlatformTokenWanService } from '../../services/platform-token-wan.service';


@Component({
  selector: 'app-exchange-orderhistory-wan',
  templateUrl: './exchange-orderhistory-wan.component.html',
  styleUrls: ['./exchange-orderhistory-wan.component.css']
})
export class ExchangeOrderhistoryWanComponent implements OnInit {

  showSpinner: boolean = true;

	private orderBookRefreshTimer: any;
  private selectedPlatformToken : PlatformToken;
  private allUserOrders: UserOrders = new UserOrders();
  private tokenRenewalSubscription: Subscription;
  public orders : Array<any>
  private refreshTimer : any;
  private marketBroadcastServiceSub : any;
  private tokenServiceSub : any;
  private savedWalletsServiceSub : any;
  private forceRefreshSub : any;
  constructor(
    private platformTokenService: PlatformTokenWanService,
    private http: Http,
    private notificationService: NotificationManagerService,
    private tokenService: TokenWanService,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
    private exchangeService : WanExchangeService
  ) {
    this.getUserOrders = this.getUserOrders.bind(this)
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        if (!this.tokenService.getToken()) {
          if (this.tokenServiceSub) {
            this.tokenServiceSub.unsubscribe()
          }
          this.tokenServiceSub = this.tokenService.token$.subscribe((data) => {
            if (data) {
              this.tokenServiceSub.unsubscribe()
              this.refresh()
              this.initiateAutoRefresh()
            }
          })
        } else {
          this.refresh()
          this.initiateAutoRefresh()
        }
      }
    })
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.orders = []
        this.showSpinner = true
        this.refresh()
        this.initiateAutoRefresh()
      }
    })
    this.forceRefreshSub = this.exchangeService.forceRefresh$.subscribe(() => {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = 0
      this.refresh()
      this.initiateAutoRefresh()
    })
  }
  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe()
    this.savedWalletsServiceSub.unsubscribe()
    this.forceRefreshSub.unsubscribe()
  }

  private initiateAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refresh();
      this.initiateAutoRefresh();
    }, 30000);
  }

  private refresh() {
    if (this.tokenService.getToken()) {
      this.getUserOrders();
    }
  }

  getUserOrders() {
    if (!this.selectedPlatformToken)
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURLWAN + 'order/user/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        this.allUserOrders = data.json();
        console.log(this.allUserOrders)
        var buyOrders = this.allUserOrders.BuyOrders.map((it) => {
       //   console.log(it)
          return {
            volume : it.BuyingVolume,
            TargetVolume : it.TargetVolume,
            Status : it.Status,
            type : 'Buy'
          }
        })
        var sellOrders = this.allUserOrders.SellOrders.map((it) => {
      //    console.log(it)
          return {
            volume : it.SellingVolume,
            TargetVolume : it.TargetVolume,
            Status : it.Status,
            type : 'Sell'
          }
        })
      //  console.log(buyOrders)
        buyOrders = buyOrders.concat(sellOrders)
        buyOrders = buyOrders.filter((it) => {
          return it.Status != 'CREATED'
        })
      //  console.log(buyOrders)
        this.showSpinner=false;
        this.orders = buyOrders
     //   console.log(this.orders)
      },
      err => {
     //   console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }
}
