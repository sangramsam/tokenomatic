import {Component, OnInit, Input, NgZone, SimpleChanges} from '@angular/core';
import {BuyOrder} from '../../models/order.model';
import {UUID} from 'angular2-uuid';
import {Constants} from '../../models/constants';
//import {Web3Service} from '../../services/web3.service';
//import {TokenService} from '../../services/token.service';
//import {UserService} from '../../services/user.service';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {ChartService} from '../../services/chart.service';
import {NgForm} from '@angular/forms';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
//import {EthExchangeService} from '../../services/eth-exchange.service';
//import {PlatformTokenService} from '../../services/platform-token.service';
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import * as Web3 from 'web3';
import { WanWeb3Service } from '../../services/wan-web3.service';
import { WanExchangeService } from '../../services/wan-exchange.service';
import { TokenWanService } from '../../services/token-wan.service';
import { UserWanService } from '../../services/user-wan.service';
import { PlatformTokenWanService } from '../../services/platform-token-wan.service';

var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);

  export function signaturegenerate(msghash: any, privatekey: any);
}

@Component({
  selector: 'app-exchange-wallet-buy-wan',
  templateUrl: './exchange-wallet-buy-wan.component.html',
  styleUrls: ['./exchange-wallet-buy-wan.component.css']
})
export class ExchangeWalletBuyWanComponent implements OnInit {

  public selectedPlatformToken: PlatformToken;
  public escrowEtherValue = 0.0;
  public wandEscrowValue = 0.0;
  public amountToBuy: number = 0.0;
  public priceToBuy: number = 0.0;
  public useWandxForFee: boolean = false;
  public usd: number = 0.0;
  public USDValue: any;
  public isBuySummaryModalVisible: boolean;
  public authorize: boolean = false;
  public authorizeWand: boolean = false;
  private marketBroadcastServiceSub: any;
  public selectedOfferToken : any;
  public ethWalletBalance : number = 0.0;
  public platformTokenWalletBalance : number = 0.0;
  private subscription1 : any;
  private subscription2 : any;
  private subscription3 : any;
  private subscription4 : any;
  private subscription5 : any;
  private subscription6 : any;
  _web3:any;
  constructor(private web3Service: WanWeb3Service,
    private tokenService: TokenWanService,
    private userService: UserWanService,
    private http: Http,
    private chartService: ChartService,
    private zone: NgZone,
    private notificationService: NotificationManagerService,
    private exchangeService: WanExchangeService,
    private platformTokenService: PlatformTokenWanService,
    private marketBroadcastService: MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
    //private WanWeb3Service : WanWeb3Service
  ) {
   //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
   // this._web3=web3Service._getWeb3();
    this._web3=web3Service._getWeb3();

    this.createBuyOrder = this.createBuyOrder.bind(this);
    this.showBuySummaryModal = this.showBuySummaryModal.bind(this);
    this.placeBuyOrder = this.placeBuyOrder.bind(this);
    this.onSubmitBuy = this.onSubmitBuy.bind(this);
    this.getBuyExchangeFee = this.getBuyExchangeFee.bind(this);
    this.getBuyTotalValue = this.getBuyTotalValue.bind(this);
    this.createBuyOrder = this.createBuyOrder.bind(this);

    this.subscription1 = this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue);
    this.subscription2 = this.exchangeService.wandEscrowValue$.subscribe(wandEscrowValue => this.wandEscrowValue = wandEscrowValue);
    this.subscription3 = this.exchangeService.authorize$.subscribe(authorize => this.authorize = authorize);
    this.subscription4 = this.exchangeService.authorizeWand$.subscribe(authorizeWand => this.authorizeWand = authorizeWand);

    this.subscription5 = this.exchangeService.ethWalletBalance$.subscribe(balance => this.ethWalletBalance = balance)
    this.subscription6 = this.exchangeService.platformTokenWalletBalance$.subscribe(balance => this.platformTokenWalletBalance = balance)
  //console.log(this.web3Service.data)
}
ngOnInit() {
  this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
    if (status == 'changed') {
      this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken();
      this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket()
      this.getCoinStats();
      this.exchangeService.getEthBalanceForUser()
      this.exchangeService.getPlatformTokenBalanceForUser()
    }
  });
  this.chartService.setUSD((err, result) => {
    if (!err) {
      this.usd = this.chartService.getUSD();
    }
  });
}

