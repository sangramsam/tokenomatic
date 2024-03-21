import { Component, OnInit } from '@angular/core';
import announcements from './announcement-data'

const electron = window.require('electron');
var shell = window.require('electron').shell;
declare var window: any;

@Component({
  selector: 'dashboad-anouncements',
  templateUrl: './dashboad-anouncements.component.html',
  styleUrls: ['./dashboad-anouncements.component.css']
})
export class DashboadAnouncementsComponent implements OnInit {
	public announcementSwiperConfig : any;
  public announcements : any = []
  public initialize = false
  constructor() {
  	this.announcementSwiperConfig = {
      pagination: {
        el: '.dashboard-announcements .swiper-pagination',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.dashboard-announcements .swiper-button-next',
        prevEl: '.dashboard-announcements .swiper-button-prev',
      },
      slidesPerView: 3,
      freeMode : true,
      spaceBetween: 5,
      breakpoints: {
        1800: {
          slidesPerView: 2,
        }
      }

    }
  }
  openLink = (announcement) => {
    shell.openExternal(announcement.link)
  }
  ngOnInit() {
    this.announcements = announcements
    setTimeout(() => {
      this.initialize = true;
    }, 500)
  }

}
