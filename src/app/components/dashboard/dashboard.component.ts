import { Component, OnInit } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service'

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public walletSwiperConfig : any;
  public ethTokenData : any = {};
  public neoTokenData : any = {};
  public wandTokenData : any = {};
  constructor(
  	private dashboardService : DashboardService
  ) {
    // this.walletSwiperConfig = {
    //   pagination: {
    //     el: '.ws-swiper .swiper-pagination',
    //     type: 'fraction',
    //   },
    //   navigation: {
    //     nextEl: '.ws-swiper .swiper-button-next',
    //     prevEl: '.ws-swiper .swiper-button-prev',
    //   },
    //   freeMode: true,

    // }
  	this.dashboardService.serviceStatus$.subscribe(status => {
  		if (status == 'ready') {
  			let tokens = this.dashboardService.getTokens()
        this.updatePillData(tokens)
  		}
  	})
  }

  updateTokenData = (tokens, symbol) => {
    let token = tokens[symbol]
    let data = {
      symbol : symbol.split(':')[0],
      changePercent : 0,
      changeUSD : 0,
      totalToken : 0,
      totalValue : 0,
      volume : 0
    }
    if (token && token.usd) {
      let usd2 = token.usd[token.usd.length - 1]
      let usd1 = token.usd[token.usd.length - 2]
      data['changePercent'] = (usd2.value - usd1.value)*100/usd1.value
      data['changeUSD'] = (usd2.value)
      data['volume'] = usd2.volume ? usd2.volume : 0
      data['totalToken'] = token.tokenBalance
      data['totalValue'] = token.tokenBalance * usd2.value
    }
    return data;
  }
  updatePillData = (tokens) => {
    // For Eth
    this.ethTokenData = this.updateTokenData(tokens, 'ETH:ETH')
    this.neoTokenData = this.updateTokenData(tokens, 'NEO:NEO')
    this.wandTokenData = this.updateTokenData(tokens, 'WAND:ETH')
  }
  ngOnInit() {
  }

}
