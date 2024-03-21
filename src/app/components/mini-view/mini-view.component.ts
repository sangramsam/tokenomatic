import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'mini-view',
  templateUrl: './mini-view.component.html',
  styleUrls: ['./mini-view.component.css']
})
export class MiniViewComponent implements OnInit {
  @Output() showMainContent = new EventEmitter<boolean>();
	public activePage : string = 'login';
  constructor() {
  }

  ngOnInit() {
  	let isFirstTime = localStorage.getItem('firsttimeinitialized') !== 'true';
  	if (isFirstTime)
  		this.activePage = 'terms-of-service';

  }
  onShowMainContent = (showMainContent) => {
    this.showMainContent.emit(showMainContent)
  }
  onChangeActivePage = (activePage) => {
  	this.activePage = activePage
  }
}
