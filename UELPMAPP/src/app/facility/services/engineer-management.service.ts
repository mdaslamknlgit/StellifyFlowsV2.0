import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EngineerManagementService {

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) {

   }

    getEngineerManagement(displayInput:any) {  

        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/EngineerManagement"}`, getReqHeaders,httpParam); 
    } 

    createEngineerManagement(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.itemsEndpoint}`+`${"/EngineerManagement"}`,data, getReqHeaders); 
    } 
  
    updateEngineerManagement(data:any) {   
      let getReqHeaders = new HttpHeaders();
      console.log(data);
      return this.apiService.putData(`${this.itemsEndpoint}`+`${"/EngineerManagement"}`,data,getReqHeaders);
    }
  
    deleteEngineerManagement(engineerId:any,userId:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.itemsEndpoint}/EngineerManagement/${engineerId}/${userId}`,getReqHeaders); 
    }  

    getEngineerManagementFilter(displayInput:any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/EngineerManagement/Filter`, getReqHeaders,httpParam); 
    }

    getEngineerDetails(engineerId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.itemsEndpoint}/EngineerManagement/${engineerId}`, getReqHeaders); 
    }


}