import { Component, OnInit, Input, SimpleChanges, NgZone } from '@angular/core';
import { SavedWalletsService } from '../../services/saved-wallets.service'
import { MarketBroadcastService } from '../../services/market-broadcast.service'
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';

@Component({
  selector: 'exchange-wallet-select',
  templateUrl: './exchange-wallet-select.component.html',
  styleUrls: ['./exchange-wallet-select.component.css']
})
export class ExchangeWalletSelectComponent implements OnInit {

  public displayRequest = 'none';
  public displayWrongPassword = 'none';
  public wallets: Array<any> = []
  public hdWallets: Array<any> = []
  public selectedWallet: any = "";
  public password: any;
  public pSelectedWallet: any = "";
  private previousExchange: any;
  public selectedExchange: any = "";
  private savedWalletsServiceSub: any;
  private marketBroadcastServiceSub: any;
  public showFullScreen: boolean = true
  public passwordError: any = {}
  public showSpinner = false;
  @Input() exchangeName: any;
  @Input() walletAddress: any;
  @Input() successCallback: any;
  @Input() cancel: any;
  @Input() showCancel: any;
  public exchanges = [{
    name: 'ETH',
    _name: 'eth'
  }, {
    name: 'NEO',
    _name: 'neo'
  }, {
    name : 'WAN',
    _name : 'wan'
  }, {
    name : 'AION',
    _name : 'aion'
  }, {
    name : 'TEZOS',
    _name : 'tezos'
  }];
  constructor(
    private savedWalletsService: SavedWalletsService,
    private marketBroadcastService: MarketBroadcastService,
    private zone: NgZone,
    private notificationsService: NotificationManagerService,
  ) {
    this.useWalletFullscreen = this.useWalletFullscreen.bind(this)
    this.getWalletsForExchange = this.getWalletsForExchange.bind(this)
    this.getSelectedExchange = this.getSelectedExchange.bind(this)
    this.fetchHDWallets = this.fetchHDWallets.bind(this)
    this.success = this.success.bind(this)
  }
  ngOnDestroy() {
    if (this.savedWalletsServiceSub)
      this.savedWalletsServiceSub.unsubscribe()
    if (this.marketBroadcastServiceSub)
      this.marketBroadcastServiceSub.unsubscribe()
  }
  setSelectedExchange() {
    if (this.selectedExchange && this.selectedExchange == this.previousExchange)
      return;
    if (this.previousExchange)
      this.previousExchange.isSelected = false
    this.previousExchange = this.selectedExchange
    this.selectedExchange.isSelected = true
    // this.marketBroadcastService.resetAll()
    // this.marketBroadcastService.setSelectedExchange(this.selectedExchange._name)
    this.selectedWallet = ''
    //this.savedWalletsService.setCurrentWallet("")
    this.getWalletsForExchange()
    sessionStorage.setItem('exchange', this.selectedExchange._name)
    // sessionStorage.setItem('exchange1', this.password)
    // console.log("exchange1",sessionStorage.getItem('exchange1'))
    // console.log("exchange11",this.password)
  }
  getSelectedExchange() {
    return this.selectedExchange
  }
  fetchHDWallets = () => {
    if (!this.selectedExchange)
      return
    if (this.selectedExchange._name == 'eth') {
      // this.savedWalletsService.getEthLedgerWallets()
      // .catch(err => {
      //   this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      // })
    } else if (this.selectedExchange._name == 'neo') {
      this.savedWalletsService.getNeoLedgerWallets()
      .catch(err => {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      })
    } else if (this.selectedExchange._name == 'wan') {
      // this.savedWalletsService.getEthWallets().jsonWallets;
    } else if (this.selectedExchange._name == 'aion') {
      this.savedWalletsService.getAionLedgerWallets()
      .catch(err => {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, err.message), MessageContentType.Text);
      })
    }
  }
  getWalletsForExchange() {
    if (this.selectedExchange._name == 'eth') {
      this.wallets = this.savedWalletsService.getEthWallets().jsonWallets
      // this.hdWallets = this.savedWalletsService.getEthWallets().hdWallets
    }
    else if (this.selectedExchange._name == 'neo') {
      this.wallets = this.savedWalletsService.getNeoWallets().jsonWallets
      this.hdWallets = this.savedWalletsService.getNeoWallets().hdWallets
    }
    else if (this.selectedExchange._name == 'wan') {
      this.wallets = this.savedWalletsService.getWanWallets().jsonWallets
      this.hdWallets = this.savedWalletsService.getWanWallets().hdWallets
    }
    else if (this.selectedExchange._name == 'aion') {
      this.wallets = this.savedWalletsService.getAionWallets().jsonWallets
      this.hdWallets = this.savedWalletsService.getAionWallets().hdWallets
    }
    else if (this.selectedExchange._name == 'tezos') {
      this.wallets = this.savedWalletsService.getTezosWallets().jsonWallets
    }
  }
  updateCurrentWalletChanged() {
    var currentWallet = this.savedWalletsService.getCurrentWallet()
    this.selectedWallet = currentWallet
    if (!currentWallet)
      this.pSelectedWallet = ""
  }
  shouldDisableBtnFS() {
    return !this.selectedWallet || !this.selectedWallet.isDecrypted && !this.password
  }
  success() {
    var prevSelectedExchange = this.marketBroadcastService.getSelectedExchange()
    sessionStorage.setItem('walletAddress', this.selectedWallet.address)
    sessionStorage.setItem('exchange', this.selectedExchange._name)
    sessionStorage.setItem('exchange1', this.password)
    console.log("exchange1", sessionStorage.getItem('exchange1'))
    var a = this.password;
    console.log("nn a", a)
    sessionStorage.setItem('nn', a)
    console.log("nn a aftweer", sessionStorage.getItem('nn'))
    if (!prevSelectedExchange || prevSelectedExchange != this.selectedExchange._name) {
      this.marketBroadcastService.resetForExchangeChange()
      this.marketBroadcastService.setSelectedExchange(this.selectedExchange._name)
    }
    this.savedWalletsService.setCurrentWallet('')
    setTimeout(() => {
      this.savedWalletsService.setCurrentWallet(this.selectedWallet)
    }, 0)
    this.successCallback()
  }
  useWalletFullscreen() {
    this.passwordError = {}
    console.log("selectedWallet", this.selectedWallet)
    // console.log("data", this.selectedWallet.wallet.wallet.data);
    if (this.selectedWallet && this.selectedWallet.isDecrypted) {
      this.success()
      return
    }
    if (!this.password) {
      this.passwordError.required = true
      return;
    }
    this.zone.run(() => {
      this.showSpinner = true
    })
    setTimeout(() => {
      if (this.selectedExchange._name == 'eth' 
        || this.selectedExchange._name == 'neo'
        || this.selectedExchange._name == 'wan'
        || this.selectedExchange._name == 'aion'
        || this.selectedExchange._name == 'tezos') {
        if (this.selectedWallet.decrypt(this.password) === false) {
          this.zone.run(() => {
            this.showSpinner = false
          })
          this.passwordError.invalid = true
          return;
        }
        this.password = ''
        this.zone.run(() => {
          this.showSpinner = false
        })
        this.success()
      }
      else {
        if (this.savedWalletsService.decrypt(this.selectedWallet.wallet, this.password, true) === false) {
          this.zone.run(() => {
            this.showSpinner = false
          })
          this.passwordError.invalid = true
          return;
        }
        this.password = ''
        this.zone.run(() => {
          this.showSpinner = false
        })
        this.success()
      }
    }, 10)
    // do other things
  }
  ngOnInit() {
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if ((d == 'ready' || d == 'newWalletAdded') && this.selectedExchange) {
        this.getWalletsForExchange()
      }
    })
  }
  ngOnChanges(changes) {
    var walletAddress = changes.walletAddress.currentValue
    var exchangeName = changes.exchangeName.currentValue
    if (exchangeName) {
      var selectedExchange = this.exchanges.filter(a => {
        return exchangeName == a._name
      })[0]
      if (this.selectedExchange && this.selectedExchange._name !== selectedExchange._name) {
        this.selectedWallet = ""
      }
      this.selectedExchange = selectedExchange
      this.selectedExchange.isSelected = true;
      this.previousExchange = this.selectedExchange
      this.getWalletsForExchange()
    }

    if (walletAddress) {
      let allWallets = this.wallets.concat(this.hdWallets)
      var selectedWallet = allWallets.filter(a => {
        return a.getAddress() == walletAddress
      })[0]
      this.selectedWallet = selectedWallet
    } else {
      this.selectedWallet = ""
    }

  }
  onSelectChange() {
    if (this.pSelectedWallet && this.pSelectedWallet == this.selectedWallet) {
      return;
    }
    this.pSelectedWallet = this.selectedWallet
    // if (!this.selectedWallet.isDecrypted) {
    //    this.requestForTheme()
    //    return;
    //  }
    // this.savedWalletsService.setCurrentWallet(this.selectedWallet)
  }

  requestForTheme(w) {
    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
      this.selectedWallet = w;
    } else {
      if (!w) {
        this.savedWalletsService.setCurrentWallet("");
      }
      this.displayRequest = 'none';
      this.selectedWallet = "";
    }
  }

  handleWalletPassword() {
    this.password;
    if (this.selectedWallet.decrypt(this.password) === false) {
      this.displayWrongPassword = 'block';
    }
    else {
      // this.savedWalletsService.setCurrentWallet("");
      this.savedWalletsService.setCurrentWallet(this.selectedWallet)
      this.password = '';
      this.displayRequest = 'none';
    }
  }
  hasLedgerSupport = () => {
    return this.selectedExchange._name == 'eth' 
      || this.selectedExchange._name == 'aion'
      || this.selectedExchange._name == 'neo'
  }
  getButtonClass(isSelected, index) {
    if (isSelected) {
      return `selected button${index + 1}`
    }
    else {
      return `button${index + 1}`
    }
  }
}
