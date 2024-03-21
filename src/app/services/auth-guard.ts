import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
const platform = window.require('electron-platform');
declare var window: any;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate() {
    if (!platform.isElectron) {
      this.router.navigate(['/']);
      return false;
    }
    if (platform.isElectron) {
      console.log('Authguard true');
      return true;
    }
    console.log('Authguard false');
    this.router.navigate(['/']);
    return false;
  }
}
