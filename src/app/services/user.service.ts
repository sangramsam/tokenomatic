import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Http, Headers, RequestOptions } from "@angular/http";

import { Web3Service } from "../services/web3.service";
import { Constants } from "../models/constants";
import { UserRegistration, UserRegistrationResponse } from "../models/user-registration.model";
import { User } from "../models/user.model";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";

@Injectable()
export class UserService {

    private _userRegistrationStatus = new BehaviorSubject<UserRegistrationResponse>(undefined);
    userRegistrationStatus$ = this._userRegistrationStatus.asObservable();
    currentUser: User = undefined;

    constructor(private http: Http, private web3: Web3Service, private tokenService: TokenService, private auth: AuthService) { }

    registerUserUsingSession(userAccount = '') {
        if (!this.auth.isAuthenticated())
            return;
        let userRegistration = new UserRegistration();
        //console.log("coin base account number",this.web3.getWeb3().eth.coinbase)
        if(sessionStorage.getItem('exchange')=='wan') {
            let userRegistration = new UserRegistration();
            // userRegistration.UserAccount = this.web3.getWeb3().eth.coinbase;
            userRegistration.UserAccount = sessionStorage.getItem("walletAddress");
            userRegistration.UserEmail = sessionStorage.getItem("email");
            userRegistration.Name = sessionStorage.getItem("name");
            if(userRegistration.Name === undefined || userRegistration.Name === undefined || userRegistration.Name === null || userRegistration.Name === null){
             //   console.log("User details not available in session");
                return;
            }
            let headers = new Headers({ "content-type": "application/json", "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey });
            let requestOptions = new RequestOptions({headers: headers});
            this.http.post(Constants.ServiceURLWAN + "RegisterUser", userRegistration, requestOptions).subscribe(
                data => {
                //    console.log(data)
                    this.currentUser = new User();
                    this.currentUser.UserAccount = userRegistration.UserAccount;
                    this.currentUser.UserEmail = userRegistration.UserEmail;
                    this.currentUser.UserName = userRegistration.Name;
                    this._userRegistrationStatus.next(data.json());
                },
                err => {
                //    console.log(err);
                    this._userRegistrationStatus.next(new UserRegistrationResponse());
                }
            );
        } else {
            if (sessionStorage.getItem('exchange') === 'aion') {
                userRegistration.UserAccount = sessionStorage.getItem('walletAddress');
                console.log(sessionStorage.getItem('walletAddress'));
            } else {
                userRegistration.UserAccount = this.web3.getWeb3().eth.coinbase;
            }
            userRegistration.UserEmail = sessionStorage.getItem("email");
            userRegistration.Name = sessionStorage.getItem("name");
            if (userRegistration.Name === undefined || userRegistration.Name === undefined || userRegistration.Name === null || userRegistration.Name === null) {
                console.log("User details not available in session");
                return;
            }
            let headers = new Headers({ "content-type": "application/json", "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey });
            let requestOptions = new RequestOptions({ headers: headers });
            this.http.post(Constants.ServiceURL + "RegisterUser", userRegistration, requestOptions).subscribe(
                data => {
                    this.currentUser = new User();
                    this.currentUser.UserAccount = userRegistration.UserAccount;
                    this.currentUser.UserEmail = userRegistration.UserEmail;
                    this.currentUser.UserName = userRegistration.Name;
                    this._userRegistrationStatus.next(data.json());
                },
                err => {
                    console.log(err);
                    this._userRegistrationStatus.next(new UserRegistrationResponse());
                }
            );
        }
    }

    getCurrentUser(): User {
        if(sessionStorage.getItem('exchange')=='eth') {
            if(this.currentUser === null || this.currentUser === undefined){
                this.currentUser = new User();
                this.currentUser.UserAccount = this.web3.getWeb3().eth.coinbase;
                this.currentUser.UserEmail = sessionStorage.getItem("email");
                this.currentUser.UserName = sessionStorage.getItem("user_id");
            }
        }
        if(sessionStorage.getItem('exchange')=='wan') {
            if(this.currentUser === null || this.currentUser === undefined) {
                this.currentUser = new User();
                this.currentUser.UserAccount = sessionStorage.getItem("walletAddress");
                this.currentUser.UserEmail = sessionStorage.getItem("email");
                this.currentUser.UserName = sessionStorage.getItem("user_id");
            }
        }
        return this.currentUser;
    }
}
