import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthApiService } from './auth-api.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthApiService, public router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {    
      if (this.auth.isLoggedIn()) {
        return true;
      } else {
      // not logged in so redirect to login page with the return url and return false
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;     
      }
    }

}
