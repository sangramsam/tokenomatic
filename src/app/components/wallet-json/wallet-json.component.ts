import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SavedWalletsService } from '../../services/saved-wallets.service'
import { NotificationManagerService } from '../../services/notification-manager.service';
import { MessageContentType, MessageModel, MessageType } from '../../models/message.model';
var toBuffer = require('typedarray-to-buffer');

@Component({
  selector: 'wallet-json',
  templateUrl: './wallet-json.component.html',
  styleUrls: ['./wallet-json.component.css']
})


export class WalletJsonComponent implements OnInit {

  jsonForm: FormGroup;
  filename: string = '';
  public newWalletInfo: any;
  public showSpinner = false;
  public walletError: any;
  public selectedFile: any;
  public jsonfile
  public data
  public password
  public encode;
  public wallet;
  public key;
  @Input() walletBaseCurrency: string = ''
  @Input() redirectToInfo;
  // files: UploadFile[] = [];

  constructor(
    private notificationManagerService: NotificationManagerService,
    private savedWalletsService: SavedWalletsService,
    private fb: FormBuilder,
    private zone: NgZone
  ) {
    this.createForm = this.createForm.bind(this);
    this.onSubmitAddFromJSON = this.onSubmitAddFromJSON.bind(this);
    this.onJSONFileChanged = this.onJSONFileChanged.bind(this);
  }

  ngOnInit() {
    this.createForm();
  }

  onJSONFileChanged(event) {
    if (this.walletBaseCurrency == 'eth' || this.walletBaseCurrency == 'neo' || this.walletBaseCurrency == 'wan') {
      let reader = new FileReader();
      if (event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        reader.readAsText(file);
        reader.onload = () => {
          this.filename = file.name;
          this.jsonForm.patchValue({
            jsonfile: reader.result
          });
          try {
            JSON.parse(reader.result);
          } catch (e) {
            this.jsonForm.get('jsonfile').markAsDirty();
            this.jsonForm.get('jsonfile').setErrors({
              'invalidJson': true
            });
          }
        };
      }

    } else if (this.walletBaseCurrency == 'aion') {
      let i = this;
      this.selectedFile = event.target.files[0];
      let fr = new FileReader();
      fr.readAsArrayBuffer(this.selectedFile);
      fr.onload = function (A) {
        let text = fr.result
        console.log(text)
        console.log(typeof (text));
        var array = new Uint8Array(text);
        var a = toBuffer(array);
        i.keystore(a)
      }
      console.log("this.selectedfile", this.selectedFile)
    }

  }
  createForm() {
    this.jsonForm = this.fb.group({
      password: ['', Validators.required],
      jsonfile: ['', Validators.required],
      walletName: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  onSubmitAddFromJSON() {
    if (this.walletBaseCurrency == 'eth' || this.walletBaseCurrency == 'neo' || this.walletBaseCurrency == 'wan' || this.walletBaseCurrency == 'aion' || this.walletBaseCurrency == 'tezos') {
      const formStatus = this.jsonForm.status;
      this.walletError = ''
      if (formStatus == 'INVALID') {
        this.jsonForm.get('jsonfile').markAsDirty();
        this.jsonForm.get('password').markAsDirty();
        this.jsonForm.get('walletName').markAsDirty();
        this.jsonForm.get('confirmPassword').markAsDirty();
        return;
      }
      let walletName = this.jsonForm.get('walletName').value
      this.jsonfile = this.jsonForm.get('jsonfile').value
      this.password = this.jsonForm.get('password').value
      var password = this.jsonForm.get('password').value
      let confirmPassword = this.jsonForm.get('confirmPassword').value;
      if (this.password !== confirmPassword) {
        this.jsonForm.get('confirmPassword').setErrors({
          'notmatch': true
        });
        return;
      }
      if (this.savedWalletsService.hasWalletWithName(walletName, this.walletBaseCurrency)) {
        this.jsonForm.get('walletName').setErrors({
          'duplicate': true
        });
        return;
      }

      this.data = {
        walletName,
        password,
        type: 'json'
      }
    } else if (this.walletBaseCurrency == 'aion') {
      let walletName = this.jsonForm.get('walletName').value
      let password = this.jsonForm.get('password').value
      let confirmPassword = this.jsonForm.get('confirmPassword').value;
      this.key = this.savedWalletsService.keystoreconvert(this.encode, password, true);
      if (password !== confirmPassword) {
        this.jsonForm.get('confirmPassword').setErrors({
          'notmatch': true
        });
        return;
      }
      if (this.savedWalletsService.hasWalletWithName(walletName, this.walletBaseCurrency)) {
        this.jsonForm.get('walletName').setErrors({
          'duplicate': true
        });
        return;
      }
      var encode = this.encode
      var key = this.key
      this.data = {
        walletName,
        password,
        type: 'json'
      }
      this.wallet = {
        key,
        encode
      }
    }

    this.zone.run(() => {
      this.showSpinner = true;
    })
    setTimeout(() => {
      var { error, wallet } = this.savedWalletsService.createWalletWithJSON(this.jsonfile, password, this.walletBaseCurrency);
      if (error) {
        this.zone.run(() => {
          this.showSpinner = false;
        })
        this.walletError = error
        return;
      }

      var obj;
      if (this.walletBaseCurrency == 'eth') {
        obj = this.savedWalletsService.addNewEthWallet(this.data, wallet)
      } else if (this.walletBaseCurrency == 'neo') {
        obj = this.savedWalletsService.addNewNeoWallet(this.data, wallet)
      } else if (this.walletBaseCurrency == 'wan') {
        obj = this.savedWalletsService.addNewWanWallet(this.data, wallet)
      } else if (this.walletBaseCurrency == 'aion') {
        obj = this.savedWalletsService.addNewAionWallet(this.data, this.wallet)
      }
      else if (this.walletBaseCurrency == 'tezos') {
        obj = this.savedWalletsService.addNewTezosWallet(this.data, this.wallet)
      }
      this.zone.run(() => {
        this.showSpinner = false;
      })
      if (obj.error) {
        this.walletError = obj.error
        return;
      }
      this.jsonForm.reset()
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Wallet Created successfully'), MessageContentType.Text);
      this.redirectToInfo()
    }, 10)
  }
  keystore(a) {
    this.encode = a;
    console.log("Encoded", this.encode)
  }
}
