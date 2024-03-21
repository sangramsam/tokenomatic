import { Component, OnInit, Input, NgZone, SimpleChanges } from '@angular/core';
import {SellOrder} from '../../models/order.model';
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
//import {EthExchangeService} from '../../services/eth-exchange.service'
//import {PlatformTokenService} from '../../services/platform-token.service'
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import { AionWeb3Service } from '../../services/aion-web3.service';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { TokenAionService } from '../../services/token-aion.service';
import { UserAionService } from '../../services/user-aion.service';
import { AionExchangeService } from '../../services/aion-exchange.service';
import { PlatformAionTokenService } from '../../services/platform-aion-token.service';

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
  
  export function signaturegenerate(msghash: any, privatekey: any);
}
@Component({
  selector: 'app-exchange-wallet-sell-aion',
  templateUrl: './exchange-wallet-sell-aion.component.html',
  styleUrls: ['./exchange-wallet-sell-aion.component.css']
})
export class ExchangeWalletSellAionComponent implements OnInit {

  public selectedPlatformToken : any;
	public escrowEtherValue = 0.0;
  public wandEscrowValue = 0.0;
  public amountToSell: number = 0.0;
  public priceToSell: number = 0;
  public selectedTokenEscrowValue: number = 0.0;
  public useWandxForFee: boolean = false;
  public isSellSummaryModalVisible : boolean = false;
  public authorize : boolean = false
  public authorizeWand : boolean = false
  public usd : number = 0.0;
  public USDValue : string = ''
  public authorizedAmount: number = 0.0;
  public ethWalletBalance : number = 0.0;
  public platformTokenWalletBalance : number = 0.0;
  private refreshTimer : any;
  private marketBroadcastServiceSub : any;
  public selectedOfferToken;
  private subscription1 : any;
  private subscription2 : any;
  private subscription3 : any;
  private subscription4 : any;
  private subscription5 : any;
  private subscription6 : any;
  private subscription7 : any;
  private subscription8 : any;
  _web3:any;
  constructor(
  	//private web3Service : Web3Service,
    private tokenService : TokenAionService,
    private userService : UserAionService,
    private http : Http,
    private chartService : ChartService,
    private zone : NgZone,
    private notificationService : NotificationManagerService,
    private exchangeService : AionExchangeService,
    private platformTokenService : PlatformAionTokenService,
    private marketBroadcastService : MarketBroadcastService,
    private aion:AionWeb3Service,
    private savedWalletsService: SavedWalletsService
  ) {
    this._web3 = this.aion.getWeb3();
    this.getSellTotalValue = this.getSellTotalValue.bind(this)
    this.getSellExchangeFee = this.getSellExchangeFee.bind(this)
    this.showSellSummaryModal = this.showSellSummaryModal.bind(this)
    this.placeSellOrder = this.placeSellOrder.bind(this)
    this.onSubmitSell = this.onSubmitSell.bind(this)
    this.createSellOrder = this.createSellOrder.bind(this)

    this.subscription1 = this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
    this.subscription2 = this.exchangeService.wandEscrowValue$.subscribe(wandEscrowValue => this.wandEscrowValue = wandEscrowValue)
    this.subscription3 = this.exchangeService.authorize$.subscribe(authorize => this.authorize = authorize)
    this.subscription4 = this.exchangeService.authorizeWand$.subscribe(authorizeWand => this.authorizeWand = authorizeWand)
    this.subscription5 = this.exchangeService.authorizedAmount$.subscribe(authorizedAmount => this.authorizedAmount = authorizedAmount)
    // this.platformTokenService.selectedPlatformToken$.subscribe(selectedToken => this.selectedPlatformToken = selectedToken)
    this.subscription6 = this.exchangeService.ethWalletBalance$.subscribe(balance => this.ethWalletBalance = balance)
    this.subscription7 = this.exchangeService.platformTokenWalletBalance$.subscribe(balance => this.platformTokenWalletBalance = balance)
    this.subscription8 = this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)

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
    })
    this.chartService.setUSD((err, result) => {
      if (!err) {
        this.usd = this.chartService.getUSD();
      }
    });
  }
  ngOnDestroy() {
    this.marketBroadcastServiceSub.unsubscribe()
    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
    this.subscription5.unsubscribe()
    this.subscription6.unsubscribe()
    this.subscription7.unsubscribe()
    this.subscription8.unsubscribe()
  }
  onAuthorizeChange(data) {
    this.exchangeService.onAuthorizeChange(data)
  }
  onAuthorizeWandChange(data) {
    this.exchangeService.onAuthorizeWandChange(data)
  }
  getSellTotalValue(): number {
    this.usd = this.chartService.getUSD();
    let amountToSell = this.amountToSell
    let priceToSell = this.priceToSell
    if (amountToSell === 0 || priceToSell === 0)
      return 0;
    this.USDValue = ((amountToSell * priceToSell) * this.usd).toFixed(4) + ' USD';
    return amountToSell * priceToSell;
  }
  getSellExchangeFee(): number {
    let amountToSell = this.amountToSell
    let priceToSell = this.priceToSell
    if (amountToSell === 0 || priceToSell === 0)
      return 0;
    if (this.useWandxForFee) {
      return amountToSell * priceToSell * Constants.WandxExchangeFeeRate;
    }
    return amountToSell * priceToSell * Constants.AionExchangeFeeRate;
  }

  showSellSummaryModal() {
    this.isSellSummaryModalVisible = true
  }
  placeSellOrder() {
    this.isSellSummaryModalVisible = false;
    this.createSellOrder();
  }
  onSubmitSell(form : NgForm) {
    if (form.controls.sellamount.value < 0.00000001) {
      form.controls.sellamount.setErrors({min: true});
      form.controls.sellamount.markAsTouched();
    }
    if (form.controls.sellprice.value < 0.00000001) {
      form.controls.sellprice.setErrors({min: true});
      form.controls.sellprice.markAsTouched();
    }

    if (!form.touched || !form.valid) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in order form'), MessageContentType.Text);
      return;
    }
    if (this.selectedPlatformToken.address === '') {
     // console.log('Invalid token address');
      return;
    }
    if (this.selectedTokenEscrowValue < this.amountToSell) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance in Funds tab to create a sell order for ' + this.selectedPlatformToken.symbol), MessageContentType.Text);
      return;
    }
    var exchangeFee = this.getSellExchangeFee();
    if (this.useWandxForFee) {
      if (this.wandEscrowValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient wand balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    else {
      if (this.escrowEtherValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient Aion balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    this.showSellSummaryModal();
  }
  checkAllowance() {
    let userAccount = sessionStorage.getItem("walletAddress");
     
      let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.TokenAbiAION,this.selectedPlatformToken.address, {
        gasLimit: 3000000,
      })  
    instanceOrderTraderContract.methods.allowance(userAccount, Constants.OrderBookContractAddressAION).call().then(function(data){
      this.authorizedAmount = data.toString();
      if (data >= 25000000) {
        this.authorize = true;
      }
      else {
        this.authorize = false;
      }
    });
  }

  private getSelectedTokenEscrowValue() {
    if (
      this.selectedPlatformToken === undefined || this.selectedPlatformToken === null ||
      this.selectedPlatformToken.address === undefined || this.selectedPlatformToken.address === null ||
      this.selectedPlatformToken.address === ''
    )
      return;
      let userAccount = sessionStorage.getItem("walletAddress");
     
      let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
        gasLimit: 3000000,
      })  
    instanceOrderTraderContract.methods.balanceOfToken(userAccount,this.selectedPlatformToken.address).call().then(function (data){
      if (data) {
      //  console.log('web 3',this._web3.fromWei(data.toString()));
        let conversion = +this._web3.utils.fromNAmp(data.toString());
        conversion = conversion * (10 ** (18 - this.selectedPlatformToken.decimals));
        this.selectedTokenEscrowValue = conversion;
        this.checkAllowance();
      }
    });
  }
  createSellOrder() {
    if (this.selectedPlatformToken.address === '') {
   //   console.log('Invalid token address');
      return;
    }
    if (this.selectedTokenEscrowValue < this.amountToSell) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance in  escrow to create a buy order for ' + this.selectedPlatformToken.symbol), MessageContentType.Text);
      return;
    }
    var exchangeFee = this.getSellExchangeFee();
    if (this.useWandxForFee) {
      if (this.wandEscrowValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient wand balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    else {
      if (this.escrowEtherValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient Aion balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    //let web3 = this.web3Service.getWeb3();
    //var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
    //var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressAION);
    var orderID = UUID.UUID().toString();
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var price = this.priceToSell;
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Your Order is creating,Please Wait.'), MessageContentType.Text);
    this._web3.eth.getBlockNumber((err, data) => {
      if (data) {
        let creationBlock = data;
        let sellVolume = this._web3.utils.toNAmp(this.amountToSell.toString());
        let sellPrice = this._web3.utils.toNAmp(price.toString());
        let userAccount =sessionStorage.getItem("walletAddress");
        let buyTokenAddress = this.selectedPlatformToken.address;
        let sellTokenAddress = Constants.EtherTokenaionAddress;
        let sellerFeeTokenAddress = Constants.EtherTokenaionAddress;
        if (this.useWandxForFee) {
          sellerFeeTokenAddress = Constants.WandxTokenAddressAION;
        }
        console.log(sellerFeeTokenAddress)
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privatekey=currentWallet.getPrivateKeyHex() 
        var result=this._web3.eth.accounts.sign([Constants.OrderBookContractAddressAION,buyTokenAddress, sellTokenAddress, sellVolume, sellPrice,creationBlock + Constants.BlockExpirationWindow, userAccount, 1, sanitizedOrderId,sellerFeeTokenAddress],privatekey)
          console.log(result['messageHash']) 
          if (result) {
            console.log("orderHash",result)
            let publickey='0x'+privatekey.substr(66,130)
             let orderHash = result['messageHash']
             let signature=result['signature'].substr(66,194)
             console.log(publickey)
             console.log(orderHash)
                          let headers = new Headers({
                            'content-type': 'application/json',
                            //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                            'Token': this.tokenService.getToken().Jwt
                          });
                          console.log(this.tokenService.getToken().Jwt)
                          let requestOptions = new RequestOptions({headers: headers});
                          let sellOrder = new SellOrder();

                          sellOrder.Id = orderID;
                          sellOrder.SellingTokenId = this.selectedPlatformToken.id;
                          sellOrder.SellingVolume = this.amountToSell;
                          sellOrder.CreationBlock = creationBlock;
                          sellOrder.CreationVolume = this.amountToSell;
                          sellOrder.ExpiringBlock = creationBlock + Constants.BlockExpirationWindow;
                          sellOrder.SellerHash = orderHash;
                          sellOrder.SellerSign = signature;
                          sellOrder.SellerAccountId = userAccount;
                          sellOrder.Status = 'CREATED';
                          sellOrder.TargetTokenId = Constants.EtherTokenIdWAN;

                          if (this.useWandxForFee) {
                            sellOrder.FeeTokenId = Constants.WandxTokenIdWAN;
                          }
                          else {
                            sellOrder.FeeTokenId = Constants.EtherTokenIdWAN;
                          }
                          sellOrder.SellerAIONAddress = publickey;
                          sellOrder.TargetVolume = price;
                          //this.web3Service.store(sellOrder);
                          this.http.post(Constants.ServiceURLAION + 'Order/sell/create', sellOrder, requestOptions).subscribe(
                            data => {
                              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Order created successfully'), MessageContentType.Text);
                              this.amountToSell = 0.0
                              this.getCoinStats()
                              this.exchangeService.setForceRefresh(true)
                            },
                            err => {
                              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
                            }
                          );
            }
            else {
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
      }
      else {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get block number'), MessageContentType.Text);
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
          this.priceToSell = tokenData.close;
        }
        else {
          this.priceToSell = 0.0;
        }
      },
      err => {
    //    console.log(err);
      }
    );
  }
}
