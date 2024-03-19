import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class AccountSubCategoryApiService {
    usersEndpoint: string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { }

    getAccountSubCategory(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.usersEndpoint}/accountsubcategory`, getReqHeaders,httpParam); 
    } 

    
    getAccountSubCategoryDetails(userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.usersEndpoint}/accountsubcategory/${userId}`, getReqHeaders); 
    } 

    createAccountSubCategory(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.usersEndpoint}`+`${"/accountsubcategory"}`,data, getReqHeaders); 
    } 
    
    updateAccountSubCategory(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.usersEndpoint}`+`${"/accountsubcategory"}`,data,getReqHeaders);
    } 

    deleteAccountSubCategory(recordId:any,userId:any,companyId:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.usersEndpoint}/accountsubcategory/${recordId}/${userId}/${companyId}`,getReqHeaders); 
    }  

}