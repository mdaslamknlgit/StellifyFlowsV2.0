import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { LocationTransfer } from "../models/location-transfer.model";

import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocationTransferService {

    itemsEndpoint : string = `${environment.apiEndpoint}`;
    constructor(private apiService: ApiService) { 

    }
    
    getLocationTransfer(displayInput:any) {   
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/locationTransfer`, getReqHeaders,httpParam); 
    }
    getLocationTransferForApproval(displayInput:any) {   
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/locationTransfer/approvals`, getReqHeaders,httpParam); 
    }
    searchLocationTransfer(displayInput:any)
    {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/locationTransfer/search`, getReqHeaders,httpParam); 
    }
    getLocationTransferReqDetails(locationTransferId:number,userId:number) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.getResults(`${this.itemsEndpoint}/locationTransfer/${locationTransferId}/${userId}`, getReqHeaders); 
    } 
    createLocationTransfer(data:any) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.postData(`${this.itemsEndpoint}/locationTransfer`,data, getReqHeaders); 
    }
    deleteLocationTransfer(locationTransferId:number,userId:number) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.deleteData(`${this.itemsEndpoint}/locationTransfer/${locationTransferId}/${userId}`,getReqHeaders); 
    } 
    updateLocationTransfer(data:any) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.putData(`${this.itemsEndpoint}/locationTransfer`,data,getReqHeaders); 
    } 
    
    getItems(displayInput:any) {  
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetItems"}`, getReqHeaders,httpParam); 
    } 

    printDetails(locationTransferId:any, companyId: any)
    { 
      const getReqHeaders = new HttpHeaders();
      return this.apiService.getPDFResults(`${this.itemsEndpoint}/locationTransferPrint/${locationTransferId}/${companyId}`, getReqHeaders);
    }

}


