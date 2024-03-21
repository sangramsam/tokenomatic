import { Component, OnInit, NgZone } from '@angular/core';
//import {Web3Service} from '../../services/web3.service';
//import {UserService} from '../../services/user.service';
import {Constants} from '../../models/constants';
import {NotificationManagerService} from '../../services/notification-manager.service';
//import {EthExchangeService} from '../../services/eth-exchange.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
//import {PlatformTokenService} from '../../services/platform-token.service'
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service';
import * as abi from 'human-standard-token-abi';
import * as Web3 from 'web3';
import { constants } from 'os';
import { WanWeb3Service } from '../../services/wan-web3.service';
import { WanExchangeService } from '../../services/wan-exchange.service';
import { UserWanService } from '../../services/user-wan.service';
import { PlatformTokenWanService } from '../../services/platform-token-wan.service';
var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-exchange-depositewithdraw-wan',
  templateUrl: './exchange-depositewithdraw-wan.component.html',
  styleUrls: ['./exchange-depositewithdraw-wan.component.css']
})
export class ExchangeDepositewithdrawWanComponent implements OnInit {
  showLoader: boolean = false;
  public displayGif = 'none';
  public selectedPlatformToken : any;
	public selectedFund: string = 'WAN';
	public amountToDepositOrWithdraw = 0.0;
	public escrowEtherValue = 0.0;
	public selectedTokenEscrowValue: number = 0.0;
  public useWandxForFee: any = false;
  public authorizeWand: any = false;

  public authorizedAmount = 0.0
  public authorizedWandAmount = 0.0
  public authorize : boolean = false
  public ethWalletBalance : number = 0.0;
  public wandEscrowValue : number = 0.0;
  public platformTokenWalletBalance : number = 0.0;
  private subscription1 : any;
  private subscription2 : any;
  private subscription3 : any;
  private subscription4 : any;
  private subscription5 : any;
  private subscription6 : any;
  private subscription7 : any;
  private subscription8 : any;
  private subscription9 : any;
  private subscription10 : any;
  private subscription11 : any;
  _web3:any;
  constructor(
  	private web3Service: WanWeb3Service,
		private userService : UserWanService,
    private zone : NgZone,
    private notificationService : NotificationManagerService,
    public exchangeService : WanExchangeService,
    private platformTokenService : PlatformTokenWanService,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
    //private WanWeb3Service : WanWeb3Service

  ) {
    console.log('constructor');
    
    //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
    // this._web3=web3Service._getWeb3();
    this._web3=web3Service._getWeb3();

    this.onAuthorizeChange = this.onAuthorizeChange.bind(this)
    this.onAuthorizeWandChange = this.onAuthorizeWandChange.bind(this)
  }

