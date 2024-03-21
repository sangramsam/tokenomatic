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
import { AionWeb3Service } from '../../services/aion-web3.service';
import { TokenAionService } from '../../services/token-aion.service';
import { PlatformAionTokenService } from '../../services/platform-aion-token.service';
import { AionExchangeService } from '../../services/aion-exchange.service';

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-exchange-openorders-aion',
  templateUrl: './exchange-openorders-aion.component.html',
  styleUrls: ['./exchange-openorders-aion.component.css']
})
export class ExchangeOpenordersAionComponent implements OnInit {

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
		private platformTokenService: PlatformAionTokenService,
  	private http: Http,
  	private notificationService: NotificationManagerService,
  	private tokenService: TokenAionService,
    private zone : NgZone,
    //private web3Service : Web3Service,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
    private exchangeService : AionExchangeService,
    private aion:AionWeb3Service
  ) {
    this._web3 = this.aion.getWeb3();
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
    this.http.get(Constants.ServiceURLAION + 'order/user/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
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
    orderValue = this._web3.utils.toNAmp(orderValue.toString());
    this.cancelOrder(order.Id, order.BuyerHash, order.BuyerAccountId,this._web3.utils.toNAmp(order.BuyingVolume.toString()), order.FeeToken.address, orderValue, 1);
  }

  cancelSellOrder(order: SellOrder) {
    let orderValue = order.SellingVolume * order.TargetVolume;
    if (order.FeeTokenId === Constants.WandxTokenId) {
      orderValue = order.SellingVolume * order.TargetVolume * 3792;
    }
    orderValue = this._web3.utils.toNAmp(orderValue.toString());
    this.cancelOrder(order.Id, order.SellerHash, order.SellerAccountId,this._web3.utils.toNAmp(order.SellingVolume.toString()), order.FeeToken.address, orderValue, 2);
  }

  cancelOrder(orderId: string, orderHash: string, orderCreator: string, orderVolume: number, feeTokenAddress: string, orderValue: number, orderType: number) {
    //let web3 = this.web3Service.getWeb3();
    var self=this;
    this.showLoader = true;
    this.displayGif = 'block';
   // console.log(orderHash, orderCreator, orderVolume, feeTokenAddress, orderValue);
    
    let userAccount = sessionStorage.getItem("walletAddress");
     
    let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
      gasLimit: 3000000,
    })
   
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 
    const contractFunction = instanceOrderTraderContract.methods.cancelOrder(orderHash, orderCreator, orderVolume, feeTokenAddress, orderValue)
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:999999,
      to:Constants.OrderBookContractAddressAION,
      data: functionAbi
    }; 
    self._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
             // rawtt=  res.rawTransaction; 
   if(res){console.log(res)}
   console.log("rawTransaction "+res.rawTransaction);
   var tx_hash;
   self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
		if(!hash) {
      self.showLoader = false;
      self.displayGif = 'none';
      self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);
	//		console.log("transfer error: ", err);
		} else {
  //    console.log(hash);
    
  self.authorize(hash,orderId,orderType);
		}
	
});
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
    //         this.http.delete(Constants.ServiceURLAION + 'order/buy/cancel/' + orderId, requestOptions).subscribe(
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
    //         this.http.delete(Constants.ServiceURLAION + 'order/sell/cancel/' + orderId, requestOptions).subscribe(
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
            this.http.delete(Constants.ServiceURLAION + 'order/buy/cancel/' + orderId, requestOptions).subscribe(
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
            this.http.delete(Constants.ServiceURLAION + 'order/sell/cancel/' + orderId, requestOptions).subscribe(
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