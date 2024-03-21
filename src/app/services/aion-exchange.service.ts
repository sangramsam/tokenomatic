import { Injectable, NgZone } from '@angular/core';
import {NotificationManagerService} from './notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../models/message.model';
// import {Web3Service} from './web3.service';
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
import { AionWeb3Service } from './aion-web3.service';
import * as Web3 from 'web3';
import { PlatformAionTokenService } from './platform-aion-token.service';
import { UserAionService } from './user-aion.service';

var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;
declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}


@Injectable()
export class AionExchangeService {

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
  	private userService : UserAionService,
  	private notificationService : NotificationManagerService,
  	private savedWalletsService : SavedWalletsService,
  	private platformTokenService : PlatformAionTokenService,
    private marketBroadcastService : MarketBroadcastService,
    private zone : NgZone,
    private aion:AionWeb3Service

  ) {
    //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
    //this._web3= web3Service._getWeb3();
    this.aionWeb3= this.aion.getWeb3();
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
    var self=this;
    let userAccount = sessionStorage.getItem("walletAddress");
    let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
      gasLimit: 3000000,
    })
    console.log("before method",this.aionWeb3.version)
      instanceOrderTraderContract.methods.balanceOf(userAccount).call({from:userAccount},function(err,data){
    console.log('escrow',data,err);
    
      if (data)
        self._escrowEtherValue.next(+self.aionWeb3.utils.fromNAmp(data));
      else
        self._escrowEtherValue.next(0.0);
    });
       
  }

  getWandEscrowValue() {
      console.log('wandaion');
      var self=this;
      let userAccount = sessionStorage.getItem("walletAddress");
     
      let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.TokenAbiAION,Constants.WandxTokenAddressAION, {
        gasLimit: 3000000,
      })
        instanceOrderTraderContract.methods.allowance(userAccount, Constants.OrderBookContractAddressAION).call().then(function(data){
          // alert(data)
          if (data){
          let conversion = +this.aionWeb3.fromNAmp(data);
          self._wandEscrowValue.next(conversion);
        }
        else
          self._wandEscrowValue.next(0.0);
      });
   
  
  }
  getSelectedTokenEscrowValue() {
    if (
      !this._selectedPlatformToken || !this._selectedPlatformToken.address) {
      return this._selectedTokenEscrowValue.next(0);
    }
   
   
      var self=this;
        let userAccount = sessionStorage.getItem("walletAddress");
      
        let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
          gasLimit: 3000000,
        })
        console.log(this._selectedPlatformToken,this._selectedPlatformToken.address)
          instanceOrderTraderContract.methods.balanceOfToken(userAccount,this._selectedPlatformToken.address).call().then(function (data) {
        if (data) {
         
          let conversion = +self.aionWeb3.utils.fromNAmp(data.toString());
          console.log("conversion1",conversion);
          conversion = conversion * (10 ** (18 - self._selectedPlatformToken.decimals));
          console.log("conversion",conversion);
          self._selectedTokenEscrowValue.next(conversion);
          self.checkAllowance();
        }
      });
    
    
  }
  getEthBalanceForUser() {
   
 
      // let userAccount = this.userService.getCurrentUser().UserAccount;
      // if ( !userAccount || !userAccount.length)
      //   return
      //let web3 = this.web3Service.getWeb3();
      let userAddress =sessionStorage.getItem('walletAddress')
      this.aionWeb3.eth.getBalance(userAddress, (err, balance) => {
        let conversion = this.aionWeb3.utils.fromNAmp(balance.toString());
        this._ethWalletBalance.next(conversion);
      }) 
    
    
  }
  getPlatformTokenBalanceForUser() {
   
  
      var self=this;
      let userAccount = sessionStorage.getItem("walletAddress");
      if ( !userAccount || !this._selectedPlatformToken)
        return
      // let web3 = this.web3Service.getWeb3();
      let userAddress = userAccount;
      // alert(this._selectedPlatformToken.address)
      let selectedTokenContract = new this.aionWeb3.eth.Contract(Constants.EtherTokenAbi,this._selectedPlatformToken.address, {
        // from: this.account,
        gasLimit: 3000000,
      })
        selectedTokenContract.methods.balanceOf(userAddress).call().then(function (err) {   
        let conversion = +self.aionWeb3.utils.fromNAmp(err.toString());
        conversion = conversion * (10 ** (18 - self._selectedPlatformToken.decimals));
        self.aionwalletbalance=conversion;
        self._platformTokenWalletBalance.next(conversion);
      })
    
   
  }
  checkAllowance() {
      var self=this;
      let userAccount = sessionStorage.getItem("walletAddress");
      if ( !userAccount || !userAccount.length)
        return
      //let web3 = this.web3Service.getWeb3();
      let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.EtherTokenAbi,this._selectedPlatformToken.address, {
        // from: this.account,
        gasLimit: 3000000,
      })
     
        instanceOrderTraderContract.methods.allowance(userAccount, Constants.OrderBookContractAddressAION).call().then(function (data) {
    
        self._authorizedAmount.next(data.toString());
        if (data >= 25000000) {
          console.log('check');
          self._authorize.next(true);
        }
        else {
          console.log('check');
          self._authorize.next(false);
        }
      });
    
   
  }
  checkWandAllowance() {  
  
      var self=this;
      let userAccount = sessionStorage.getItem("walletAddress");
      if ( !userAccount || !userAccount.length)
        return
      //let web3 = this.web3Service.getWeb3();
      
      let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.EtherTokenAbi,Constants.WandxTokenAddressAION, {
        // from: this.account,
        gasLimit: 3000000,
      })
      instanceOrderTraderContract.methods.allowance(userAccount, Constants.OrderBookContractAddressAION).call().then(function (data) {
        self._authorizedWandAmount.next(data.toString());
        if (data >= 25000000) {
          
          self._authorizeWand.next(true);
        }
        else {
        
          self._authorizeWand.next(false);
        }
      });
    
  
  }
  onAuthorizeChange(data) {
      
  
      var self=this;
      self.displayGif='block'
      // let address =['0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x9181bf7531faf4f4b488621f1e63dee09e268fe2','0x7e3fde3c98da5ba63399b098e0ad6ca2429c6656','0xdec1259156221f5a35a2bc2ae77ad584e45eb4ac','0x88f376e8b8e525f15ce7d1b5c5e49bb41a5dc19b','0x2f37ec384180a6475df3de2e4bab6ae10caa937b','0x9e8f2cae092ef2e991cf101329cba5148a81dce9','0x5b0ecff8c72fca56e634f80d63b13d13f6abc1a5'];
      // let symbol =['WXETH','WXETH','WAND','QTUM','GNT','ZRX','SAND','WXETH','POWR'];
      let userAccount = sessionStorage.getItem("walletAddress");
      // let amount=self.aionwalletbalance.toString();
      let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.TokenAbiAION,this._selectedPlatformToken.address, {
        gasLimit: 3000000,
      })
      var tokenaddress=this._selectedPlatformToken.address;
    
      if (data) {
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait..'), MessageContentType.Text);
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        const contractFunction = instanceOrderTraderContract.methods.approve(Constants.OrderBookContractAddressAION,this.aionWeb3.utils.toNAmp('100000000'))
        const functionAbi = contractFunction.encodeABI();
        const txParams = {
          gas:999999,
          to:tokenaddress,
          data: functionAbi
        }; 
        self.aionWeb3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
          // console.log(res)
          self.aionWeb3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
            console.log("txhash",hash)
            if(!hash) {
              self.displayGif='none'
              self.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
            } else {
              console.log(hash)
              self.authorize(hash,tokenaddress);
            }
          });
        });
      }
      else {
        //self.displayGif='block'
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        const contractFunction = instanceOrderTraderContract.methods.approve(Constants.OrderBookContractAddressAION, 0)
        const functionAbi = contractFunction.encodeABI();
        const txParams = {
          gas:999999,
          to:this._selectedPlatformToken.address,
          data: functionAbi
        }; 
        self.aionWeb3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
          // console.log(res)
          // console.log("rawTransaction "+res.rawTransaction);
          var tx_hash;
          self.aionWeb3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
            console.log("txhash",hash)
            if(!hash) {
              self.displayGif='none'
              self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Not enabled'), MessageContentType.Text);
            } else {
              console.log(hash)
              self.authorize1(hash,tokenaddress);
            }
          });
        });
      }
    
   
  }

  authorize(hash,tokenaddress) {
    
    console.log('authorize',hash,tokenaddress)
    this.aionWeb3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      console.log(hash1)
      if(hash1 === null) {
        this.authorize(hash,tokenaddress);
      }
      else {
        if(hash1['status']== false) {
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
          // let userAccount = this.userService.getCurrentUser().UserAccount;
          // var orderTraderContract = this.aionWeb3.eth.contract(Constants.TokenAbiAION);
          // var instanceOrderTraderContract = orderTraderContract.at(tokenaddress);
          // instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressAION, (err, data) => {
          //   // alert(data)
          // })
        }
      }
    });
  
  }

  authorize1(hash,tokenaddress) {

     // console.log('authorize')
     this.aionWeb3.eth.getTransactionReceipt(hash,(err, hash1)=>{
        console.log(hash1)
        if(hash1 === null) {
          this.authorize1(hash,tokenaddress);
        } 
        else {
          if(hash1['status']== false) {
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
            // let userAccount = this.userService.getCurrentUser().UserAccount;
            // var orderTraderContract = this.aionWeb3.eth.contract(Constants.TokenAbiAION);
            // var instanceOrderTraderContract = orderTraderContract.at(tokenaddress);
            // instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddressAION, (err, data) => {
            // //  alert(data)
            // })
          }
        }
      });
  
  }

  
  onAuthorizeWandChange(data) {
    console.log(data)
   
      var self=this;
      self.displayGif='block';
      let userAccount = sessionStorage.getItem("walletAddress");
      let instanceOrderTraderContract = new this.aionWeb3.eth.Contract(Constants.TokenAbiAION,Constants.WandxTokenAddressAION, {
        gasLimit: 3000000,
      })
      if (data) {
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        const contractFunction = instanceOrderTraderContract.methods.approve(Constants.OrderBookContractAddressAION,this.aionWeb3.utils.toNAmp('1'))
        const functionAbi = contractFunction.encodeABI();
        const txParams = {
          gas:999999,
          to:Constants.WandxTokenAddressAION,
          data: functionAbi
        }; 
        self.aionWeb3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
          console.log(res)
          var tx_hash;
          self.aionWeb3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
            if(!hash) {
              self.displayGif='none';
              self.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
            } else {
              console.log(hash);
              self.authorizecheck(hash);
            }
          });
        })
      }
      else {
        //self.displayGif='block'
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        let currentWallet=this.savedWalletsService.getCurrentWallet();
        var privateKey=currentWallet.getPrivateKeyHex()
        const contractFunction = instanceOrderTraderContract.methods.approve(Constants.OrderBookContractAddressAION, 0)
        const functionAbi = contractFunction.encodeABI();
        const txParams = {
          gas:999999,
          to:Constants.WandxTokenAddressAION,
          data: functionAbi
        }; 
        self.aionWeb3.eth.accounts.signTransaction(txParams,privateKey,function(err,res) {
          console.log(res)
          self.aionWeb3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash=> {
            if(!hash) {
              self.displayGif='none';
              self.notificationService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
              console.log("transfer error: ", err);
            } else {
              console.log(hash);
              self.authorizecheck1(hash);
            }
          });
        });
      }
    
   
    
  }
  authorizecheck(hash) { 
 
    console.log('authorize')
    this.aionWeb3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      console.log(hash1)
      if(hash1 === null) {
        this.authorizecheck(hash);
      }
      else {
        if(hash1['status']== false) {
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
  
  }

  authorizecheck1(hash) {
   
  
     // console.log('authorize')
     this.aionWeb3.eth.getTransactionReceipt(hash,(err, hash1)=>{
      if(hash1 === null) {
        this.authorizecheck(hash);
      }
      else {
        if(hash1['status']== false) {
          this.zone.run(() => {
          //  console.log('authorizecheck1')
            this._authorizeWand.next(true);
          });this.displayGif='none'
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
  }
  
}
