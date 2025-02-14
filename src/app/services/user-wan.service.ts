import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Http, Headers, RequestOptions } from "@angular/http";

//import { Web3Service } from "../services/web3.service";
import { Constants } from "../models/constants";
import { UserRegistration, UserRegistrationResponse } from "../models/user-registration.model";
import { User } from "../models/user.model";
//import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { TokenWanService } from "./token-wan.service";

@Injectable()
export class UserWanService {

    private _userRegistrationStatus = new BehaviorSubject<UserRegistrationResponse>(undefined);
    userRegistrationStatus$ = this._userRegistrationStatus.asObservable();
    currentUser: User = undefined;

    constructor(private http: Http, private tokenService: TokenWanService, private auth: AuthService) { }

    registerUserUsingSession(userAccount = '') {
        if (!this.auth.isAuthenticated())
            return;
     
        //console.log("coin base account number",this.web3.getWeb3().eth.coinbase)
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
      
    }

    getCurrentUser(): User {
       
       
            if(this.currentUser === null || this.currentUser === undefined) {
                this.currentUser = new User();
                this.currentUser.UserAccount = sessionStorage.getItem("walletAddress");
                this.currentUser.UserEmail = sessionStorage.getItem("email");
                this.currentUser.UserName = sessionStorage.getItem("user_id");
            }
       
        return this.currentUser;
    }
}
