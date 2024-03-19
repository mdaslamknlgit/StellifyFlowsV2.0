import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class ServiceCategoryService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getServiceCategories(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/serviceCategory`, getReqHeaders,httpParam); 
  }
  getServiceCategoryDetails(paymentTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/serviceCategory/${paymentTermId}`, getReqHeaders); 
  } 
  createServiceCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/serviceCategory`,data, getReqHeaders); 
  }
  deleteServiceCategory(paymentTermId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/serviceCategory/${paymentTermId}/${userId}`,getReqHeaders); 
  } 
  updateServiceCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/serviceCategory`,data,getReqHeaders); 
  } 

  getAllServiceCategories(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/serviceCategory/search"}`, getReqHeaders, httpParam);
  }
}


