import { Component, NgZone } from "@angular/core";
import Amplify from "aws-amplify";
import Cognito from "./models/cognito-config";
import { EthBasketService } from "./services/eth-basket.service";
import { Subscription } from "rxjs/Subscription";
import { PortfolioService } from "./services/portfolio.service";
PortfolioService
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public check: any = false;
  public shouldShowMainContent: boolean = false;
  title = 'app';
  private logdata: Subscription;
  constructor(
    private zone: NgZone,
    private EthBasketService: EthBasketService,
    private portfolioService:PortfolioService
  ) {
    // this.updateFirstInitialize = this.updateFirstInitialize.bind(this)
    Amplify.configure({
      Auth: {
        mandatorySignIn: true,
        region: Cognito.REGION,
        userPoolId: Cognito.USER_POOL_ID,
        identityPoolId: Cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: Cognito.APP_CLIENT_ID,
      },
    });
    this.logdata = this.portfolioService.logoutdata$.subscribe(data =>
      this.logout(data)
    );

    if(sessionStorage.getItem('username'))
    {
      this.shouldShowMainContent=true;
    }
  }
  options = {
    timeOut: 0,
    pauseOnHover: false,
    showProgressBar: false,
    clickToClose: true,
    maxStack: 4,
    icons: {
      alert: "<i class='fa fa-times'></i>",
      error: "<i class='fa fa-times'></i>",
      info: "<i class='fa fa-times'></i>",
      warn: "<i class='fa fa-times'></i>",
      success: "<i class='fa fa-times'></i>",
    },
  };
  onShowMainContent = (shouldShowMainContent) => {
    this.shouldShowMainContent = shouldShowMainContent;
  };
  ngOnInit() {
    // this.check = localStorage.getItem('firsttimeinitialized');
  }

  logout(data)
  {
    this.shouldShowMainContent = data;
  }
  // updateFirstInitialize(){
  //   localStorage.setItem('firsttimeinitialized','true');
  //   this.zone.run(()=>{
  //     this.check = 'true'
  //   })
  // }
}
