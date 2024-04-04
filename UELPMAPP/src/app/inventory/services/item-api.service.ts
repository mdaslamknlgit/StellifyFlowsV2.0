import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ItemService {
  itemsEndpoint : string = `${environment.apiEndpoint}/items`;
  constructor(private apiService: ApiService) { }

  getItems() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(this.itemsEndpoint, getReqHeaders); 
  } 

  getItemById(itemId: Number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/${itemId}`, getReqHeaders); 
  } 

  createItem(itemObj): Observable<any> {
    let reqHeaders = new HttpHeaders();
     return this.apiService.postData(this.itemsEndpoint, itemObj, reqHeaders);  
  }

  updateItem(itemObj:any, itemId:number): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.putData(`${this.itemsEndpoint}/${itemId}`, itemObj, reqHeaders);  
  }  

  deleteItem(itemId:number): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.deleteData(`${this.itemsEndpoint}/${itemId}`, reqHeaders);  
  }  
}


