import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Http, Headers, RequestOptions } from "@angular/http";
import { AionWeb3Service } from "../services/aion-web3.service";
//import { Web3Service } from "../services/web3.service";
import { Constants } from "../models/constants";
import { UserRegistration, UserRegistrationResponse } from "../models/user-registration.model";
import { User } from "../models/user.model";
import { JwtToken } from "../models/token.model";
import { AuthService } from "./auth.service";
import { SavedWalletsService } from "./saved-wallets.service";

@Injectable()
export class TokenAionService {
    private currentToken: JwtToken;
    private _token = new BehaviorSubject<JwtToken>(undefined);
    token$ = this._token.asObservable();
    private tokenTimer: any;
    constructor(
        private http: Http, 
       // private web3: Web3Service, 
        private aion_web3: AionWeb3Service, 
        private auth: AuthService,
        private savedWalletsService : SavedWalletsService
    ) {
        //console.log("web3is", this.web3);
        console.log("aion web3 is", this.aion_web3);
    }

    fetchToken(userAccount = '') {
        if (!this.auth.isAuthenticated())
            return;
        if (this.tokenTimer)
            clearTimeout(this.tokenTimer)
      

            let userRegistration = new UserRegistration();
            let currentWallet=this.savedWalletsService.getCurrentWallet();
            if (!currentWallet)
                return;
            var privatekey=currentWallet.getPrivateKeyHex()
            let publickey='0x'+privatekey.substr(66,130)
            userRegistration.UserAccount = sessionStorage.getItem("walletAddress");
            userRegistration.UserEmail = sessionStorage.getItem("email");
            userRegistration.Name = sessionStorage.getItem("name");
            userRegistration.AIONAddress=publickey;
            console.log(userRegistration)
            let headers = new Headers({ "content-type": "application/json"});
            let requestOptions = new RequestOptions({headers: headers}); 
            this.http.post(Constants.ServiceURLAION + "RegisterUser",userRegistration, requestOptions).subscribe(
                data => {
             //     console.log("order", data.json())
                },
                err => {
                    console.log(err);
                    this._token.next(undefined);
                }
            );
            this.http.post(Constants.ServiceURLAION + "Token", userRegistration, requestOptions).subscribe(
                data => {
                  console.log("tokens", data.json())
                    this.currentToken = new JwtToken();
                    this.currentToken.Jwt = data.json().Jwt;
                    this.currentToken.JwtExpiryDateTime = data.json().JwtExpiryDateTime;
                    sessionStorage.setItem('id_token', this.currentToken.Jwt);
                    this._token.next(this.currentToken);
                },
                err => {
                 //   console.log(err);
                    this._token.next(undefined);
                }
            );
            
            this.tokenTimer = setTimeout(() => {
                this.fetchToken();
            }, 3600000);
        }
       

    getToken() {
        return this.currentToken;
    }
    stopTokenService() {
        if (this.tokenTimer)
            clearTimeout(this.tokenTimer)
        this.tokenTimer = 0
        this.currentToken = null
        this._token.next(undefined)
    }
}
