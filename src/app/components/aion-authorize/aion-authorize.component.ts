import { Component,NgZone, OnDestroy, OnInit } from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {Constants} from '../../models/constants';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NavigationService} from '../../services/nav.service';
//import {WalletService} from '../../services/wallet.service';
import { AionWeb3Service } from '../../services/aion-web3.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {SwitchThemeService} from '../../services/switch-theme.service';
//import {TokenService} from '../../services/token.service';
import {ChartService} from '../../services/chart.service';
import * as _ from 'underscore';
//import {PortfolioService} from '../../services/portfolio.service';
import {BigNumber} from 'bignumber.js';
import {validate} from 'codelyzer/walkerFactory/walkerFn';
import{JSONAionWallet,AionWalletHelper} from '../wallets/jsonwallet_aion';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import { PortfolioAionService } from '../../services/portfolio-aion.service';
import { TokenAionService } from '../../services/token-aion.service';
import { WalletAionService } from '../../services/wallet-aion.service';
//import { Web3Service } from '../../services/web3.service';

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}
@Component({
  selector: 'app-aion-authorize',
  templateUrl: './aion-authorize.component.html',
  styleUrls: ['./aion-authorize.component.css']
})
export class AionAuthorizeComponent implements OnInit {
  ccadd:any
  aionWalletHelper:any
  selectedToken: string = 'WAND';
  allAvailableContracts: Array<any> = [];
  allAvailableTokenContracts: Array<any> = [];
  userAccountSummary: Array<any> = [];
  showWalletLoader = true;
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance = 0.0;
  wxETHBalance = 0.0;
  usd: any;
  contractAddress: any;
  tokenListAddress: Array<any> = [];
  tokenWithbalance: Array<any> = [];
  vsbContract: any;
  trackDepositeToken = 0;
  private availableTokensType: Array<string> = ['WAND', 'ZRX', 'QTUM', 'VERI', 'GNT', 'DEX'];
  private tokenContracts: any;
  private tokenContractChange: Subscription;
  private userAccountChange: Subscription;
  private transactionInProgress: boolean = false;
  private authorizeTokenList = [];
  private authorizeTransactionTimer: any;
  public showLoader = false;
  public track = 0;
  public displayGif ='none';
  public platformTokens: any;
  constructor(private navService: NavigationService,
              private http: Http,
              private portfolioService: PortfolioAionService,
              private zone: NgZone,
              private walletService: WalletAionService,
              private notificationsService: NotificationManagerService,
              readonly switchThemeService: SwitchThemeService,
              private web3: AionWeb3Service,
              private router: Router,
              private tokenService: TokenAionService,
            //  private web3service:Web3Service,
              private chartService: ChartService,  private savedWalletsService: SavedWalletsService,
              ) {
                this.aionWalletHelper = new AionWalletHelper(this.web3);
               // console.log("showloader is",!this.showLoader);
              //  console.log("authorize token is called");
  //  console.log('cuurent nav', navService.getCurrentActiveTab());
    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(data => this.handleContractChange(data));
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(data => this.handleUserAccountSummaryChange(data));
  }

  ngOnInit() {
    this.showWalletLoader = true;
    this.authorizeTokenList = [];
    let web3 = this.web3.getWeb3();
    web3.eth.getBalance(sessionStorage.getItem('walletAddress'), (err, data) => {
      this.currentEtherBalance = data/1000000000000000000;
    });
   

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
    this.track = 0;
    this.getPlatformTokens();
    setTimeout(function(){ console.log("token with balance",this.tokenWithbalance); }, 3000);
  }

  ngOnDestroy(): void {
    this.tokenContractChange.unsubscribe();
    this.userAccountChange.unsubscribe();
    if (this.authorizeTransactionTimer) {
      clearTimeout(this.authorizeTransactionTimer);
    }
  }

