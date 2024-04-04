import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class AccountTypesApiService {
    usersEndpoint: string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { }

    getAccountType(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.usersEndpoint}/coaaccounttypes`, getReqHeaders,httpParam); 
    } 

    
    getAccountTypesDetails(userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.usersEndpoint}/coaaccounttypes/${userId}`, getReqHeaders); 
    } 

    createAccountTypes(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.usersEndpoint}`+`${"/coaaccounttypes"}`,data, getReqHeaders); 
    } 
  
    
    updateAccountTypes(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.usersEndpoint}`+`${"/coaaccounttypes"}`,data,getReqHeaders);
    } 

    deleteAccountTypes(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.usersEndpoint}`+`${"/coaaccounttypes/"}`+data, getReqHeaders); 
    }


}