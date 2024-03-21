import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {BuyOrder, SellOrder} from '../../models/order.model';
import {Http} from '@angular/http';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {PlatformTokenService} from '../../services/platform-token.service';
import {TokenService} from '../../services/token.service';
import {Subscription} from 'rxjs/Subscription';
import {UUID} from 'angular2-uuid';
import {PlatformToken} from '../../models/platform-tokens';
import {Constants} from '../../models/constants';
import {Web3Service} from '../../services/web3.service';
import {UserService} from '../../services/user.service';
import {RequestOptions, Headers} from '@angular/http';
import {OrderTransaction} from '../../models/order-transaction.model';
import {NgForm} from '@angular/forms';
import {BigNumber} from 'bignumber.js';
import {EthExchangeService} from '../../services/eth-exchange.service'
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service';
var AionWeb3 = require('aion-web3-v1.0')

declare namespace web3Functions {


  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

}
@Component({
  selector: 'app-exchange-orderbook-sidepane-aion',
  templateUrl: './exchange-orderbook-sidepane-aion.component.html',
  styleUrls: ['./exchange-orderbook-sidepane-aion.component.css']
})
export class ExchangeOrderbookSidepaneAionComponent implements OnInit {
  showSpinner: boolean = true;

	public buyOrders: Array<BuyOrder> = new Array<BuyOrder>();
  public sellOrders: Array<SellOrder> = new Array<SellOrder>();
  private currentBlockNumber = 0;
  private refreshTimer: any;
  public sourceTokens: Array<PlatformToken> = new Array<PlatformToken>();
  public selectedSourceTokenSymbol: string = '';
  private paramToken: string = 'WAND';

  public selectedPlatformToken: PlatformToken = new PlatformToken();
  public selectedTokenEscrowValue: number = 0.0;
  public selectedBuyOrder: BuyOrder = new BuyOrder();
  public selectedSellOrder: SellOrder = new SellOrder();
  public isBuyModalVisible: boolean = false;
  public isSellModalVisible: boolean = false;
  public useWandxForBuyFee: boolean = false;
  public useWandxForSellFee: boolean = false;
  public buyErrorMessage: string = '';
  public sellErrorMessage: string = '';
  public escrowEtherValue = 0.0;