  isWalletActive() {
    if (this.navService.getCurrentActiveTab() === 'dashboard') {
      this.showContent = true;
    } else {
      this.showContent = false;
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
      });
    });
  }

  refreshAccountSummary() {
    this.showWalletLoader = true;
    this.walletService.fetchAccountSummary();
  }

  deposit() {
    
  }

  withdraw() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please check Wallet'), MessageContentType.Text);
      return;
    }

    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Withdrawing ' + this.amount + ' from ether token'), MessageContentType.Text);
    let wxEthData = this.getContract('WXETH');
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get ether token details'), MessageContentType.Text);
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.withdraw(convertedAmount, {from: userAccount}, (err, result) => {
      this.transactionInProgress = false;
      if (!result || result === undefined || result === null) {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
        return;
      }
      this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
      return;
    });
  }

  authorize(token: any, value: any) {
    // var contract, exchange;
    // if (this.allAvailableContracts === null || this.allAvailableContracts === undefined || this.allAvailableContracts.length === 0)
    //   return;
    // var myTokenContract = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
    // var instanceMyTokenContract = myTokenContract.at(token.address);
    // var userAccount = this.web3.getWeb3().eth.coinbase;
    // if (parseFloat(token.AuthorizationAmount) < parseFloat(value)) {
    //   this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Please enter allowance greater then the Token balance'), MessageContentType.Text);
    // } else {
    //   this.checkAndAuthorize(instanceMyTokenContract, userAccount, this.contractAddress, web3Functions.toBaseUnitAmount(token.AuthorizationAmount, token.data.decimals));
    //   this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Initiated authorization'), MessageContentType.Text);
    // }
    var contract, exchange;
    var auth=token.AuthorizationAmount*1000000000000000000;
    if (this.allAvailableContracts === null || this.allAvailableContracts === undefined || this.allAvailableContracts.length === 0)
      return;
    var userAccount = sessionStorage.getItem("walletAddress");
    let web3Instance = this.web3.getWeb3();
    //console.log("token address",token.address)
    let instanceMyTokenContract = new web3Instance.eth.Contract(Constants.EtherTokenAbi,token.address,{//Constants.TokenAbi
      // from: this.account,
      gasLimit: 3000000,
    })
    if (auth < parseFloat(value)) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Please enter allowance greater then the Token balance'), MessageContentType.Text);
    } else {
     // console.log("this.contract address",this.contractAddress);
     // console.log("this.token addres",token.address);
      this.checkAndAuthorize(instanceMyTokenContract, userAccount, this.contractAddress,token.AuthorizationAmount*1000000000000000000,token.address);
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Initiated authorization'), MessageContentType.Text);
    }
  }

  // getWalletInfo(data) {
  //  //console.log("Get Wallet Info in ..........",data);
  //   let tempArray = data;
  //   //console.log(tempArray)
  //       // let address =['0xa091e20594ab76252649e4e5e848cb40a5d0cb21ad05e8945a392e17c3fcd057','0xa0e71480dc375887dc9b7d0f7218dad7d1586552f4e2ff2648182f4573a329cc','0xa0a905ad1dbfcff5cf88fb791e71cc167c3b9b49a748f02874fdb0ec69a38bd0','0xa0d591c3eca48957888bc7711499caa71a7a88d4bff8f489faa2133a08ecc8d2','0xa073512a09cfdcb6f747044e9e17772aa24c9b213dfe8e598582353ded01ece1','0xa0bf82c9042e3d87a089515afadeacf0b3f10c604289d515571ba9eb1a3890dd'];
  //        let address=[Constants.wandTokenAddress,Constants.ZRXTokenaddress,Constants.GNTTokenaddress,Constants.powrTokenAddress,Constants.sandTokenaddress,Constants.QTUMTokenaddress]
  //       let symbol =['WAND','ZRX','GNT','POWR','SAND','QTUM'];
  //        for(let i=0;i<data.length;i++)
  //        {
  //       //   console.log("steps",i,"wallet inf",symbol[i])
  //          let a=i;
  //           if ('WAND' === 'WAND') {
  //           console.log(a)
  //           if (a === tempArray.length - 1) {
  //           //   console.log("steps reached",tempArray);
  //           // console.log(a)
  //           // console.log('getWalletInfo', tempArray);
  //           if (this.portfolioService.getNewTokenValue()) {
  //             console.log('token value', this.portfolioService.getNewTokenValue());
  //             let newAssets = this.portfolioService.getNewTokenValue();
  //             this.checkWithBalanceOfToken(tempArray, newAssets, (res) => {
  //               if (res) {
  //                 this.walletService.setNewPortfolioTokenWithValue(res);
  //                 this.showLoader = false;
  //                 this.getAllowance(res);
  //                 if (res.length === 0) {
  //                   this.next();
  //                 }
  //                 this.tractButton();
  //               }
  //             });
  //           } 
  //           else {
  //             this.tokenWithbalance = tempArray;
  //            // console.log('validate token balance', this.tokenWithbalance.length);
  //             this.showLoader = false;
  //             this.getAllowance(this.tokenWithbalance);
  //             this.walletService.setNewPortfolioTokenWithValue(this.tokenWithbalance);
  //             this.tractButton();
  //           }
  //           this.zone.run(() => {
  //           });
  //         }
  //       }
  //     }
  // }

  getWalletInfo(data) {
console.log(data);

    let tempArray = data;
    tempArray.map((keys1, value) => {
      this.platformTokens.map((key) => {
        console.log(key);
        
        if (key.symbol === keys1.symbol) {
          console.log('true');
          
          keys1.data = key;
          if (value === tempArray.length - 1) {
            console.log('getWalletInfo', tempArray);
            if (this.portfolioService.getNewTokenValue()) {
              console.log('token value', this.portfolioService.getNewTokenValue());
              let newAssets = this.portfolioService.getNewTokenValue();
              this.checkWithBalanceOfToken(tempArray, newAssets, (res) => {
                if (res) {
                  console.log(res);
                  
                  this.walletService.setNewPortfolioTokenWithValue(res);
                  this.showLoader = false;
                  this.getAllowance(res);
                  if (res.length === 0) {
                    this.next();
                  }
                  this.tractButton();
                }
              });
            } else {
              this.tokenWithbalance = tempArray;
              console.log('final', this.tokenWithbalance);
              this.showLoader = false;
              this.getAllowance(this.tokenWithbalance);
              this.walletService.setNewPortfolioTokenWithValue(this.tokenWithbalance);
              this.tractButton();
            }
            this.zone.run(() => {
            });
          }
        }
      });
    });
  }

  checkWithBalanceOfToken(data, newAssets, callback) {
    newAssets.map((key, value1) => {
      data.map((key2, value) => {
        if (key2.address === (key.address === undefined ? (key.tokenAddress).toLowerCase() :( key.address).toLowerCase())) {
       //   console.log('balance', key.value, key2.balanceOfToken,key2.symbol);
          if (key2.balanceOfToken !== 0) {
            if (key2.balanceOfToken >= key.value) {
              data.splice(value, 1);
            //  console.log('if', data);
            } else {
              key2.value = key.value - key2.balanceOfToken;
            //  console.log('else', data);
            }
          }
          if (value1 === newAssets.length - 1) {
            callback(data);
          }
        }
      });
    });
  }


  // checkWithBalanceOfToken(data, newAssets, callback) {
  //   newAssets.map((key, value1) => {
  //     data.map((key2, value) => {
  //       if (key2.address === (key.address === undefined ? key.tokenAddress : key.address)) {
  //      //   console.log('balance', key.value, key2.balanceOfToken,key2.symbol);
  //         if (key2.balanceOfToken !== 0) {
  //           if (key2.balanceOfToken >= key.value) {
  //             data.splice(value, 1);
  //           //  console.log('if', data);
  //           } else {
  //             key2.value = key.value - key2.balanceOfToken;
  //           //  console.log('else', data);
  //           }
  //         }
  //         if (value1 === newAssets.length - 1) {
  //           callback(data);
  //         }
  //       }
  //     });
  //   });
  // }

  getTokenAddress(data) {
    //  console.log(data)
      var tempArray = data;
      tempArray.map((key2, value) => {
  
   
  
        this.platformTokens.map((key) => {
          if (key.address.toLowerCase() === key2.address.toLowerCase()) {
            key2['symbol'] = key.symbol;
            if (value === data.length - 1) {
             // console.log('getTokenAddress', tempArray);
              this.getWalletInfo(tempArray);
            }
          }
        });
      });
    }

  // getTokenAddress(data) {
  //  // console.log("step 5...getTokenaddress......",data)
  //   let tempArray = data;
  //   tempArray.map((key2, value) => {
  //  // console.log(key2)
  //     let address=[Constants.wandTokenAddress,Constants.ZRXTokenaddress,Constants.GNTTokenaddress,Constants.powrTokenAddress,Constants.sandTokenaddress,Constants.QTUMTokenaddress]
  //     let symbol =['WAND','ZRX','GNT','POWR','SAND','QTUM'];
  //     for(let i=0;i<address.length;i++)
  //    {
  //     let _symbol=symbol[i];
  //     let _address=address[i];
  //       // console.log(value)
  //       // console.log(_symbol)
  //       // console.log(_address)
  //       if (_address.toLowerCase() == key2.address) {
  //         key2['symbol'] =_symbol; //key.symbol;
  //         if (value == data.length - 1) {
  //          // console.log('getTokenAddress', tempArray);
  //           this.getWalletInfo(tempArray);
  //         }
  //       }
  //     }
    
  //   });
  // }

  public count1:any;
  getPortfolioToken() {


    var self=this;
    console.log("Step 3.....getPlatform Token",this.walletService.getPortfolioAddress());
    if (this.walletService.getPortfolioAddress()) {
      this.contractAddress = this.walletService.getPortfolioAddress();
      console.log('address', this.walletService.getPortfolioAddress(),"vaalid ",Constants.VBPExchageAddress);
      let web3Instance = this.web3.getWeb3();
      // web3Instance.eth.getPastLogs({fromBlock:2789039,toBlock:'latest',
			// topics:['0x53e51eafcc6cc48771db669cdabad660678aa9510059c72a6bb42930a9a6fe12']}).then(res=>{
        // 	console.log('inside events')
        //   console.log(res)
      // let  data = res[0].data;
      //   // console.log(data)
      //    if (data.startsWith("0x")) {
      //      data = data.substr(2);
      //    }
      //    data = data.match(/.{1,64}/g);
      //    console.log(data);
         
      
			// }).catch(err=>{console.log(err)
			// 	console.log("err")
			// 	console.log(err)
			// })
      let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,this.contractAddress,{
        from:sessionStorage.getItem('walletAddress'),
        gasLimit: 3000000,
      })
      this.vsbContract = vsbContract;
      //  console.log(this.vsbContract);
      self.count1=sessionStorage.getItem('tokenlength');
      // console.log(self.count1);
    // for (let i = 0; i < self.count1; i++) {

      vsbContract.methods.assetlength().call().then(length=>{
        console.log("lenghttttttt");

        console.log(length)
        self.count1=length;
        for (let i = 0; i < length; i++) {
          
          console.log(i)
       vsbContract.methods.TotalAssets(i).call().then(function (err) {
          if(err){
            console.log("errrrr",err)
            var temp = {};
            temp['address'] = err;
            console.log(" beforeee  self.tokenListAddress", self.tokenListAddress)
            self.tokenListAddress.push(temp);
            console.log(" self.tokenListAddress", self.tokenListAddress)
            console.log(" temp", temp)
            console.log(self.tokenListAddress.length)
            console.log(self.count1)
            if (self.tokenListAddress.length == self.count1) {
              let arr = _.filter(self.tokenListAddress, function (item) {
                   console.log(item['address'])
                   console.log("arr",arr)
                   return item['address'] !== '0x';
              });
             console.log("arrarr",arr)
              self.getAssest(arr,self.vsbContract);
          }
        }
      })
    }
   })
    }
  }

