import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { NeotokenService } from './neotoken.service';
import { NeoService } from './neo.service';
import { Web3Service } from './web3.service';
import { SavedWalletsService } from './saved-wallets.service';
import { Constants } from '../models/constants';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as abi from 'human-standard-token-abi';
import { PlatformTokenService } from './platform-token.service';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { PlatformToken } from "../models/platform-tokens";
import { mergeMap } from 'rxjs/operators';
import { from } from 'rxjs/observable/from';


@Injectable()
export class DashboardService {
  private neoTokens: any = [];
  private ethTokens: any = [];
  private tokens: any; /* price tracker for tokens. Should be a map */
  private tokenChainInfo = {}
  private savedWalletsServiceSub: any;
  private totalEthTokens = 0;
  private totalNeoTokens = 0;
  private totalEthWallets = 0;
  private totalNeoWallets = 0;
  private totalUsdUpdates = 0;
  private totalTokenBalUpdates = 0;
  private _serviceStatus: BehaviorSubject<string> = new BehaviorSubject<string>('initializing');
  private tokenSubscription: any;
  private authToken: any;
  private platformTokenSub2: any;
  private initializingCondition: any = {
    walletsReady: false,
    ethTokens: false
  }
  public serviceStatus$ = this._serviceStatus.asObservable()
  constructor(
    private http: Http,
    private neotokenService: NeotokenService,
    private neoService: NeoService,
    private web3Service: Web3Service,
    private savedWalletsService: SavedWalletsService,
    private platformTokenService: PlatformTokenService,
    private userService: UserService,
    private tokenService: TokenService,

  ) {
    this.getUSDValueForTokens = this.getUSDValueForTokens.bind(this)
    this.getChainTokens = this.getChainTokens.bind(this)
    this.initialize = this.initialize.bind(this)

    this.web3Service.initialize();
    this.getChainTokens()
    // Listen for savewallet events and then initialize the values
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      console.log('DashboardService', d)
      if (d == 'walletsReady' || d == 'newWalletAdded') {
        this.initializingCondition['walletsReady'] = true
        if (this.savedWalletsService.getEthWallets().jsonWallets.length) {
          let ethWallet = this.savedWalletsService.getEthWallets().jsonWallets[0]
          this.tokenService.stopTokenService();
          this.guestLogin(ethWallet.address);
          this.userService.userRegistrationStatus$.subscribe(data => {
            this.tokenService.fetchToken(ethWallet.address);
            if (this.tokenSubscription) {
              this.tokenSubscription.unsubscribe()
            }
            this.tokenSubscription = this.tokenService.token$.subscribe((token) => {
              if (token && this.authToken != token) {
                this.authToken = token;
                this.platformTokenService.getPlatformTokens();
                this.platformTokenSub2 = this.platformTokenService.platformTokens$.subscribe((ethTokens) => {
                  if (!ethTokens)
                    return;
                  let p = new PlatformToken()
                  p.name = 'Ethereum',
                    p.symbol = 'ETH',
                    p.address = '',
                    p.decimals = 18
                  let ethTokensCopy = ethTokens.slice()
                  ethTokensCopy.push(p)
                  this.ethTokens = ethTokensCopy
                  this.totalEthTokens = ethTokensCopy.length
                  this.initializingCondition['ethTokens'] = true

                  this.tokenSubscription.unsubscribe()
                  this.platformTokenSub2.unsubscribe()

                  //this.getUSDValueForTokens()
                  this.initialize()
                })
              }
            });
          });
        } else {
          this.ethTokens = [{
            name: 'ETH',
            fullName: 'ETH',
            symbol: 'ETH',
            balance: '',
            decimals: 8,
          }, {
            name: 'WAND',
            fullName: 'WAND',
            symbol: 'WAND',
            balance: '',
            decimals: 8,
          }]
          this.totalEthTokens = this.ethTokens.length
          //this.getUSDValueForTokens()
          this.initializingCondition['ethTokens'] = true
          this.initialize()
        }
      }
    })
  }
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
  getChainTokens() {
    let neoTokens = this.neotokenService.getNeonTokenList().slice()
    neoTokens = neoTokens.concat([{
      name: 'GAS',
      fullName: 'GAS',
      symbol: 'GAS',
      balance: '',
      decimals: 8,
    },
    {
      name: 'NEO',
      fullName: 'NEO',
      symbol: 'NEO',
      balance: '',
      decimals: 8,
    }])
    // let neoTokens = []
    this.neoTokens = neoTokens
    this.totalNeoTokens = neoTokens.length
  }
  getTokens() {
    return JSON.parse(JSON.stringify(this.tokens)) /* deep copy */
  }
  getUSDValueForTokens() {
    from(this.ethTokens)
      .pipe(mergeMap(it => this.getHistoDay(it['symbol'], it), 5))
      .subscribe(r => {
        let res = r['res']
        let symbolInfo = r['symbolInfo']
        if (res['Response'] == 'Success') {
          // clean the data for now
          let symbol = symbolInfo['symbol']
          let key = `${symbol}:ETH`
          if (!this.tokens[key]) {
            this.tokens[key] = {
              name: symbolInfo['name']
            }
          }
          this.tokens[key]['usd'] = res.Data.map((jt, j) => {
            let data = {
              date: new Date(Math.round(jt.time * 1000)),
              value: jt.close,
            }
            // Store the volume of the last day
            if (j == res.Data.length - 1) {
              data['volume'] = jt.volumeto
            }
            return data
          })
        }
        this.totalUsdUpdates += 1
        this.updateReadyState()
      })

    from(this.neoTokens)
      .pipe(mergeMap(it => this.getHistoDay(it['symbol'], it), 5))
      .subscribe(r => {
        let res = r['res']
        let symbolInfo = r['symbolInfo']
        if (res.Response == 'Success') {
          // clean the data for now
          let key = `${symbolInfo['symbol']}:NEO`
          if (!this.tokens[key]) {
            this.tokens[key] = {
              name: symbolInfo.name
            }
          }
          let dataLenght = res.Data.length
          this.tokens[key]['usd'] = res.Data.map((jt, j) => {
            let data = {
              date: new Date(Math.round(jt.time * 1000)),
              value: jt.close,
            }
            // Store the volume of the last day
            if (j == res.Data.length - 1) {
              data['volume'] = jt.volumeto
            }
            return data
          })
        }
        this.totalUsdUpdates += 1
        this.updateReadyState()
      })
  }
  updateReadyState() {
    if (this.totalUsdUpdates >= (this.totalEthTokens + this.totalNeoTokens)
      && this.totalTokenBalUpdates >= ((this.totalEthTokens * this.totalEthWallets) + (this.totalNeoTokens * this.totalNeoWallets))) {
      this._serviceStatus.next('ready')
    }
  }
  ready() {
    this.savedWalletsService.getWallet();
  }
  initialize() {
    if (!this.initializingCondition['walletsReady'] || !this.initializingCondition['ethTokens'])
      return;

    // initialize the token map for all tokens
    if (!this.tokens) {
      let tokenMap = {}
      this.neoTokens.forEach(jt => {
        tokenMap[`${jt.symbol}:NEO`] = {
          name: jt.name,
          balances: [],
          tokenBalance: 0,
        }
      })
      this.ethTokens.forEach(jt => {
        tokenMap[`${jt.symbol}:ETH`] = {
          name: jt.name,
          balances: [],
          tokenBalance: 0,
        }
      })
      this.tokens = tokenMap;
    }

    let ethWallets = this.savedWalletsService.getEthWallets().jsonWallets
    this.totalEthWallets = ethWallets.length
    let neoWallets = this.savedWalletsService.getNeoWallets().jsonWallets
    this.totalNeoWallets = neoWallets.length

    // Special case for eth.. create a common list for wallet and token
    let ethWalletTokenList = []
    ethWallets.forEach(it => {
      this.ethTokens.forEach(jt => {
        ethWalletTokenList.push({
          wallet: it,
          token: jt
        })
      })
    })

    from(ethWalletTokenList)
      .pipe(mergeMap(item => {
        return this.getBalanceFromETHChain(item.wallet, item.token)
      }, 5))
      .subscribe(r => {
        let token = r['token']
        let wallet = r['wallet']
        let balance = r['balance']
        let key = `${token['symbol']}:ETH`
        if (!this.tokens[key])
          this.tokens[key] = {
            name: token.name
          }
        if (!this.tokens[key]['balances'])
          this.tokens[key]['balances'] = []
        this.tokens[key]['balances'].push({
          walletName: wallet.walletName,
          walletAddress: wallet.address,
          balance
        })
        if (this.tokens[key]['tokenBalance'] === undefined)
          this.tokens[key]['tokenBalance'] = 0
        this.tokens[key]['tokenBalance'] += balance
        this.totalTokenBalUpdates += 1
        this.updateReadyState()
      })
    // ethWallets.forEach((it, i) => {
    //   this.ethTokens.forEach(jt => {
    //     this.getBalanceFromETHChain(it.address, {address : jt.address, decimals : jt.decimals, symbol : jt.symbol})
    //     .subscribe(balance => {
    //       let key = `${jt.symbol}:ETH`
    //       if (!this.tokens[key])
    //         this.tokens[key] = {
    //           name : jt.name
    //         }
    //       if (!this.tokens[key]['balances'])
    //         this.tokens[key]['balances'] = []
    //       this.tokens[key]['balances'].push({
    //         walletName : it.walletName,
    //         walletAddress : it.address,
    //         balance
    //       })
    //       if (this.tokens[key]['tokenBalance'] === undefined)
    //         this.tokens[key]['tokenBalance'] = 0
    //       this.tokens[key]['tokenBalance'] += balance
    //       this.totalTokenBalUpdates += 1
    //       this.updateReadyState()
    //     })
    //   })
    // })

    // Special case for neo as we can get all the token balances in one call

    from(neoWallets)
      .pipe(mergeMap(wallet => this.getBalanceFromNEOChain(wallet), 5))
      .subscribe(r => {
        // Run a loop, check for each
        let balanceMap = r['balanceMap']
        let wallet = r['wallet']
        this.neoTokens.forEach(jt => {
          let key = `${jt.symbol}:NEO`
          if (!this.tokens[key])
            this.tokens[key] = {
              name: jt.name
            }
          if (!this.tokens[key]['balances'])
            this.tokens[key]['balances'] = []
          let balance = 0;
          if (balanceMap[jt['fullName'].toUpperCase()] !== undefined) {
            balance = balanceMap[jt['fullName'].toUpperCase()]
            this.tokens[key]['balances'].push({
              walletName: wallet.walletName,
              walletAddress: wallet.address,
              balance
            })
          }
          if (this.tokens[key]['tokenBalance'] === undefined)
            this.tokens[key]['tokenBalance'] = 0
          this.tokens[key]['tokenBalance'] += balance
          this.totalTokenBalUpdates += 1
        })
        this.updateReadyState()
      })
    // neoWallets.forEach((it, i) => {
    //   this.getBalanceFromNEOChain(it)
    //   .subscribe(balanceMap => {
    //     // Run a loop, check for each
    //     this.neoTokens.forEach(jt => {
    //       let key = `${jt.symbol}:NEO`
    //       if (!this.tokens[key])
    //         this.tokens[key] = {
    //           name : jt.name
    //         }
    //       if (!this.tokens[key]['balances'])
    //         this.tokens[key]['balances'] = []
    //       let balance = 0;
    //       if (balanceMap[jt['fullName'].toUpperCase()] !== undefined) {
    //         balance = balanceMap[jt['fullName'].toUpperCase()]
    //         this.tokens[key]['balances'].push({
    //           walletName : it.walletName,
    //           walletAddress : it.address,
    //           balance
    //         })
    //       }
    //       if (this.tokens[key]['tokenBalance'] === undefined)
    //         this.tokens[key]['tokenBalance'] = 0
    //       this.tokens[key]['tokenBalance'] += balance
    //       this.totalTokenBalUpdates += 1
    //     })
    //     this.updateReadyState()
    //   })
    // })

  }
  getHistoDay(fsym, symbolInfo) {
    return this.http
      .get('https://min-api.cryptocompare.com/data/histoday?limit=120&aggregate=1&e=CCCAGG&tsym=USD&fsym=' + fsym)
      .map(res => {
        let r = {
          res: res.json(),
          symbolInfo
        }
        return r;
      });
  }
  getBalanceFromETHChain(wallet, token) {
    //console.log('getBalanceFromETHChain', wallet, token)
    let ret = new Subject<any>()
    if (!token.address) {
      let web3 = this.web3Service.getWeb3();
      web3.eth.getBalance(wallet.address, (err, balance) => {
        if (err) {
          console.error(err)
          console.log(wallet.address)
        }
        let conversion = 0
        if (balance)
          conversion = +web3.fromWei(balance.toString());
        // this._ethWalletBalance.next(conversion);
        ret.next({ balance: conversion, wallet, token })
      })
    } else {
      let web3 = this.web3Service.getWeb3();
      var selectedTokenContract = web3.eth.contract(abi).at(token.address)
      selectedTokenContract.balanceOf(wallet.address, { from: wallet.address }, (err, balance) => {
        if (err) {
          console.error(err)
          console.log(wallet.address)
        }
        let conversion = 0
        if (balance) {
          conversion = +web3.fromWei(balance.toString());
          conversion = conversion * (10 ** (18 - token.decimals));
        }
        // this._platformTokenWalletBalance.next(conversion);
        ret.next({ balance: conversion, wallet, token })
      })
    }
    return ret.asObservable()
  }
  getBalanceFromNEOChain(wallet) {
    console.log("getBalanceFromNEOChain")
    let ret = new Subject<any>()
    this.neoService.getNeondGasForAddress(wallet.address).then((result) => {
      // make map of token fullname and its balance
      let balanceMap: any = {}
      result['assetSymbols'].forEach(it => {
        balanceMap[it] = new BigNumber(result['assets'][it].balance).toNumber()
      })
      ret.next({ balanceMap, wallet });
    });
    return ret.asObservable()
  }
}
