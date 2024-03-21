import { Component, OnInit, OnDestroy, NgZone } from "@angular/core";
import { Http } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";

import { WXETH_ABI, WXETH_CONTRACT_ADDRESS } from "../../wxeth_constants";
import { Constants } from "../../models/constants";
import {
  MessageModel,
  MessageType,
  MessageContentType
} from "../../models/message.model";
import { NavigationService } from "../../services/nav.service";
import { WalletService } from "../../services/wallet.service";
import { Web3Service } from "../../services/web3.service";
import { NotificationManagerService } from "../../services/notification-manager.service";
import { SwitchThemeService } from "../../services/switch-theme.service";
import { TokenService } from "../../services/token.service";
import { ChartService } from "../../services/chart.service";
import { BigNumber } from "bignumber.js";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { WanWeb3Service } from "../../services/wan-web3.service";
import { UserTokensService } from "../../services/user-tokens.service";

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(
    ecSignature: any,
    orderHash: any,
    signer: any
  );
}

@Component({
  selector: "app-basket-wallet",
  templateUrl: "./basket-wallet.component.html",
  styleUrls: ["./basket-wallet.component.css"]
})
export class BasketWalletComponent implements OnInit, OnDestroy {
  private availableTokensType: Array<string> = [
    "WAND",
    "ZRX",
    "QTUM",
    "VERI",
    "GNT",
    "DEX"
  ];
  private tokenContracts: any;
  private tokenContractChange: Subscription;
  private userAccountChange: Subscription;
  private transactionInProgress: boolean = false;
  private savedWalletChangeSubscription: any;
  private tokendata: Subscription;
  selectedToken: string = "WAND";
  allAvailableContracts: Array<any> = [];
  allAvailableTokenContracts: Array<any> = [];
  userAccountSummary: Array<any> = [];
  showWalletLoader = true;
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance = 0.0;
  wxETHBalance: BigNumber;
  usd: any;
  AllowanceBalance: any;
  _web3: any;
  tokendetails: any;
  constructor(
    private navService: NavigationService,
    private http: Http,
    private zone: NgZone,
    private walletService: WalletService,
    private notificationsService: NotificationManagerService,
    readonly switchThemeService: SwitchThemeService,
    private web3: Web3Service,
    private router: Router,
    private tokenService: TokenService,
    private savedWalletsService: SavedWalletsService,
    private chartService: ChartService,
    private WanWeb3Service: WanWeb3Service,
    private UserTokensService: UserTokensService
  ) {
    console.log("wallet tab is called");
    console.log("cuurent nav", navService.getCurrentActiveTab());
    //  this._web3=web3._getWeb3();
    this._web3 = WanWeb3Service._getWeb3();

    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(
      data => this.handleContractChange(data)
    );
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(
      data => this.handleUserAccountSummaryChange(data)
    );
    this.tokendata = this.UserTokensService.itemList$.subscribe(data => {
      this.token(data);
    });
    this.getWalletBalance = this.getWalletBalance.bind(this);
  }

  token(data) {
    console.log("token", data);
    this.tokendetails = data;
  }

