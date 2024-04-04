import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivateChild } from '@angular/router';
import { AuthApiService } from './auth-api.service';
import { SessionStorageService } from './sessionstorage.service';


@Injectable({
  providedIn: 'root',
})
export class AuthenticateGuardService implements CanActivateChild {
  //userRoles: any = this.sessionService.getUserRole();
  isAutherized: boolean;
  constructor(
    private auth: AuthApiService,
    private router: Router,
    private sessionService: SessionStorageService,
    private authApiService: AuthApiService,
    //private authonticateApiService: AuthonticateApiService
  ) { }

  //This is for view restrict purpose
  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    // const expectedPermissions = route.data.expectedPermissions;
    const expectedPermissions = route.data[0];
    //  this.isAutherized = this.authonticateApiService.checkIsAutherized(expectedPermissions);
    this.isAutherized = this.checkIsAutherized(expectedPermissions);
    // Todo: true should replace with this.isAutherized, once user permissions are set in DB
    return this.isAutherized;
    //return this.isAutherized;
  }

  checkIsAutherized(expectedPermissions): boolean {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    // let k = roleAccessLevels.filter(x => x.FormName == expectedPermissions)[0].Display;
    let isView = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == expectedPermissions)[0].IsView;
    if (isView) {
      return true;
    }
    else {
      return false;
    }
  }
}
