import { Injectable, NgZone } from '@angular/core';
import {NotificationManagerService} from './notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../models/message.model';
//import {Web3Service} from './web3.service';
//import {UserService} from './user.service';
import {Constants} from '../models/constants';
import {SavedWalletsService} from './saved-wallets.service'
import {PlatformToken} from '../models/platform-tokens';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
//import {PlatformTokenService} from './platform-token.service'
import {MarketBroadcastService} from './market-broadcast.service'
import * as abi from 'human-standard-token-abi';
//import { AionWeb3Service } from './aion-web3.service';
import * as Web3 from 'web3';
import { WanWeb3Service } from './wan-web3.service';
import { PlatformTokenWanService } from './platform-token-wan.service';
import { UserWanService } from './user-wan.service';


var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;
declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Injectable()
export class WanExchangeService{

	// this will all the common functions use by exchange
	private _selectedPlatformToken :  PlatformToken;
	private _escrowEtherValue : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _selectedTokenEscrowValue :  BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _wandEscrowValue :  BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _authorizedAmount : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _authorizedWandAmount : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _authorize : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
	private _authorizeWand :  BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  private _ethWalletBalance : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _platformTokenWalletBalance : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private refreshTimer : any
  private _forceRefresh : Subject<boolean> = new Subject<boolean>();

