import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { UUID } from "angular2-uuid";
import { Http, RequestOptions, Headers } from "@angular/http";

import { Constants } from "../models/constants";
import {
  MessageModel,
  MessageType,
  MessageContentType
} from "../models/message.model";
//import {  AionWeb3Service}  from '../services/aion-web3.service'
//import {Web3Service} from '../services/web3.service';
import { NotificationManagerService } from "../services/notification-manager.service";
import { TokenService } from "./token.service";
import { JwtToken } from "../models/token.model";
import { AuthService } from "./auth.service";

@Injectable()
export class WalletService {
  private availableTokensType: Array<string> = new Array<string>();
  private tokenContracts: any = undefined;
  private userAccountSummary: any = undefined;
  private PortfolioAddress: any;
  private PortfolioTransactionhash:any;
  private newPortfolioTokenWithValue: any;
  private _userAccountSummaryChange = new BehaviorSubject<any>(undefined);
  private _tokenContractChange = new BehaviorSubject<any>(undefined);
  private _platformTokenChanges = new BehaviorSubject<any>(undefined);
  private tokenChangeSubscription: Subscription;

  public userAccountSummaryChange$ = this._userAccountSummaryChange.asObservable();
  public tokenContractChange$ = this._tokenContractChange.asObservable();
  public platformTokenChanges$ = this._platformTokenChanges.asObservable();

  constructor(
    private http: Http,
    // private web3: Web3Service,
    // private aionweb3:AionWeb3Service,
    private notificationService: NotificationManagerService,
    private tokenService: TokenService,
    private auth: AuthService
  ) {
    console.log("Wallet service initialized");
    this.tokenChangeSubscription = this.tokenService.token$.subscribe(data => {
      this.handleTokenChange(data);
    });
  }

