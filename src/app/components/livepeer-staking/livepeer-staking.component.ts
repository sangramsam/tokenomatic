import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../../services/web3.service";
import { MatSnackBar } from "@angular/material";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { CustomWalletService } from "../../services/custom-wallet.service";
import { UniswapServiceService } from "../../services/uniswap-service.service";
import { ChartService } from "../../services/chart.service";

import {
  AccountInfo,
  RoundInfo,
  BondInfo,
  TranscoderInfo
} from "../../models/livepeer.model";

import { NotificationManagerService } from "../../services/notification-manager.service";
import {
  MessageContentType,
  MessageModel,
  MessageType
} from "../../models/message.model";

import { LivepeerSDK } from "@livepeer/sdk";

import { LivepeerTokenArtifact } from "../../artifacts/LivepeerToken";
import { BondingManagerArtifact } from "../../artifacts/BondingManager";
import { RoundsManagerArtifact } from "../../artifacts/RoundsManager";
import { ExchangeArtifact } from "../../artifacts/exchange";
import { tokensData } from "../../artifacts/tokensData";

import * as BigNumber from "../../../assets/newBigNumber.js";

var Tx = require("ethereumjs-tx");
let base = BigNumber(10);
let div = base.pow(18);

var any: any;

@Component({
  selector: "app-livepeer-staking",
  templateUrl: "./livepeer-staking.component.html",
  styleUrls: ["./livepeer-staking.component.css"]
})
export class LivepeerStakingComponent implements OnInit {
  public selectedWallet: any = "";
  accounts: string[];
  // transcoders: string[] = [];

  rpc: any;
  provider: string =
    "https://mainnet.infura.io/v3/f8857e6fe0604228b1ac7867482293e1";
  controllerAddress: string = "0xf96d54e490317c557a967abfa5d6e33006be69b3";
  managerProxyAddress = "0x511Bc4556D823Ae99630aE8de28b9B80Df90eA2e";

  // provider: string =
  //   "https://rinkeby.infura.io/v3/84a94f6390804c409e4fd79ea026ef78";
  // controllerAddress: string = "0x37dC71366Ec655093b9930bc816E16e6b587F968";
  // managerProxyAddress = "0xF6b0Ceb5e3f25b6FBecf8186F8A68B4E42A96a17";

  web3Instance: any;
  LivepeerToken: any;
  BondingManager: any;
  RoundManager: any;

  accountInfo: any;
  roundInfo: any;
  bondInfo: any;
  transcoderInfo: any;

  private savedWalletsServiceSub: any;

  newBondAmount: string;
  newAllowance: string;
  unbondAmount: string;
  unbondingTxns: any[];

  //added
  selectedTranscoderAddress: string;
  txcoderPage: number = 1;
  txPages: number[] = [];
  tot = 0;
  insatantBuyModal: boolean = false;
  traderate: boolean = true;
  bestrate: boolean = false;
  demo = {
    uniswap_exchange_artifact: any
  };
  txParams;
  canBondShow: boolean = false;
  canUnbondShow: boolean = false;
  transcodersInfo: Object[] = [];
  bondError1: boolean = false;
  bondError2: boolean = false;
  unBondError1: boolean = false;
  unBondError2: boolean = false;
  lptquantity: number = 0;
  etherToBuyToken: number = 0;
  apiHistBuy: number = 0;
  blockiesOptions: Object = {
    // All options are optional
    seed: "randstring", // seed used to generate icon data, default: random
    color: "#dfe", // to manually specify the icon color, default: random
    bgcolor: "#aaa", // choose a different background color, default: random
    size: 15, // width/height of the icon in blocks, default: 8
    scale: 3, // width/height of each block in pixels, default: 4
    spotcolor: "#000" // each pixel has a 13% chance of being of a third color,
    // default: random. Set to -1 to disable it. These "spots" create structures
    // that look like eyes, mouths and noses.
  };
  displayGif = "none";

