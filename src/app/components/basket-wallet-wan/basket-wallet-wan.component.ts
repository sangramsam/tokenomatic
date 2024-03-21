import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {Http} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {Constants} from '../../models/constants';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NavigationService} from '../../services/nav.service';
//import {WalletService} from '../../services/wallet.service';
//import {Web3Service} from '../../services/web3.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {SwitchThemeService} from '../../services/switch-theme.service';
//import {TokenService} from '../../services/token.service';
import {ChartService} from '../../services/chart.service';
import {BigNumber} from 'bignumber.js';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import * as Web3 from 'web3';
import { WanWeb3Service } from '../../services/wan-web3.service';
import { TokenWanService } from '../../services/token-wan.service';
import { WalletWanService } from '../../services/wallet-wan.service';

var wanUtil = require('wanchain-util')
var Tx = wanUtil.wanchainTx;
declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-basket-wallet-wan',
  templateUrl: './basket-wallet-wan.component.html',
  styleUrls: ['./basket-wallet-wan.component.css']
})
export class BasketWalletWanComponent implements OnInit, OnDestroy {
  showLoader: boolean = false;
  public displayGif = 'none';
  private availableTokensType: Array<string> = ['WAND', 'ZRX', 'QTUM', 'VERI', 'GNT', 'DEX'];
  private tokenContracts: any;
  private tokenContractChange: Subscription;
  private userAccountChange: Subscription;
  private transactionInProgress: boolean = false;
  private savedWalletChangeSubscription : any
  selectedToken: string = 'WAND';
  allAvailableContracts: Array<any> = [];
  allAvailableTokenContracts: Array<any> = [];
  userAccountSummary: Array<any> = [];
  showWalletLoader = true;
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance = 0.0;
  wxETHBalance:any;
  usd: any;
  AllowanceBalance: any;
_web3:any;
  constructor(private navService: NavigationService,
              private http: Http,
              private zone: NgZone,
              private walletService: WalletWanService,
              private notificationsService: NotificationManagerService,
              readonly switchThemeService: SwitchThemeService,
             // private web3: Web3Service,
              private router: Router,
              private tokenService: TokenWanService,
              private savedWalletsService: SavedWalletsService,
              private chartService: ChartService,
              private web3 : WanWeb3Service) {
   // console.log('cuurent nav', navService.getCurrentActiveTab());
    //console.log(this.web3.priv)
    //this._web3 = new Web3(new Web3.providers.HttpProvider("http://18.216.117.215:8545"));
   // this._web3=web3._getWeb3();
    this._web3=web3._getWeb3();
    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(data => this.handleContractChange(data));
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(data => this.handleUserAccountSummaryChange(data));
    this.getWalletBalance = this.getWalletBalance.bind(this)
  }

