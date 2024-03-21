import { Component, OnInit, NgZone } from '@angular/core';
import { SavedWalletsService } from '../../services/saved-wallets.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './new-dashboard.component.html',
  styleUrls: ['./new-dashboard.component.css']
})
export class NewDashboardComponent implements OnInit {
  portfolioData: any;
  savedWalletsServiceSub: any;
  t: boolean = false
  constructor(private zone: NgZone, private savedWalletsService: SavedWalletsService,
    private web3: Web3Service,) {
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(
      d => {
        console.log('NewDashboardComponent', d)
        if (d == "currentWalletChanged") {
          this.zone.run(() => {
            //console.log('NewDashboardComponent', d)
            this.t = false;
            this.t = true
          })
        }
      }
    );
  }

  ngOnInit() {

  }


}
