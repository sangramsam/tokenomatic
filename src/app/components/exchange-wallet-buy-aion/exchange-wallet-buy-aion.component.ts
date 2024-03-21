import {Component, OnInit, Input, NgZone, SimpleChanges} from '@angular/core';
import {BuyOrder} from '../../models/order.model';
import {UUID} from 'angular2-uuid';
import {Constants} from '../../models/constants';
import {Web3Service} from '../../services/web3.service';
import {TokenService} from '../../services/token.service';
import {UserService} from '../../services/user.service';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {ChartService} from '../../services/chart.service';
import {NgForm} from '@angular/forms';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {EthExchangeService} from '../../services/eth-exchange.service';
import {PlatformTokenService} from '../../services/platform-token.service';
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import { constants } from 'os';
import { AionWeb3Service } from '../../services/aion-web3.service';
import { SavedWalletsService } from '../../services/saved-wallets.service';
var Web3 = require('aion-web3-v1.0')

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);

  export function signaturegenerate(msghash: any, privatekey: any);
}
@Component({
  selector: 'app-exchange-wallet-buy-aion',
  templateUrl: './exchange-wallet-buy-aion.component.html',
  styleUrls: ['./exchange-wallet-buy-aion.component.css']
})
export class ExchangeWalletBuyAionComponent implements OnInit {

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
  constructor(private web3Service: Web3Service,
    private tokenService: TokenService,
    private userService: UserService,
    private http: Http,
    private chartService: ChartService,
    private zone: NgZone,
    private notificationService: NotificationManagerService,
    private exchangeService: EthExchangeService,
    private platformTokenService: PlatformTokenService,
    private marketBroadcastService: MarketBroadcastService,
    private aion:AionWeb3Service,
    private savedWalletsService : SavedWalletsService
  ) {

  this._web3 = this.aion.getWeb3();
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
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please add AION on Funds tab to enable the transaction'), MessageContentType.Text);
    return;
  }

  if (!this.useWandxForFee && this.escrowEtherValue < exchangeFee) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient AION balance to pay for exchange fee'), MessageContentType.Text);
    return;
  }

  if (!this.useWandxForFee && this.escrowEtherValue < (exchangeFee + (this.amountToBuy * this.priceToBuy))) {
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please add AION on Funds tab to enable the transaction'), MessageContentType.Text);
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
  return amountToBuy * priceToBuy * Constants.AionExchangeFeeRate;
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
    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient AION balance to pay for the transaction'), MessageContentType.Text);
    return;
  }
  let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
    gasLimit: 3000000,
  }) 
 
  var orderID = UUID.UUID().toString();
  var find = '-';
  var re = new RegExp(find, 'g');
  var sanitizedOrderId = orderID.replace(re, '');
  sanitizedOrderId = '0x' + sanitizedOrderId;
  var price = this.priceToBuy;
  this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Your Order is creating,Please Wait.'), MessageContentType.Text);
  this._web3.eth.getBlockNumber((err, data) => {
    if (data) {
      console.log("data",data)
      let creationBlock = data;
      let buyVolume = this._web3.utils.toNAmp(this.amountToBuy.toString());
      let buyPrice = this._web3.utils.toNAmp(price.toString());
      let userAccount = sessionStorage.getItem("walletAddress");
      let sellTokenAddress = this.selectedPlatformToken.address;
      let buyTokenAddress = Constants.EtherTokenaionAddress;
      let buyerFeeTokenAddress = Constants.EtherTokenaionAddress;
      if (this.useWandxForFee) {
        buyerFeeTokenAddress = Constants.WandxTokenAddressAION;
      }
      let currentWallet=this.savedWalletsService.getCurrentWallet();
      var privatekey=currentWallet.getPrivateKeyHex() 
      console.log(buyerFeeTokenAddress)
      var result=this._web3.eth.accounts.sign([Constants.OrderBookContractAddressAION,sellTokenAddress, buyTokenAddress, buyVolume, buyPrice,creationBlock + Constants.BlockExpirationWindow, userAccount, 0,sanitizedOrderId,buyerFeeTokenAddress],privatekey)
        console.log(result['messageHash']) 
      if (result) {
           console.log("orderHash",result)
           let publickey='0x'+privatekey.substr(66,130)
           let orderHash = result['messageHash']
           let signature=result['signature'].substr(66,194);
            console.log(publickey)
            console.log(orderHash)
            console.log(signature)
                        let headers = new Headers({
                          'content-type': 'application/json',
                          'Token': this.tokenService.getToken().Jwt
                        });
                        console.log(this.tokenService.getToken().Jwt)
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
                        buyOrder.BuyerAIONAddress = publickey;
                        buyOrder.TargetVolume = price;
                       // this.web3Service.store(buyOrder);
                        this.http.post(Constants.ServiceURLAION + 'Order/buy/create', buyOrder, requestOptions).subscribe(
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
                      // }
                    // });
                  // }
                // }
                // else {
                //   this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
                // }
            //   }
            // );
          }
          else {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
          }
       // }
     // );
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