ngOnDestroy() {
  this.subscription1.unsubscribe()
  this.subscription2.unsubscribe()
  this.subscription3.unsubscribe()
  this.subscription4.unsubscribe()
  this.subscription5.unsubscribe()
  this.subscription6.unsubscribe()
}


showBuySummaryModal() {
  this.isBuySummaryModalVisible = true;
}

placeBuyOrder() {
  this.isBuySummaryModalVisible = false;
  this.createBuyOrder();
}

onSubmitBuy(form: NgForm) {
  if (form.controls.buyamount.value < 0.00000001) {
    form.controls.buyamount.setErrors({min: true});
    form.controls.buyamount.markAsTouched();
  }
  if (form.controls.buyprice.value < 0.00000001) {
    form.controls.buyprice.setErrors({min: true});
    form.controls.buyprice.markAsTouched();
  }

  if (!form.touched || !form.valid) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in order form'), MessageContentType.Text);
    return;
  }
  if (this.selectedPlatformToken.address === '') {
    //console.log('Invalid token address');
    return;
  }
  var exchangeFee = this.getBuyExchangeFee();

  if (this.useWandxForFee && this.wandEscrowValue < exchangeFee) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient WAND balance to pay for exchange fee'), MessageContentType.Text);
    return;
  }

  if (this.useWandxForFee && this.escrowEtherValue < (this.amountToBuy * this.priceToBuy)) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please add WAN on Funds tab to enable the transaction'), MessageContentType.Text);
    return;
  }

  if (!this.useWandxForFee && this.escrowEtherValue < exchangeFee) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient WAN balance to pay for exchange fee'), MessageContentType.Text);
    return;
  }

  if (!this.useWandxForFee && this.escrowEtherValue < (exchangeFee + (this.amountToBuy * this.priceToBuy))) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please add WAN on Funds tab to enable the transaction'), MessageContentType.Text);
    return;
  }
  this.showBuySummaryModal();
}

onAuthorizeChange(data) {
  this.exchangeService.onAuthorizeChange(data);
}

onAuthorizeWandChange(data) {
  this.exchangeService.onAuthorizeWandChange(data);
}

getBuyExchangeFee(): number {
  //console.log("getbuy")
  let amountToBuy = this.amountToBuy;
  let priceToBuy = this.priceToBuy;
  if (amountToBuy === 0 || priceToBuy === 0)
    return 0;
  if (this.useWandxForFee) {
    return amountToBuy * priceToBuy * Constants.WandxExchangeFeeRate;
  }
  return amountToBuy * priceToBuy * Constants.EthExchangeFeeRate;
}

getBuyTotalValue(): number {
  this.usd = this.chartService.getUSD();
  let amountToBuy = this.amountToBuy;
  let priceToBuy = this.priceToBuy;
  if (amountToBuy === 0 || priceToBuy === 0)
    return 0;
  this.USDValue = ((amountToBuy * priceToBuy) * this.usd).toFixed(4) + ' USD';

  return amountToBuy * priceToBuy;
}

