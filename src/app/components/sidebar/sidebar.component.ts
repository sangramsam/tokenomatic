import {Component, OnInit,EventEmitter,Output} from '@angular/core';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {Subscription} from 'rxjs/Subscription';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() changeActivePage = new EventEmitter<string>();
  @Output() showMainContent = new EventEmitter<boolean>();
  private selectedExchange: Subscription;
  public traceExchange = 'eth';
  public displayRequest = 'none';
  public menuExpanded = false;
  public isLoading = false;
  constructor(private market: MarketBroadcastService,private PortfolioService:PortfolioService) {
    this.selectedExchange = this.market.selectedExchange$.subscribe((data) => this.getExchange(data));
  }

  ngOnInit() {

  }

  getExchange(data) {
    if (data) {
      //console.log('exchnage', data);
      this.traceExchange = data;
    }
  }
  toggleMenu() {
    this.menuExpanded = !this.menuExpanded
  }
  hideMenu() {
    this.menuExpanded = false
  }
  showMenu() {
    this.menuExpanded = true
  }
  collapseMenu() {
    this.menuExpanded = false;
  }

  logout()
  {
    console.log("logout");
    
  sessionStorage.clear();
  //this.showMainContent.emit(false)
  this.PortfolioService.logout(false);
  }
 
  requestForTheme() {

    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
    } else {
      this.displayRequest = 'none';
    }
  }
}
