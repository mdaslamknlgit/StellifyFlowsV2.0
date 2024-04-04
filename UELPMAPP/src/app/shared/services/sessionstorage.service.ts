import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserDetails, Notifications } from '../models/shared.model';

@Injectable({
    providedIn: 'root',
})

export class SessionStorageService {

    constructor(
        public router: Router,
    ) { }
    // Store access_token in session storage
    getToken() {
        if (sessionStorage.getItem('access_token')) {
            return sessionStorage.getItem('access_token');
        } else {
            return false;
        }
    }

    setToken(access_token) {
        sessionStorage.setItem('access_token', access_token);
    }

    removeaccess_token() {
        sessionStorage.removeItem('access_token');
    }

    refreshaccess_token(access_token) {
        if (sessionStorage.getItem('access_token')) {
            sessionStorage.removeItem('access_token');
        }
        sessionStorage.setItem('access_token', access_token);
    }

    // Store User in session storage
    setUser(user) {
        sessionStorage.setItem('userDetails', JSON.stringify(user));
    }

    getUser():UserDetails|boolean {        
        if (sessionStorage.getItem('userDetails')) {
            return JSON.parse(sessionStorage.getItem('userDetails'));
        } else {
            return false;
        }
    }

    setCompanyId(companyID){
        sessionStorage.setItem('companyID', companyID);
    }

    
    getCompanyId(){
        if (sessionStorage.getItem('companyID')) {
            return JSON.parse(sessionStorage.getItem('companyID'));
        } else {
            return false;
        }       
    }

    setRolesAccess(roleAccessList){
        sessionStorage.setItem('rolesAccess', JSON.stringify(roleAccessList));
    }

    getRolesAccess(){
        if (sessionStorage.getItem('rolesAccess')) {
            return JSON.parse(sessionStorage.getItem('rolesAccess'));
        } else {
            return false;
        }       
    }

    setCompany(company){
        sessionStorage.setItem('company', company);
    }

    getCompany(){
        if (sessionStorage.getItem('company')) {
            return JSON.parse(sessionStorage.getItem('company'));
        } else {
            return false;
        }
       
    }

    removeUser() {
        sessionStorage.removeItem('userDetails');
    }
    removeToken() {
        sessionStorage.removeItem('access_token');
    }

    refreshUser(branchId) {
        let user:UserDetails = <UserDetails>this.getUser();
        user.BranchId = branchId;
        this.removeUser();
        this.setUser(user);
    }

    //  Store User roles in session storage
    setUserRole(user) {
        sessionStorage.setItem('UserRole', JSON.stringify(user));
    }

    getUserRole() {
        if (sessionStorage.getItem('UserRole')) {
            return JSON.parse(sessionStorage.getItem('UserRole'));
        } else {
            return false;
        }
    }

    removeUserRole() {
        sessionStorage.removeItem('UserRole');
    }

    // //  Store selected notification in session storage
    // setSelectedNotification(notificationData:Notifications) {
    //     sessionStorage.setItem('SelectedNotification', JSON.stringify(notificationData));
    // }
    // getSelectedNofication() {
    //     if (sessionStorage.getItem('SelectedNotification')) {
    //         return JSON.parse(sessionStorage.getItem('SelectedNotification'));
    //     } else {
    //         return false;
    //     }
    // }
    // removeSelectedNofication() {
    //     sessionStorage.removeItem('SelectedNotification');
    // }

//Base Currency
setBaseCurrency(basecurrency: any) {
    sessionStorage.setItem("BaseCurrency", JSON.stringify(basecurrency));
  }

  getBaseCurrency(): any {
    if (sessionStorage.getItem("BaseCurrency")) {
      return JSON.parse(sessionStorage.getItem("BaseCurrency"));
    } else {
      return "";
    }
  }
    getBaseCurrencySymbol() {
        const MyBaseCurrency = sessionStorage.getItem("BaseCurrency");
        let MyBaseCurrencyJSON = JSON.parse(MyBaseCurrency);
        let MyBaseCurrencySymbol = MyBaseCurrencyJSON.Symbol;
    
        return MyBaseCurrencySymbol;

      }

}

