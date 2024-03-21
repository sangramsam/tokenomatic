import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dashboard-wallet',
  templateUrl: './dashboard-wallet.component.html',
  styleUrls: ['./dashboard-wallet.component.css']
})
export class DashboardWalletComponent implements OnInit {
	@Input() data : any;
  constructor() { }

  ngOnInit() {
  }

}
