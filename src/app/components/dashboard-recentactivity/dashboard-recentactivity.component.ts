import { Component, OnInit, NgZone, Input } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { Headers, Http, RequestOptions } from "@angular/http";
import { Constants } from "../../models/constants";
import { TokenService } from '../../services/token.service';
import { Web3Service } from '../../services/web3.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'dashboard-recentactivity',
  templateUrl: './dashboard-recentactivity.component.html',
  styleUrls: ['./dashboard-recentactivity.component.css']
})
export class DashboardRecentactivityComponent implements OnInit {
  @Input() update: any;
  public activities: any = []
  public currentPage = 1
  public filter: '';
  currentWallet: any;
  public hasData: boolean = false
  public noDataForFilter: boolean = false;
  private _activities = [];
  public itemLists: any = [];
  savedWalletsServiceSub: any;
  constructor(
    private zone: NgZone,
    private dashboardService: DashboardService,
    private savedWalletsService: SavedWalletsService,
    private tokenService: TokenService,
    private http: Http,
    private userService: UserService,
    private web3: Web3Service,
  ) {
    this.dashboardService.serviceStatus$.subscribe(status => {
      console.log("getActivities", status)
      if (status == 'ready') {
        console.log("getActivities", status)
        let tokens = this.dashboardService.getTokens()
        try {
          let activities = this.getActivities(tokens)
          this.zone.run(() => {
            this.activities = activities
            this._activities = activities
            if (this._activities.length) {
              this.hasData = true;
              this.noDataForFilter = false
            }
          })
        } catch (err) {
          console.log(err)
        }
      }
    })
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        console.log('DashboardRecentactivityComponent', d)
        if (d == "currentWalletChanged") {
          // console.log('getCurrentWallet', this.savedWalletsService.getCurrentWallet())
          this.zone.run(() => {
            this.currentWallet = this.savedWalletsService.getCurrentWallet()
            this.guestLogin(null);
            setTimeout(() => {
              this.getPlatformTokens();
            }, 4000)

          })
        }
      }
    );
    console.log("update", this.update)
    if (this.update) {

    }

  }
  updateSearchItems = () => {
    let activities = this.itemLists;
    if (!activities || !activities.length)
      return;
    activities = activities.filter(item => item.symbol.toLowerCase().indexOf(this.filter.toLowerCase()) != -1)
    if (!activities.length)
      this.noDataForFilter = true
    this.itemLists = activities
  }
  getActivities(tokens) {
    let activities = []
    let filter = this.filter
    Object.keys(tokens).forEach(it => {
      let symbol = it.split(':')[0]
      let chain = it.split(':')[1] == 'NEO' ? 'assets/images/neo.png' : 'assets/images/eth.png'
      let data = {
        symbol,
        chain,
        lastPrice: 0,
        volume: 0,
        tokenName: tokens[it].name,
        usd: 0,
        change: 0,
        balance: 0,
      }
      if (tokens[it].usd) {
        let usd2 = tokens[it].usd[tokens[it].usd.length - 1]
        let usd1 = tokens[it].usd[tokens[it].usd.length - 2]
        data['change'] = (usd2.value - usd1.value) * 100 / usd1.value
        data['lastPrice'] = usd2.value
      }
      if (tokens[it].balances) {
        tokens[it].balances.forEach(jt => {
          let d = Object.assign({}, data)
          d['walletName'] = jt['walletName']
          d['balance'] = jt['balance']
          d['usd'] = jt['balance'] * data['lastPrice']
          activities.push(d)
        })
      }
    })
    activities.sort((a, b) => {
      return b['usd'] - a['usd']
    })
    activities = activities.filter(item => item.symbol.indexOf(filter))
    return activities
  }
  ngOnInit() {
    debugger;
    //console.log("this.web3.getWeb3().eth.coinbase", this.web3.getWeb3().eth.coinbase)
    // if (this.web3.getWeb3().eth.coinbase) {
    //   this.guestLogin(null);
    //   setTimeout(() => {
    //     this.getPlatformTokens();
    //   }, 4000)
    // }



  }

  // generateDate = () => {
  // 	let alphabets = 'abcdefghijklmnopqrstuvwxyz_123456789'
  // 	for(let i = 0; i < 100; i++) {
  // 		let symbol = Math.random()<0.5 ? 'NEO' : 'ETH'
  // 		let chain;
  // 		let tokenName;
  // 		if (symbol == 'NEO') {
  // 			chain = 'assets/images/neo.png'
  // 			tokenName = 'NEO'
  // 		} else {
  // 			chain = 'assets/images/eth.png'
  // 			tokenName = 'Ethereum'
  // 		}
  // 		let walletName = ''
  // 		for(let j = 0; j<7;j++) {
  // 			let index = Math.round(Math.random() * (alphabets.length - 1))
  // 			walletName += alphabets[index]
  // 		}
  // 		let balance = Math.random() * 100
  // 		let lastPrice = Math.random() * 1000
  // 		let volume = Math.random() * 10000
  // 		let usd = Math.random() * 300
  // 		let change = (Math.random()<0.5 ? -1 : 1) * Math.random() * 100
  // 		var data = {
  // 			chain,
  // 			walletName,
  // 			tokenName,
  // 			symbol,
  // 			balance,
  // 			lastPrice,
  // 			volume,
  // 			usd,
  // 			change
  // 		}
  // 		this.activities[i] = data
  // 	}
  // }
  guestLogin = (userAccount) => {
    console.log('Logging in as guest');
    var date = new Date();
    var date2 = new Date(date);
    date2.setHours(date.getHours() + 10);
    sessionStorage.setItem('expires_at', date2.getTime().toString());
    sessionStorage.setItem('email', 'guest@wandx.co');
    sessionStorage.setItem('name', 'guest');
    localStorage.removeItem('portfolio');
    localStorage.removeItem('buy');
    this.userService.registerUserUsingSession(userAccount);

  }
  getPlatformTokens() {
    console.log('getPlatformTokens')
    let headers = new Headers({
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey,
      Token: this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({ headers: headers });
    this.http
      .get(Constants.ServiceURL + "PlatformToken", requestOptions)
      .subscribe(data => {
        debugger

        var tokens = data.json();
        let itemLists = [];
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].symbol !== "WXETH" && tokens[i].symbol !== "DICE") { // && tokens[i].symbol !== "POWR"
            let tokenEth = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
            let toeknContract = tokenEth.at(tokens[i].address);
            let _data = tokens[i];
            toeknContract.balanceOf(
              this.web3.getWeb3().eth.coinbase,
              (err, res) => {
                if (res) {
                  this.zone.run(() => {
                    itemLists.push({
                      id: _data.symbol,
                      itemName: _data.symbol,
                      address: _data.address,
                      contract: tokenEth,
                      balance: new BigNumber(res)
                        .dividedBy(new BigNumber(10).pow(_data.decimals))
                        .toJSON(),
                      decimals: _data.decimals
                    });
                    this.itemLists = itemLists
                    //console.log("itemLists", itemLists)
                  });
                }
              }
            );
          }
        }
      });
  }
}
