import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExpensePOService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
 /*
  purpose:calling the api method to fetch all purchase orders
  */
  getPurchaseOrders(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/expensePurchaseOrders`, getReqHeaders,httpParam); 
  }
  getAllSearchPurchaseOrders(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/expensePurchaseOrders/SearchAll`, getReqHeaders,httpParam); 
  } 
 /*
  to get the purchase order details.
 */
 getPurchaseOrderDetails(purchaseOrderId:number, companyId: number, isApprovalPage?:boolean,userId?:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/expensePurchaseOrders/${purchaseOrderId}/${userId}/${companyId}`, getReqHeaders); 
  } 
 /*
  to create purchase order details..
  */
 createPurchaseOrder(data:any,files:any,quotationFiles:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    quotationFiles.forEach(data => {
      formData.append('file[]',data.File,"EXPOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/expensePurchaseOrders`,formData, getReqHeaders); 
  }
 /*
   to delete selected purchase order details..
  */
 deletePurchaseOrder(purchaseOrderId:any,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/expensePurchaseOrders/${purchaseOrderId}/${userId}`,getReqHeaders); 
  } 
 /*
  to update the selected purchase order details...
  */
  updatePurchaseOrder(data:any,files:any,quotationFiles:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    quotationFiles.forEach(data => {
      formData.append('file[]',data.File,"EXPOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/expensePurchaseOrders`,formData,getReqHeaders); 
  
  }

  printDetails(purchaseOrderId:any, purchaseOrderTypeId: any, companyId: any)
  {   
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/purchaseOrderPrint/${purchaseOrderId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders);
  }

  sendPurchaseOrderMailtoSupplier(purchaseOrderId:number, companyId: number, purchaseOrderTypeId:number) {      
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/expensePurchaseOrders/sendPurchaseOrderMailtoSupplier/${purchaseOrderId}/${companyId}/${purchaseOrderTypeId}`, getReqHeaders,null,true); 
  }
  updatePurchaseOrderApprovalStatus(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrderStatusUpdate`,displayInput,getReqHeaders); 
  }
}


