import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class TaxGroupApiService {
    usersEndpoint: string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { }

    getTaxGroup(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.usersEndpoint}/taxgroup`, getReqHeaders,httpParam); 
    } 

    
    getTaxGroupDetails(userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.usersEndpoint}/taxgroup/${userId}`, getReqHeaders); 
    } 

    createTaxGroup(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.usersEndpoint}`+`${"/taxgroup"}`,data, getReqHeaders); 
    } 
    
    updateTaxGroup(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.usersEndpoint}`+`${"/taxgroup"}`,data,getReqHeaders);
    } 

    deleteTaxGroup(recordId:any,userId:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.usersEndpoint}/taxgroup/${recordId}/${userId}`,getReqHeaders); 
    }  

}