  fetchContracts() {
    if (sessionStorage.getItem("exchange") == "aion") {
      if (!this.auth.isAuthenticated()) return;
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURLAION + "manage/token/get", requestOptions)
        .subscribe(
          data => {
            this.tokenContracts = data.json();
            this.availableTokensType = new Array<string>();
            for (let i = 0; i < this.tokenContracts.length; i++) {
              if (this.tokenContracts[i].isTokenContract) {
                this.availableTokensType.push(this.tokenContracts[i].symbol);
              }
            }
            this._tokenContractChange.next(this.tokenContracts);
            this.fetchAccountSummary();
          },
          err => {
            //  console.log(err);
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get token contracts"
              ),
              MessageContentType.Text
            );
          }
        );
    } else if (sessionStorage.getItem("exchange") == "eth") {
      if (!this.auth.isAuthenticated()) return;
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURL + "manage/token/get", requestOptions)
        .subscribe(
          data => {
            this.tokenContracts = data.json();
            this.availableTokensType = new Array<string>();
            for (let i = 0; i < this.tokenContracts.length; i++) {
              if (this.tokenContracts[i].isTokenContract) {
                this.availableTokensType.push(this.tokenContracts[i].symbol);
              }
            }
            this._tokenContractChange.next(this.tokenContracts);
            this.fetchAccountSummary();
          },
          err => {
            console.log(err);
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get token contracts"
              ),
              MessageContentType.Text
            );
          }
        );
    } else if (sessionStorage.getItem("exchange") == "wan") {
      if (!this.auth.isAuthenticated()) return;
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURLWAN + "manage/token/get", requestOptions)
        .subscribe(
          data => {
            this.tokenContracts = data.json();
            this.availableTokensType = new Array<string>();
            for (let i = 0; i < this.tokenContracts.length; i++) {
              if (this.tokenContracts[i].isTokenContract) {
                this.availableTokensType.push(this.tokenContracts[i].symbol);
              }
            }
            this._tokenContractChange.next(this.tokenContracts);
            this.fetchAccountSummary();
          },
          err => {
            //  console.log(err);
            this.notificationService.showNotification(
              new MessageModel(
                MessageType.Error,
                "Failed to get token contracts"
              ),
              MessageContentType.Text
            );
          }
        );
    }
  }

  fetchAccountSummary() {
    if (!this.auth.isAuthenticated()) return;
    if (!this.tokenService.getToken()) {
      return;
    }
    if (sessionStorage.getItem("exchange") == "eth") {
      // const wxethContract = this.web3.getWeb3().eth.contract(WXETH_ABI);
      // const wxethInstance = wxethContract.at(WXETH_CONTRACT_ADDRESS);
      // wxethInstance.balanceOf(userAccount, (err, res) => {
      //   this.wxETHBalance = new BigNumber(res.toString()).dividedBy(
      //     new BigNumber(10).pow(18)
      //   );
      // });
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      var tokensToFetch = this.availableTokensType;
      tokensToFetch.push("ETH");
      this.http
        .post(
          Constants.ServiceURL + "manage/token/summary",
          this.availableTokensType,
          requestOptions
        )
        .subscribe(
          data => {
            this.userAccountSummary = data.json();
            // this.userAccountSummary.Balances[5].Balance = this.wxETHBa;
            console.log("WALLET", data.json());
            this._userAccountSummaryChange.next(this.userAccountSummary);
          },
          err => {
            console.log(err);
            //this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account details'), MessageContentType.Text);
          }
        );
    } else if (sessionStorage.getItem("exchange") == "wan") {
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      var tokensToFetch = this.availableTokensType;
      tokensToFetch.push("ETH");
      this.http
        .post(
          Constants.ServiceURLWAN + "manage/token/summary",
          this.availableTokensType,
          requestOptions
        )
        .subscribe(
          data => {
            this.userAccountSummary = data.json();
            // console.log("wallet", data.json());
            this._userAccountSummaryChange.next(this.userAccountSummary);
          },
          err => {
            // console.log(err);
            //this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account details'), MessageContentType.Text);
          }
        );
    }
    // else if(sessionStorage.getItem('exchange')=='aion') {
    //   let headers = new Headers({
    //     'content-type': 'application/json',
    //     //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
    //     'Token': this.tokenService.getToken().Jwt
    //   });
    //   let requestOptions = new RequestOptions({headers: headers});
    //   var tokensToFetch = this.availableTokensType;
    //   tokensToFetch.push('ETH');
    //   this.http.post(Constants.ServiceURLAION + 'manage/token/summary', this.availableTokensType, requestOptions).subscribe(
    //     data => {
    //       this.userAccountSummary = data.json();
    //       // console.log("wallet", data.json());
    //       this._userAccountSummaryChange.next(this.userAccountSummary);
    //     },
    //     err => {
    //      // console.log(err);
    //       //this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account details'), MessageContentType.Text);
    //     }
    //   );
    // }
  }

  getContracts(): any {
    return this.tokenContracts;
  }

  getUserAccountSummary(): any {
    return this.userAccountSummary;
  }

  handleTokenChange(data: JwtToken) {
    if (data === undefined) return;
    this.fetchContracts();
  }

  setPortfolioAddress(address): any {
    this.PortfolioAddress = address;
  }

  setPortfolioTransactionhash(address): any {
    this.PortfolioTransactionhash = address;
  }

  getPortfolioAddress(): any {
    //return '0x702626503312fe38b78c22a4bbc4955d6f38a0d4';
    return this.PortfolioAddress;
  }

  getPortfolioTransactionhash(): any {
    //return '0x702626503312fe38b78c22a4bbc4955d6f38a0d4';
    return this.PortfolioTransactionhash;
  }

  getNewPortfolioTokenWithValue(): any {
    return this.newPortfolioTokenWithValue;
  }

  setNewPortfolioTokenWithValue(data): any {
    this.newPortfolioTokenWithValue = data;
  }

  getPlatformTokens() {
    if (sessionStorage.getItem("exchange") == "aion") {
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURLAION + "PlatformToken", requestOptions)
        .subscribe(data => {
          this._platformTokenChanges.next(data.json());
        });
    }
    if (sessionStorage.getItem("exchange") == "eth") {
      let headers = new Headers({
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURL + "PlatformToken", requestOptions)
        .subscribe(data => {
          this._platformTokenChanges.next(data.json());
        });
    } else if (sessionStorage.getItem("exchange") == "wan") {
      console.log("getPlatformTokens5");
      let headers = new Headers({
        "content-type": "application/json",
        //'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        Token: this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({ headers: headers });
      this.http
        .get(Constants.ServiceURLWAN + "PlatformToken", requestOptions)
        .subscribe(data => {
          this._platformTokenChanges.next(data.json());
        });
    }
  }
  stopSubscription() {
    this.tokenChangeSubscription.unsubscribe();
  }
}