	public escrowEtherValue$  = this._escrowEtherValue.asObservable()
	public selectedTokenEscrowValue$ = this._selectedTokenEscrowValue.asObservable()
	public wandEscrowValue$ = this._wandEscrowValue.asObservable()
	public authorizedAmount$  = this._authorizedAmount.asObservable()
  public authorizedWandAmount$  = this._authorizedWandAmount.asObservable()
	public authorize$  = this._authorize.asObservable()
	public authorizeWand$  = this._authorizeWand.asObservable()
  public ethWalletBalance$ = this._ethWalletBalance.asObservable()
  public platformTokenWalletBalance$ = this._platformTokenWalletBalance.asObservable()
  public forceRefresh$ = this._forceRefresh.asObservable()
  public aionwalletbalance;
  public displayGif = 'none';
	private i = 0
  _web3:any;
  aionWeb3 : any;
  constructor(
  	//private web3Service : Web3Service,
  	private userService : UserWanService,
  	private notificationService : NotificationManagerService,
  	private savedWalletsService : SavedWalletsService,
  	private platformTokenService : PlatformTokenWanService,
    private marketBroadcastService : MarketBroadcastService,
    private zone : NgZone,
    //private aion:AionWeb3Service,
    private WanWeb3Service : WanWeb3Service

  ) {
    //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
    // this._web3= web3Service._getWeb3();
    this._web3= WanWeb3Service._getWeb3();

  //  this.aionWeb3= this.aion.getWeb3();
  	this.getEtherEscrowValue = this.getEtherEscrowValue.bind(this)
		this.getSelectedTokenEscrowValue = this.getSelectedTokenEscrowValue.bind(this)
		this.checkAllowance = this.checkAllowance.bind(this)
		this.checkWandAllowance = this.checkWandAllowance.bind(this)
		this.onAuthorizeChange = this.onAuthorizeChange.bind(this)
		this.onAuthorizeWandChange = this.onAuthorizeWandChange.bind(this)
		this.completeRefresh = this.completeRefresh.bind(this)
  	this.platformTokenService.selectedPlatformToken$.subscribe((value) => {
  		if (value) {
  			this._selectedPlatformToken = value
        this.completeRefresh()
  		}
  	})
    this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this._selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        var selectedExchange = this.marketBroadcastService.getSelectedExchange()
        if (this._selectedPlatformToken && selectedExchange == 'eth') {
          this.completeRefresh()
        } else {
          clearTimeout(this.refreshTimer);
        }
        if (this._selectedPlatformToken && selectedExchange == 'aion') {
          this.completeRefresh()
        } else {
          clearTimeout(this.refreshTimer);
        }

        if (this._selectedPlatformToken && selectedExchange == 'wan') {
          this.completeRefresh()
        } else {
          clearTimeout(this.refreshTimer);
        }
        //this.refresh()
        // this.initiateAutoRefresh()
      }
    })
  }
  private initiateAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.completeRefresh()
    }, 30000);
  }
  completeRefresh() {
  	if (!this._selectedPlatformToken)
  		return;
  	this.refresh();
    this.initiateAutoRefresh();
  }
  setForceRefresh(forceRefresh) {
    this._forceRefresh.next(forceRefresh)
  }
  refresh() {
  	this.getEtherEscrowValue()
		this.getSelectedTokenEscrowValue()
		this.checkWandAllowance()
		this.checkAllowance()
    this.getEthBalanceForUser()
    this.getPlatformTokenBalanceForUser()
  }
  getEtherEscrowValue() {
   
    
      let userAccount = this.userService.getCurrentUser().UserAccount;
      //console.log(userAccount)
      //let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbiWAN);
      var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
      instanceOrderTraderContract.balanceOf(userAccount, (err, data) => {
      //  console.log('data', data);
        if (data)
          this._escrowEtherValue.next(+this._web3.fromWei(data));
        else
          this._escrowEtherValue.next(0.0);
      });

  }
  getWandEscrowValue() {
   
      console.log('wandwan');
      
      let userAccount = this.userService.getCurrentUser().UserAccount;
      //let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.TokenAbiWAN);
      var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddressWAN);
      instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressWAN, (err, data) => {
        if (data){
          console.log('wandes',data);
          
          let conversion = +this._web3.fromWei(data.toString());
          conversion = conversion * (10 ** (18 - Constants.WandxTokenDecimals));
          this._wandEscrowValue.next(conversion);
        }
        else 
          console.log('wandes');
          this._wandEscrowValue.next(0.0);
      });
    
  }
  getSelectedTokenEscrowValue() {
    if (
      !this._selectedPlatformToken || !this._selectedPlatformToken.address) {
      return this._selectedTokenEscrowValue.next(0);
    }
  
   
    if(sessionStorage.getItem('exchange')=='wan') {
      // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
      //   let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
      let userAccount = this.userService.getCurrentUser().UserAccount;
      //let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.OrderbookContractAbi);
      var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddressWAN);
     // console.log('current address', address[this._selectedPlatformToken.id]);
      instanceOrderTraderContract.balanceOfToken(userAccount,this._selectedPlatformToken.address, (err, data) => {
        if (data) {
      //    console.log('web 3', this._web3.fromWei(data.toString()));
          let conversion = +this._web3.fromWei(data.toString());
          conversion = conversion * (10 ** (18 - this._selectedPlatformToken.decimals));
          this._selectedTokenEscrowValue.next(conversion);
          this.checkAllowance();
        }
      });
    }
  }
  getEthBalanceForUser() {
   
   
   // if(sessionStorage.getItem('exchange')=='wan') {
      let userAccount = this.userService.getCurrentUser().UserAccount;
      if ( !userAccount || !userAccount.length)
        return
      //let web3 = this.web3Service.getWeb3();
      let userAddress =sessionStorage.getItem('walletAddress')
      this._web3.eth.getBalance(userAddress, (err, balance) => {
        let conversion = +this._web3.fromWei(balance.toString());
        this._ethWalletBalance.next(conversion);
      }) 
   // }
  }
  getPlatformTokenBalanceForUser() {
  
   // if(sessionStorage.getItem('exchange')=='wan') {
      // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
      // let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
      let userAccount = this.userService.getCurrentUser().UserAccount;
      if ( !userAccount || !this._selectedPlatformToken)
        return
    //  let web3 = this.web3Service.getWeb3();
      let userAddress = userAccount;
   // console.log(this._selectedPlatformToken.id)
      var selectedTokenContract = this._web3.eth.contract(abi).at(this._selectedPlatformToken.address)
      selectedTokenContract.balanceOf(userAddress, (err, balance) => {
        let conversion = +this._web3.fromWei(balance.toString());
        conversion = conversion * (10 ** (18 - this._selectedPlatformToken.decimals));
        this._platformTokenWalletBalance.next(conversion);
      })
  //  }
  }
  checkAllowance() {
   
  //  if(sessionStorage.getItem('exchange')=='wan') {
      // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
      //   let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
      let userAccount = this.userService.getCurrentUser().UserAccount;
      if ( !userAccount || !userAccount.length)
        return
     // let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.TokenAbiWAN);
      var instanceOrderTraderContract = orderTraderContract.at(this._selectedPlatformToken.address);
      instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressWAN, (err, data) => {
        this._authorizedAmount.next(data);
        if (data >= 25000000) {
      //    console.log('check');
          this._authorize.next(true);
        }
        else {
       //   console.log('check');
          this._authorize.next(false);
        }
      });
   // }
  }
  checkWandAllowance() {
   
   // if(sessionStorage.getItem('exchange')=='wan') {
      let userAccount = this.userService.getCurrentUser().UserAccount;
      if ( !userAccount || !userAccount.length)
        return
    //  let web3 = this.web3Service.getWeb3();
      var orderTraderContract =this._web3.eth.contract(Constants.TokenAbiWAN);
      var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddressWAN);
      console.log(Constants.WandxTokenAddressWAN,Constants.OrderBookContractAddressWAN,userAccount);
      
      instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressWAN, (err, data) => {
        this._authorizedWandAmount.next(data);
        if (data >= 25000000) {
      //    console.log('checkwand')
          this._authorizeWand.next(true);
        }
        else {
     //     console.log('checkwand1')
          this._authorizeWand.next(false);
        }
      });
    //}
  }
  onAuthorizeChange(data) {
   
    //if(sessionStorage.getItem('exchange')=='wan') {
      this.displayGif='block'
      //selectedTokenAddress = address[this.selectedPlatformToken.id]
      let userAccount = this.userService.getCurrentUser().UserAccount;
      //let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.TokenAbiWAN);
      var instanceOrderTraderContract = orderTraderContract.at(this._selectedPlatformToken.address);
      var tokenaddress=this._selectedPlatformToken.address;

      if (data) {
        // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        privateKey = Buffer.from(privateKey.substr(2), 'hex')
        var count = this._web3.eth.getTransactionCount(userAccount);
        var data = instanceOrderTraderContract.approve.getData(Constants.OrderBookContractAddressWAN,100000000000000000000, {'from': userAccount});
        const txParams = {
      		gasPrice: '0x09184e79a00',
      		gasLimit: 400000,
          to:tokenaddress,
          data:data,
          from: userAccount,
          chainId: Constants.chainid,
          Txtype: 0x01,
          nonce: count
        };
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been strated, please wait.'), MessageContentType.Text);
        this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
      		if( err) {
            this.displayGif='none'
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
      		//	console.log("transfer error: ", err);
      		} else {
           // console.log(hash);
          
            this.authorize(hash,tokenaddress);
      		}
        });
      }
      else {
        //this.displayGif='block'
        // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        privateKey = Buffer.from(privateKey.substr(2), 'hex')
        var count = this._web3.eth.getTransactionCount(userAccount);
        var data = instanceOrderTraderContract.approve.getData(Constants.OrderBookContractAddressWAN, 0, {'from': userAccount});
        const txParams = {
          gasPrice: '0x09184e79a00',
          gasLimit: 400000,
            to:this._selectedPlatformToken.address,
            data:data,
            from: userAccount,
            chainId: Constants.chainid,
            Txtype: 0x01,
            nonce: count
        };
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been Started, please wait.'), MessageContentType.Text);
        this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
          if( err) {
            this.displayGif='none'
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Not enabled'), MessageContentType.Text);
         //   console.log("transfer error: ", err);
          } else {
           // console.log(hash);
          
            this.authorize1(hash,tokenaddress);
          }
        });
      }