  ngOnInit() {
    console.log('ngon');
    
    this.subscription1 = this.exchangeService.authorizedAmount$.subscribe(authorizedAmount => this.authorizedAmount = authorizedAmount)
    this.subscription2 = this.exchangeService.authorize$.subscribe(authorize => this.authorize = authorize)
    this.subscription3 = this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
    this.subscription4 = this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)
    this.subscription5 = this.platformTokenService.selectedPlatformToken$.subscribe(selectedToken => this.selectedPlatformToken = selectedToken)
    this.subscription6 = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        this.exchangeService.getEthBalanceForUser()
        this.exchangeService.getPlatformTokenBalanceForUser()
      }
    })
    this.subscription7 = this.exchangeService.authorizeWand$.subscribe(authorizeWand => this.authorizeWand = authorizeWand)
    this.subscription8 = this.exchangeService.ethWalletBalance$.subscribe(balance => this.ethWalletBalance = balance)
    this.subscription9 = this.exchangeService.platformTokenWalletBalance$.subscribe(balance => this.platformTokenWalletBalance = balance)
    this.subscription10 = this.exchangeService.wandEscrowValue$.subscribe(wandEscrowValue => this.wandEscrowValue = wandEscrowValue)
    this.subscription11 = this.exchangeService.authorizedWandAmount$.subscribe(authorizedWandAmount => this.authorizedWandAmount = authorizedWandAmount)
  }
  ngOnDestroy() {
    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
    this.subscription5.unsubscribe()
    this.subscription6.unsubscribe()
    this.subscription7.unsubscribe()
    this.subscription8.unsubscribe()
    this.subscription9.unsubscribe()
    this.subscription10.unsubscribe()
    this.subscription11.unsubscribe()
  }
  onAuthorizeChange(data) {
    this.exchangeService.onAuthorizeChange(data)
  }
  onAuthorizeWandChange(data) {
    this.exchangeService.onAuthorizeWandChange(data)
  }
  
  deposit() {
    //console.log('deposit'+this.amountToDepositOrWithdraw)
    if (this.amountToDepositOrWithdraw <= 0)
      return;
    // TODO : Ideally we should also check if the user has sufficient balance to execute tx
    let userAccount = this.userService.getCurrentUser().UserAccount;
    console.log(userAccount);
    
    let web3 = this.web3Service._getWeb3();
    var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
    //  console.log('deposit1'+this.selectedFund)
    if (this.selectedFund === 'WAN') {
      this._web3.eth.getBalance(userAccount, (err, balance) => {
        balance = +this._web3.fromWei(balance.toString());
        if (this.amountToDepositOrWithdraw > parseFloat(balance)) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {
          this.showLoader = true;
          this.displayGif = 'block';
          //console.log(this.web3Service.priv)
          // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
          let currentWallet=this.savedWalletsService.getCurrentWallet();
          var privateKey=currentWallet.getPrivateKeyHex()
          console.log(privateKey)
          privateKey = Buffer.from(privateKey.substr(2), 'hex')


          var count = this._web3.eth.getTransactionCount(userAccount);

          //console.log("Getting gas estimate");
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
          var data = instanceOrderTraderContract.deposit.getData(userAccount, {'from': userAccount,'value': this.amountToDepositOrWithdraw*1000000000000000000});
          const txParams = {
        		gasPrice: '0x09184e79a00',
        		gasLimit: 400000,
            to:Constants.OrderBookContractAddressWAN,
            data:data,
            from: userAccount,
            chainId:Constants.chainid,
            Txtype: 0x01,
            value:this.amountToDepositOrWithdraw*1000000000000000000,
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
               		console.log("transfer error: ", err);
          	} else {
              //     console.log(hash);
              this.depositcheck(hash);
          	}
          });
        }
      })
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
      // select the token address and decimals, do other sanity checks
      if (this.selectedFund === 'WAND') {
        var authorizedWandAmount = +this._web3.fromWei(this.authorizedWandAmount.toString());
        authorizedWandAmount = authorizedWandAmount * (10 ** (18 - Constants.WandxTokenDecimals));
        if (authorizedWandAmount < this.amountToDepositOrWithdraw || !this.authorizeWand) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please authorize the Wand Token by turning it on for trading'), MessageContentType.Text);
          return;
        }
        selectedTokenAddress = Constants.WandxTokenAddressWAN
        selectedTokenDecimal = Constants.WandxTokenDecimalsWAN
      } else if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        var authorizedAmount = +this._web3.fromWei(this.authorizedAmount.toString());
        authorizedAmount = authorizedWandAmount * (10 ** (18 - this.selectedPlatformToken.decimals));
        if (authorizedAmount < this.amountToDepositOrWithdraw || !this.authorize) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, `Please authorize the ${this.selectedPlatformToken.symbol} Token by turning it on for trading`), MessageContentType.Text);
          return;
        }
        // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
        // let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
       // selectedTokenAddress = address[this.selectedPlatformToken.id]
       console.log(this.selectedPlatformToken)
       selectedTokenAddress = this.selectedPlatformToken.address
       selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else { /* no platform selected */
        return;
      }

      // check if the user has sufficient balance in wallet for the selected token
      
         console.log(selectedTokenAddress)
      var selectedTokenContract = this._web3.eth.contract(abi).at(selectedTokenAddress)
      selectedTokenContract.balanceOf(userAccount, (err, balance) => {
        let conversion = +this._web3.fromWei(balance.toString());
        conversion = conversion * (10 ** (18 - selectedTokenDecimal));
        if (this.amountToDepositOrWithdraw > conversion) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {
          this.showLoader = true;
          this.displayGif = 'block';
          // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
          let currentWallet=this.savedWalletsService.getCurrentWallet();
          var privateKey=currentWallet.getPrivateKeyHex()
          console.log(privateKey)
          privateKey = Buffer.from(privateKey.substr(2), 'hex')
          var count = this._web3.eth.getTransactionCount(userAccount);
          // console.log("Getting gas estimate");
          // console.log(this.amountToDepositOrWithdraw)
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
          var data = instanceOrderTraderContract.depositTokens.getData(userAccount, selectedTokenAddress,web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, selectedTokenDecimal), {'from': userAccount});
          const txParams = {
        		gasPrice: '0x09184e79a00',
        		gasLimit: 400000,
            to:Constants.OrderBookContractAddressWAN,
            data:data,
            from: userAccount,
            chainId: Constants.chainid,
            Txtype: 0x01,
            //value:web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18),
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
              //   console.log(hash);
              this.depositcheck(hash);
          	}
          });
        }
      })
    }
  }
  depositcheck(hash) {
   // console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
    //  console.log(hash1)
      if(hash1 === null) {
        this.depositcheck(hash);
      }
      else {
        if(hash1['status']== 0x0) {
          // console.log('error')
          this.showLoader = false;
          this.displayGif = 'none';
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Deposit failed'), MessageContentType.Text);

        }
        else
        {
          this.showLoader = false;
          this.displayGif = 'none';
        //  this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);

          this.amountToDepositOrWithdraw = 0.0;
        }
      }
    });
  }
  withdraw() {
    if (this.amountToDepositOrWithdraw <= 0)
      return;
    // TODO : Ideally we should also check if the user has sufficient balance to execute tx
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service._getWeb3();
    var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
    if (this.selectedFund == 'WAN') {
      if (this.amountToDepositOrWithdraw > this.escrowEtherValue) {
        this.zone.run(() => {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
        });
        return;
      }
      this.showLoader = true;
      this.displayGif = 'block';
      // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
      let currentWallet=this.savedWalletsService.getCurrentWallet();
      var privateKey=currentWallet.getPrivateKeyHex()
      privateKey = Buffer.from(privateKey.substr(2), 'hex')

      var count = this._web3.eth.getTransactionCount(userAccount);
  
      // console.log("Getting gas estimate");
      this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
      var data = instanceOrderTraderContract.withdrawTo.getData(userAccount, web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18), {'from': userAccount});
      const txParams = {
        gasPrice: '0x09184e79a00',
        gasLimit: 400000,
        to:Constants.OrderBookContractAddressWAN,
        data:data,
        from: userAccount,
        chainId: Constants.chainid,
        Txtype: 0x01,
        //value:web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18),
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
        //  console.log("transfer error: ", err);
        } else {
         // console.log(hash);
          this.withdrawcheck(hash);
        }
      });
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
      if (this.selectedFund == 'WAND'){
        console.log(this.amountToDepositOrWithdraw,this.selectedTokenEscrowValue);
        
        if (this.amountToDepositOrWithdraw > this.selectedTokenEscrowValue) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
          });
          return;
        }
        selectedTokenAddress = Constants.WandxTokenAddressWAN
        selectedTokenDecimal = Constants.WandxTokenDecimalsWAN
      } else if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        if (this.amountToDepositOrWithdraw > this.selectedTokenEscrowValue || !this.authorize) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
          });
          return;
        }
        // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
        // let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
       // selectedTokenAddress = address[this.selectedPlatformToken.id]
       selectedTokenAddress = this.selectedPlatformToken.address
       selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else {
        return;
      }
      this.showLoader = true;
      this.displayGif = 'block';
      // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
      let currentWallet=this.savedWalletsService.getCurrentWallet();
      var privateKey=currentWallet.getPrivateKeyHex()
      privateKey = Buffer.from(privateKey.substr(2), 'hex')

      var count = this._web3.eth.getTransactionCount(userAccount);
  
      // console.log("Getting gas estimate");
      this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text); 
      var data = instanceOrderTraderContract.withdrawTokenTo.getData(userAccount, selectedTokenAddress,web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, selectedTokenDecimal), {'from': userAccount});
      const txParams = {
        gasPrice: '0x09184e79a00',
        gasLimit: 400000,
        to:Constants.OrderBookContractAddressWAN,
        data:data,
        from: userAccount,
        chainId: Constants.chainid,
        Txtype: 0x01,
        //value:web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18),
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
          //   console.log("transfer error: ", err);
        } else {
          //  console.log(hash);
          this.withdrawcheck(hash);
        }
    
      });
    }
  }

  withdrawcheck(hash) {
    //  console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      //  console.log(hash1)
      if(hash1 === null) {
        this.withdrawcheck(hash);
      }
      else {
        if(hash1['status']== 0x0) {
          // console.log('error')
          this.showLoader = false;
          this.displayGif = 'none';
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Withdraw failed'), MessageContentType.Text);
        }
        else {
          this.showLoader = false;
          this.displayGif = 'none';
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw successful, please wait for transaction to complete'), MessageContentType.Text);
           this.amountToDepositOrWithdraw = 0.0;
        }
      }
    });
  }
}
