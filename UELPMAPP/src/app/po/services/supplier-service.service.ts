import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class SupplierServicesService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getSupplierServices(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierService`, getReqHeaders,httpParam); 
  }
  getSupplierServiceDetails(paymentTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierService/${paymentTermId}`, getReqHeaders); 
  } 
  createSupplierService(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/supplierService`,data, getReqHeaders); 
  }
  deleteSupplierService(paymentTermId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/supplierService/${paymentTermId}/${userId}`,getReqHeaders); 
  } 
  updateSupplierService(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/supplierService`,data,getReqHeaders); 
  } 

  getAllSupplierService(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/supplierService/search"}`, getReqHeaders, httpParam);
  }
}


