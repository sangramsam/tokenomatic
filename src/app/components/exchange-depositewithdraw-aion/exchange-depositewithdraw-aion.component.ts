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
import * as abi from 'human-standard-token-abi';
import { AionWeb3Service } from '../../services/aion-web3.service';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { UserAionService } from '../../services/user-aion.service';
import { AionExchangeService } from '../../services/aion-exchange.service';
import { PlatformAionTokenService } from '../../services/platform-aion-token.service';

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}
@Component({
  selector: 'app-exchange-depositewithdraw-aion',
  templateUrl: './exchange-depositewithdraw-aion.component.html',
  styleUrls: ['./exchange-depositewithdraw-aion.component.css']
})
export class  ExchangeDepositewithdrawAionComponent implements OnInit {
  showLoader: boolean = false;
  public displayGif = 'none';
  public selectedPlatformToken : any;
	public selectedFund: string = 'AION';
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
  	//private web3Service : Web3Service,
		private userService : UserAionService,
    private zone : NgZone,
    private notificationService : NotificationManagerService,
    public exchangeService : AionExchangeService,
    private platformTokenService : PlatformAionTokenService,
    private marketBroadcastService : MarketBroadcastService,
    private aion:AionWeb3Service,
    private savedWalletsService: SavedWalletsService

  ) {
    this._web3 = this.aion.getWeb3();
    this.onAuthorizeChange = this.onAuthorizeChange.bind(this)
    this.onAuthorizeWandChange = this.onAuthorizeWandChange.bind(this)
  }

  ngOnInit() {
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
    console.log("authorize data",data);    
    // let obj: any={};
    this.exchangeService.onAuthorizeChange(data)
  }
  onAuthorizeWandChange(data) {
    console.log("authorize data1",data);
    
    this.exchangeService.onAuthorizeWandChange(data)
  }
  
  deposit() {
    console.log("deposit")
   var self=this;
    if (self.amountToDepositOrWithdraw <= 0)
      return;
    let userAccount = sessionStorage.getItem("walletAddress");
     
    let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
      gasLimit: 3000000,
    })  
    //alert(self.selectedFund)
    if (self.selectedFund === 'AION') {
      self._web3.eth.getBalance(userAccount, (err, balance) => {
        console.log("deposit")
        balance = +self._web3.utils.fromNAmp(balance.toString());
        if (self.amountToDepositOrWithdraw > parseFloat(balance)) {
          self.zone.run(() => {
            self.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {
          self.showLoader = true;
          self.displayGif = 'block';

    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 
    const contractFunction = instanceOrderTraderContract.methods.deposit(userAccount)
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:999999,
      to:Constants.OrderBookContractAddressAION,
      value:self.amountToDepositOrWithdraw*1000000000000000000,
      data: functionAbi
    }; 
    self._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
        
   console.log(res)
    console.log("rawTransaction "+res.rawTransaction);
    
    self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
		if(!hash) {
      self.showLoader = false;
      self.displayGif = 'none';
      self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);
		} else {
      self.depositcheck(hash);
		}
	
  });
      })
         
        }
      })
    
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
  
      if (this.selectedFund === 'WAND') {
        var authorizedWandAmount = +this._web3.utils.fromNAmp(this.authorizedWandAmount.toString());
        authorizedWandAmount = authorizedWandAmount * (10 ** (18 - Constants.WandxTokenDecimals));
        if (authorizedWandAmount < this.amountToDepositOrWithdraw || !this.authorizeWand) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please authorize the Wand Token by turning it on for trading'), MessageContentType.Text);
          return;
        }
        selectedTokenAddress = Constants.WandxTokenAddressAION
        selectedTokenDecimal = Constants.WandxTokenDecimals
      } else if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        var authorizedAmount = +this._web3.utils.fromNAmp(this.authorizedAmount.toString());
        authorizedAmount = authorizedWandAmount * (10 ** (18 - this.selectedPlatformToken.decimals));
        if (authorizedAmount < this.amountToDepositOrWithdraw || !this.authorize) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, `Please authorize the ${this.selectedPlatformToken.symbol} Token by turning it on for trading`), MessageContentType.Text);
          return;
        }
        
        selectedTokenAddress = this.selectedPlatformToken.address
        selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else { 
        return;
      }
      let userAccount = sessionStorage.getItem("walletAddress");
     
      let selectedTokenContract = new this._web3.eth.Contract(Constants.TokenAbiAION,selectedTokenAddress, {
        gasLimit: 3000000,
      }) 
     
      selectedTokenContract.methods.balanceOf(userAccount).call().then(function (balance){
        let conversion = +self._web3.utils.fromNAmp(balance.toString());
        conversion = conversion * (10 ** (18 - selectedTokenDecimal));
        if (self.amountToDepositOrWithdraw > conversion) {
          self.zone.run(() => {
            self.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {

          self.showLoader = true;
          self.displayGif = 'block';
    let currentWallet=self.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 
    let value=self._web3.utils.toNAmp(self.amountToDepositOrWithdraw.toString());
    console.log("value",value)
    const contractFunction = instanceOrderTraderContract.methods.depositTokens(userAccount, selectedTokenAddress,value)
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:999999,
      to:Constants.OrderBookContractAddressAION,
      data: functionAbi
    }; 
    self._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
     
   console.log(res)
   console.log("rawTransaction "+res.rawTransaction);
  
   self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
		if( !hash) {
      self.showLoader = false;
      self.displayGif = 'none';
      self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);

		} else {
  
    
   self.depositcheck(hash);
		}
	
});
      });


        }
      })
    }
  }
  depositcheck(hash)
  {
   // console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
    //  console.log(hash1)
  if(hash1 === null)
  {
    this.depositcheck(hash);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
 // console.log('error')
  this.showLoader = false;
      this.displayGif = 'none';
  this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Deposit failed'), MessageContentType.Text);

    }
    else
    {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
      this.amountToDepositOrWithdraw = 0.0;
  }
  }
    });
  }
  withdraw() {
    var self=this;
    if (this.amountToDepositOrWithdraw <= 0)
      return;
    let userAccount = sessionStorage.getItem("walletAddress");
     
    let instanceOrderTraderContract = new this._web3.eth.Contract(Constants.OrderbookContractAbiAION,Constants.OrderBookContractAddressAION, {
      gasLimit: 3000000,
    }) 
    if (self.selectedFund == 'AION') {
      if (self.amountToDepositOrWithdraw > this.escrowEtherValue) {
        self.zone.run(() => {
          self.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
        });
        return;
      }
      self.showLoader = true;
      self.displayGif = 'block';
     
      let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex() 
    const contractFunction = instanceOrderTraderContract.methods.withdrawTo(userAccount,self._web3.utils.toNAmp(self.amountToDepositOrWithdraw.toString()))
    const functionAbi = contractFunction.encodeABI();
    const txParams = {
      gas:999999,
      to:Constants.OrderBookContractAddressAION,
      data: functionAbi
    }; 
    self._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
   console.log(res)
   console.log("rawTransaction "+res.rawTransaction);
   var tx_hash;
   self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash => {
      if( !hash) {
        self.showLoader = false;
        self.displayGif = 'none';
        self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);
      //  console.log("transfer error: ", err);
      } else {
       // console.log(hash);
      
       self.withdrawcheck(hash);
      }
    
  });
});
     
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
      // if (this.selectedFund == 'WAND'){
      //   console.log(this.wandEscrowValue, "amouut",this.amountToDepositOrWithdraw)
      //   if (this.amountToDepositOrWithdraw > this.wandEscrowValue) {
      //     this.zone.run(() => {
      //       this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
      //     });
      //     return;
      //   }
      //   selectedTokenAddress = Constants.WandxTokenAddress
      //   selectedTokenDecimal = Constants.WandxTokenDecimals
      // } else \
      if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        if (this.amountToDepositOrWithdraw > this.selectedTokenEscrowValue || !this.authorize) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
          });
          return;
        }
        selectedTokenAddress = this.selectedPlatformToken.address
        selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else {
        return;
      }
      this.showLoader = true;
      this.displayGif = 'block';
      
      let currentWallet=this.savedWalletsService.getCurrentWallet();
      var privateKey=currentWallet.getPrivateKeyHex() 
      const contractFunction = instanceOrderTraderContract.methods.withdrawTokenTo(userAccount, selectedTokenAddress,self._web3.utils.toNAmp(self.amountToDepositOrWithdraw.toString()));
      const functionAbi = contractFunction.encodeABI();
      const txParams = {
        gas:999999,
        to:Constants.OrderBookContractAddressAION,
        data: functionAbi
      }; 
        this._web3.eth.accounts.signTransaction(txParams,privateKey,function(err,res){
    console.log(res)
     console.log("rawTransaction "+res.rawTransaction);
    
     self._web3.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',hash=> {
      if( !hash) {
        self.showLoader = false;
        self.displayGif = 'none';
        self.notificationService.showNotification(new MessageModel(MessageType.Error, 'Error'), MessageContentType.Text);
     //   console.log("transfer error: ", err);
      } else {
      //  console.log(hash);
      
      self.withdrawcheck(hash);
      }
    
  });
});
    }
  }

  withdrawcheck(hash)
  {
  //  console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
    //  console.log(hash1)
  if(hash1 === null)
  {
    this.withdrawcheck(hash);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
 // console.log('error')
  this.showLoader = false;
      this.displayGif = 'none';
  this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Withdraw failed'), MessageContentType.Text);
    }
    else
    {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw successful, please wait for transaction to complete'), MessageContentType.Text);
       this.amountToDepositOrWithdraw = 0.0;
  }
  }
    });
  }
  
}