createBuyOrder() {
  if (this.selectedPlatformToken.address === '') {
    //console.log('Invalid token address');
    return;
  }
  var exchangeFee = this.getBuyExchangeFee();
  if (this.useWandxForFee && this.wandEscrowValue < exchangeFee) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient WAND balance to pay for exchange fee'), MessageContentType.Text);
    return;
  }
  else if (!this.useWandxForFee && this.escrowEtherValue < (exchangeFee + (this.amountToBuy * this.priceToBuy))) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient WAN balance to pay for the transaction'), MessageContentType.Text);
    return;
  }
  console.log(this.selectedPlatformToken.address)
  let web3 = this.web3Service._getWeb3();
  var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
  var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
  var orderID = UUID.UUID().toString();
  var find = '-';
  var re = new RegExp(find, 'g');
  var sanitizedOrderId = orderID.replace(re, '');
  sanitizedOrderId = '0x' + sanitizedOrderId;
  var price = this.priceToBuy;
 // this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Creating the order, please click on The Sign button on the popup window'), MessageContentType.Text);
  this._web3.eth.getBlockNumber((err, data) => {
    if (data) {
      // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
      // let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
      let creationBlock = data;
      let buyVolume = web3Functions.toBaseUnitAmount(this.amountToBuy, this.selectedPlatformToken.decimals);
      let buyPrice = web3Functions.toBaseUnitAmount(price, 18);
      let userAccount = this.userService.getCurrentUser().UserAccount;
      //let sellTokenAddress = address[this.selectedPlatformToken.id];
      let sellTokenAddress = this.selectedPlatformToken.address;
      let buyTokenAddress = Constants.EtherTokenAddressWAN;
      let buyerFeeTokenAddress = Constants.EtherTokenAddressWAN;
      if (this.useWandxForFee) {
        buyerFeeTokenAddress = Constants.WandxTokenAddressWAN;
      }
      instanceOrderTraderContract.orderHash(
        sellTokenAddress, buyTokenAddress, buyVolume, buyPrice,
        creationBlock + Constants.BlockExpirationWindow, userAccount, 0, sanitizedOrderId,
        buyerFeeTokenAddress,
        (err, result) => {
          if (result) {
            let orderHash = result;
            // var payload = {
            //   jsonrpc: '2.0',
            //   method: 'eth_sign',
            //   params: [userAccount, orderHash]
            // };
            // web3.currentProvider.sendAsync(
            //   payload,
            //   (err, result) => {
              // var privatekey='0x'+this.web3Service.priv;
              let currentWallet=this.savedWalletsService.getCurrentWallet();
              var privatekey=currentWallet.getPrivateKeyHex()
             // console.log(privatekey)
              let result1= web3Functions.signaturegenerate(orderHash,privatekey);
                console.log(result1)
                if (result1) {
                  let signature = result1;
                  let ecSignature = web3Functions.extractECSignature(signature, orderHash, userAccount);
                console.log(ecSignature)
                  if (web3Functions.clientVerifySign(ecSignature, orderHash, userAccount)) {
                    instanceOrderTraderContract.verifySignature(userAccount, orderHash, ecSignature.v, ecSignature.r, ecSignature.s, (err, result) => {
                      if (result) {
              //          console.log(this.tokenService.getToken().Jwt)
                        let headers = new Headers({
                          'content-type': 'application/json',
                          'Token': this.tokenService.getToken().Jwt
                        });
                        let requestOptions = new RequestOptions({headers: headers});
                        let buyOrder = new BuyOrder();

                        buyOrder.Id = orderID;
                        buyOrder.BuyingTokenId = this.selectedPlatformToken.id;
                        buyOrder.BuyingVolume = this.amountToBuy;
                        buyOrder.CreationBlock = creationBlock;
                        buyOrder.CreationVolume = this.amountToBuy;
                        buyOrder.ExpiringBlock = creationBlock + Constants.BlockExpirationWindow;
                        buyOrder.BuyerHash = orderHash;
                        buyOrder.BuyerSign = signature;
                        buyOrder.BuyerAccountId = userAccount;
                        buyOrder.Status = 'CREATED';
                        buyOrder.TargetTokenId = Constants.EtherTokenIdWAN;
               //         console.log(buyOrder)
                        if (this.useWandxForFee) {
                          buyOrder.FeeTokenId = Constants.WandxTokenIdWAN;
                        }
                        else {
                          buyOrder.FeeTokenId = Constants.EtherTokenIdWAN;
                        }

                        buyOrder.TargetVolume = price;
                        this.web3Service.store(buyOrder);
                        console.log(buyOrder);
                        
                        this.http.post(Constants.ServiceURLWAN + 'Order/buy/create', buyOrder, requestOptions).subscribe(
                          data => {
                            this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Order has been created. It can be viewed in My Orders tab after confirmation on the blockchain. This may take a while.'), MessageContentType.Text);
                            this.amountToBuy = 0.0
                            this.exchangeService.setForceRefresh(true)
                            this.getCoinStats()
                          },
                          err => {
                       //     console.log(MessageType.Error, err)
                            this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
                          }
                        );
                      }
                    });
                  }
                }
                else {
                  this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
                }
            //   }
            // );
          }
          else {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
          }
        }
      );
    }
    else {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get current block number'), MessageContentType.Text);
    }
  });
}

getCoinStats() {
  if (!this.selectedPlatformToken || !this.selectedOfferToken)
    return;
  this.http.get(`${Constants.CryptoCompareUrl}?fsym=${this.selectedPlatformToken.symbol}&tsym=${this.selectedOfferToken.symbol}&limit=60&aggregate=3&e=CCCAGG`).subscribe(
    data => {
      var jsonData = data.json();
      if (jsonData.Response === 'Success') {
        var dataLength = jsonData.Data.length;
        var tokenData = jsonData.Data[dataLength - 1];
        this.priceToBuy = tokenData.close;
      }
      else {
        this.priceToBuy = 0.0;
      }
    },
    err => {
     // console.log(err);
    }
  );
}
}

