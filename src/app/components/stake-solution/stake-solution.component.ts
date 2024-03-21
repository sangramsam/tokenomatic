import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MarketBroadcastService } from '../../services/market-broadcast.service';
import { SavedWalletsService } from '../../services/saved-wallets.service';

@Component({
  selector: 'app-stake-solution',
  templateUrl: './stake-solution.component.html',
  styleUrls: ['./stake-solution.component.css']
})
export class StakeSolutionComponent implements OnInit {

  public selectedExchange: any = "";
  public selectedWallet : any = "";
  private marketBroadcastServiceSub : any; 

  visibleTab: string = 'none';

  constructor(
    private marketBroadcastService: MarketBroadcastService,
    private savedWalletsService: SavedWalletsService,
    private zone : NgZone
  ) {}

  ngOnInit() {

    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        let w = this.savedWalletsService.getCurrentWallet();
        this.selectedWallet = w
      }
    });

    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'exchangeWillChange') {
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange()
      }
    });
  }

  setVisibleTab(tabName: string) {
    this.visibleTab = tabName;
  }

  isTabVisible(tabName: string): boolean {
    return this.visibleTab === tabName;
  }

  ngOnDestroy(): void {
    if(this.marketBroadcastServiceSub) {
      this.marketBroadcastServiceSub.unsubscribe()
    }
  }
}