  getWalletBalance() {
    let web3 = this.web3.getWeb3();
    web3.eth.getBalance(
      sessionStorage.getItem("walletAddress"),
      (err, data) => {
        this.currentEtherBalance = web3.fromWei(data).toFixed(4);
      }
    );
  }
  ngOnInit() {
    this.showWalletLoader = true;
    this.savedWalletChangeSubscription = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if (d == "currentWalletChanged") {
          this.getWalletBalance();
          this.UserTokensService.getPlatformTokens();
        }
      }
    );
    this.getWalletBalance();

    if (this.tokenService.getToken() === undefined) {
      console.log(this.tokenService.getToken());
      this.tokenService.fetchToken();
    } else {
      this.loadData();
      this.isWalletActive();
    }
    let __this = this;
    this.chartService.setUSD(function(err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
    this.UserTokensService.getPlatformTokens();
  }

  ngOnDestroy(): void {
    this.tokenContractChange.unsubscribe();
    this.userAccountChange.unsubscribe();
    this.savedWalletChangeSubscription.unsubscribe();
    this.tokendata.unsubscribe();
  }

  isWalletActive() {
    if (this.navService.getCurrentActiveTab() === "dashboard") {
      this.showContent = true;
    } else {
      this.showContent = false;
    }
  }

  private loadData() {
    if (this.walletService.getUserAccountSummary() !== undefined) {
      this.showWalletLoader = false;
      this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
      console.log(this.userAccountSummary);
      this.wxETHBalance = this.userAccountSummary.filter(
        wxethbalance => wxethbalance.Symbol === "WXETH"
      )[0].Balance;

      const contrct = this.userAccountSummary.filter(
        wxethbalance => wxethbalance.Symbol === "WXETH"
      )[0].tokenContract;
      console.log("contrct", contrct);
      const myTokenContract = this.web3
        .getWeb3()
        .eth.contract(JSON.parse(contrct["abi"]));
      const instanceMyTokenContract = myTokenContract.at(contrct["address"]);
      const userAccount = this.web3.getWeb3().eth.coinbase;
      // const wxethContract = this.web3.getWeb3().eth.contract(WXETH_ABI);
      // const wxethInstance = wxethContract.at(WXETH_CONTRACT_ADDRESS);
      // wxethInstance.balanceOf(userAccount, (err, res) => {
      //   this.wxETHBalance = new BigNumber(res.toString()).dividedBy(
      //     new BigNumber(10).pow(18)
      //   );
      // });
      // console.log("WOHO: ", this.wxETHBalance);
      instanceMyTokenContract.allowance(
        userAccount,
        Constants.TrasfersProxyAddress,
        (err, result) => {
          this.zone.run(() => {
            this.AllowanceBalance = new BigNumber(result.toString())
              .dividedBy(new BigNumber(10).pow(18))
              .toJSON();
          });
        }
      );
      console.log(
        "WXEth Balance: " +
          this.userAccountSummary.filter(
            wxethbalance => wxethbalance.Symbol === "WXETH"
          )[0].Balance
      );
      console.log(
        "userAccountSummary length: " + this.userAccountSummary.length
      );
    } else {
      this.walletService.fetchAccountSummary();
    }

    if (this.walletService.getContracts() !== undefined) {
      this.allAvailableContracts = this.walletService.getContracts();
    } else {
      this.walletService.fetchContracts();
    }
  }

  handleContractChange(data) {
    if (data === undefined) return;
    this.allAvailableContracts = data;
    for (var i = 0; i < data.length; i++) {
      if (data[i].isTokenContract) {
        data[i]["AuthorizationAmount"] = 0;
        this.allAvailableTokenContracts.push(data[i]);
      }
    }
    if (!this.hasUASummaryUpdateWithTC) this.updateUASummaryWithTokenContract();
  }

  handleUserAccountSummaryChange(data) {
    this.showWalletLoader = false;
    if (data === undefined) return;
    this.userAccountSummary = data.Balances;
    this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
    var wxEthToken = this.userAccountSummary.filter(
      wxethbalance => wxethbalance.Symbol === "WXETH"
    )[0];
    this.wxETHBalance = new BigNumber(0);
    if (wxEthToken) {
      this.wxETHBalance = wxEthToken.Balance;
    }
    this.hasUASummaryUpdateWithTC = false;
    this.updateUASummaryWithTokenContract();
  }

  updateUASummaryWithTokenContract() {
    if (!this.allAvailableTokenContracts || !this.userAccountSummary) return;
    var self = this;
    this.hasUASummaryUpdateWithTC = true;
    self.allAvailableTokenContracts.forEach(function(it, i) {
      self.userAccountSummary.forEach(function(jt, j) {
        if (it.symbol && it.symbol == jt.Symbol) jt.tokenContract = it;
        if (i === self.allAvailableTokenContracts.length - 1) {
          const contrct = self.userAccountSummary.filter(
            wxethbalance => wxethbalance.Symbol === "WXETH"
          )[0].tokenContract;
          console.log("contrct", contrct);
          const myTokenContract = self.web3
            .getWeb3()
            .eth.contract(JSON.parse(contrct["abi"]));
          const instanceMyTokenContract = myTokenContract.at(
            contrct["address"]
          );
          const userAccount = self.web3.getWeb3().eth.coinbase;
          instanceMyTokenContract.allowance(
            userAccount,
            Constants.TrasfersProxyAddress,
            (err, result) => {
              self.zone.run(() => {
                self.AllowanceBalance = new BigNumber(result.toString())
                  .dividedBy(new BigNumber(10).pow(18))
                  .toJSON();
              });
            }
          );
        }
      });
    });
  }

  refreshAccountSummary() {
    this.showWalletLoader = true;
    this.walletService.fetchAccountSummary();
  }

  // deposit() {
  //   if (this.transactionInProgress) {
  //     this.notificationsService.showNotification(
  //       new MessageModel(MessageType.Info, "Transaction is in progress"),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }
  //   let web3Instance = this.web3.getWeb3();
  //   var userAccount = web3Instance.eth.coinbase;
  //   if (
  //     userAccount === null ||
  //     userAccount === undefined ||
  //     userAccount.length === 0
  //   ) {
  //     console.log("sfjslf");
  //     this.notificationsService.showNotification(
  //       new MessageModel(
  //         MessageType.Error,
  //         "Failed to get user account, please reload"
  //       ),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }

  //   this.notificationsService.showNotification(
  //     new MessageModel(
  //       MessageType.Info,
  //       "Depositing " +
  //         this.amount +
  //         " as WXETH to enable trading in ERC20 Token Baskets"
  //     ),
  //     MessageContentType.Text
  //   );
  //   let wxEthData = this.getContract("WXETH");
  //   if (!wxEthData || wxEthData === undefined || wxEthData === null) {
  //     this.notificationsService.showNotification(
  //       new MessageModel(
  //         MessageType.Error,
  //         "Failed to get ether token details"
  //       ),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }

  //   let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
  //   let wxEthContract = wxEth.at(wxEthData.address);
  //   let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

  //   wxEthContract.deposit(
  //     userAccount,
  //     { from: userAccount, value: convertedAmount },
  //     (err, result) => {
  //       this.transactionInProgress = false;
  //       console.log(result);

  //       if (!result || result === undefined || result === null) {
  //         this.notificationsService.showNotification(
  //           new MessageModel(
  //             MessageType.Info,
  //             "Transaction has not been processed"
  //           ),
  //           MessageContentType.Text
  //         );
  //         return;
  //       }
  //       this.notificationsService.showNotification(
  //         new MessageModel(
  //           MessageType.Success,
  //           "Token deposit successful, please wait for transaction to complete"
  //         ),
  //         MessageContentType.Text
  //       );
  //       return;
  //     }
  //   );
  // }

  // withdraw() {
  //   if (this.transactionInProgress) {
  //     this.notificationsService.showNotification(
  //       new MessageModel(MessageType.Info, "Transaction is in progress"),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }
  //   let web3Instance = this.web3.getWeb3();
  //   var userAccount = web3Instance.eth.coinbase;
  //   if (
  //     userAccount === null ||
  //     userAccount === undefined ||
  //     userAccount.length === 0
  //   ) {
  //     this.notificationsService.showNotification(
  //       new MessageModel(
  //         MessageType.Error,
  //         "Failed to get user account, please check reload"
  //       ),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }
  //   web3Instance.eth.getBalance(userAccount, (err, result) => {
  //     console.log(
  //       "balance",
  //       new BigNumber(result.toString())
  //         .dividedBy(new BigNumber(10).pow(18))
  //         .toJSON()
  //     );
  //     const balance = new BigNumber(result.toString())
  //       .dividedBy(new BigNumber(10).pow(18))
  //       .toJSON();
  //     if (parseFloat("0") == parseFloat(balance)) {
  //       this.notificationsService.showNotification(
  //         new MessageModel(
  //           MessageType.Error,
  //           "You do not have ETH balance for this transaction."
  //         ),
  //         MessageContentType.Text
  //       );
  //       return;
  //     } else {
  //       if (new BigNumber(this.wxETHBalance) < new BigNumber(this.amount)) {
  //         this.notificationsService.showNotification(
  //           new MessageModel(
  //             MessageType.Error,
  //             "You do not have enough WXETH balance to withdraw"
  //           ),
  //           MessageContentType.Text
  //         );
  //         return;
  //       }
  //       this.notificationsService.showNotification(
  //         new MessageModel(
  //           MessageType.Info,
  //           "Withdrawing " + this.amount + " from ether token"
  //         ),
  //         MessageContentType.Text
  //       );
  //       let wxEthData = this.getContract("WXETH");
  //       if (!wxEthData || wxEthData === undefined || wxEthData === null) {
  //         this.notificationsService.showNotification(
  //           new MessageModel(
  //             MessageType.Error,
  //             "Failed to get ether token details"
  //           ),
  //           MessageContentType.Text
  //         );
  //         return;
  //       }
  //       let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
  //       let wxEthContract = wxEth.at(wxEthData.address);
  //       let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);
  //       wxEthContract.withdraw(
  //         convertedAmount,
  //         { from: userAccount },
  //         (err, result) => {
  //           this.transactionInProgress = false;
  //           if (!result || result === undefined || result === null) {
  //             this.notificationsService.showNotification(
  //               new MessageModel(
  //                 MessageType.Error,
  //                 "Transaction has not been processed"
  //               ),
  //               MessageContentType.Text
  //             );
  //             return;
  //           }
  //           this.notificationsService.showNotification(
  //             new MessageModel(
  //               MessageType.Success,
  //               "Token withdrawal successful, please wait for transaction to complete"
  //             ),
  //             MessageContentType.Text
  //           );
  //           return;
  //         }
  //       );
  //     }
  //   });
  // }

  deposit() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(
        new MessageModel(MessageType.Info, "Transaction is in progress"),
        MessageContentType.Text
      );
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (
      userAccount === null ||
      userAccount === undefined ||
      userAccount.length === 0
    ) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get user account, please reload"
        ),
        MessageContentType.Text
      );
      return;
    }

    this.notificationsService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Depositing " + this.amount + " ETH as WXETH to enable basket creation"
      ),
      MessageContentType.Text
    );
    let wxEthData = this.getContract("WXETH");
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get ether token details"
        ),
        MessageContentType.Text
      );
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.deposit(
      userAccount,
      { from: userAccount, value: convertedAmount },
      (err, result) => {
        this.transactionInProgress = false;
        if (!result || result === undefined || result === null) {
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Info,
              "Transaction cancelled!"
            ),
            MessageContentType.Text
          );
          return;
        }
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Success,
            "Token deposit initiated, please wait for transaction to complete"
          ),
          MessageContentType.Text
        );
        let foo = this;
        var interval = setInterval(function() {
          web3Instance.eth.getTransactionReceipt(result, (err, res2) => {
            if (res2) {
              foo.getWalletBalance();
              if (res2.status === "0x1") {
                web3Instance.eth.getBalance(userAccount, (err, result) => {
                  foo.currentEtherBalance = web3Instance
                    .fromWei(result)
                    .toFixed(4);
                  // console.log(foo.currentEtherBalance);

                  foo.walletService.fetchAccountSummary();
                  foo.getWalletBalance();
                  foo.loadData();
                  foo.notificationsService.showNotification(
                    new MessageModel(MessageType.Info, "Deposit successful!"),
                    MessageContentType.Text
                  );
                });
              } else if (res2.status === "0x0") {
                foo.notificationsService.showNotification(
                  new MessageModel(
                    MessageType.Error,
                    "Error In Token Deposit;Transaction failed"
                  ),
                  MessageContentType.Text
                );
                console.log(err);
              }
              clearInterval(interval);
            }
          });
        }, 1000);
      }
    );
  }

  withdraw() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(
        new MessageModel(MessageType.Info, "Transaction is in progress"),
        MessageContentType.Text
      );
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (
      userAccount === null ||
      userAccount === undefined ||
      userAccount.length === 0
    ) {
      this.notificationsService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Failed to get user account, please check reload"
        ),
        MessageContentType.Text
      );
      return;
    }
    web3Instance.eth.getBalance(userAccount, (err, result) => {
      console.log(
        "balance",
        new BigNumber(result.toString())
          .dividedBy(new BigNumber(10).pow(18))
          .toJSON()
      );
      const balance = new BigNumber(result.toString())
        .dividedBy(new BigNumber(10).pow(18))
        .toJSON();
      if (parseFloat("0") == parseFloat(balance)) {
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Error,
            "You do not have ETH balance for this transaction."
          ),
          MessageContentType.Text
        );
        return;
      } else {
        if (new BigNumber(this.wxETHBalance) < new BigNumber(this.amount)) {
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Error,
              "You do not have enough WXETH balance to withdraw"
            ),
            MessageContentType.Text
          );
          return;
        }
        this.notificationsService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Withdrawing " + this.amount + " WXETH as ETH"
          ),
          MessageContentType.Text
        );
        let wxEthData = this.getContract("WXETH");
        if (!wxEthData || wxEthData === undefined || wxEthData === null) {
          this.notificationsService.showNotification(
            new MessageModel(
              MessageType.Error,
              "Failed to get ether token details"
            ),
            MessageContentType.Text
          );
          return;
        }
        let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
        let wxEthContract = wxEth.at(wxEthData.address);
        let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);
        wxEthContract.withdraw(
          convertedAmount,
          { from: userAccount },
          (err, result) => {
            this.transactionInProgress = false;
            if (!result || result === undefined || result === null) {
              this.notificationsService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  "Transaction cancelled!"
                ),
                MessageContentType.Text
              );
              return;
            }
            this.notificationsService.showNotification(
              new MessageModel(
                MessageType.Success,
                "Token withdrawal initiated, please wait for transaction to complete"
              ),
              MessageContentType.Text
            );
            let foo = this;
            var interval = setInterval(function() {
              web3Instance.eth.getTransactionReceipt(result, (err, res2) => {
                if (res2) {
                  foo.getWalletBalance();
                  if (res2.status === "0x1") {
                    web3Instance.eth.getBalance(userAccount, (err, result) => {
                      foo.currentEtherBalance = web3Instance
                        .fromWei(result)
                        .toFixed(4);
                      //  console.log(foo.currentEtherBalance);
                      foo.walletService.fetchAccountSummary();
                      foo.getWalletBalance();
                      foo.loadData();
                      foo.notificationsService.showNotification(
                        new MessageModel(
                          MessageType.Info,
                          "Withdrawal successful!"
                        ),
                        MessageContentType.Text
                      );
                    });
                  } else if (res2.status === "0x0") {
                    foo.notificationsService.showNotification(
                      new MessageModel(
                        MessageType.Error,
                        "Error Withdrawal;Transaction failed"
                      ),
                      MessageContentType.Text
                    );
                    console.log(err);
                  }
                  clearInterval(interval);
                }
              });
            }, 1000);
          }
        );
      }
    });
  }

  authorize(token: any) {
    var contract, exchange, wxethAddress;
    if (
      this.allAvailableContracts === null ||
      this.allAvailableContracts === undefined ||
      this.allAvailableContracts.length === 0
    )
      return;
    for (var i = 0, len = this.allAvailableContracts.length; i < len; i++) {
      if (this.allAvailableContracts[i]["symbol"] == token["symbol"])
        contract = this.allAvailableContracts[i];
      else if (this.allAvailableContracts[i]["symbol"] == "DEX")
        exchange = this.allAvailableContracts[i];
    }
    var myTokenContract = this.web3
      .getWeb3()
      .eth.contract(JSON.parse(contract["abi"]));
    var instanceMyTokenContract = myTokenContract.at(contract["address"]);
    var userAccount = this.web3.getWeb3().eth.coinbase;
    if (token.symbol === "WXETH") {
      wxethAddress = Constants.TrasfersProxyAddress;
    } else {
      wxethAddress = exchange["address"];
    }
    this.checkAndAuthorize(
      instanceMyTokenContract,
      userAccount,
      wxethAddress,
      web3Functions.toBaseUnitAmount(token.AuthorizationAmount, 18)
    );
    this.notificationsService.showNotification(
      new MessageModel(MessageType.Info, "Initiated authorization"),
      MessageContentType.Text
    );
  }

  private checkAndAuthorize(
    instanceTokenContract,
    account,
    authorizedAcc,
    value
  ) {
    // alert('called checkAndAuthorize')
    instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
      console.log("result", result.lt(value));
      if (result.lt(value)) {
        this.authorizeOne(instanceTokenContract, account, authorizedAcc, value);
      } else {
        this.notificationsService.showNotification(
          new MessageModel(MessageType.Success, "Already Authorized"),
          MessageContentType.Text
        );
      }
    });
  }

  private authorizeOne(instanceTokenContract, account, authorizedAcc, value) {
    // alert('called authorizeOne')
    //instanceTokenContract.approve.estimateGas(authorizedAcc, value, (err, result) => {
    //    var estimatedGas = result;
    let web3Instance = this.web3.getWeb3();
    let foo = this;
    instanceTokenContract.approve(
      authorizedAcc,
      value,
      {
        from: account
        //, gas: estimatedGas
      },
      (err, result) => {
        instanceTokenContract.allowance(
          account,
          authorizedAcc,
          (err, result1) => {
            this.notificationsService.showNotification(
              new MessageModel(
                MessageType.Success,
                "Authorization successfully submitted to Blockchain network"
              ),
              MessageContentType.Text
            );
            var interval = setInterval(function() {
              web3Instance.eth.getTransactionReceipt(result, (err, res2) => {
                if (res2) {
                  foo.getWalletBalance();
                  if (res2.status === "0x1") {
                    web3Instance.eth.getBalance(account, (err, result) => {
                      foo.currentEtherBalance = web3Instance
                        .fromWei(result)
                        .toFixed(4);
                      //console.log(foo.currentEtherBalance);
                      foo.walletService.fetchAccountSummary();
                      foo.getWalletBalance();
                      foo.loadData();
                      foo.notificationsService.showNotification(
                        new MessageModel(
                          MessageType.Info,
                          "Token Authorization successfully Completed"
                        ),
                        MessageContentType.Text
                      );
                    });
                  } else if (res2.status === "0x0") {
                    foo.notificationsService.showNotification(
                      new MessageModel(
                        MessageType.Error,
                        "Error Authorization;Transaction failed"
                      ),
                      MessageContentType.Text
                    );
                    console.log(err);
                  }
                  clearInterval(interval);
                }
              });
            }, 1000);
          }
        );
      }
    );
    //});
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
    var myTokenContract = this.web3
      .getWeb3()
      .eth.contract(JSON.parse(tokenContract["abi"]));
    var instanceMyTokenContract = myTokenContract.at(tokenContract["address"]);
    var userAccount = this.web3.getWeb3().eth.coinbase;
    instanceMyTokenContract.allowance(
      userAccount,
      Constants.TrasfersProxyAddress,
      (err, result) => {
        this.zone.run(() => {
          this.AllowanceBalance = new BigNumber(result.toString())
            .dividedBy(new BigNumber(10).pow(18))
            .toJSON();
        });
      }
    );
  }
}
