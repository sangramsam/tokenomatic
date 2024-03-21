 import { Component, OnInit,OnDestroy, NgZone } from '@angular/core';

import {Http} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {Constants} from '../../models/constants';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NavigationService} from '../../services/nav.service';
//import {WalletService} from '../../services/wallet.service';
import {AionWeb3Service} from '../../services/aion-web3.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {SwitchThemeService} from '../../services/switch-theme.service';
//import {TokenService} from '../../services/token.service';
import {ChartService} from '../../services/chart.service';
import {BigNumber} from 'bignumber.js';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import{JSONAionWallet,AionWalletHelper} from '../wallets/jsonwallet_aion';
import { constants } from 'os';
import {ExchangeWalletSelectComponent} from '../exchange-wallet-select/exchange-wallet-select.component'
import { WalletAionService } from '../../services/wallet-aion.service';
import { TokenAionService } from '../../services/token-aion.service';
//import { Web3Service } from '../../services/web3.service';
declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-aionwallet',
  templateUrl: './aionwallet.component.html',
  styleUrls: ['./aionwallet.component.css']
})
export class AionwalletComponent implements  OnInit, OnDestroy {

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
  
  showLoader: boolean = false;
  public displayGif = 'none';
  public wizard1=true;
  
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance:any = 0.0;
  wxETHBalance:any = 0.0;
  tokenbalance:any;
  usd: any;
  AllowanceBalance: any= 0.0;
  instance:any;
  Symbol:any;
  AuthorizationAmount:any;
  aionWalletHelper:any
  ccadd:any;
  exchangeWalletSelectComponent:any;
  currentWallet : any;

