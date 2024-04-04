import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class ExpenseMasterService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getExpenseMaster(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/expenses`, getReqHeaders,httpParam); 
  }
  searchExpenseMaster(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/expenses/search`, getReqHeaders,httpParam); 
  }
  getExpenseMasterDetails(assetId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/expenses/${assetId}`, getReqHeaders); 
  } 
  createExpenseMaster(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/expenses`,data, getReqHeaders); 
  }
  deleteExpenseMaster(assetId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/expenses/${assetId}/${userId}`,getReqHeaders); 
  } 
  updateExpenseMaster(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/expenses`,data,getReqHeaders); 
  } 
}


