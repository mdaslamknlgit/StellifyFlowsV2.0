import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ItemTypeDisplayInput  } from "../models/item-type.model";

@Injectable()
export class ItemTypeService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 
  }
 /*  
  purpose:calling the api method to fetch the details of the selected item type...
  */
 getItemTypes(displayInput:any) {  

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetItemType"}`, getReqHeaders,httpParam); 
  } 

   /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
 saveItemType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateItemType"}`,data, getReqHeaders); 
  } 

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
 deleteItemType(data:any) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.deleteData(`${this.itemsEndpoint}`+`${"/DeleteItemType/"}`+data, getReqHeaders); 
} 

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
  updateItemType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/UpdateItemType"}`,data,getReqHeaders);
  } 

  
 GetItemCategoryList() {   
   let getReqHeaders = new HttpHeaders();
   return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetCategoryList"}`, getReqHeaders); 
 } 

 GetAllItemType(displayItemTypeGrid: any) {
  let getReqHeaders = new HttpHeaders();
  let httpParam = new HttpParams({
    fromObject: displayItemTypeGrid
  });

  return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetItemType/search"}`, getReqHeaders, httpParam);
}

}


