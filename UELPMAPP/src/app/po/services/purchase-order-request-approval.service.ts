import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PORequestApprovalService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getPurchaseOrderRequests(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderRequestsApproval`, getReqHeaders,httpParam); 
  }
  getAllSearchPurchaseOrders(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderRequestsApproval/search`, getReqHeaders,httpParam); 
  }
  getPurchaseOrderDetails(purchaseOrderRequestId:number,processId,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderRequestsApproval/${purchaseOrderRequestId}/${processId}/${userId}`, getReqHeaders); 
  }
  updatePurchaeOrderApprovalStatus(input:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrderRequestsApproval/`,input, getReqHeaders); 
  }

  printDetails(purchaseOrderRequestId:number,processId:number, companyId: number)
  {   
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/purchaseOrderRequestApprovalPrint/${purchaseOrderRequestId}/${processId}/${companyId}`, getReqHeaders);
  }
}


