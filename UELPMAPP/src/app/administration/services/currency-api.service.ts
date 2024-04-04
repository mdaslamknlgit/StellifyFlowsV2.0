import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class CurrencyApiService {
    usersEndpoint: string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { }

    getCurrency(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.usersEndpoint}/currency`, getReqHeaders,httpParam); 
    } 

    
    getCurrencyDetails(userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.usersEndpoint}/currency/${userId}`, getReqHeaders); 
    } 

    createCurrency(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.usersEndpoint}`+`${"/currency"}`,data, getReqHeaders); 
    } 

    // saveItemMaster(data: any) {
    //     let getReqHeaders = new HttpHeaders();
    //     return this.apiService.postData(`${this.itemsEndpoint}` + `${"/CreateItemMaster"}`, data, getReqHeaders);
    //   }

    
    updateCurrency(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.usersEndpoint}`+`${"/currency"}`,data,getReqHeaders);
    } 

    deleteCurrency(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.usersEndpoint}`+`${"/currency/"}`+data, getReqHeaders); 
    }


}