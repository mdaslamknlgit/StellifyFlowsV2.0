import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class POApprovalService 
{
    itemsEndpoint : string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { 
 
    }
   /*
    purpose:calling the api method to fetch all purchase orders
    */
    getPurchaseOrdersApprovals(displayInput:any) {   
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderApprovals`, getReqHeaders,httpParam); 
    }

   /*
    purpose:calling the api method to search for  purchase order approvals
   */
   searchForPurchaseOrdersApprovals(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderApprovals/Search`, getReqHeaders,httpParam); 
  }

  updatePurchaseOrderApprovalStatus(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrderApprovals`,displayInput,getReqHeaders); 
  }
}