//    }
  }

  authorize(hash,tokenaddress) {
    // if(sessionStorage.getItem('exchange')=='wan')
    // {
    console.log('authorize',hash,tokenaddress)
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      console.log(hash1)
      if(hash1 === null) {
        this.authorize(hash,tokenaddress);
      }
      else {
        if(hash1['status']== 0x0) {
          console.log('error')
          this.zone.run(() => {
           // console.log('authorizecheck')
            this._authorize.next(false);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not enabled'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
           console.log('authorizecheck')
            this._authorize.next(true);
          });
          console.log('authorizecheck1')
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is Completed.'), MessageContentType.Text);
          let userAccount = this.userService.getCurrentUser().UserAccount;
          var orderTraderContract = this._web3.eth.contract(Constants.TokenAbiWAN);
          var instanceOrderTraderContract = orderTraderContract.at(tokenaddress);
          instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressWAN, (err, data) => {
            // alert(data)
          })
        }
      }
    });
 // }

  }

  authorize1(hash,tokenaddress) {
    // if(sessionStorage.getItem('exchange')=='wan')
    // {
   // console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
    //  console.log(hash1)
      if(hash1 === null) {
        this.authorize1(hash,tokenaddress);
      } 
      else {
        if(hash1['status']== 0x0) {
         // console.log('error')
          this.zone.run(() => {
          //  console.log('authorizecheck1')
            this._authorize.next(true);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not disabled'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
          //    console.log('authorizecheck1')
            this._authorize.next(false);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is Completed.'), MessageContentType.Text);
          let userAccount = this.userService.getCurrentUser().UserAccount;
          var orderTraderContract = this._web3.eth.contract(Constants.TokenAbiWAN);
          var instanceOrderTraderContract = orderTraderContract.at(tokenaddress);
          instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressWAN, (err, data) => {
          //  alert(data)
          })
        }
      }
    });
 // }
  
  }

  // onAuthorizeWandChange(data) {
  //   let userAccount = this.userService.getCurrentUser().UserAccount;
  //   let web3 = this.web3Service.getWeb3();
  //   var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
  //   var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddressWAN);

  //   if (data) {
  //     instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, web3Functions.toBaseUnitAmount(100000000, 18), {'from': userAccount}, (err, data) => {
  //       if (data) {
  //         this.zone.run(() => {
  //           this._authorizeWand.next(true);
  //         });
  //         this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
  //       }
  //       else {
  //         this.zone.run(() => {
  //           this._authorizeWand.next(false);
  //         });
  //         this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not enabled'), MessageContentType.Text);
  //       }
  //     });
  //   }
  //   else {
  //     instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, 0, {'from': userAccount}, (err, data) => {
  //       if (data) {
  //         this.zone.run(() => {
  //           this._authorizeWand.next(false);
  //         });
  //         this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
  //       }
  //       else {
  //         this.zone.run(() => {
  //           this._authorizeWand.next(true);
  //         });
  //         this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not disabled'), MessageContentType.Text);
  //       }
  //     });
  //   }
  // }


  onAuthorizeWandChange(data) {
    console.log(data)
  
 //   if(sessionStorage.getItem('exchange')=='wan') {
      let userAccount = this.userService.getCurrentUser().UserAccount;
     // let web3 = this.web3Service.getWeb3();
      var orderTraderContract = this._web3.eth.contract(Constants.TokenAbi);
      var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddressWAN);
