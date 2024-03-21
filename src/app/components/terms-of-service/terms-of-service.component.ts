import { Component, OnInit, EventEmitter, Output  } from '@angular/core';

const remote = window.require('electron').remote
declare var window: any;

@Component({
  selector: 'terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent implements OnInit {
  isFirstTime:any;
	@Output() changeActivePage = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
    this.isFirstTime = localStorage.getItem('firsttimeinitialized') !== 'true';
  }
  setActivePage = (activePage) => {
  	this.changeActivePage.emit(activePage)
  }
  handleAgree = () => {
  	localStorage.setItem('firsttimeinitialized','true')
  	this.setActivePage('login')
  }
  closeApp = () => {
    let w = remote.getCurrentWindow()
    w.close()
  }
}