  constructor(
    private navService: NavigationService,
    private http: Http,
    private zone: NgZone,
    private walletService: WalletAionService,
    private notificationsService: NotificationManagerService,
    readonly switchThemeService: SwitchThemeService,
    private web3: AionWeb3Service,
    private router: Router,
    // private ww  : JSONAionWallet,
    private tokenService: TokenAionService,
    private savedWalletsService: SavedWalletsService,
    private chartService: ChartService,
   //private web3service: Web3Service
  ) {
    console.log("wallet tab is called");
    var self=this;
    console.log('cuurent nav', navService.getCurrentActiveTab());
    console.log("selected Account Address",this.savedWalletsService.getCurrentWallet())
  // console.log("private Keyyyy",this.aionWalletHelper.getDecode());
    self.tokenContractChange = self.walletService.tokenContractChange$.subscribe(data => self.handleContractChange(data));
    self.userAccountChange = self.walletService.userAccountSummaryChange$.subscribe(data => self.handleUserAccountSummaryChange(data));
    self.getWalletBalance = self.getWalletBalance.bind(self)
    let _web3=self.web3.getWeb3();
    console.log("private Key by session",sessionStorage.getItem("privk"))
    // let wxethAddress='0xA0aF6BAa95c242aa092E43EE9Fc09838E5a29B5521a8c00056730b61F5F316D3';
    self.instance=new _web3.eth.Contract(Constants.EtherTokenAbi,Constants.EtherTokenaionAddress,{from:sessionStorage.getItem('walletAddress'),gasLimit:550000})
    self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result){
      var balance=result;
      console.log("balance",balance);
      self.wxETHBalance=(balance/1000000000000000000).toFixed(4)
     })
  
    self.instance.methods.allowance(sessionStorage.getItem('walletAddress'),Constants.TrasfersProxyaionAddress).call().then(function(result){
      let a = result;
      //1000000000000000000;
      console.log("allowance",a)
      self.AllowanceBalance=(a/1000000000000000000).toFixed(4);
    })
    self.instance.methods.symbol().call().then(function(result){
      console.log(result);
      self.Symbol=result;
    })
  }

  getAllowanceBalance(){
    var self=this
 //   self.instance=new _web3.eth.Contract(Constants.EtherTokenAbi,wxethAddress,{from:sessionStorage.getItem('walletAddress'),gasLimit:550000})
    self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result){
      var balance=result/1000000000000000000;
      console.log("balance",balance);
      self.wxETHBalance=balance.toFixed(4)
    })
  
     self.instance.methods.allowance(sessionStorage.getItem('walletAddress'),Constants.TrasfersProxyaionAddress).call().then(function(result){
      console.log("result",result) 
      //let a = result.toNumber();
        console.log("result type",typeof(result))
        console.log("allowance",result)
        self.AllowanceBalance=(result/1000000000000000000).toFixed(4);
    })
  }
  getWalletBalance() {
    let web3 = this.web3.getWeb3();
    web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
      this.currentEtherBalance = (data/1000000000000000000).toFixed(4);
    });
  }
  ngOnInit() {
    this.showWalletLoader = true;
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.getWalletBalance()
        this.getAllowanceBalance()
      }
    });
    this.getWalletBalance()
    this.getAllowanceBalance()

    if (this.tokenService.getToken() === undefined) {
      console.log(this.tokenService.getToken())
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
      const userAccount = sessionStorage.getItem('walletAddress');
      console.log('WXEth Balance: ' + this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].Balance);
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
    //var wxEthToken = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0]
    // this.wxETHBalance = 0;
    // if (wxEthToken) {
    //   this.wxETHBalance = wxEthToken.Balance;
    // }
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
          // const contrct = self.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].tokenContract;
          // console.log('contrct',contrct)
          //const myTokenContract = self.web3.getWeb3().eth.contract(JSON.parse(contrct['abi']));
          const myTokenContract = Constants.EtherTokenAbi;
          const userAccount = sessionStorage.getItem("address");
          this.instance.methods.allowance(userAccount,Constants.TrasfersProxyaionAddress).call().then(function (result){
            self.AllowanceBalance = result/1000000000000000000;
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
    var userAccount = sessionStorage.getItem('walletAddress');
    var self=this;
    let web3Instance = self.web3.getWeb3();
    web3Instance.eth.getBalance(userAccount,function(err,res){
      if(res==0){
        self.notificationsService.showNotification(new MessageModel(MessageType.Error, "Your wallet doesn't have  AION balance"), MessageContentType.Text);
      }
      else {
     
        self.displayGif='block';
        self.wizard1=false;
        let currentWallet=self.savedWalletsService.getCurrentWallet();
        var privatekey=currentWallet.getPrivateKeyHex() 
        console.log("deposit private key",privatekey)
        if (self.transactionInProgress) {
          self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
          return;
        }
        if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
          console.log("sfjslf")
          self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please reload'), MessageContentType.Text);
          return;
        }

        self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Depositing ' + self.amount + ' as WXETH to enable trading in ERC20 Token Baskets'), MessageContentType.Text);
      
        const contractFunction = self.instance.methods.deposit(userAccount);
        const functionAbi = contractFunction.encodeABI();
        let estimatedGas;
        let nonce;
        let convertedAmount = self.amount*1000000000000000000;
        console.log(self.instance);

        contractFunction.estimateGas({from:userAccount}).then((gasAmount) => {
          estimatedGas = gasAmount.toString(16);
        
          console.log("Estimated gas: " + estimatedGas);
      
          web3Instance.eth.getTransactionCount(userAccount).then(_nonce => {
            nonce = _nonce.toString(16);
      
            console.log("Nonce: " + nonce);
          
            const txParams = {
              // 
              gas:60000,
              to:Constants.EtherTokenaionAddress,
              data: functionAbi,
              value: convertedAmount
            };
            let raa;
            web3Instance.eth.accounts.signTransaction(txParams,privatekey,(err,res)=>{
              console.log("sign transaction is",res);
              raa=res.rawTransaction;
              let txHash;
              web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',tx_hash=>{
                tx_hash=tx_hash;
              }).on('receipt', receipt => {
                console.log("receipt is........",receipt);
                console.log("Instance is.......",self.instance);
                var a=receipt.blockNumber-1000;
                console.log("Blocknumber is......",receipt.blockNumber,a)
                self.instance.getPastEvents('Transfer',{fromBlock:a, toBlock: 'latest'},function(errr,ress){
                  console.log("events is ",ress,errr);
                })
                self.displayGif = 'none';
                self.wizard1=true;
                self.getWalletBalance();
                self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
                  console.log(result);
                  self.wxETHBalance =(result/1000000000000000000).toFixed(4);
                  if (!receipt || receipt === undefined || receipt === null) {
                    self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
                    return;
                  }
                  self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token deposit successful, please wait for transaction to complete'), MessageContentType.Text);
                  return;
                })
              }).catch(err=>{
                  console.log(err)
                  self.check_deposit(txHash);
              })
            })
          })
        });
      }  
    })
  }
  check_deposit(res){
    var self=this;
    let web3Instance = self.web3.getWeb3();
    web3Instance.eth.getTransactionReceipt(res,function(err,resr){
    // self.showLoader = false;
      if(res===null){
        self.check_deposit(res);
      }
      else{
        console.log("Instance is.......",self.instance);
        self.instance.getPastEvents('Transfer',{fromBlock: resr.blockNumber, toBlock: 'latest'},function(errr,ress){
          console.log("events is ",ress,errr);
        })
        console.log(resr)
        self.getWalletBalance();
        self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
          console.log(result);
          self.wxETHBalance =(result/1000000000000000000).toFixed(4);
          // alert(result);
          self.displayGif = 'none';
          self.wizard1=true;
          if (!result || result === undefined || result === null) {
            self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
            return;
          }
          self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token deposit successful, please wait for transaction to complete'), MessageContentType.Text);
          return;
        }) 
      } 
    })
  }

  withdraw() {
    var self=this;
    let web3Instance = self.web3.getWeb3();
    var userAccount = sessionStorage.getItem('walletAddress');
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privatekey=currentWallet.getPrivateKeyHex() 
    self.instance.methods.balanceOf(userAccount).call().then(function(res){
      if(res==0){
        self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient WXAION balance to withdraw.'), MessageContentType.Text);
      }
      else {

        console.log("checkingbalance",res)
        if (self.transactionInProgress) {
          self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
          return;
        }
       
        if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
          this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please check reload'), MessageContentType.Text);
          return;
        }
        self.instance.methods.balanceOf(userAccount).call().then(function(result) {
          console.log('balance', new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON());
          const balance = new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(18)).toJSON();
          if (self.amount > parseFloat(balance)) {
            self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
            return;
          } else {
            self.displayGif='block';
            self.wizard1=false;
            
            self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Withdrawing ' + self.amount + ' from ether token'), MessageContentType.Text);
            
            let value=self.amount.toString();
            const contractFunction = self.instance.methods.withdraw(web3Instance.utils.toNAmp(value));
            const functionAbi = contractFunction.encodeABI();
            console.log(functionAbi)
            let estimatedGas;
            let nonce;
            let convertedAmount = web3Functions.toBaseUnitAmount(self.amount, 18);
            contractFunction.estimateGas({from:userAccount}).then((gasAmount) => {
              estimatedGas = gasAmount.toString(16);
            
              console.log("Estimated gas: " + estimatedGas);
            
              web3Instance.eth.getTransactionCount(userAccount).then(_nonce => {
                nonce = _nonce.toString(16);
            
                console.log("Nonce: " + nonce);
                
                const txParams = {
                  gas:160000,
                  to:Constants.EtherTokenaionAddress,
                  data: functionAbi,
                };
                let raa;
                let tx;
                web3Instance.eth.accounts.signTransaction(txParams,privatekey,(err,res)=> {
                  //console.log("sign transaction is",res);
                  raa=res.rawTransaction;
                  web3Instance.eth.sendSignedTransaction(raa).on('receipt', receipt => {
                   // console.log(receipt);
                    self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
                      self.wxETHBalance = (result/1000000000000000000).toFixed(4);

                      if (!result || result === undefined || result === null) {
                        self.displayGif='none';
                        self.wizard1=false;
                        self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
                        return;
                      }
                      self.displayGif='none';
                      self.wizard1=true;
                      self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
                      return;
                    })
                  })
                })
              })
            });
          }
        });
      }
    })
  }

  check_withdraw(res){
    var self=this;
    let web3Instance=self.web3.getWeb3();
    web3Instance.eth.getTransactionReceipt(res,function(err,res){
      if(res === null) {self.check_withdraw(res);} 
      self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
        self.wxETHBalance = (result/1000000000000000000).toFixed(4);
        if (!result || result === undefined || result === null) {
          self.displayGif='none';
          self.wizard1=false;
          self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
              return;
            }
            self.displayGif='none';
            self.wizard1=true;
            self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
            return;
      })
    })
  }

  authorize() {
    var self=this
    var userAccount = sessionStorage.getItem('walletAddress');
    self.instance.methods.balanceOf(userAccount).call().then(function(res){
      if(res==0) {
        self.notificationsService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient WXAION balance to Authorize.'), MessageContentType.Text);
      }
      else {
        var wxethAddress;
        self.displayGif='block';
        self.wizard1=false;
        let web3Instance = self.web3.getWeb3();
  
        wxethAddress = Constants.TrasfersProxyaionAddress;         
        var value = self.AuthorizationAmount
        self.checkAndAuthorize(self.instance, userAccount, wxethAddress,value);
        self.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Initiated authorization'), MessageContentType.Text);
      }
    }) 
  }

  private checkAndAuthorize(instanceTokenContract, account, authorizedAcc, value) {
    let self=this;
    instanceTokenContract.methods.allowance(account,Constants.TrasfersProxyaionAddress).call().then(function(result){
      let r=result/1000000000000000000;
      if (r<=value) {
         self.authorizeOne(instanceTokenContract, account, authorizedAcc, value);
      } else {
        self.displayGif='none';
        self.wizard1=true;
        self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Already Authorized'), MessageContentType.Text);
      }
    })
  }

  private authorizeOne(instanceTokenContract, account, authorizedAcc, value) {
    var tx;
    // var p=sessionStorage.getItem('exchange111');
    // console.log("ppppp",p)
    // var p1=p.toString();
    var self=this;
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privatekey=currentWallet.getPrivateKeyHex()      
    //        console.log(instanceTokenContract)
    let web3Instance = this.web3.getWeb3();
    let convertedAmount =value.toString();       
    const contractFunction = this.instance.methods.approve(authorizedAcc,web3Instance.utils.toNAmp(convertedAmount));
    const functionAbi = contractFunction.encodeABI();
    console.log(functionAbi)
    let estimatedGas;
    let nonce;
    web3Instance.eth.getTransactionCount(account).then(_nonce => {
      nonce = _nonce.toString(16);
      console.log("Nonce: " + nonce);
      const txParams = {
        gas:560000,
        to:Constants.EtherTokenaionAddress,
        data: functionAbi,
      };
      console.log(this.instance);
      console.log(txParams,privatekey)
      let raa;
      web3Instance.eth.accounts.signTransaction(txParams,privatekey,(err,res)=>{
        console.log("sign transaction is",res);
        raa=res.rawTransaction;
        web3Instance.eth.sendSignedTransaction(raa).on('receipt', receipt => {
          tx=receipt;
          console.log(receipt);
          this.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
          self.wxETHBalance = (result/1000000000000000000).toFixed(4);
            web3Instance.eth.getBalance(sessionStorage.getItem("walletAddress")).then( res => {
              self.currentEtherBalance = (res/1000000000000000000).toFixed(4)
            });
            console.log("Value after increment: " + result)
          // self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
          })
          self.instance.methods.allowance(account, authorizedAcc).call().then(function(result) {
            console.log("allowance"+result);
            self.AllowanceBalance=(result/1000000000000000000).toFixed(4);
            self.displayGif='none';
            self.wizard1=true;
            self.notificationsService.showNotification(new MessageModel(MessageType.Success, "Authorization successfully submitted to Blockchain network"), MessageContentType.Text);
          });
        }).catch(err=>{
          console.log(err);
          console.log(tx);
          var web3=self.web3.getWeb3()
          web3.eth.getTransactionReceipt(tx,function(err,res){
            console.log(res);
            self.instance.methods.balanceOf(sessionStorage.getItem("walletAddress")).call().then(function (result) {
              self.wxETHBalance = (result/1000000000000000000).toFixed(4);
              web3Instance.eth.getBalance(sessionStorage.getItem("walletAddress")).then( res => {
              self.currentEtherBalance = (res/1000000000000000000).toFixed(4)
              });
              console.log("Value after increment: " + result)
              self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
            })
            self.instance.methods.allowance(account, authorizedAcc).call().then(function(result) {
              self.AllowanceBalance=(result/1000000000000000000).toFixed(4);
              self.displayGif='none';
              self.wizard1=true;
              self.notificationsService.showNotification(new MessageModel(MessageType.Success, "Authorization successfully submitted to Blockchain network"), MessageContentType.Text);
            });
          })
        })
      })
    })
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
   var self=this;
    var myTokenContract = self.web3.getWeb3().eth.contract(JSON.parse(tokenContract['abi']));
    //var instanceMyTokenContract = myTokenContract.at(tokenContract['address']);
    //var userAccount = self.web3.getWeb3().eth.coinbase;
    self.instance.allowance(sessionStorage.getItem('walletAddress'), Constants.TrasfersProxyaionAddress, (err, result) => {
    self.zone.run(() => {
        self.AllowanceBalance = (result/1000000000000000000).toFixed(4);
      });
    });
  }
}
