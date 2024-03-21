import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Constants} from '../models/constants';
var Web3 = require('aion-web3-v1.0')
@Injectable()
export class AionWeb3Service {
  public privatekey:any;
  public naclInstance;
  public web3:any;
  constructor(private http:Http) { 
    this.web3=new Web3(new Web3.providers.HttpProvider(Constants.providerURL));
    console.log(this.web3);
     
  }
  getWeb3() {
    return this.web3;
  }
}
