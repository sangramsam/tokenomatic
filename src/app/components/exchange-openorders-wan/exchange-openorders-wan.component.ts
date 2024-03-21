import { Component, OnInit, NgZone } from '@angular/core';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {PlatformToken} from '../../models/platform-tokens';
import {Constants} from '../../models/constants';
//import {TokenService} from '../../services/token.service';
//import {Web3Service} from '../../services/web3.service';
//import {PlatformTokenService} from '../../services/platform-token.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {BuyOrder, SellOrder, UserOrders} from '../../models/order.model';
import {Subscription} from 'rxjs/Subscription';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';
//import {EthExchangeService} from '../../services/eth-exchange.service';

import * as Web3 from 'web3';
import { WanWeb3Service } from '../../services/wan-web3.service';
import { WanExchangeService } from '../../services/wan-exchange.service';
import { TokenWanService } from '../../services/token-wan.service';
import { PlatformTokenWanService } from '../../services/platform-token-wan.service';
var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-exchange-openorders-wan',
  templateUrl: './exchange-openorders-wan.component.html',
  styleUrls: ['./exchange-openorders-wan.component.css']
})
export class ExchangeOpenordersWanComponent implements OnInit {

  showSpinner: boolean = true;
_web3:any;
  private refreshTimer: any;
	private selectedPlatformToken : PlatformToken;
	private allUserOrders: UserOrders = new UserOrders();
  private tokenRenewalSubscription: Subscription;
  public openOrders : Array<any>
  private marketBroadcastServiceSub : any;
  private tokenServiceSub : any;
  private savedWalletsServiceSub : any;
  private forceRefreshSub: any;
  showLoader: boolean = false;
  public displayGif = 'none';
  constructor(
		private platformTokenService: PlatformTokenWanService,
  	private http: Http,
  	private notificationService: NotificationManagerService,
  	private tokenService: TokenWanService,
    private zone : NgZone,
    private web3Service : WanWeb3Service,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
    private exchangeService : WanExchangeService,
    //private WanWeb3Service : WanWeb3Service
  ) {
    //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
    // this._web3=web3Service._getWeb3();
    this._web3=web3Service._getWeb3();

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
        var selectedWallet = this.savedWalletsService.getCurrentWallet()
        if(!selectedWallet)
          return;
        this.openOrders = []
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
    if (this.tokenServiceSub){
      this.tokenServiceSub.unsubscribe()
    }
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
      //  console.log(this.allUserOrders)
        var buyOrders = this.allUserOrders.BuyOrders.map((it) => {
      //    console.log(it);
          
        	return {
        		volume : it.BuyingVolume,
        		TargetVolume : it.TargetVolume,
        		Status : it.Status,
        		type : 'Buy',
            cancel : () => this.cancelBuyOrder(it)
        	}
        })
        var sellOrders = this.allUserOrders.SellOrders.map((it) => {
      //    console.log(it);
        	return {
        		volume : it.SellingVolume,
        		TargetVolume : it.TargetVolume,
        		Status : it.Status,
        		type : 'Sell',
            cancel : () => this.cancelSellOrder(it)
        	}
        })
        buyOrders = buyOrders.concat(sellOrders)
        buyOrders = buyOrders.filter((it) => {
        	return it.Status == 'CREATED'
        })
        this.showSpinner=false;
        this.openOrders = buyOrders
     //   console.log(this.openOrders)
      },
      err => {
    //    console.log(err)
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }
  cancelBuyOrder(order: BuyOrder) {
    let orderValue = order.BuyingVolume * order.TargetVolume;
    if (order.FeeTokenId === Constants.WandxTokenId) {
      orderValue = order.BuyingVolume * order.TargetVolume * 3792;
    }
    orderValue = web3Functions.toBaseUnitAmount(orderValue, 18);
    this.cancelOrder(order.Id, order.BuyerHash, order.BuyerAccountId, web3Functions.toBaseUnitAmount(order.BuyingVolume, 18), order.FeeToken.address, orderValue, 1);
  }

  cancelSellOrder(order: SellOrder) {
    let orderValue = order.SellingVolume * order.TargetVolume;
    if (order.FeeTokenId === Constants.WandxTokenId) {
      orderValue = order.SellingVolume * order.TargetVolume * 3792;
    }
    orderValue = web3Functions.toBaseUnitAmount(orderValue, 18);
    this.cancelOrder(order.Id, order.SellerHash, order.SellerAccountId, web3Functions.toBaseUnitAmount(order.SellingVolume, 18), order.FeeToken.address, orderValue, 2);
  }

