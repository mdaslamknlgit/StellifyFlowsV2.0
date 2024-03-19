import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SessionStorageService } from './sessionstorage.service';

@Injectable({
    providedIn: 'root',
})

export class AuthApiService { 
  constructor(
    public router: Router,  
    public sessionService: SessionStorageService
  ) { }  

  signout() {
    //this.sessionService.removeToken();
    this.sessionService.removeUser();
    this.sessionService.removeUserRole();  
    this.router.navigate(['/']);
  }

  isLoggedIn() {
    // if (this.sessionService.getToken() && this.sessionService.getUser()) {
    if (this.sessionService.getUser()) {
      return true;
    } else {
      return false;
    }
  }

//this is for view restrict 
  // checkIsAutherized( expectedPermissions ): boolean {
  //   //debugger;
  //   this.UsersRoles=this.sessionService.getUserRoles();
  //   //debugger;
  //   let k= this.UsersRoles.filter(x=>x.FormName==expectedPermissions)[0].Display;
  //   if(k)
  //   {
  //       return true;
  //   }
  //   else{
  //       return false;
  //   }
  // }

}
