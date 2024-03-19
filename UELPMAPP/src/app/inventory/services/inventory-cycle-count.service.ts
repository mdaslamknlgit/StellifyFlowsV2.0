import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class InventoryCycleCountService 
{
    itemsEndpoint : string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { 
  
    }

    // Getting Data
    getInventoryCycleCount(displayInput:any) {  
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetInventoryCycleCount"}`, getReqHeaders,httpParam); 
  } 

  createInventoryCycleCountRequest(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateInventoryCycleCountRequest"}`,data, getReqHeaders); 

  } 
  
  getExistingInventoryCycleCount(displayInput:any) {  

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetExistingInventoryCycleCount"}`, getReqHeaders,httpParam); 
  } 

  getItemsbasedLocationID(itemObj:any){

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj    
    });
    console.log(itemObj);
    return this.apiService.getResults(this.itemsEndpoint+`${"/GetItemsbasedLocationID"}`, getReqHeaders,httpParam); 
  }


}