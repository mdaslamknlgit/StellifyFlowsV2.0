import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PORSearch } from '../models/purchase-order-request.model';

@Injectable()
export class PurchaseOrderRequestService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
 /*
  purpose:calling the api method to fetch all purchase orders
  */
  getPurchaseOrdersRequest(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrdersRequest`, getReqHeaders,httpParam); 
  }
  getAllSearchPurchaseOrdersRequest(displayInput:PORSearch)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:<any> displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrdersRequest/Search`, getReqHeaders,httpParam); 
  } 
   /*
  purpose:calling the api method to fetch all purchase orders
  */
 getPurchaseOrderTypes() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrderTypes`,getReqHeaders); 
  }
  /*
  purpose:calling the api method to departments
  */
  getDepartments() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/PORequestDepartments`,getReqHeaders); 
  }
  
  /**
   * to get the cost of service types.
   */
  getCostOfServiceTypes(){
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/PORequestCostOfServiceTypes`,getReqHeaders); 
  }
 /*
  to get the purchase order details.
 */
 getPurchaseOrderRequestDetails(purchaseOrderRequestId:number,processId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrdersRequest/${purchaseOrderRequestId}/${processId}`, getReqHeaders); 
  } 

  sendPurchaseOrderMailtoSupplier(purchaseOrderRequestId:number, companyId: number,processId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/sendPurchaseOrderMailtoSupplier/${purchaseOrderRequestId}/${companyId}/${processId}`, getReqHeaders); 
  } 

 /*
  to create purchase order request details..
  */
 createPurchaseOrderRequest(data:any,files:any,vendorfiles) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    vendorfiles.forEach((data) => {
      formData.append('file[]',data.File,"Quotation@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrderRequest",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/PurchaseOrdersRequest`,formData, getReqHeaders); 
  }
 /*
   to delete selected purchase order details..
  */
 deletePurchaseOrderRequest(purchaseOrderRequestId:any,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/PurchaseOrdersRequest/${purchaseOrderRequestId}/${userId}`,getReqHeaders); 
  } 
 /*
  to update the selected purchase order details...
  */
  updatePurchaseOrderRequest(data:any,files:any,vendorfiles) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    vendorfiles.forEach((data) => {
      formData.append('file[]',data.File,"Quotation@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrderRequest",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/PurchaseOrdersRequest`,formData,getReqHeaders); 
  } 

  printDetails(purchaseOrderRequestId:any, companyId: any,processId:number)
  {   
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/purchaseOrderRequestPrint/${purchaseOrderRequestId}/${companyId}/${processId}`, getReqHeaders);
  }
  updatePurchaseOrderStatus(input:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrderRequestStatusUpdate/`,input, getReqHeaders); 
  }
  sendForApproval(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrdersRequest/sendForApproval`,displayInput, getReqHeaders); 
  }
  getFilterPurchaseOrderRequest(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/PurchaseOrdersRequest/Filter"}`, getReqHeaders, httpParam);
  }
}


