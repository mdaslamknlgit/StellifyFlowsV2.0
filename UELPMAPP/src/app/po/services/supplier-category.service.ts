import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class SupplierCategoryService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getSupplierCategories(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierCategories`, getReqHeaders,httpParam); 
  }
  getSupplierCategoryDetails(paymentTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierCategories/${paymentTermId}`, getReqHeaders); 
  } 
  createSupplierCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/supplierCategories`,data, getReqHeaders); 
  }
  deleteSupplierCategory(paymentTermId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/supplierCategories/${paymentTermId}/${userId}`,getReqHeaders); 
  } 
  updateSupplierCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/supplierCategories`,data,getReqHeaders); 
  } 

  getAllSupplierCategories(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/supplierCategories/search"}`, getReqHeaders, httpParam);
  }
}


