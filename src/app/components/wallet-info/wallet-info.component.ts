import { Component, OnInit, Input, SimpleChanges, SimpleChange, NgZone } from '@angular/core';
import * as ethUtil from 'ethereumjs-util';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { Constants } from '../../models/constants';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';


const electron = window.require('electron');
var shell = window.require('electron').shell;
declare var window: any;

@Component({
  selector: 'wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.css']
})
export class WalletInfoComponent implements OnInit {

  public displayRequest = 'none';
  public displayWrongPassword = 'none';
  private activeRouteSub: any;
  public exchangeImg = '../../assets/images/eth.png';
  public wallets: Array<any> = [];
  public hdWallets: Array<any> = [];
  @Input() walletBaseCurrency: string;
  @Input() handleWalletDetail: any;
  @Input() handleWalletTokens: any;
  private selectedWallet;
  public password: any;
  public shell = shell;

  constructor(
    private savedWalletsService: SavedWalletsService,
    private ngZone: NgZone,
    private notificationsService: NotificationManagerService,
  ) {
    this.handleExchangeChange = this.handleExchangeChange.bind(this);
    this.getExchangeName = this.getExchangeName.bind(this);
    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      console.log(d)
      if (d == 'ready' || d == 'newWalletAdded') {
        this.handleExchangeChange();
      }
    });
  }

  handleWalletPassword() {
    if (this.walletBaseCurrency == 'eth') {
      this.password;
      if (this.selectedWallet.decrypt(this.password) === false) {
        this.displayWrongPassword = 'block';
      }
      else {
        this.handleWalletDetail(this.selectedWallet);
        this.password = '';
        this.displayRequest = 'none';
      }
    }
    else if (this.walletBaseCurrency == 'neo') {
      this.password;
      if (this.selectedWallet.decrypt(this.password) === false) {
        this.displayWrongPassword = 'block';
      }
      else {
        this.handleWalletDetail(this.selectedWallet);
        this.password = '';
        this.displayRequest = 'none';
      }
    } else if (this.walletBaseCurrency == 'wan') {
      this.password;
      if (this.selectedWallet.decrypt(this.password) === false) {
        this.displayWrongPassword = 'block';
      }
      else {
        this.handleWalletDetail(this.selectedWallet);
        this.password = '';
        this.displayRequest = 'none';
      }
    } else if (this.walletBaseCurrency == 'aion') {
      this.password;
      if (this.savedWalletsService.decrypt(this.selectedWallet.wallet, this.password, true) === false) {
        this.displayWrongPassword = 'block';
      }
      else {
        this.handleWalletDetail(this.selectedWallet);
        this.password = '';
        this.displayRequest = 'none';
      }
    } else if (this.walletBaseCurrency == 'tezos') {
      this.password;
      if (this.selectedWallet.decrypt(this.password) === false) {
        this.displayWrongPassword = 'block';
      }
      else {
        this.handleWalletDetail(this.selectedWallet);
        this.password = '';
        this.displayRequest = 'none';
      }
    } 

  }

  handleExchangeChange() {
    var wallets = [];
    var hdWallets = []
    if (this.walletBaseCurrency == 'eth') {
      this.exchangeImg = '../../assets/images/eth.png';
      wallets = this.savedWalletsService.getEthWallets().jsonWallets;
      // hdWallets = this.savedWalletsService.getEthWallets().hdWallets;
    } else if (this.walletBaseCurrency == 'neo') {
      this.exchangeImg = '../../assets/images/neo.png';
      wallets = this.savedWalletsService.getNeoWallets().jsonWallets;
      hdWallets = this.savedWalletsService.getNeoWallets().hdWallets;
    } else if (this.walletBaseCurrency == 'wan') {
      this.exchangeImg = '../../assets/images/wanchain.svg';
      wallets = this.savedWalletsService.getWanWallets().jsonWallets;
      hdWallets = this.savedWalletsService.getWanWallets().hdWallets;
    } else if (this.walletBaseCurrency == 'aion') {
      this.exchangeImg = '../../assets/images/aion.png';
      wallets = this.savedWalletsService.getAionWallets().jsonWallets;
      hdWallets = this.savedWalletsService.getAionWallets().hdWallets;
    } else if (this.walletBaseCurrency == 'tezos') {
      this.exchangeImg = '../../assets/images/tezos.png';
      wallets = this.savedWalletsService.getTezosWallets().jsonWallets;
    }
    this.ngZone.run(() => {
      this.wallets = wallets.reverse();
      this.hdWallets = hdWallets;
    });
  }
  hasLedgerSupport = () => {
    return this.walletBaseCurrency == 'eth' 
      || this.walletBaseCurrency == 'aion'
      || this.walletBaseCurrency == 'neo'
  }
  fetchHDWallets = () => {
    if (this.walletBaseCurrency == 'eth') {
      // this.savedWalletsService.getEthLedgerWallets()
      // .catch(err => {
      //   this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      // })
    } else if (this.walletBaseCurrency == 'neo') {
      this.savedWalletsService.getNeoLedgerWallets()
      .catch(err => {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      })
    } else if (this.walletBaseCurrency == 'wan') {
      // this.savedWalletsService.getEthWallets().jsonWallets;
    } else if (this.walletBaseCurrency == 'aion') {
      this.savedWalletsService.getAionLedgerWallets()
      .catch(err => {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      })
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.handleExchangeChange();
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  getExchangeName() {
    if (this.walletBaseCurrency == 'eth') {
      return 'Ethereum';
    }
    else if (this.walletBaseCurrency == 'neo') {
      return 'NEO';
    } else if (this.walletBaseCurrency == 'wan') {
      return 'Wanchain';
    }
    else if (this.walletBaseCurrency == 'aion') {
      return 'Aion';
    }
    else if (this.walletBaseCurrency == 'tezos') {
      return 'Tezos';
    }
  }

  requestForTheme(w) {
    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
      this.selectedWallet = w;
    } else {
      this.displayRequest = 'none';
      this.selectedWallet = null;
    }
  }

  delete(data)
  {
    console.log(data);
    this.savedWalletsService.deleteFile(data.filename);
  }
  getTokenDetailUrl(): string {
    return Constants.AddressAppnetURL;
  }
}
