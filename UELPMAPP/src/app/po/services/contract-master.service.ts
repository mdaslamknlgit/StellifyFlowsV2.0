import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ContractPurchaseOrder } from '../models/contract-purchase-order.model';

@Injectable()
export class ContractMasterService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  /*
  purpose:calling the api method to fetch all purchase orders
  */
  getContractPurchaseOrders(displayInput:any) {
      
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders`, getReqHeaders,httpParam); 
  }
  getAllSearchContractPurchaseOrders(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders/SearchAll`, getReqHeaders,httpParam); 
  } 
  getPocList(pocObj:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:pocObj
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders/getPocLists`,getReqHeaders,httpParam);
  }


  // exportAccrualGL(data: AccureContractPurchaseOrder) {
  //   let getReqHeaders = new HttpHeaders();   
  //   return this.apiService.postData(`${this.itemsEndpoint}/contractPurchaseOrders/exportAccrualGL`, data, getReqHeaders);
  // }
}