  constructor(
    private web3: Web3Service,
    private matSnackBar: MatSnackBar,
    private savedWalletsService: SavedWalletsService,
    private wallet: CustomWalletService,
    private notificationManagerService: NotificationManagerService,
    private uniswapService: UniswapServiceService,
    private chartService: ChartService
  ) {
    // var token = ["LPT"];
    // var price = [0.000042]
    // for(var i=0;i<1;i++)
    // {
    //     this.demo.push( {
    //        'token' :token[i],
    //        'current_price' : price[i]
    //     })
    //   }
  }

  ngOnInit() {
    this.accountInfo = new AccountInfo();
    this.roundInfo = new RoundInfo();
    this.bondInfo = new BondInfo();
    this.transcoderInfo = new TranscoderInfo();
    this.unbondingTxns = [];
    this.web3.initialize();
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if (d == "currentWalletChanged") {
          this.selectedWallet = this.savedWalletsService.getCurrentWallet();
          this.wallet.setWallet(this.selectedWallet);
          this.web3.setDefaultAccount();
          this.accounts = [this.selectedWallet.address];
          this.accountInfo.account = this.accounts[0];
          this.refreshAccountStatus();
        }
      }
    );

    var provider = this.provider,
      controllerAddress = this.controllerAddress;
    this.roundInfo.currentRound = this.roundInfo.blockCount = this.roundInfo.roundStatus = this.transcoderInfo.feeShare = this.transcoderInfo.rewardCut = this.transcoderInfo.totalStake =
      "Fetching...";
    // debugger
    try {
      LivepeerSDK({ provider, controllerAddress, gas: 2.1 * 1000000 }).then(
        async sdk => {
          // Once initialized, you can access the methods under the `rpc` namespace
          // debugger
          // console.log(sdk);
          const { rpc } = sdk;
          this.rpc = rpc;
          this.refreshAccountStatus();
          var foo = this;
          setInterval(function() {
            foo.getRoundInfo();
          }, 5000);
          this.fetchTranscoders();
        }
      );
    } catch (e) {
      console.log("ee", e);
    }

    this.web3Instance = this.web3.getWeb3();
    this.LivepeerToken = this.web3Instance.eth
      .contract(LivepeerTokenArtifact.contractAbi)
      .at(LivepeerTokenArtifact.contractAddress);
    this.BondingManager = this.web3Instance.eth
      .contract(BondingManagerArtifact.contractAbi)
      .at(BondingManagerArtifact.contractAddress);
    this.RoundManager = this.web3Instance.eth
      .contract(RoundsManagerArtifact.contractAbi)
      .at(RoundsManagerArtifact.contractAddress);
    this.setApiHistory();
  }

  ngOnDestroy(): void {
    this.savedWalletsServiceSub.unsubscribe();
  }

  refreshAccountStatus() {
    this.accountInfo.ethBalance = this.accountInfo.tokenBalance = this.bondInfo.allowance = this.bondInfo.delegatorStatus = this.bondInfo.bondedAmount = this.bondInfo.lastClaimedRound = this.bondInfo.delegatedAddress = this.bondInfo.unclaimedToken = this.bondInfo.unclaimedFees =
      "Fetching...";
    if (this.rpc === undefined) return;
    this.refreshAccountInfo();
    this.getDelegatorInfo();
    this.fetchUnbondingTransactions();
  }

  refreshAccountInfo() {
    var foo = this;
    this.rpc.getEthBalance(this.accountInfo.account).then(function(res) {
      foo.accountInfo.ethBalance = BigNumber(res)
        .dividedBy(div)
        .toNumber();
    });
    this.rpc.getTokenBalance(this.accountInfo.account).then(function(res) {
      foo.accountInfo.tokenBalance = BigNumber(res)
        .dividedBy(div)
        .toNumber();
      if (foo.accountInfo.tokenBalance > 0) {
        foo.canBondShow = true;
      }
    });
  }

  getDelegatorInfo() {
    var foo = this;
    this.rpc.getDelegator(this.accountInfo.account).then(function(res) {
      foo.bondInfo.allowance = BigNumber(res.allowance)
        .dividedBy(div)
        .toNumber();
      if (foo.bondInfo.allowance <= 0) {
        foo.bondError1 = true;
      } else {
        foo.bondError1 = false;
      }
      foo.bondInfo.delegatorStatus = res.status;
      foo.bondInfo.bondedAmount = BigNumber(res.bondedAmount)
        .dividedBy(div)
        .toNumber();
      if (foo.bondInfo.bondedAmount > 0) {
        foo.canUnbondShow = true;
      } else {
        foo.canUnbondShow = false;
      }
      foo.bondInfo.lastClaimedRound = res.lastClaimRound;
      foo.bondInfo.delegatedAddress = res.delegateAddress;
      let pendingStake = BigNumber(res.pendingStake)
        .dividedBy(div)
        .toNumber();
      foo.bondInfo.unclaimedToken = pendingStake - foo.bondInfo.bondedAmount;
      // console.log("PS: ", res.pendingStake);
      if (foo.bondInfo.unclaimedToken < 0) foo.bondInfo.unclaimedToken = 0;
      foo.bondInfo.unclaimedFees = BigNumber(res.pendingFees)
        .dividedBy(div)
        .toNumber();
    });
  }

  getRoundInfo() {
    var foo = this;
    this.rpc.getCurrentRoundInfo().then(function(res1) {
      if (foo.roundInfo.currentRound !== res1.id) foo.getDelegatorInfo();
      foo.roundInfo.currentRound = res1.id;
      foo.roundInfo.roundStatus = res1.initialized
        ? "Initialized"
        : "Not Initialized";
      if (res1.initialized == "Not Initialized") {
        foo.bondError1 = true;
        foo.unBondError1 = true;
      } else {
        foo.bondError1 = false;
        foo.unBondError1 = false;
      }
      foo.rpc.getBlock("latest").then(function(res2) {
        foo.roundInfo.blockCount =
          res1.length - (res2.number - res1.startBlock);
      });
    });
  }

  fetchTranscoders() {
    var foo = this;
    this.rpc.getTranscoders().then(function(res) {
      // let transcoders = [];
      // for (let t of res) transcoders.push(t.address);
      // foo.transcoders = transcoders;
      // foo.transcoderInfo.transcoder = foo.transcoders[0];
      foo.getTranscodersInfo(res);
    });
  }

  // getTranscoderInfo(_res) {

  //   var foo = this;
  //   // this.rpc.getTranscoder(this.transcoderInfo.transcoder).then(function(res) {
  //     foo.transcoderInfo.transcoder = _res.transcoder;
  //     foo.transcoderInfo.feeShare = _res.feeShare / 10000 + "%";
  //     foo.transcoderInfo.rewardCut = _res.rewardCut / 10000 + "%";
  //     foo.transcoderInfo.totalStake =
  //       BigNumber(_res.totalStake)
  //         .dividedBy(div)
  //         .toJSON() + " LPT";
  //   // });
  // }

  getTranscodersInfo(_transocders) {
    var foo = this;
    foo.transcodersInfo = [];
    foo.notificationManagerService.showNotification(
      new MessageModel(MessageType.Info, "Loading Orchestrators' Information"),
      MessageContentType.Text
    );
    _transocders.forEach(_transcoder => {
      foo.rpc.getTranscoder(_transcoder.address).then(function(res) {
        foo.transcodersInfo.push({
          transcoder: _transcoder.address,
          feeShare: res.feeShare / 10000 + "%",
          rewardCut: 100 - res.rewardCut / 10000 + "%",
          totalStake: BigNumber(res.totalStake)
            .dividedBy(div)
            .toJSON()
        });
        // foo.transcoderInfo = foo.transcodersInfo[0];
        foo.setPages();
      });
    });
  }

  async fetchUnbondingTransactions() {
    var foo = this;
    this.rpc
      .getDelegatorUnbondingLocks(this.accountInfo.account)
      .then(function(res) {
        let txns = [];
        for (let t of res) {
          if (t.amount == 0) continue;
          let id = t.id,
            amount = BigNumber(t.amount)
              .dividedBy(div)
              .toJSON(),
            round = t.withdrawRound - 1;
          txns.push({ id: id, amount: amount, round: round });
        }
        foo.unbondingTxns = txns;
      });
  }

  initializeRound() {
    if (this.roundInfo.roundStatus === "Initialized") {
      this.notificationManagerService.showNotification(
        new MessageModel(MessageType.Error, "Round Already Initialized!"),
        MessageContentType.Text
      );
      return;
    }
    this.notificationManagerService.showNotification(
      new MessageModel(MessageType.Info, "Initializing Round"),
      MessageContentType.Text
    );
    var foo = this;
    this.RoundManager.initializeRound((err, res1) => {
      if(err) {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Error,
            err
          ),
          MessageContentType.Text
        );
        return;
      }
      else {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted to blockchain"
          ),
          MessageContentType.Text
        );
        var interval = setInterval(function() {
          foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
            if (res2) {
              if (res2.status === "0x1") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Info,
                    "Transaction complete! Refreshing status"
                  ),
                  MessageContentType.Text
                );
                foo.refreshAccountStatus();
              } else if (res2.status === "0x0") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Error,
                    "Error initializing round;Transaction failed"
                  ),
                  MessageContentType.Text
                );
                console.log(err);
              }
              clearInterval(interval);
            }
          });
        }, 3000);
      }
    });
  }

  setAllowance() {
    if (this.newAllowance === undefined || this.newAllowance === "") return;
    this.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Setting New Allowance " + this.newAllowance + " LPT"
      ),
      MessageContentType.Text
    );
    const newAllowance = BigNumber(this.newAllowance)
      .multipliedBy(div)
      .toJSON();
    var foo = this;
    this.LivepeerToken.approve(
      this.managerProxyAddress,
      newAllowance,
      { gas: 300000 },
      (err, res1) => {
        if(err) {
          foo.notificationManagerService.showNotification(
            new MessageModel(
              MessageType.Error,
              err
            ),
            MessageContentType.Text
          );
          return;
        } 
        else {
          foo.notificationManagerService.showNotification(
            new MessageModel(
              MessageType.Info,
              "Transaction submitted to blockchain"
            ),
            MessageContentType.Text
          );
          var interval = setInterval(function() {
            foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
              if (res2) {
                if (res2.status === "0x1") {
                  foo.notificationManagerService.showNotification(
                    new MessageModel(
                      MessageType.Info,
                      "Transaction complete! Refreshing status"
                    ),
                    MessageContentType.Text
                  );
                  foo.refreshAccountStatus();
                } else if (res2.status === "0x0") {
                  foo.notificationManagerService.showNotification(
                    new MessageModel(
                      MessageType.Error,
                      "Error setting allowance limit; Transaction failed."
                    ),
                    MessageContentType.Text
                  );
                  console.log(err);
                }
                clearInterval(interval);
              }
            });
          }, 3000);
        }
      }
    );
  }

  claimEarnings() {
    if (this.roundInfo.roundStatus !== "Initialized") {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Initialize Round first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (
      this.bondInfo.lastClaimedRound === this.roundInfo.currentRound ||
      this.bondInfo.unclaimedToken === 0
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Already claimed upto current round"
        ),
        MessageContentType.Text
      );
      return;
    }
    const currRound = parseInt(this.roundInfo.currentRound, 10);
    const lastClaimedRound = parseInt(this.bondInfo.lastClaimedRound, 10);
    const round =
      currRound < lastClaimedRound + 100 ? currRound : lastClaimedRound + 100;
    this.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Claiming Earnings Till Round " + round
      ),
      MessageContentType.Text
    );
    var foo = this;
    //setting high gas limit to avoid 'Out of Gas' error while contract execution (which eats up users' gas fees).
    //The consumed gas varies from 100,000 to 700,000. No wonder it could shoot to 7,000,000
    this.BondingManager.claimEarnings(round, { gas: 9000000 }, (err, res1) => {
      console.log("ERRRR", err);
      if(err) {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Error,
            err
          ),
          MessageContentType.Text
        );
        return;
      }
       else {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted to blockchain"
          ),
          MessageContentType.Text
        );
        var interval = setInterval(function() {
          foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
            if (res2) {
              if (res2.status === "0x1") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Info,
                    "Transaction complete! Refreshing status"
                  ),
                  MessageContentType.Text
                );
                foo.refreshAccountStatus();
              } else if (res2.status === "0x0") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Error,
                    "Error claiming earnings. Transaction failed!"
                  ),
                  MessageContentType.Text
                );
                console.log(err);
              }
              clearInterval(interval);
            }
          });
        }, 3000);
      }
    });
  }

  bondToken() {
    var foo = this;
    if (!this.canBondShow) return;
    if (
      this.transcoderInfo.transcoder === "" ||
      this.transcoderInfo.transcoder === undefined
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(MessageType.Error, "Select Transcoder First"),
        MessageContentType.Text
      );
      return;
    }
    if (this.newBondAmount === "" || this.newBondAmount === undefined) {
      this.notificationManagerService.showNotification(
        new MessageModel(MessageType.Error, "Enter Bond Amount"),
        MessageContentType.Text
      );
      return;
    }
    if (this.roundInfo.roundStatus !== "Initialized") {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Initialize Round first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (
      this.bondInfo.delegatorStatus === "Bonded" &&
      this.roundInfo.currentRound - this.bondInfo.lastClaimedRound >= 100
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Please Claim Earning first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (
      BigNumber(this.accountInfo.tokenBalance).isLessThan(
        BigNumber(this.newBondAmount)
      )
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "You don't have this much LPT to bond"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (
      BigNumber(this.bondInfo.allowance).isLessThan(
        BigNumber(this.newBondAmount)
      )
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "You can't bond beyond your allowance. Please update your allowance first"
        ),
        MessageContentType.Text
      );
      return;
    }
    let _transcoder: string = this.transcoderInfo.transcoder;
    _transcoder = _transcoder.substring(0, 20) + "...";
    this.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Bonding " +
          this.newBondAmount +
          " LPT towards the Transcoder : " +
          _transcoder
      ),
      MessageContentType.Text
    );
    const bondAmount = BigNumber(this.newBondAmount)
      .multipliedBy(div)
      .toJSON();
    const address = this.transcoderInfo.transcoder;
    foo.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "You'll see your earnings in the 'Claim Earnings' section, which will update in every round (i.e. approx. 24 hours)."
      ),
      MessageContentType.Text
    );
    foo.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "And do not forget to claim your earnings, to be able to withdraw them into your wallet. You can claim earnings of a maximum of 100 rounds together."
      ),
      MessageContentType.Text
    );
    this.BondingManager.bond(bondAmount, address, (err, res1) => {
      if(err) {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Error,
            err
          ),
          MessageContentType.Text
        );
        return;
      }
      else {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted to blockchain"
          ),
          MessageContentType.Text
        );
        var interval = setInterval(function() {
          foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
            if (res2) {
              clearInterval(interval);
              if (res2.status === "0x1") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Info,
                    "Transaction complete! Refreshing status"
                  ),
                  MessageContentType.Text
                );
                foo.refreshAccountStatus();
              } else if (res2.status === "0x0") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Error,
                    "Error bonding token; Transaction failed."
                  ),
                  MessageContentType.Text
                );
                console.log(err);
              }
            }
          });
        }, 3000);
      }
    });
  }

  unbondToken() {
    if (this.unbondAmount === "" || this.unbondAmount === undefined) return;
    if (this.roundInfo.roundStatus !== "Initialized") {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Initialize Round first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (BigNumber(this.bondInfo.unclaimedToken) == 0) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Unbonding is only allowed once per round (i.e. approx. 24 hours), for some NON-ZERO earnings"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (
      BigNumber(this.bondInfo.bondedAmount).isLessThan(
        BigNumber(this.unbondAmount)
      )
    ) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "You can't unbond more than you bonded"
        ),
        MessageContentType.Text
      );
      return;
    }
    if (this.roundInfo.currentRound - this.bondInfo.lastClaimedRound >= 100) {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Please Claim Earning first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    this.notificationManagerService.showNotification(
      new MessageModel(
        MessageType.Info,
        "Unbonding " + this.unbondAmount + " LPT"
      ),
      MessageContentType.Text
    );
    const unbondAmount = BigNumber(this.unbondAmount)
      .multipliedBy(div)
      .toJSON();
    var foo = this;
    this.BondingManager.unbond(unbondAmount, (err, res1) => {
      if(err) {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Error,
            err
          ),
          MessageContentType.Text
        );
        return;
      } 
      else {
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Transaction submitted to blockchain"
          ),
          MessageContentType.Text
        );
        var interval = setInterval(function() {
          foo.web3Instance.eth.getTransactionReceipt(res1, (err, res2) => {
            if (res2) {
              if (res2.status === "0x1") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Info,
                    "Transaction complete! Refreshing status"
                  ),
                  MessageContentType.Text
                );
                foo.refreshAccountStatus();
              } else if (res2.status === "0x0") {
                foo.notificationManagerService.showNotification(
                  new MessageModel(
                    MessageType.Error,
                    "Error unbonding token; Transaction failed."
                  ),
                  MessageContentType.Text
                );
                console.log(err);
              }
              clearInterval(interval);
            }
          });
        }, 3000);
      }
    });
  }

  withdrawStake(unbondingId) {
    if (this.roundInfo.roundStatus !== "Initialized") {
      this.notificationManagerService.showNotification(
        new MessageModel(
          MessageType.Error,
          "Initialize Round first to continue"
        ),
        MessageContentType.Text
      );
      return;
    }
    var foo = this;
    this.rpc
      .getDelegatorUnbondingLock(this.accountInfo.account, unbondingId)
      .then(function(lock) {
        if (lock.amount === 0) {
          foo.notificationManagerService.showNotification(
            new MessageModel(MessageType.Error, "Already withdrawn"),
            MessageContentType.Text
          );
          return;
        }
        if (lock.withdrawRound > foo.roundInfo.currentRound) {
          foo.notificationManagerService.showNotification(
            new MessageModel(
              MessageType.Error,
              "You can withdraw after Round " + (lock.withdrawRound - 1)
            ),
            MessageContentType.Text
          );
          return;
        }
        foo.notificationManagerService.showNotification(
          new MessageModel(
            MessageType.Info,
            "Withdrawing Stake with Id = " + unbondingId
          ),
          MessageContentType.Text
        );
        foo.BondingManager.withdrawStake(
          unbondingId,
          { gas: 300000 },
          (err, res1) => {
            if(err) {
              foo.notificationManagerService.showNotification(
                new MessageModel(
                  MessageType.Error,
                  err
                ),
                MessageContentType.Text
              );
              return;
            } 
            else {
              foo.notificationManagerService.showNotification(
                new MessageModel(
                  MessageType.Info,
                  "Transaction submitted to blockchain"
                ),
                MessageContentType.Text
              );
              var interval = setInterval(function() {
                foo.web3Instance.eth.getTransactionReceipt(
                  res1,
                  (err, res2) => {
                    if (res2) {
                      if (res2.status === "0x1") {
                        foo.notificationManagerService.showNotification(
                          new MessageModel(
                            MessageType.Info,
                            "Transaction complete! Refreshing status"
                          ),
                          MessageContentType.Text
                        );
                        foo.refreshAccountStatus();
                      } else if (res2.status === "0x0") {
                        foo.notificationManagerService.showNotification(
                          new MessageModel(
                            MessageType.Error,
                            "Error withdrawing stake; Transaction failed."
                          ),
                          MessageContentType.Text
                        );
                        console.log(err);
                      }
                      clearInterval(interval);
                    }
                  }
                );
              }, 3000);
            }
          }
        );
      });
  }

  setAllowanceAmount(e) {
    this.newAllowance = e.target.value.trim();
  }

  setBondAmount(e) {
    this.newBondAmount = e.target.value.trim();
    if (
      BigNumber(this.accountInfo.tokenBalance).isLessThan(
        BigNumber(this.newBondAmount)
      ) ||
      BigNumber(this.bondInfo.allowance).isLessThan(
        BigNumber(this.newBondAmount)
      )
    ) {
      this.bondError2 = true;
    } else {
      this.bondError2 = false;
    }
  }

  setDelegatedAddress(_transcoder) {
    this.transcoderInfo = _transcoder;
    // this.transcoderInfo.feeShare = this.transcoderInfo.rewardCut = this.transcoderInfo.totalStake =
    //   "Fetching...";
  }

  setUnbondAmount(e) {
    this.unbondAmount = e.target.value.trim();

    if (
      BigNumber(this.bondInfo.bondedAmount).isLessThan(
        BigNumber(this.unbondAmount)
      )
    ) {
      this.unBondError2 = true;
    } else {
      this.unBondError2 = false;
    }
  }

  setPages() {
    let foo = this;
    foo.txPages = [];
    if (foo.transcodersInfo.length > 0 && foo.transcodersInfo.length < 5) {
      foo.txPages.push(1);
      foo.tot++;
    }
    let looplen0 = foo.transcodersInfo.length / 5 + "";
    let looplen = Number(looplen0.split(".")[0]);
    for (let i = 1; i <= looplen; i++) {
      foo.txPages.push(i);
      foo.tot++;
    }
    // console.log("foo.txPages ",foo.txPages)
  }

  modal() {
    this.insatantBuyModal = true;
    // this.bestrate = true;
    this.traderate = true;
    this.setApiHistory();
  }

  closeInstantbuyModal() {
    this.insatantBuyModal = false;
    this.traderate = true;
    this.bestrate = false;
    this.lptquantity = 0;
  }

  checktraderate() {
    this.traderate = false;
    this.bestrate = true;
  }

  buyLpt() {
    let meta = this;
    meta.prepTradeWithUniswap();
  }

  prepTradeWithUniswap() {
    var foo = this;
    let sell_value =
      "0x" +
      BigNumber(foo.etherToBuyToken)
        .multipliedBy(base.pow(tokensData.ethereumTokens["ETH"].decimals))
        .toString(16);
    let buy_value =
      "0x" +
      BigNumber(foo.lptquantity)
        .multipliedBy(base.pow(tokensData.ethereumTokens["LPT"].decimals))
        .toString(16);
    // foo.buy_token.trade_data = [];
    foo.uniswapService
      .confirmEthToToken(
        buy_value,
        sell_value,
        foo.demo.uniswap_exchange_artifact
      )
      .then(function(res) {
        // foo.buy_token.trade_data.push(res);
        // foo.numTradesPrepared++;
        foo.confirmUniswap(res);
        // console.log("uni res",res)
        // foo.txParams = res;
      });
  }

  confirmUniswap(_txParams) {
    var foo = this;
    foo.displayGif = "block";
    var privateKey = foo.selectedWallet.getPrivateKeyHex();
    privateKey = Buffer.from(privateKey.substr(2), "hex");
    var transaction;
    foo.web3Instance.eth.getTransactionCount(
      _txParams["from"],
      (nonceErr, nonce) => {
        if (nonce) {
          transaction = {
            from: _txParams["from"],
            to: _txParams["to"],
            data: _txParams["data"],
            value: _txParams["value"],
            gasPrice: _txParams["gasPrice"],
            gasLimit: _txParams["gasLimit"],
            nonce: nonce
          };
          console.log("transaction ", transaction);
          const tx = new Tx(transaction);
          tx.sign(privateKey);
          const serializedTx = tx.serialize();
          foo.web3Instance.eth.sendRawTransaction(
            "0x" + serializedTx.toString("hex"),
            (err, txHash) => {
              console.log("txHash is", txHash);
              console.log("err is", err);
              if (err) {
                foo.closeInstantbuyModal();
                foo.displayGif = "none";
                foo.notificationManagerService.showNotification(
                  new MessageModel(MessageType.Error, "Transaction Not Send"),
                  MessageContentType.Text
                );
              } else {
                var interval = setInterval(function() {
                  foo.web3Instance.eth.getTransactionReceipt(
                    txHash,
                    (TxReceiptErr, res2) => {
                      if (res2) {
                        foo.closeInstantbuyModal();
                        foo.displayGif = "none";
                        clearInterval(interval);
                        foo.refreshAccountStatus();
                        if (res2.status === "0x1") {
                          foo.notificationManagerService.showNotification(
                            new MessageModel(
                              MessageType.Info,
                              "Transaction complete! Refreshing status"
                            ),
                            MessageContentType.Text
                          );
                        } else if (res2.status === "0x0") {
                          foo.notificationManagerService.showNotification(
                            new MessageModel(
                              MessageType.Error,
                              "Error LPT buying; Transaction Error"
                            ),
                            MessageContentType.Text
                          );
                        }
                      }
                    }
                  );
                }, 10000);
              }
            }
          );
        } else {
          foo.closeInstantbuyModal();
          foo.displayGif = "none";
          foo.notificationManagerService.showNotification(
            new MessageModel(MessageType.Error, nonceErr),
            MessageContentType.Text
          );
        }
      }
    );
  }
  // Check tokens received on Uniswap
  checkUniswap() // : number,
  {
    //console.log('checkuniswap',sell_token_address,sell_value,buy_token_address,index);
    var foo = this;
    if (!(foo.lptquantity > 0)) {
      return;
    }
    foo.checktraderate();
    let buy_token_address: string = tokensData.ethereumTokens["LPT"].address;
    let sell_value: number = foo.lptquantity; //have to calculate sell value
    let decimals = tokensData.ethereumTokens["LPT"].decimals;
    let new_sell_value =
      "0x" +
      BigNumber(sell_value)
        .multipliedBy(base.pow(decimals))
        .toString(16);
    foo.demo.uniswap_exchange_artifact = new ExchangeArtifact();
    // foo.sell_token.uniswap_exchange_artifact = new ExchangeArtifact();
    foo.demo.uniswap_exchange_artifact.contractAbi =
      ExchangeArtifact.contractAbi;
    // foo.sell_token.uniswap_exchange_artifact.contractAbi =
    //   ExchangeArtifact.contractAbi;
    //console.log('checkuiswap1',foo.demo[index].uniswap_exchange_artifact,foo.sell_token.uniswap_exchange_artifact,foo.demo[index].uniswap_exchange_artifact.contractAbi,foo.sell_token.uniswap_exchange_artifact.contractAbi);

    // If ETH is sold to buy ERC20 tokens
    // if (sell_token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    foo.uniswapService
      .getExchangeAddress(buy_token_address)
      .then(function(res) {
        // console.log("uni1", res, foo.sell_token, new_sell_value);
        // foo.demo[index].uniswapcount = 1;
        foo.demo.uniswap_exchange_artifact.contractAddress = res;
        if (res + "" === "0x") {
          console.log("no exchange exists on Uniswap!");
          // foo.uniswapCheckFail("no exchange exists on Uniswap!", index);
          // foo.counter += 3;
          return;
        }
        foo.uniswapService
          .tokenToEthValue(foo.demo.uniswap_exchange_artifact, new_sell_value)
          .then(function(res) {
            console.log("final result ", res);
            // alert(res.toString())
            // foo.counter += 3;
            // foo.demo[index].

            // ether received for x lpt

            foo.etherToBuyToken = parseFloat(
              BigNumber(res)
                .dividedBy(base.pow(decimals))
                .dividedBy(0.99)
                .toFixed(6)
            );
            console.log(
              "ether needed for " +
                sell_value +
                "(" +
                new_sell_value +
                ") token is " +
                foo.etherToBuyToken
            );

            //(((BigNumbers(res)).dividedBy(base.pow(foo.sell_token.decimals))).dividedBy(0.99)).toJSON();
            // foo.numTokensCheckedUniswap++;
          });
      });
    // }
  }

  setApiHistory() {
    let foo = this;
    foo.chartService.getUSDETHWAND("LPT", (err, result) => {
      if (result) {
        foo.apiHistBuy = result["ETH"];
      } else {
        console.log("error is ", err);
      }
    });
  }
}