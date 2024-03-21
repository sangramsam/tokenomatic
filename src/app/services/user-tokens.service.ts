import { Injectable, Inject, OnInit, NgZone } from "@angular/core";
import * as EthQuery from "eth-query";
import * as web3local from "web3";
import * as Web3 from "web3";
import { CustomWalletService } from "./custom-wallet.service";
import { InfuraNetworkService } from "./infura-network.service";
//import { Constants } from "@aws-amplify/core";
import { Constants } from "../models/constants";
import { TokenService } from "./token.service";
import { Headers, Http, RequestOptions } from "@angular/http";
import * as _ from "underscore";
import { Web3Service } from "./web3.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
const Store = window.require("electron-store");

declare var window: any;

declare global {
  interface Window {
    web3: any;
  }
}
window.web3 = window.web3 || undefined;
declare namespace web3Functions {
  export function initializeWeb3(useJsonWallet: boolean, data: any);
  export function setDefaultAccount();
}

@Injectable()
export class UserTokensService {
  public store = new Store();
  _web3: any;
  query: EthQuery;
  priv: any;
  data = [];
  showAnalysisLoader: boolean = false;
  itemList = [];
  private _itemList = new BehaviorSubject<Object>(null);
  public itemList$ = this._itemList.asObservable();
  constructor(
    private wallet: CustomWalletService,
    private network: InfuraNetworkService,
    private tokenService: TokenService,
    private http: Http,
    private zone: NgZone,
    private web3:Web3Service
    ) {
      setTimeout(() => {
        console.log('UserTokensService',this.tokenService.getToken().Jwt);
        this.getPlatformTokens();
      },6000);
      // this.getPlatformTokens();
    }

  getPlatformTokens() {
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
    .get(Constants.ServiceURL + "PlatformToken", requestOptions)
      .subscribe(data => {
        this.showAnalysisLoader = true;
        var tokens = data.json();
        //var tokens = Constants.platfromToken;
        console.log("tokes", data.json());
        let itemLists = [];
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].symbol !== "WXETH") {
            let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
            let toeknContract = tokenEth.at(tokens[i].address);
            let _data = tokens[i];
            toeknContract.balanceOf(
              this.web3.getWeb3().eth.coinbase,
              (err, res) => {
                // if (res) {
             //     console.log('balance',res,parseFloat(res), new BigNumber(res).dividedBy(new BigNumber(10).pow(_data.decimals)).toJSON());
                //  if(parseFloat(res)>0) {
                    this.zone.run(() => {  
                      if(parseFloat(res)>0)
                      itemLists.push({
                        id: _data.symbol,
                        itemName: _data.symbol,
                        address: _data.address,
                        contract: tokenEth,
                        balance: new BigNumber(res)
                          .dividedBy(new BigNumber(10).pow(_data.decimals))
                          .toJSON(),
                        decimals: _data.decimals
                      });
                      //console.log(tokens.length,i);
                      if(tokens.length == i) {
                       // console.log(itemLists);
                        this._itemList.next(itemLists);
                      }
                    });
            //    }
              }
            );
          }
        }
      });
  }
}
