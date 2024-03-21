import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExchangeComponent } from './components/exchange/exchange.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BasketComponent } from './components/basket/basket.component';
import { BasketNeoComponent } from './components/basket-neo/basket-neo.component';
import { StakeContainerComponent } from './components/stake-container/stake-container.component';
import { WalletsManagerComponent } from './components/wallets-manager/wallets-manager.component';
import { BasketContainerComponent } from './components/basket-container/basket-container.component';
import { AirdropComponent } from './components/airdrop/airdrop.component';
import { ProfileContainerComponent } from './components/profile-container/profile-container.component';
import { MiniViewComponent } from './components/mini-view/mini-view.component'
import { AuthGuard } from './services/auth-guard';
import { StakeSolutionComponent } from './components/stake-solution/stake-solution.component';
import { TokenTradingComponent } from './components/token-trading/token-trading.component';

import { NewDashboardComponent } from "./components/new-dashboard/new-dashboard.component";
const appRoutes: Routes = [
  {
    path: 'exchange',
    component: ExchangeComponent,
    canActivate: [AuthGuard]
    // children : [{
    //   path : 'wallet',
    //   component : ExchangeWalletComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'depositewithdraw',
    //   component : ExchangeDepositewithdrawComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'quicktrade',
    //   component : ExchangeQuicktradeComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'openorders',
    //   component : ExchangeOpenordersComponent,
    //   outlet : 'ordertabs'
    // }, {
    //   path : 'orderhistory',
    //   component : ExchangeOrderhistoryComponent,
    //   outlet : 'ordertabs'
    // }, {
    //   path: '',
    //   pathMatch: 'full',
    //   redirectTo: '/exchange/(ordertabs:openorders//wallettabs:wallet)'
    // }]
  },
  {
    path: 'dashboard',
    component: NewDashboardComponent,
    canActivate: [AuthGuard]
    // children : [{
    //   path : 'wallet',
    //   component : DashboardWalletComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path : 'depositewithdraw',
    //   component : DashboardDepositewithdrawComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path : 'quicktrade',
    //   component : DashboardQuicktradeComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path: '',
    //   pathMatch: 'full',
    //   redirectTo: '/dashboard/(dashboarWallettabs:wallet)'
    // }]
  },
  {
    path: 'wallets-manager',
    component: WalletsManagerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'basket',
    component: BasketComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'neoBasket',
    component: BasketNeoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'neoBasket/:tab',
    component: BasketNeoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'baskets',
    component: BasketContainerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stake',
    component: StakeContainerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'airdrop',
    component: AirdropComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileContainerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stakeSolution',
    component: StakeSolutionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'trade',
    component: TokenTradingComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/wallets-manager', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
