import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ItemCategoryDisplayInput } from "../models/item-category.model";

@Injectable()
export class InventoryDisposalRequestService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }

 /*
  purpose:calling the api method to fetch the inventory disposal requests ...
  */
  getInventoryDisposalRequests(displayInput:any) {   

    let getReqHeaders = new HttpHeaders();

    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/InventoryDisposalRequest"}`, getReqHeaders,httpParam); 
  } 

   /*
  purpose:calling the api method to create the inventory request...
  */
 createInventoryDisposalRequest(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateInventoryDisposalRequest"}`,data, getReqHeaders); 

  } 



}


