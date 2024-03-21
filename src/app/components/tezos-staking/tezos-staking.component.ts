import { Component, OnInit, OnDestroy } from "@angular/core";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { AccountInfo } from "../../models/tezos.model";
import { Constants } from "../../models/constants";
import { CORS } from "../../services/cors.service";
import { NotificationManagerService } from "../../services/notification-manager.service";
import {
  MessageContentType,
  MessageModel,
  MessageType
} from "../../models/message.model";

import Sotez, { utility, forge, crypto, ledger } from "sotez";
const sotez = new Sotez("https://api.tezos.org.ua", "main", {
  defaultFee: 1275
});

declare var eztz: any;
import "../../../assets/eztz.min.js";

import * as BigNumber from "../../../assets/newBigNumber.js";
var Tx = require("ethereumjs-tx");
const electron = window.require("electron");
var shell = window.require("electron").shell;
declare var window: any;

@Component({
  selector: "app-tezos-staking",
  templateUrl: "./tezos-staking.component.html",
  styleUrls: ["./tezos-staking.component.css"]
})
export class TezosStakingComponent implements OnInit {
  public selectedWallet: any = "";
  accounts: string[];

  private savedWalletsServiceSub: any;
  public shell = shell;

  accountInfo: any;

  originationAmount: string;
  newDelegationAddress: any;
  serial: string;
  // fromAddress: string;
  toAddress: string;
  transferAmount: string;
  DelegationAddressTez:any;

  constructor(
    private savedWalletsService: SavedWalletsService,
    private notificationManagerService: NotificationManagerService
  ) {}