  private marketBroadcastServiceSub :any;
  private tokenServiceSub :any;
  private savedWalletsServiceSub : any;
  _web3:any;
  constructor(
  	private http: Http,
  	private notificationService: NotificationManagerService,
  	private tokenService: TokenService,
    private platformTokenService: PlatformTokenService,
    private web3Service: Web3Service,
    private userService: UserService,
    private zone: NgZone,
    private exchangeService : EthExchangeService,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
  ) {
    // alert('orderbook')
    console.log('orderbook')
    this._web3 = new AionWeb3(new AionWeb3.providers.HttpProvider("http://52.15.173.92:8545"));
      this.initiateAutoRefresh = this.initiateAutoRefresh.bind(this)
      this.refresh = this.refresh.bind(this)
      this.getBuyOrders = this.getBuyOrders.bind(this)
      this.getSellOrders = this.getSellOrders.bind(this)
      this.showBuyModal = this.showBuyModal.bind(this)
      this.showSellModal = this.showSellModal.bind(this)
      this.buyOrder = this.buyOrder.bind(this)
      this.sellOrder = this.sellOrder.bind(this)
      this.getSellerFeeValueForBuy = this.getSellerFeeValueForBuy.bind(this)
      this.getBuyerFeeValueForBuy = this.getBuyerFeeValueForBuy.bind(this)
      this.getSellerFeeValueForSell = this.getSellerFeeValueForSell.bind(this)
      this.getBuyerFeeValueForSell = this.getBuyerFeeValueForSell.bind(this)
      this.updateCurrentEthBlockNumber = this.updateCurrentEthBlockNumber.bind(this)
      this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
      this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)
  }

  ngOnInit() {
    // alert('orderhistory')
    console.log('orderbook')
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
        this.buyOrders = []
        this.sellOrders = []
        this.showSpinner = true
        this.refresh()
        this.initiateAutoRefresh()
      }
    })
  }
  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe()
    this.savedWalletsServiceSub.unsubscribe()
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
      this.getBuyOrders();
      this.getSellOrders();
    }
    
  }
  updateCurrentEthBlockNumber() {
    let web3 = this.web3Service.getWeb3();
    web3.eth.getBlockNumber((err, data) => {
      if (data) {
        this.currentBlockNumber = data;
      }
    });
  }
  getBuyOrders() {
    console.log('getBuyOrders')
    if (!this.selectedPlatformToken || !this.tokenService.getToken())
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      'Token': this.tokenService.getToken().Jwt
    });
    console.log(this.tokenService.getToken().Jwt)
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURLAION + 'order/buy/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        console.log(data.json())
        // BuyingTokenId
        // BuyingVolume
        // Status
        var d = data.json();
        d = d.filter((buyOrder) => {
          return buyOrder.ExpiringBlock > this.currentBlockNumber;
        });
        d.sort((a, b) => {
          // sort buy orders in ascending order
          return a.SellingVolume - b.SellingVolume
        })
        this.showSpinner = false;
        this.sellOrders = d
      },
      err => {
        console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }
  getSellOrders() {
    console.log('getSellOrders')
    if (!this.selectedPlatformToken || !this.tokenService.getToken())
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURLAION + 'order/sell/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        console.log(data.json())
        var d = data.json();
        d = d.filter((sellOrders) => {
          return sellOrders.ExpiringBlock > this.currentBlockNumber;
        });
        d.sort((a, b) => {
          // sort buy orders in ascending order
          return a.BuyingVolume - b.BuyingVolume
        })
        this.showSpinner = false;
        this.buyOrders = d
      },
      err => {
        console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }

  showBuyModal(order: SellOrder) {
    if (this.escrowEtherValue < order.SellingVolume * order.TargetVolume) {
      this.buyErrorMessage = 'Insufficient funds in escrow, please deposit AION';
    }
    console.log(order)
    // alert(order)
    this.selectedSellOrder = order;
    this.isBuyModalVisible = true;
  }

  showSellModal(order: BuyOrder) {
    console.log(order)
    if (this.selectedTokenEscrowValue < order.BuyingVolume) {
      this.sellErrorMessage = 'Insufficient funds in escrow, please deposit ' + order.BuyingToken.symbol;
    }
    this.selectedBuyOrder = order;
    this.isSellModalVisible = true;
  }

  buyOrder() {
    var self=this;
    // alert(JSON.stringify(this.selectedSellOrder));
    // alert(Object.keys(this.selectedSellOrder));
    console.log(this.selectedSellOrder)
    if (this.selectedSellOrder.Id === '')
      return;

    if (this.selectedSellOrder.ExpiringBlock < this.currentBlockNumber + 4) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'This order is about to expire. Sorry for the inconvenience'), MessageContentType.Text);
      return;
    }
    
    
    let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressWAN, {
      gasLimit: 3000000,
    })
    var orderID = this.selectedSellOrder.Id;
    let userAccount = sessionStorage.getItem("walletAddress");
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var buyFeeToken = Constants.EtherTokenaionAddress;
    if (this.useWandxForBuyFee)
      buyFeeToken = Constants.WandxTokenAddressAION;
    var tokensAndAddresses = [
      this.selectedSellOrder.SellingToken.address,
      this.selectedSellOrder.TargetToken.address,
      this.selectedSellOrder.FeeToken.address,
      buyFeeToken,
      this.selectedSellOrder.SellerAccountId,
      userAccount
    ];
    var volumes = [
      this._web3.utils.toNAmp(this.selectedSellOrder.SellingVolume.toString()),
      this._web3.utils.toNAmp((this.selectedSellOrder.TargetVolume* this.selectedSellOrder.SellingVolume).toString()),
      this._web3.utils.toNAmp(this.getSellerFeeValueForBuy().toString()),
      this._web3.utils.toNAmp(this.getBuyerFeeValueForBuy().toString()),
      this._web3.utils.toNAmp(this.selectedSellOrder.SellingVolume.toString()),
      this._web3.utils.toNAmp(this.selectedSellOrder.TargetVolume.toString())
    ];

    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiating transaction, please authorize the transaction'), MessageContentType.Text);
    //var ecSignature = web3Functions.extractECSignature(this.selectedSellOrder.SellerSign, this.selectedSellOrder.SellerHash, this.selectedSellOrder.SellerAccountId);
    this.isBuyModalVisible = false;
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 

    var count = this._web3.eth.getTransactionCount(userAccount);

    console.log("Getting gas estimate");
    // alert(userAccount)
    // alert( tokensAndAddresses)
    // alert( volumes.toString())
    const contractFunction = instanceOrderTraderContract.methods.fillOrder(tokensAndAddresses, volumes, this.selectedSellOrder.ExpiringBlock, 1,sanitizedOrderId,this.selectedSellOrder.SellerHash)
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:9999990,
      to:Constants.OrderBookContractAddressWAN,
      data: functionAbi
    }; 
    this._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
     // rawtt=  res.rawTransaction; 
      if(res){console.log(res)}
      console.log("rawTransaction "+res.rawTransaction);
      var tx_hash;
      self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',(err,hash) => {
    		if( err) {
    			console.log("transfer error: ", err);
    		} else {
          console.log(hash);
          self.buyordercheck(hash,userAccount);
    		}	
      })
    })
  }

  buyordercheck(hash,userAccount)
{
  console.log('deposit')
  this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
    console.log(hash1)
if(hash1 === null)
{
  this.buyordercheck(hash,userAccount);
}
else
{
  if(hash1['status']== 0x0)
  {
console.log('error')
this.isBuyModalVisible = false;
this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
  }
  else
  {
    this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted to the blockchain. Please wait for confirmation on the Aion blockchain'), MessageContentType.Text);
          let headers = new Headers({
            'content-type': 'application/json',
            'Token': this.tokenService.getToken().Jwt
          });
          let requestOptions = new RequestOptions({headers: headers});

          let orderTransaction = new OrderTransaction();
          orderTransaction.TransactionId = hash;
          orderTransaction.SellOrderId = this.selectedSellOrder.Id;
          orderTransaction.SellerAccountId = this.selectedSellOrder.SellerAccountId;
          orderTransaction.BuyerAccountId = userAccount;
          orderTransaction.Status = 'COMPLETED';
          orderTransaction.TransactionValue = this.selectedSellOrder.SellingVolume * this.selectedSellOrder.TargetVolume;
          this.selectedSellOrder = undefined;
          this.isBuyModalVisible = false;
          this.http.post(Constants.ServiceURLAION + 'ordertransaction/create', orderTransaction, requestOptions).subscribe(
            data => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isBuyModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction recorded successfully'), MessageContentType.Text);
            },
            err => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isBuyModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
          );
 }
}
  });
}
  sellOrder() {
    var self=this;
    console.log(this.selectedBuyOrder)
    console.log("execute")
    if (this.selectedBuyOrder.Id === '')
      return;
    if (this.selectedBuyOrder.ExpiringBlock < this.currentBlockNumber + 4) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'This order is about to expire. Sorry for the inconvenience'), MessageContentType.Text);
      return;
    }
    let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressWAN, {
      gasLimit: 3000000,
    })
    var orderID = this.selectedBuyOrder.Id;
    let userAccount = sessionStorage.getItem("walletAddress");
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var sellFeeToken = Constants.EtherTokenaionAddress;
    if (this.useWandxForSellFee)
      sellFeeToken = Constants.WandxTokenAddressAION;
    var tokensAndAddresses = [
      this.selectedBuyOrder.BuyingToken.address,
      this.selectedBuyOrder.TargetToken.address,
      sellFeeToken,
      this.selectedBuyOrder.FeeToken.address,
      userAccount,
      this.selectedBuyOrder.BuyerAccountId
    ];

    var volumes = [
      this._web3.utils.toNAmp(this.selectedBuyOrder.BuyingVolume.toString()),
      this._web3.utils.toNAmp((this.selectedBuyOrder.TargetVolume* this.selectedBuyOrder.BuyingVolume).toString()),
      this._web3.utils.toNAmp(this.getSellerFeeValueForSell().toString()),
      this._web3.utils.toNAmp(this.getBuyerFeeValueForSell().toString()),
      this._web3.utils.toNAmp(this.selectedBuyOrder.BuyingVolume.toString()),
      this._web3.utils.toNAmp(this.selectedBuyOrder.TargetVolume.toString())
    ];
   // var ecSignature = web3Functions.extractECSignature(this.selectedBuyOrder.BuyerSign, this.selectedBuyOrder.BuyerHash, this.selectedBuyOrder.BuyerAccountId);
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiating transaction, please authorize the transaction'), MessageContentType.Text);
    this.isSellModalVisible = false;

    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 
    const contractFunction = instanceOrderTraderContract.methods.fillOrder(
    tokensAndAddresses, volumes, this.selectedBuyOrder.ExpiringBlock,
    0, sanitizedOrderId,this.selectedBuyOrder.BuyerHash)
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:999999,
      to:Constants.OrderBookContractAddressWAN,
      data: functionAbi
    }; 
    this._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
      // rawtt=  res.rawTransaction; 
      if(res){console.log(res)}
      console.log("rawTransaction "+res.rawTransaction);
      var tx_hash;
      self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',(err,hash) => {
    		if( err) {
    			console.log("transfer error: ", err);
    		} else {
          console.log(hash);
          self.sellOrdercheck(hash,userAccount);
    		}	
      })
    })
  }

  sellOrdercheck(data,userAccount) {
    console.log('deposit')
    this._web3.eth.getTransactionReceipt(data,(err, hash1)=>{
      console.log(hash1)
      if(hash1 === null) {
        this.sellOrdercheck(data,userAccount);
      }
      else {
        if(hash1['status']== 0x0) {
          console.log('error')
          this.isSellModalVisible = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
        }
        else {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted to the blockchain. Please wait for confirmation on the AION blockchain'), MessageContentType.Text);
          let headers = new Headers({
            'content-type': 'application/json',
            'Token': this.tokenService.getToken().Jwt
          });
          let requestOptions = new RequestOptions({headers: headers});

          let orderTransaction = new OrderTransaction();
          orderTransaction.TransactionId = data;
          orderTransaction.BuyOrderId = this.selectedBuyOrder.Id;
          orderTransaction.BuyerAccountId = this.selectedBuyOrder.BuyerAccountId;
          orderTransaction.SellerAccountId = userAccount;
          orderTransaction.Status = 'COMPLETED';
          orderTransaction.TransactionValue = this.selectedBuyOrder.BuyingVolume * this.selectedBuyOrder.TargetVolume;
          this.selectedBuyOrder = undefined;
          this.isSellModalVisible = false;
          this.http.post(Constants.ServiceURLAION + 'ordertransaction/create', orderTransaction, requestOptions).subscribe(
            data => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isSellModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted, once confirmed it will display on the My Orders tab'), MessageContentType.Text);
            },
            err => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isSellModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
          );
        }
      }
    });
  }

  getSellerFeeValueForBuy() {
    if (this.selectedSellOrder.FeeToken.address === Constants.WandxTokenAddress) {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume * 3792;
    }
    else {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume;
    }
  }

  getBuyerFeeValueForBuy() {
    if (this.useWandxForBuyFee) {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume * 3792;
    }
    else {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume;
    }
  }

  getSellerFeeValueForSell() {
    if (this.selectedBuyOrder.FeeToken.address === Constants.WandxTokenAddress) {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume * 3792;
    }
    else {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume;
    }
  }

  getBuyerFeeValueForSell() {
    if (this.useWandxForSellFee) {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume * 3792;
    }
    else {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume;
    }
  }
}
