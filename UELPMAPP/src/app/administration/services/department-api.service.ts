import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class DepartmentApiService {
    usersEndpoint: string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { }

    getDepartment(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.usersEndpoint}/department`, getReqHeaders,httpParam); 
    } 

    
    getDepartmentDetails(userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.usersEndpoint}/department/${userId}`, getReqHeaders); 
    } 

    createDepartment(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.usersEndpoint}`+`${"/department"}`,data, getReqHeaders); 
    } 

    // saveItemMaster(data: any) {
    //     let getReqHeaders = new HttpHeaders();
    //     return this.apiService.postData(`${this.itemsEndpoint}` + `${"/CreateItemMaster"}`, data, getReqHeaders);
    //   }

    
    updateDepartment(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.usersEndpoint}`+`${"/department"}`,data,getReqHeaders);
    } 

    deleteDepartment(recordId:any,userId:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.usersEndpoint}/department/${recordId}/${userId}`,getReqHeaders); 
    }  
}