  ngOnInit() {
    this.accountInfo = new AccountInfo();
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        // console.log(d);
        if (d == "currentWalletChanged") {
          this.selectedWallet = this.savedWalletsService.getCurrentWallet();
          // console.log("selectedWallet",this.selectedWallet)
          this.accounts = [this.selectedWallet.address];
          this.accountInfo.account = this.accounts[0];
          this.refreshAccountStatus();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.savedWalletsServiceSub.unsubscribe();
  }

  async refreshAccountStatus() {
    this.accountInfo.tezBalance = "Fetching...";
    var foo = this;
    // debugger;
    await sotez.importKey(foo.selectedWallet.account.sk);
    // ##----user's tezos account private key here----##");
    eztz.rpc.getBalance(foo.accountInfo.account).then(function(res) {
      var balance = BigNumber(res);
      foo.accountInfo.tezBalance = balance.dividedBy(1000000).toJSON();
    });
    this.getDelegate();
  }

  // async importAccount() {
  // debugger;
  // let hash;
  // sotez
  //   .setDelegate({
  //     delegate: "tz1Tnjaxk6tbAeC2TmMApPh8UsrEVQvhHvx5",
  //     fee: 1500
  //   })
  //   .then(async opHash => {
  //     hash = opHash;
  //     return console.log("OpHash: ", opHash);
  //   });
  // const block = await sotez.awaitOperation(hash);
  // console.log(`Operation found in block ${block}`);
  // sotez
  //   .getDelegate("tz1f8bBWMMPEp33VPduxmzJJhRgocfB1TUdi")
  //   .then(delegate => console.log("Delegate: ", delegate));
  // debugger;
  // }

  // getOriginatedAccounts() {
  //   var foo = this;
  //   CORS.doCORSRequest(
  //     {
  //       method: "GET",
  //       url:
  //         "https://api6.dunscan.io/v3/operations/" +
  //         foo.accountInfo.account +
  //         "?type=Origination"
  //       //   ,
  //       // data: ""
  //     },
  //     function result(status, response) {
  //       response = status == 200 ? JSON.parse(response) : response;
  //       // debugger;
  //       if (status != 200) return;
  //       // debugger;
  //       let objArr = [];
  //       for (let t of response) {
  //         let address = t["type"]["operations"][0]["tz1"]["tz"];
  //         objArr.push({
  //           address: address,
  //           balance: "Fetching...",
  //           delegatedAddress: "Fetching..."
  //         });
  //       }
  //       objArr.reverse();
  //       foo.accountInfo.originatedAccounts = objArr;
  //       for (let i in response) foo.fetchKTAccountInfo(i);
  //     }
  //   );
  // }

  // fetchKTAccountInfo(index) {
  //   console.log("originations: ", this.accountInfo.originatedAccounts.length);
  //   console.log("index: ", index);
  //   if (this.accountInfo.originatedAccounts.length <= index) return;
  //   var obj = this.accountInfo.originatedAccounts[index];
  //   var foo = this;
  //   eztz.rpc.getBalance(obj.address).then(function(res) {
  //     var balance = BigNumber(res);
  //     obj.balance = balance.dividedBy(1000000).toJSON();
  //   });
  //   eztz.rpc.getDelegate(obj.address).then(function(res) {
  //     if (!res) {
  //       obj.delegatedAddress = "NONE";
  //       return;
  //     }
  //     obj.delegatedAddress = res;
  //   });
  // }

  // originateAccount() {
  //   if (this.originationAmount === "" || this.originationAmount === undefined)
  //     return;
  //   if (
  //     BigNumber(this.originationAmount).toNumber() + 0.2614 >
  //     this.accountInfo.tezBalance
  //   ) {
  //     this.notificationManagerService.showNotification(
  //       new MessageModel(MessageType.Error, "Insufficient balance"),
  //       MessageContentType.Text
  //     );
  //     return;
  //   }
  //   this.notificationManagerService.showNotification(
  //     new MessageModel(MessageType.Info, "Preparing Transaction"),
  //     MessageContentType.Text
  //   );
  //   var foo = this;
  //   eztz.rpc
  //     .account(
  //       this.selectedWallet.account,
  //       this.originationAmount,
  //       true,
  //       true,
  //       undefined,
  //       1400
  //     )
  //     .then(function(res) {
  //       foo.notificationManagerService.showNotification(
  //         new MessageModel(
  //           MessageType.Info,
  //           "Transaction submitted. Please wait..."
  //         ),
  //         MessageContentType.Text
  //       );
  //       const { hash, operations } = res;
  //       var interval = setInterval(function() {
  //         CORS.doCORSRequest(
  //           {
  //             method: "GET",
  //             url: "https://api6.dunscan.io/v3/operation/" + hash,
  //             data: ""
  //           },
  //           function result(status, response) {
  //             if (status != 200) return;
  //             clearInterval(interval);
  //             foo.notificationManagerService.showNotification(
  //               new MessageModel(
  //                 MessageType.Info,
  //                 "Origination success. Refreshing info"
  //               ),
  //               MessageContentType.Text
  //             );
  //             foo.refreshAccountStatus();
  //           }
  //         );
  //       }, 5000);
  //       // const address = eztz.contract.hash(hash, 0);
  //       // foo.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'KT Address = ' + address), MessageContentType.Text);
  //     })
  //     .catch(function(e) {
  //       foo.notificationManagerService.showNotification(
  //         new MessageModel(MessageType.Error, "Origination error; see log."),
  //         MessageContentType.Text
  //       );
  //       console.log("[Origination Error]", e);
  //     });
  // }
  getAddressUrl() {
    return Constants.tezosurl;
  }
  getDelegate() {
    sotez.getDelegate(this.accountInfo.account).then(delegate => {
      // console.log("Delegate: ", delegate);
      if (delegate) {
        this.DelegationAddressTez = delegate;
      }
      // this.newDelegationAddress = delegate;
    });
  }

  setDelegate() {
    if (
      this.newDelegationAddress === "" ||
      this.newDelegationAddress === undefined
      // this.serial === "" ||
      // this.serial === undefined
    )
      return;
    // if (
    //   this.serial >= this.accountInfo.originatedAccounts.length ||
    //   this.serial < "0"
    // ) {
    //   this.notificationManagerService.showNotification(
    //     new MessageModel(MessageType.Error, "Invalid serial no"),
    //     MessageContentType.Text
    //   );
    //   return;
    // }
    // var obj = this.accountInfo.originatedAccounts[this.serial];
    if (this.accountInfo.tezBalance < 0.0014) {
      this.notificationManagerService.showNotification(
        new MessageModel(MessageType.Error, "Insufficient balance"),
        MessageContentType.Text
      );

      return;
    }
    this.notificationManagerService.showNotification(
      new MessageModel(MessageType.Info, "Preparing Transaction"),
      MessageContentType.Text
    );
    var foo = this;
    // eztz.rpc
    //   .setDelegate(
    //     obj.address,
    //     foo.selectedWallet.account.pk,
    //     foo.selectedWallet.account,
    //     this.newDelegationAddress,
    //     1400
    //   )
    let hash;
    sotez
      .setDelegate({
        delegate: this.newDelegationAddress,
        fee: 1500
      })
      .then(async opHash => {
        hash = opHash;
        console.log("OpHash: ", opHash);
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted. Please wait"
          ),
          MessageContentType.Text
        );
        // add code to notify successful delegation
        // foo.notificationManagerService.showNotification(
        //   new MessageModel(
        //     MessageType.Info,
        //     "Transaction submitted. Please wait..."
        //   ),
        //   MessageContentType.Text
        // );
        const _hash = opHash.hash;

        var interval = setInterval(function() {
          CORS.doCORSRequest(
            {
              method: "GET",
              url: "https://api.tzstats.com/explorer/op/" + _hash,
              data: ""
            },
            function result(status, response) {
              if (status != 200) return;
              clearInterval(interval);
              foo.notificationManagerService.showNotification(
                new MessageModel(
                  MessageType.Info,
                  "Delegation success.\nRefreshing delegation details"
                ),
                MessageContentType.Text
              );
              foo.refreshAccountStatus();
              //               foo.fetchKTAccountInfo(foo.serial);
            }
          );
        }, 5000);
      })
      .catch(function(e) {
        foo.notificationManagerService.showNotification(
          new MessageModel(MessageType.Error, "Delegation error; see log."),
          MessageContentType.Text
        );
        console.log("[Delegation Error]", e);
      });
    sotez
      .awaitOperation(hash, 11, 181)
      .then(block =>
        console.log("Block in which operation is included: ", block)
      );
  }

  transferTezos() {
    if (
      // this.fromAddress === "" ||
      // this.fromAddress === undefined ||
      this.toAddress === "" ||
      this.toAddress === undefined ||
      this.transferAmount === "" ||
      this.transferAmount === undefined
    )
      return;
    this.notificationManagerService.showNotification(
      new MessageModel(MessageType.Info, "Preparing Transaction"),
      MessageContentType.Text
    );
    var foo = this;
    sotez
      .transfer({
        to: foo.toAddress,
        amount: +foo.transferAmount * 1000000, // '+' to convert string to number in typescript
        fee: 1500
      })
      .then(async res => {
        console.log("Transfer res:", res);
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted. Please wait..."
          ),
          MessageContentType.Text
        );
        const { hash, operations } = res;
        var interval = setInterval(function() {
          CORS.doCORSRequest(
            {
              method: "GET",
              // https://api.tzstats.com/explorer/op/
              // https://api6.dunscan.io/v3/operation/
              url: "https://api.tzstats.com/explorer/op/" + hash,
              data: ""
            },
            function result(status, response) {
              if (status != 200) return;
              clearInterval(interval);
              foo.notificationManagerService.showNotification(
                new MessageModel(
                  MessageType.Info,
                  "Transfer success. Refreshing info"
                ),
                MessageContentType.Text
              );
              foo.refreshAccountStatus();
            }
          );
        }, 5000);
      })
      .catch(function(e) {
        foo.notificationManagerService.showNotification(
          new MessageModel(MessageType.Error, "Transfer failed; see log."),
          MessageContentType.Text
        );
        console.log("[Transfer Error]", e);
      });
  }

  setDelegationAddress(e) {
    this.newDelegationAddress = e.target.value;
  }

  setSerialNo(e) {
    this.serial = e.target.value;
  }

  setOriginationAmount(e) {
    this.originationAmount = e.target.value;
  }

  // setFromAddress(e) {
  //   this.fromAddress = e.target.value;
  // }

  setToAddress(e) {
    this.toAddress = e.target.value;
  }

  setTransferAmount(e) {
    this.transferAmount = e.target.value;
  }
}