  cancelOrder(orderId: string, orderHash: string, orderCreator: string, orderVolume: number, feeTokenAddress: string, orderValue: number, orderType: number) {
    //let web3 = this.web3Service.getWeb3();
    this.showLoader = true;
    this.displayGif = 'block';
   // console.log(orderHash, orderCreator, orderVolume, feeTokenAddress, orderValue);
    var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
    let userAccount = sessionStorage.getItem('walletAddress');
    // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    privateKey = Buffer.from(privateKey.substr(2), 'hex')

    var count = this._web3.eth.getTransactionCount(userAccount);

//console.log("Getting gas estimate");

var data = instanceOrderTraderContract.cancelOrder.getData(orderHash, orderCreator, orderVolume, feeTokenAddress, orderValue, {'from': userAccount});
    const txParams = {
		gasPrice: '0x09184e79a00',
		gasLimit: 400000,
      to:Constants.OrderBookContractAddressWAN,
      data:data,
      from: userAccount,
      chainId: Constants.chainid,
      Txtype: 0x01,
      nonce: count
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
		if( err) {
      this.showLoader = false;
      this.displayGif = 'none';
  this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);
	//		console.log("transfer error: ", err);
		} else {
  //    console.log(hash);
    
      this.authorize(hash,orderId,orderType);
		}
	
});
    // instanceOrderTraderContract.cancelOrder(
    //   orderHash, orderCreator, orderVolume, feeTokenAddress, orderValue,
    //   (err, data) => {
    //     if (data) {
    //       this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction successful, please wait for transaction to complete'), MessageContentType.Text);
    //       let headers = new Headers({
    //         'content-type': 'application/json',
    //         //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
    //         'Token': this.tokenService.getToken().Jwt
    //       });
    //       let requestOptions = new RequestOptions({headers: headers});
    //       if (orderType === 1) {
    //         this.http.delete(Constants.ServiceURLWAN + 'order/buy/cancel/' + orderId, requestOptions).subscribe(
    //           data => {
    //             this.zone.run(() => this.refresh());
    //             console.log(err);
    //             this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Order cancellation recorded'), MessageContentType.Text);
    //           },
    //           err => {
    //             console.log(err);
    //             this.zone.run(() => this.refresh());
    //             this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Falied to record order cancellation'), MessageContentType.Text);
    //           }
    //         );
    //       }
    //       if (orderType === 2) {
    //         this.http.delete(Constants.ServiceURLWAN + 'order/sell/cancel/' + orderId, requestOptions).subscribe(
    //           data => {
    //             this.zone.run(() => this.refresh());
    //             console.log(err);
    //             this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Order cancellation recorded'), MessageContentType.Text);
    //           },
    //           err => {
    //             console.log(err);
    //             this.zone.run(() => this.refresh());
    //             this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Falied to record order cancellation'), MessageContentType.Text);
    //           }
    //         );
    //       }
    //     }
    //     else {
    //       this.zone.run(() => this.refresh());
    //       console.log(err);
    //       this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to cancel order'), MessageContentType.Text);
    //     }
    //   }
    //);
  }
  authorize(hash,orderId,orderType)
  {
 //   console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
 //     console.log(hash1)
  if(hash1 === null)
  {
    this.authorize(hash,orderId,orderType);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
      this.zone.run(() => this.refresh());
   //   console.log(err);
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to cancel order'), MessageContentType.Text);

    }
    else
    {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction successful, please wait for transaction to complete'), MessageContentType.Text);
          let headers = new Headers({
            'content-type': 'application/json',
            //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
            'Token': this.tokenService.getToken().Jwt
          });
          let requestOptions = new RequestOptions({headers: headers});
          if (orderType === 1) {
            this.http.delete(Constants.ServiceURLWAN + 'order/buy/cancel/' + orderId, requestOptions).subscribe(
              data => {
                this.zone.run(() => this.refresh());
     //           console.log(err);
                this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Order cancellation recorded'), MessageContentType.Text);
              },
              err => {
       //         console.log(err);
                this.zone.run(() => this.refresh());
                this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Falied to record order cancellation'), MessageContentType.Text);
              }
            );
          }
          if (orderType === 2) {
            this.http.delete(Constants.ServiceURLWAN + 'order/sell/cancel/' + orderId, requestOptions).subscribe(
              data => {
                this.zone.run(() => this.refresh());
          //      console.log(err);
                this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Order cancellation recorded'), MessageContentType.Text);
              },
              err => {
            //    console.log(err);
                this.zone.run(() => this.refresh());
                this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Falied to record order cancellation'), MessageContentType.Text);
              }
            );
          }
            }
  }
    });
  }
}