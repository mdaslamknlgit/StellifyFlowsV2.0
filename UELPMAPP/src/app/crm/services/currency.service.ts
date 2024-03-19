
import { ApiService } from '../../shared/services/api.service';
//import { SharedService } from './shared.service';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import {  HttpParams } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map'

import 'rxjs/add/operator/map';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SessionStorageService } from '../../../app/shared/services/sessionstorage.service';
import {TreeNode} from 'primeng/api';

@Injectable({providedIn: 'root'})
export class CurrencyService {


  _webApiUrl : string = `${environment.apiEndpoint}`;
    //private _webApiUrl = environment.apiEndPoint;
    //private sessionService: SessionStorageService;
    constructor(private apiService: ApiService) { }

      GetCurrencyList(): Observable<any> {
        const getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this._webApiUrl}/GetCurrency`, getReqHeaders); 
    
      }
      GetDefaultCurrency()
      {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this._webApiUrl}/GetDefaultCurrency`, getReqHeaders);       
      }
      GetCurrencyListById(Id:number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this._webApiUrl}/GetCurrencyListById/${Id}`, getReqHeaders);       
      } 
    
      UpdateCurrencyList(CurrencyDTO :any)
      {
        const getReqHeaders = new HttpHeaders();
        return  this.apiService.postData(`${this._webApiUrl}/UpdateCurrencyList`,CurrencyDTO, getReqHeaders);  
      }
    
      DeleteCurrencyList(CurrencyDTO :any)
      {
        const getReqHeaders = new HttpHeaders();
        return  this.apiService.postData(`${this._webApiUrl}/DeleteCurrencyList`,CurrencyDTO, getReqHeaders);  
      }
      CreateCurrencyList(CurrencyDTO :any)
      {
        const getReqHeaders = new HttpHeaders();
        return  this.apiService.postData(`${this._webApiUrl}/CreateCurrencyList`,CurrencyDTO, getReqHeaders);  
      }
     
    private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
    
}