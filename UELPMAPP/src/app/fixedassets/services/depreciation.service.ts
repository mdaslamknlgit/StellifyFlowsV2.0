import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class DepreciationService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getDepreciations(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/depreciationTypes`, getReqHeaders,httpParam); 
  }
  searchDepreciation(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/depreciationTypes/search`, getReqHeaders,httpParam); 
  }
  getDepreciationDetails(depreciationId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/depreciationTypes/${depreciationId}`, getReqHeaders); 
  } 
  createDepreciation(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/depreciationTypes`,data, getReqHeaders); 
  }
  deleteDepreciation(depreciationId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/depreciationTypes/${depreciationId}/${userId}`,getReqHeaders); 
  } 
  updateDepreciation(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/depreciationTypes`,data,getReqHeaders); 
  } 
}


