  import { Injectable } from '@angular/core';
  import { ApiService } from '../../shared/services/api.service';
  import { environment } from '../../../environments/environment';
  import { HttpHeaders, HttpParams } from '@angular/common/http';
  import { Observable } from 'rxjs/Observable';

  @Injectable()
  export class ItemsListingService 
  {
      itemsEndpoint : string = `${environment.apiEndpoint}`;

      constructor(private apiService: ApiService) { 
      }

    // Getting Data
    getItemsListing(displayInput:any) {  

      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/getItemsListing"}`, getReqHeaders,httpParam); 
    } 

    getFilterItemListing(displayInput:any) {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
          fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/ItemsListing/Filter`, getReqHeaders,httpParam); 
    }


    getItems(displayInput:any) {  

      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/getSearchItems"}`, getReqHeaders,httpParam); 
    } 



    getExistingItemsListing(displayInput:any) {  

      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetExistingItemsListing"}`, getReqHeaders,httpParam); 
    } 

    //SearchItemListing
    SearchItemListing(data:any) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/SearchItemListing/"}`+data, getReqHeaders); 
    } 

  }