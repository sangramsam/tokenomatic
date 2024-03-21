import { Injectable, Inject, OnInit } from "@angular/core";
//import * as web3local from 'web3'
import * as Web3 from 'web3';
//import {CustomWalletService} from './custom-wallet.service'
//import {InfuraNetworkService} from './infura-network.service'
//import { Constants } from "@aws-amplify/core";
import { Constants} from '../models/constants';
declare global {
  interface Window { web3: any; }
}
window.web3 = window.web3 || undefined;
declare namespace web3Functions{
  export function initializeWeb3(useJsonWallet : boolean, data : any);
  export function setDefaultAccount();
  export function setDefaultAccountwan();
}
@Injectable()
export class WanWeb3Service {
  
  web3: any;
  _web3:any;
  priv:any;
  data = [];
  constructor() { 
    this._web3 = new Web3(new Web3.providers.HttpProvider(Constants.providerwanURL));
    console.log(Constants.providerwanURL);
    
    console.log("this._web3",this._web3);
  }

  // initialize(useJsonWallet = false) {
  //   // we need to manually initialize web3 after the wallet is chosen
  //   web3Functions.initializeWeb3(useJsonWallet, {web3 : web3local, provider : this});
  //   this.web3 = window.web3;
  //    if (this.wallet.isWalletInitialized())
  //     this.web3.eth.defaultAccount = this.wallet.userAddress()
  // }
  setDefaultAccount() {
  //  web3Functions.setDefaultAccountwan()
    this._web3.eth.defaultAccount=sessionStorage.getItem('walletAddress');
  }

  gen(a)
  {
   // console.log('gen')
    //var a=sessionStorage.getItem('private');
    this.priv= a.substring(2,a.length);
   // console.log(this.priv)
  }
  store(b)
  {
    this.data.push(b)
  }
  _getWeb3() {
    return this._web3;
  }
}