  getWalletBalance() {
    let web3 = this._web3;
    web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
      this.currentEtherBalance = web3.fromWei(data).toFixed(4);
    });
  }
  ngOnInit() {
    this.showWalletLoader = true;
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.getWalletBalance()
      }
    });
    this.getWalletBalance()

    if (this.tokenService.getToken() === undefined) {
      this.tokenService.fetchToken();
    }
    else {
      this.loadData();
      this.isWalletActive();
    }
    let __this = this;
    this.chartService.setUSD(function (err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
  }

  ngOnDestroy(): void {
    this.tokenContractChange.unsubscribe();
    this.userAccountChange.unsubscribe();
    this.savedWalletChangeSubscription.unsubscribe()
  }

  isWalletActive() {
    if (this.navService.getCurrentActiveTab() === 'dashboard') {
      this.showContent = true;
    } else {
      this.showContent = false;
    }
  }

   private loadData() {
    if (this.walletService.getUserAccountSummary() !== undefined) {
      this.showWalletLoader = false;
      this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
      this.wxETHBalance = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXWAN')[0].Balance;
      const contrct = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXWAN')[0].tokenContract;
      console.log('contrct',contrct)
      const myTokenContract = this._web3.eth.contract(JSON.parse(contrct['abi']));
      const instanceMyTokenContract = myTokenContract.at(contrct['address']);
      const userAccount = sessionStorage.getItem('walletAddress');
      instanceMyTokenContract.allowance(userAccount, Constants.TrasfersProxyAddressWAN, (err, result) => {
        this.zone.run(() => {
          this.AllowanceBalance = new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON();
        });
      });
      console.log('WXEth Balance: ' + this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXWAN')[0].Balance);
      console.log('userAccountSummary length: ' + this.userAccountSummary.length);
    }
    else {
      this.walletService.fetchAccountSummary();
    }

    if (this.walletService.getContracts() !== undefined) {
      this.allAvailableContracts = this.walletService.getContracts();
    }
    else {
      this.walletService.fetchContracts();
    }

  }

  handleContractChange(data) {
    if (data === undefined)
      return;
    this.allAvailableContracts = data;
    for (var i = 0; i < data.length; i++) {
      if (data[i].isTokenContract) {
        data[i]['AuthorizationAmount'] = 0;
        this.allAvailableTokenContracts.push(data[i]);
      }
    }
    if (!this.hasUASummaryUpdateWithTC)
      this.updateUASummaryWithTokenContract();
  }

  handleUserAccountSummaryChange(data) {
   
    this.showWalletLoader = false;
    if (data === undefined)
      return;
    this.userAccountSummary = data.Balances;
    this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
    var wxEthToken = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXWAN')[0]
    this.wxETHBalance = 0;
    if (wxEthToken) {
      this.wxETHBalance = wxEthToken.Balance;
    }
    this.hasUASummaryUpdateWithTC = false;
    this.updateUASummaryWithTokenContract();
  }

  updateUASummaryWithTokenContract() {
    if (!this.allAvailableTokenContracts || !this.userAccountSummary)
      return;
    var self = this;
    this.hasUASummaryUpdateWithTC = true;
    self.allAvailableTokenContracts.forEach(function (it, i) {
      self.userAccountSummary.forEach(function (jt, j) {
        if (it.symbol && it.symbol == jt.Symbol)
          jt.tokenContract = it;
        if(i===self.allAvailableTokenContracts.length-1){
          const contrct = self.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXWAN')[0].tokenContract;
      //    console.log('contrct',contrct)
          const userAccount = sessionStorage.getItem('walletAddress');
          const myTokenContract = self._web3.eth.contract(JSON.parse(contrct['abi']));
          const instanceMyTokenContract = myTokenContract.at(contrct['address']);
          instanceMyTokenContract.allowance(userAccount, Constants.TrasfersProxyAddressWAN, (err, result) => {
            self.zone.run(() => {
              self.AllowanceBalance = (result/1000000000000000000).toFixed(4);
            });
          });
        }
      });
    });

  }

  refreshAccountSummary() {
    this.showWalletLoader = true;
    this.walletService.fetchAccountSummary();
  }

  deposit() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
      return;
    }
    let web3Instance = this.web3._getWeb3();
    var userAccount = sessionStorage.getItem('walletAddress');
    if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
    //  console.log("sfjslf")
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please reload'), MessageContentType.Text);
      return;
    }

    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Depositing ' + this.amount + ' as WXWAN to enable trading in WRC20 Token Baskets'), MessageContentType.Text);
    let wxEthData = this.getContract('WXWAN');
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get wan token details'), MessageContentType.Text);
      return;
    }
    this.showLoader = true;
          this.displayGif = 'block';
    let wxEth =this._web3.eth.contract(Constants.wxethWAN);
    let wxEthContract = wxEth.at(Constants.EtherTokenAddressWAN);
    let convertedAmount = this.amount*1000000000000000000;
    // const privateKey = Buffer.from(this.web3.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    privateKey = Buffer.from(privateKey.substr(2), 'hex')

    var count = this._web3.eth.getTransactionCount(userAccount);

//console.log("Getting gas estimate");

var data = wxEthContract.deposit.getData(userAccount, {from: userAccount, value: convertedAmount});
    const txParams = {
		gasPrice: '0x09184e79a00',
		gasLimit: 400000,
      to: Constants.EtherTokenAddressWAN,
      data:data,
      from: userAccount,
      chainId: Constants.chainid,
      Txtype: 0x01,
      value:convertedAmount,
      nonce: count
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
		if( err) {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
	//		console.log("transfer error: ", err);
		} else {
   
      this.depositcheck(hash);
		}

		})
  
  }
