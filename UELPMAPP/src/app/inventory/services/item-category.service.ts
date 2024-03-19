import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ItemCategoryDisplayInput } from "../models/item-category.model";

@Injectable()
export class ItemCategoryService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 



  }

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
  getItemCategories(displayInput:any) {   


    let getReqHeaders = new HttpHeaders();

    let httpParam = new HttpParams({
      fromObject:displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/ItemCategories"}`, getReqHeaders,httpParam); 

  } 

  GetItemCategorById(ItemCategoryId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/ItemCategories/GetItemCategorById/${ItemCategoryId}`,getReqHeaders); 
  }


   /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
 saveItemCategory(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/CreateItemCategory"}`,data, getReqHeaders); 

  } 

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
//  deleteItemCategory(data:any) {   

//   let getReqHeaders = new HttpHeaders();

//   return this.apiService.deleteData(`${this.itemsEndpoint}`+`${"/DeleteItemCategory/"}`+data, getReqHeaders); 

// } 


deleteItemCategory(itemCategoryId:number) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.deleteData(`${this.itemsEndpoint}/DeleteItemCategory/${itemCategoryId}`,getReqHeaders); 
} 

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
  updateItemCategory(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/UpdateItemCategory"}`,data,getReqHeaders); 

  } 

}