this.displayGif='block';
      if (data) {
        // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        privateKey = Buffer.from(privateKey.substr(2), 'hex')
        var count = this._web3.eth.getTransactionCount(userAccount);
        var data = instanceOrderTraderContract.approve.getData(Constants.OrderBookContractAddressWAN, web3Functions.toBaseUnitAmount(100000000, 18), {'from': userAccount});
        const txParams = {
      		gasPrice: '0x09184e79a00',
      		gasLimit: 400000,
          to: Constants.WandxTokenAddressWAN,
          data:data,
          from: userAccount,
          chainId: Constants.chainid,
          Txtype: 0x01,
          nonce: count
        };
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
      		if( err) {
            this.displayGif='none';
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
      			//console.log("transfer error: ", err);
      		} else {
         //   console.log(hash);
          
            this.authorizecheck(hash);
      		}
        });
      }
      else {
        // const privateKey = Buffer.from(this.web3Service.priv, 'hex');
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        privateKey = Buffer.from(privateKey.substr(2), 'hex')
        var count = this._web3.eth.getTransactionCount(userAccount);
        var data = instanceOrderTraderContract.approve.getData(Constants.OrderBookContractAddressWAN, 0, {'from': userAccount});
        const txParams = {
          gasPrice: '0x09184e79a00',
          gasLimit: 400000,
          to: Constants.WandxTokenAddressWAN,
          data:data,
          from: userAccount,
          chainId: Constants.chainid,
          Txtype: 0x01,
          nonce: count
        };
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
          if( err) {
            this.displayGif='none';
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
         //   console.log("transfer error: ", err);
          } else {
         //   console.log(hash);
          
            this.authorizecheck1(hash);
          }
      
        });
      }
  //  }
  }
  authorizecheck(hash) {
    // if(sessionStorage.getItem('exchange')=='wan')
    // {
    console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      console.log(hash1)
      if(hash1 === null) {
        this.authorizecheck(hash);
      }
      else {
        if(hash1['status']== 0x0) {
          this.zone.run(() => {
            console.log('authorizecheck')
            this._authorizeWand.next(false);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not enabled'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
               console.log('authorizecheck')
            this._authorizeWand.next(true);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is Completed.'), MessageContentType.Text);
        }
      }
    });
 // }
 
  }

  authorizecheck1(hash) {
    // if(sessionStorage.getItem('exchange')=='wan')
    // {
   // console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      if(hash1 === null) {
        this.authorizecheck(hash);
      }
      else {
        if(hash1['status']== 0x0) {
          this.zone.run(() => {
          //  console.log('authorizecheck1')
            this._authorizeWand.next(true);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not disabled'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
        //    console.log('authorizecheck1')
            this._authorizeWand.next(false);
          });
          this.displayGif='none'
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is Completed.'), MessageContentType.Text);
        }
      }
    });
  //}
  
  }
}