depositcheck(hash)
{
 // console.log('deposit')
  this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
 //   console.log(hash1)
if(hash1 === null)
{
  this.depositcheck(hash);
}
else
{
  if(hash1['status']== 0x0)
  {
//console.log('error')
this.showLoader = false;
this.displayGif = 'none';
this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
  }
  else
  {
  this._web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
    this.currentEtherBalance = this._web3.fromWei(data).toFixed(4);
  });
  const myTokenContract = this._web3.eth.contract(Constants.wxethWAN);
  const instanceMyTokenContract = myTokenContract.at(Constants.EtherTokenAddressWAN);
  instanceMyTokenContract.balanceOf(sessionStorage.getItem('walletAddress'),(err, result) => {
    this.zone.run(() => {
  this.wxETHBalance = (result/1000000000000000000).toFixed(4);
    })
  })
  this.showLoader = false;
  this.displayGif = 'none';
  this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token deposit successful, please wait for transaction to complete'), MessageContentType.Text);
}
}
  });
}
  withdraw() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
      return;
    }
    let web3Instance = this.web3._getWeb3();
    var userAccount = sessionStorage.getItem('walletAddress');
    if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please check reload'), MessageContentType.Text);
      return;
    }
    this._web3.eth.getBalance(userAccount, (err, result) => {
    //  console.log('balance', new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON());
      const balance = new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON();
      if (this.amount > parseFloat(balance)) {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
        return;
      } else {
        this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Withdrawing ' + this.amount + ' from wan token'), MessageContentType.Text);
        let wxEthData = this.getContract('WXWAN');
        if (!wxEthData || wxEthData === undefined || wxEthData === null) {
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get wan token details'), MessageContentType.Text);
          return;
        }
        this.showLoader = true;
        this.displayGif = 'block';
        let wxEth =this._web3.eth.contract(Constants.wxethWAN);
    let wxEthContract = wxEth.at(Constants.EtherTokenAddressWAN);
    let convertedAmount = this.amount*1000000000000000000;

    // const privateKey = Buffer.from(this.web3.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    privateKey = Buffer.from(privateKey.substr(2), 'hex')

    var count = this._web3.eth.getTransactionCount(userAccount);

//console.log("Getting gas estimate");

var data = wxEthContract.withdraw.getData(convertedAmount, {from: userAccount});
    const txParams = {
		gasPrice: '0x09184e79a00',
		gasLimit: 400000,
      to: Constants.EtherTokenAddressWAN,
      data:data,
      from: userAccount,
      chainId: Constants.chainid,
      Txtype: 0x01,
      //value:convertedAmount,
      nonce: count
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
		if( err) {
      this.showLoader = false;
  this.displayGif = 'none';
  this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
		//	console.log("transfer error: ", err);
		} else {
   
      this.withdrawcheck(hash);
		}
	
		})
       
      }
    });


  }

  withdrawcheck(hash)
{
//  console.log('deposit')
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
//console.log('error')
this.showLoader = false;
this.displayGif = 'none';
this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
  }
  else
  {
  this._web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
    this.currentEtherBalance = this._web3.fromWei(data).toFixed(4);
  });
  const myTokenContract = this._web3.eth.contract(Constants.wxethWAN);
  const instanceMyTokenContract = myTokenContract.at(Constants.EtherTokenAddressWAN);
  instanceMyTokenContract.balanceOf(sessionStorage.getItem('walletAddress'),(err, result) => {
    this.zone.run(() => {
  this.wxETHBalance = (result/1000000000000000000).toFixed(4);
    })
  })
  this.showLoader = false;
  this.displayGif = 'none';
  this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
}
}
  });
}
  authorize(token: any) {
   // console.log(token)
    var contract, exchange, wxethAddress;
    if (this.allAvailableContracts === null || this.allAvailableContracts === undefined || this.allAvailableContracts.length === 0)
      return;
    for (var i = 0, len = this.allAvailableContracts.length; i < len; i++) {
      if (this.allAvailableContracts[i]['symbol'] == token['symbol'])
        contract = this.allAvailableContracts[i];
      else if (this.allAvailableContracts[i]['symbol'] == 'DEX')
        exchange = this.allAvailableContracts[i];
    }
    var myTokenContract = this._web3.eth.contract(Constants.wxethWAN);
    var instanceMyTokenContract = myTokenContract.at(Constants.EtherTokenAddressWAN);
    var userAccount = sessionStorage.getItem('walletAddress');
    if (token.symbol === 'WXWAN') {
      wxethAddress = Constants.TrasfersProxyAddressWAN;
    } else {
      wxethAddress = Constants.TrasfersProxyAddressWAN;
    }
    this.checkAndAuthorize(instanceMyTokenContract, userAccount, wxethAddress,token.AuthorizationAmount*1000000000000000000);
    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Initiated authorization'), MessageContentType.Text);
  }

  private checkAndAuthorize(instanceTokenContract, account, authorizedAcc, value) {
    // alert('called checkAndAuthorize')
    instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
   //   console.log('result', result.lt(value));
      if (result.lt(value)) {
        this.authorizeOne(instanceTokenContract, account, authorizedAcc, value);
      } else {
        this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Already Authorized'), MessageContentType.Text);
      }
    });
  }

  private authorizeOne(instanceTokenContract, account, authorizedAcc, value) {
  
    this.showLoader = true;
          this.displayGif = 'block';
    let wxEth =this._web3.eth.contract(Constants.wxethWAN);
    let wxEthContract = wxEth.at(Constants.EtherTokenAddressWAN);
    // const privateKey = Buffer.from(this.web3.priv, 'hex');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privateKey=currentWallet.getPrivateKeyHex()
    privateKey = Buffer.from(privateKey.substr(2), 'hex')

    var count = this._web3.eth.getTransactionCount(account);

//console.log("Getting gas estimate");

var data = wxEthContract.approve.getData(authorizedAcc, value, { from: account});
    const txParams = {
		gasPrice: '0x09184e79a00',
		gasLimit: 400000,
      to: Constants.EtherTokenAddressWAN,
      data:data,
      from: account,
      chainId: Constants.chainid,
      Txtype: 0x01,
     // value:convertedAmount,
      nonce: count
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
this._web3.eth.sendRawTransaction("0x"+serializedTx.toString('hex'), (err, hash)=>{
		if( err) {
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'error'), MessageContentType.Text);
	//		console.log("transfer error: ", err);
		} else {
  
      this.authorizecheck(hash,authorizedAcc);
		}
	
});

 
  }


  authorizecheck(hash,authorizedAcc)
  {
   // console.log('authorize')
    this._web3.eth.getTransactionReceipt(hash,(err, hash1)=>{
   //   console.log(hash1)
  if(hash1 === null)
  {
    this.authorizecheck(hash,authorizedAcc);
  }
  else
  {
    if(hash1['status']== 0x0)
    {
  //console.log('error')
  this.showLoader = false;
      this.displayGif = 'none';
  this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
    }
    else
    {
    this._web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
      this.currentEtherBalance = this._web3.fromWei(data).toFixed(4);
    });
    const myTokenContract = this._web3.eth.contract(Constants.wxethWAN);
    const instanceMyTokenContract = myTokenContract.at(Constants.EtherTokenAddressWAN);
    instanceMyTokenContract.allowance(sessionStorage.getItem('walletAddress'), authorizedAcc, (err, result) => {
      this.AllowanceBalance = (result/1000000000000000000).toFixed(4);
      this.showLoader = false;
      this.displayGif = 'none';
      this.notificationsService.showNotification(new MessageModel(MessageType.Success, "Authorization successfully submitted to Blockchain network"), MessageContentType.Text);
    });
  }
  }
    });
  }




  private getContract(symbol: string) {
    let availableContracts = this.walletService.getContracts();
    for (var i = 0; i < availableContracts.length; i++) {
      if (availableContracts[i].symbol === symbol) {
        return availableContracts[i];
      }
    }
    return undefined;
  }

  getAllowance(tokenContract) {
    const userAccount = sessionStorage.getItem('walletAddress');
          const myTokenContract = this._web3.eth.contract(JSON.parse(tokenContract['abi']));
          const instanceMyTokenContract = myTokenContract.at(tokenContract['address']);
          instanceMyTokenContract.allowance(userAccount, Constants.TrasfersProxyAddressWAN, (err, result) => {
            this.zone.run(() => {
              this.AllowanceBalance = new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON();            });
          });
  }
}
