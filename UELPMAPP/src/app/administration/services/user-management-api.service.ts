import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable({
  providedIn: 'root',
})
export class UserManagementApiService {
  usersEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { }


  getUserManagement(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/users`, getReqHeaders, httpParam);
  }

  getUserRoles() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/Roles`, getReqHeaders);
  }

  getUserDetails(userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/users/${userId}`, getReqHeaders);
  }

  getUsersByCompany(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/getCompanyUsers`, getReqHeaders, httpParam);
  }

  getUsersByRole(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/getUsersByRole`, getReqHeaders, httpParam);
  }

  getUserName(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/GetUserName`, getReqHeaders, httpParam);
  }


  // saving data
  createUserManagement(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.usersEndpoint}` + `${"/users"}`, data, getReqHeaders);
  }


  //   Update Data
  updateUserManagement(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.usersEndpoint}` + `${"/users"}`, data, getReqHeaders);
  }

  deleteUserManagement(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.usersEndpoint}` + `${"/users/"}` + data, getReqHeaders);
  }

  getUserManagementFilter(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/users/Filter`, getReqHeaders, httpParam);
  }

  getUsers(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/GetUserName`, getReqHeaders, httpParam);
  }

  GetReportingUsers(CompanyId:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/Users/GetReportingUsers/${CompanyId}`, getReqHeaders);       
  } 
  getCheckUserName(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/CheckUserName`, getReqHeaders, httpParam);
  }

  resetpassword(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.usersEndpoint}/reset`, getReqHeaders, httpParam);
  }

  changepassword(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.usersEndpoint}` + `${"/changepassword"}`, data, getReqHeaders);
  }

  GetLDAPUserProfile() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/LDAPUserProfile`, getReqHeaders);
  }

  retainStructure(userId: any): Observable<any> {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append("userId", JSON.stringify(userId));
    return this.apiService.postDataWithAttachments(`${this.usersEndpoint}/retainStructure`, formData, reqHeaders);
  }

  GetUserNames(searchKey: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/GetisShowUserNames?searchKey=${searchKey}`, getReqHeaders);
  }

  GetAllUserNames(searchKey: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/GetAllUserNames?searchKey=${searchKey}`, getReqHeaders);
  }

  saveUserNames(userId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/SaveUserName?userId=${userId}`, getReqHeaders);
  }

}