//  public count1:any;
//   getPortfolioToken() {
//     var self=this;
//     //console.log("Step 3.....getPlatform Token");
//     if (this.walletService.getPortfolioAddress()) {
//       this.contractAddress = this.walletService.getPortfolioAddress();
//       //console.log('address', this.walletService.getPortfolioAddress(),"vaalid ",Constants.VBPExchageAddress);
//       let web3Instance = this.web3.getWeb3();
//       let vsbContract = new web3Instance.eth.Contract(Constants.VBPABIaion,this.contractAddress,{
//         from:sessionStorage.getItem('walletAddress'),
//         gasLimit: 3000000,
//       })
//       this.vsbContract = vsbContract;
//     //  console.log(this.vsbContract);
//     self.count1=sessionStorage.getItem('tokenlength');
//   //  console.log(self.count1);
//     for (let i = 0; i < self.count1; i++) {
//     //   console.log(i)
//        vsbContract.methods.TotalAssets(i).call().then(function (err, data) {
//           if(err){
//         //    console.log("errrrr",err)
//             var temp = {};
//             temp['address'] = err;
//             self.tokenListAddress.push(temp);
//             // console.log(" self.tokenListAddress", self.tokenListAddress)
//             // console.log(" temp", temp)
//             // console.log(self.tokenListAddress.length)
//             // console.log(self.count1)
//             if (self.tokenListAddress.length == self.count1) {
//               let arr = _.filter(self.tokenListAddress, function (item) {
//                   //  console.log(item['address'])
//                   //  console.log("arr",arr)
//                    return item['address'] !== '0x';
//               });
//              // console.log("arrarr",arr)
//               self.getAssest(arr,self.vsbContract);
//           }
//         }
//       });
//    }
//     }
//   }

  getAssest(data, vsbContract) {
   // console.log("Step 3.....getasset Token",data,vsbContract);
    var self=this;
    let tempArray = [];
    data.map((key, value) => {
      var temp = {};
      vsbContract.methods.assetStatus(key.address).call().then(function (err, result){
        if (err === true) {
          vsbContract.methods.assets(key.address).call().then(function (err, res) {
            temp['address'] = key.address;
            temp['value'] = err/1000000000000000000//(new BigNumber(err).dividedBy(new BigNumber(10).pow(18))).toJSON();
            tempArray.push(temp);
            // console.log("tempArray",tempArray,tempArray.length)
            self.getBalanceOfToken(tempArray,self.vsbContract);
          });
        }
      });
    });
  }

  getBalanceOfToken(data, vsbContract) {
   // console.log("Step 4.....getPlatform Token",data,vsbContract);
    var self=this;
     let tempArray = [];
     data.map((key) => {
       var temp = {};
       vsbContract.methods.balanceOfToken(sessionStorage.getItem("walletAddress"), key.address).call().then(function (err, result){
         if (!err) {
           return;
         }
         temp['address'] = key.address.toLowerCase();
         temp['value'] = key.value;
         temp['balanceOfToken'] = err/1000000000000000000
         temp['AuthorizationAmount'] = 10;
         tempArray.push(temp);
        // console.log("temp Array.........",tempArray);
         if (tempArray.length === data.length) {
          // console.log("getToken address",tempArray);
           self.getTokenAddress(tempArray);
         }
       });
     });
  }

  tractButton() {
    this.zone.run(() => {
    });
    if (this.track !== this.authorizeTokenList.length) {
      return true;
    } else {
      //console.log("called if")
      if (this.authorizeTokenList.length > 0) {
        for (var i = 0; i < this.authorizeTokenList.length; i++) {
          if (this.authorizeTokenList[i].status === false)
            return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  tractButtonTransaction() {
    //console.log("trace button is executed");
  //  console.log("authorize token list",this.authorizeTokenList)
    this.authorizeTokenList.map((key) => {
    //  console.log(key);
      this.tractTransaction(key.address).then((res) => {
        // console.log('response', res);
        // console.log('called getAllowanceAfterTransactionSuccess');
        this.getAllowanceAfterTransactionSuccess();
      });
    });
  }

  next() {
   // console.log('called');
    if (this.authorizeTransactionTimer) {
      clearTimeout(this.authorizeTransactionTimer);
    }
    this.portfolioService.despoiteToken();
  }

  public getAllowance(data) {
   // console.log(" getAllowance data",data)
    data.map((key, value) => {
    //   console.log('getAllowance key',key)
    //  console.log('getAllowance key.address',key.address)
    //    console.log('getAllowance key.address',key.address)
     
     // var myTokenContract = this.web3.getWeb3().eth.contract(ABI.EtherTokenAbi);
     let web3Instance=this.web3.getWeb3();
      var instanceMyTokenContract =  new web3Instance.eth.Contract(Constants.EtherTokenAbi,key.address);
      this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then((res) => {
        this.zone.run(() => {
          key.allowance = res;
          this.validateAllowance(data);
        });
      });
    });
  }

  public getAllowanceAfterTransactionSuccess() {
    this.tokenWithbalance.map((key, value) => {
     // console.log(key);
      var web3Instance=this.web3.getWeb3();
       var instanceMyTokenContract = new web3Instance.eth.Contract(Constants.EtherTokenAbi,key.address);
     // console.log("instance mytoketokencontract",instanceMyTokenContract)
       this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then((res) => {
      //   console.log("mady ides",res)
        this.zone.run(() => {
          key.allowance = res;
        });
      });
    });
  }

  getAllowanceData(instanceMyTokenContract, contractAddress) {
    return new Promise((resolve, reject) => {
      var address=sessionStorage.getItem('walletAddress');
      instanceMyTokenContract.methods.allowance(address, contractAddress).call().then(function(result) {
       //   console.log("allowance data for portfolio",result)
          resolve(new BigNumber(result).dividedBy(new BigNumber(10).pow(18)).toJSON());
        });
      });
       }

  private tractTransaction(address) {
  //  console.log("tracktransaction address",address,this.authorizeTokenList);
    return new Promise((resolve, reject) => {
      let web3Instance = this.web3.getWeb3();
      // if (this.authorizeTransactionTimer)
        web3Instance.eth.getTransactionReceipt(address).then(res => {
          if (res) {
         //   console.log("token track well",res);
            if (res['status']=== true) {
              this.getAllowanceAfterTransactionSuccess();
              this.authorizeTokenList.map((key) => {
                if (key.address === address) {
                  key.status = true;
                  this.tractButton();
                }
              });
              resolve(true);
            }
          }
        });
      // this.authorizeTransactionTimer = setTimeout(() => {
      //   this.tractTransaction(address);
      // }, 1000);
    });
  }

  private loadData() {
    if (this.walletService.getUserAccountSummary() !== undefined) {
      this.showWalletLoader = false;
      //console.log("userAccountSummary",this.walletService.fetchAccountSummary());
      this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
      // this.tokenListAddress.map((key)=>{
      //   this.userAccountSummary = this.userAccountSummary.filter((data) => data.address === key.address);
      // })
      this.wxETHBalance = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].Balance;

      // console.log('WXEth Balance: ' + this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].Balance);
      // console.log('userAccountSummary length: ' + this.userAccountSummary.length);

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

  private checkAndAuthorize(instanceTokenContract, account, authorizedAcc, value,tokenAddress) {
    instanceTokenContract.methods.allowance(account, authorizedAcc).call().then((err, result) => {
     //console.log("check and authorize ",result,err);
     if (err<value) {
      this.authorizeOne(instanceTokenContract, account, authorizedAcc,value,tokenAddress);
    } else {
        this.trackDepositeToken++;
        this.tractButtonTransaction();
        this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Good, you have sufficient allowance for this token'), MessageContentType.Text);
      }
    });
  }

  private authorizeOne(instanceTokenContract, account, authorizedAcc, value,tokenaddress) {
    let web3Instance = this.web3.getWeb3();
  //   var p=sessionStorage.getItem('exchange111');
  //   //console.log("ppppp",p)
  //  var p1=p.toString();
    var self=this;
    //self.showLoader = true;
    self.displayGif='block';
    let currentWallet=this.savedWalletsService.getCurrentWallet();
    var privatekey=currentWallet.getPrivateKeyHex() 
  //  self.aionWalletHelper.decrypted(self.ccadd.wallet.wallet.data,p1,true)
//console.log("deposit private key",privatekey)

   var res=web3Instance.eth.accounts.privateKeyToAccount(privatekey)
    //console.log("res",res)
    var addr=res.address;

    // console.log("addr and account", addr,account)
    // console.log("instance contract",instanceTokenContract)
    // console.log("account number",account)
    // console.log("authorized acc",authorizedAcc)
    // console.log("this.acontract address",this.contractAddress)
    // console.log("value is",value)
    // console.log("token address",tokenaddress)
    var self=this;
    // self.showLoader = true;
    self.displayGif = 'block';
     const userAccount = sessionStorage.getItem("walletAddress");
    // console.log(userAccount)
     var address=sessionStorage.getItem("walletAddress");
     
     var add= sessionStorage.getItem("walletAddress");
    //console.log(address);
     var a11=(value/1000000000000000000).toString()
    
    var vall= web3Instance.utils.toNAmp(a11)
    //console.log(value,a11,vall)
         var tx_hash;
         const contractFunction = instanceTokenContract.methods.approve(authorizedAcc, vall);
         const functionAbi = contractFunction.encodeABI();
                    const txParams = {
                        gas:1999999,
                        to:tokenaddress,
                        data: functionAbi,
           };
       
         web3Instance.eth.accounts.signTransaction(txParams,privatekey,function(err,res){
             instanceTokenContract.methods.balanceOf(account).call().then(v => console.log("Value balance: " + v));
           //  console.log("check allowance",account,authorizedAcc);
             instanceTokenContract.methods.allowance(addr,authorizedAcc).call().then(v => console.log("Value before increment: " + v));          
          
             web3Instance.eth.sendSignedTransaction(res.rawTransaction).on('transactionHash',txHash=>{
           //    console.log(txHash);
               tx_hash=txHash;
             }).on('receipt', receipt => {
            // console.log(receipt);
             instanceTokenContract.methods.allowance(addr,authorizedAcc).call().then(function (result) {
            // console.log("Value after increment: " + result)
             if (result) {
              self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Authorization successfully submitted to the Aion Blockchain. Please wait till it confirms.'), MessageContentType.Text); 
            }           
          })
          if(receipt)
          {
            self.displayGif = 'none';
          }
          let temp = {};
          temp['address'] = receipt.transactionHash;
          temp['status'] = true;
          self.authorizeTokenList.push(temp);
          self.trackDepositeToken++;
          self.tractButtonTransaction();
       
        }).catch(err=>{
            web3Instance.eth.getTransactionReceipt(tx_hash,function(error,result){
          //  console.log(result);
            instanceTokenContract.methods.allowance(addr,authorizedAcc).call().then(function (result) {
           // console.log("Value after increment: " + result)
            if (result) {
             self.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Authorization successfully submitted to the Aion Blockchain. Please wait till it confirms.'), MessageContentType.Text); 
           }           
           })
          if(result['status'])
          {
            self.displayGif = 'none';
          }
          let temp = {};
          temp['address'] = result['transactionHash'];
          temp['status'] = true;
          self.authorizeTokenList.push(temp);
          self.trackDepositeToken++;
          self.tractButtonTransaction();
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

  private validateAllowance(data) {
   // console.log('data', data);
    let track = 0;
    data.map((key, value) => {
      if (parseFloat(key.allowance) >= parseFloat(key.value)) {
        track++;
        if (track === data.length) {
          this.showLoader = false;
          this.next();
        }
        ;
      }
      ;
      if (value === data.length - 1) {
        this.track = data.length - track;
        this.tokenWithbalance = data;
     //   console.log("validate allowance",this.tokenWithbalance.length)
      }
    });
  }

  getPlatformTokens() {
    let headers = new Headers({
      'content-type': 'application/json',
      // 'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURLAION + 'PlatformToken', requestOptions).subscribe(
      data => {
        var tokens = data.json();
        this.platformTokens = tokens;
     //   console.log("Step 2.....getPortfolio Token");
        this.getPortfolioToken();
      });
  }

}
