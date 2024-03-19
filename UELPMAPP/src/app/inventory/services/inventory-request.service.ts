import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ItemCategoryDisplayInput } from "../models/item-category.model";

@Injectable()
export class InventoryRequestService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 



  }

 /*
  
  purpose:calling the api method to fetch the inventory requests ...

  */
  getInventoryRequests(displayInput:any) {   


    let getReqHeaders = new HttpHeaders();

    let httpParam = new HttpParams({
      fromObject:displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/InventoryRequest"}`, getReqHeaders,httpParam); 

  } 

   /*
  
  purpose:calling the api method to fetch the details of the selected inventory request record ...

  */
 getInventoryRequestDetails(displayInput:any) {   


    let getReqHeaders = new HttpHeaders();

    let httpParam = new HttpParams({
      fromObject:displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/InventoryRequestDetails"}`, getReqHeaders,httpParam); 

  } 

   /*
  
  purpose:calling the api method to create the inventory request...

  */
 createInventoryRequest(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateInventoryRequest"}`,data, getReqHeaders); 

  } 

 /*
  
  purpose:calling the api method to delete the inventory request...

  */
 deleteInventoryRequest(data:any) {   

  let getReqHeaders = new HttpHeaders();

  return this.apiService.deleteData(`${this.itemsEndpoint}`+`${"/DeleteInventoryRequest/"}`+data, getReqHeaders); 

} 

 /*
  
  purpose:calling the api method to update the inventory request....

  */
  updateInventoryRequest(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.putData(`${this.itemsEndpoint}`+`${"/UpdateInventoryRequest"}`,data,getReqHeaders); 

  } 

}


