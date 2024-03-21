import { Component, OnInit, NgZone } from "@angular/core";
import { SavedWalletsService } from "../../services/saved-wallets.service";
import { MarketBroadcastService } from "../../services/market-broadcast.service";
import { JSONAionWallet, AionWalletHelper } from "../wallets/jsonwallet_aion";
import { Web3Service } from "../../services/web3.service";
import { AionWeb3Service } from "../../services/aion-web3.service";

@Component({
  selector: "exchange-wallet-select-inline",
  templateUrl: "./exchange-wallet-select-inline.component.html",
  styleUrls: ["./exchange-wallet-select-inline.component.css"]
})
export class ExchangeWalletSelectInlineComponent implements OnInit {
  public exchanges = [
    {
      name: "ETH",
      _name: "eth",
      isSelected: false
    },
    {
      name: "NEO",
      _name: "neo",
      isSelected: false
    },
    {
      name: "WAN",
      _name: "wan",
      isSelected: false
    },
    {
      name: "AION",
      _name: "aion",
      isSelected: false
    },
    {
      name: "TEZOS",
      _name: "tezos",
      isSelected: false
    }
  ];
  public displayPopup = false;
  public displayWrongPassword = "none";
  public wallets: Array<any> = [];
  public hdWallets: Array<any> = [];
  public selectedWallet: any = "";
  public password: any;
  public pSelectedWallet: any = "";
  private previousExchange: any;
  public selectedExchange: any = "";
  public showFullScreen: boolean = false;
  public passwordError: any = {};
  private savedWalletsServiceSub: any;
  private marketBroadcastServiceSub: any;
  public wallet: any;
  public exchange: any;
  aionWalletHelper: any;
  constructor(
    public aionWeb3Service: AionWeb3Service,
    private savedWalletsService: SavedWalletsService,
    private marketBroadcastService: MarketBroadcastService,
    private zone: NgZone,
    private web3service: Web3Service
  ) {
    this.cancelCallback = this.cancelCallback.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.initFromSession = this.initFromSession.bind(this);
    this.aionWalletHelper = new AionWalletHelper(this.aionWeb3Service);
  }
  handleSuccess() {
    this.displayPopup = false;
    this.showFullScreen = false;
    this.pSelectedWallet = this.selectedWallet;
  }
  cancelCallback() {
    this.displayPopup = false;
    this.selectedWallet = this.pSelectedWallet;
  }
  initFromSession() {
    var walletAddress = sessionStorage.getItem("walletAddress");

    if (walletAddress) {
      var selectedWallet = this.wallets.filter(a => {
        return a.address == walletAddress;
      })[0];
    }

    if (!this.selectedExchange || !selectedWallet) {
      this.zone.run(() => {
        this.showFullScreen = true;
      });
    }
    if (selectedWallet && !selectedWallet.isDecrypted) {
      this.wallet = selectedWallet.address;
      this.exchange = this.selectedExchange._name;
      this.zone.run(() => {
        this.showFullScreen = true;
      });
    }
    console.log(this.showFullScreen);
  }
  ngOnDestroy() {
    if (this.savedWalletsServiceSub) {
      this.savedWalletsServiceSub.unsubscribe();
    }
  }
  ngOnInit() {
    var exchange = sessionStorage.getItem("exchange");
    console.log("exchange", exchange);
    if (exchange) {
      var selectedExchange = this.exchanges.filter(a => {
        return exchange == a._name;
      })[0];
      this.selectedExchange = selectedExchange;
      this.selectedExchange.isSelected = true;
      this.previousExchange = this.selectedExchange;
    }
    if (!this.selectedExchange) {
      this.zone.run(() => {
        this.showFullScreen = true;
      });
    }
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        if ((d == "ready" || d == "newWalletAdded") && this.selectedExchange) {
          console.log("getWalletsForExchange");
          this.getWalletsForExchange(this.selectedExchange._name);
          this.initFromSession();
        }
        if (d == "currentWalletChanged" && this.selectedExchange) {
          this.getWalletsForExchange(this.selectedExchange._name);
          this.selectedWallet = this.savedWalletsService.getCurrentWallet();
        }
      }
    );
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(
      status => {
        if (status == "changed") {
          var selectedExchangeName = this.marketBroadcastService.getSelectedExchange();
          var selectedExchange = this.exchanges.filter(a => {
            return selectedExchangeName == a._name;
          })[0];
          if (this.selectedExchange) {
            this.selectedExchange.isSelected = false;
          }
          if (selectedExchange) selectedExchange.isSelected = true;
          this.selectedExchange = selectedExchange;
        }
      }
    );
  }
  getWalletsForExchange(name) {
    if (name == "eth") {
      this.wallets = this.savedWalletsService.getEthWallets().jsonWallets;
      // this.hdWallets = this.savedWalletsService.getEthWallets().hdWallets;
    } else if (name == "neo") {
      this.wallets = this.savedWalletsService.getNeoWallets().jsonWallets;
      this.hdWallets = this.savedWalletsService.getNeoWallets().hdWallets;
    } else if (name == "wan") {
      this.wallets = this.savedWalletsService.getWanWallets().jsonWallets;
      this.hdWallets = this.savedWalletsService.getWanWallets().hdWallets;
    } else if (name == "aion") {
      this.wallets = this.savedWalletsService.getAionWallets().jsonWallets;
      this.hdWallets = this.savedWalletsService.getAionWallets().hdWallets;
    } else if (name == "tezos") {
      this.wallets = this.savedWalletsService.getTezosWallets().jsonWallets;
    }
  }
  setExchangeAndWallet(wallet, exchange) {
    this.marketBroadcastService.setSelectedExchange(exchange._name);
    this.savedWalletsService.setCurrentWallet(wallet);
  }
  setSelectedExchange() {
    if (
      this.selectedExchange &&
      this.previousExchange &&
      this.selectedExchange._name != this.previousExchange._name
    ) {
      this.exchange = this.selectedExchange._name;
      this.wallet = "";
      this.displayPopup = true;
    }
    this.previousExchange = this.selectedExchange;
  }
  onSelectWallet() {
    if (this.selectedWallet) {
      this.displayPopup = true;
      this.wallet = this.selectedWallet.getAddress();
      this.exchange = this.selectedExchange._name;
      return;
    }
  }
}
