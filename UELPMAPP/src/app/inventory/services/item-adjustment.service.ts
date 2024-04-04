import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ItemAdjustment } from "../models/item-adjustment.model";

import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ItemAdjustmentService {
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  /*
     purpose:calling the api method to fetch the list of location transfer requests
  */
 getItemAdjustment(displayInput:any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(this.itemsEndpoint+`${"/GetItemAdjustment"}`, getReqHeaders,httpParam); 
  } 
  
  /**
   * 
   * @param itemAdjustmentObj 
   * purpose:to create new location tranfer 
   */
  createItemAdjustmentRequest(itemAdjustmentObj:ItemAdjustment): Observable<any> {
    let reqHeaders = new HttpHeaders();
     return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateItemAdjustment"}`, itemAdjustmentObj, reqHeaders);  
  }

  /**
   * 
   * @param itemAdjustmentObj 
   * purpose:to update the selected record details...
   */
  updateItemAdjustmentRequest(itemAdjustmentObj:ItemAdjustment): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.putData(`${this.itemsEndpoint}`+`${"/UpdateItemAdjustment"}`, itemAdjustmentObj, reqHeaders);  
  }  

  /**
   * 
   * @param locationTransferId 
   * purpose:to delete the selected record...
   */
  DeleteItemAdjustmentRequest(itemAdjustmentId:number): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.deleteData(`${this.itemsEndpoint}`+`${"/DeleteItemAdjustment/"}`+itemAdjustmentId, reqHeaders);  
  }  

}