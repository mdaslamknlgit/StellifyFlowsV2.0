import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({providedIn: 'root'})
export class POCreationService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  //debugger;
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
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders`, getReqHeaders,httpParam); 
  }
  getAllSearchPurchaseOrders(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders/SearchAll`, getReqHeaders,httpParam); 
  } 
   /*
  purpose:calling the api method to fetch all purchase orders
  */
 getPurchaseOrderTypes() {   
    let getReqHeaders = new HttpHeaders();
    //debugger;
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrderTypes`,getReqHeaders); 
  }
  /*
  purpose:calling the api method to departments
  */
  getDepartments() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/Departments`,getReqHeaders); 
  }
  
  /**
   * to get the cost of service types.
   */
  getCostOfServiceTypes(){
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/CostOfServiceTypes`,getReqHeaders); 
  }
 /*
  to get the purchase order details.
 */
 getPurchaseOrderDetails(purchaseOrderId:number, companyId: number, isApprovalPage?:boolean,userId?:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders/${purchaseOrderId}/${companyId}/${userId}`, getReqHeaders); 
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
      formData.append('file[]',data.File,"SPOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/PurchaseOrders`,formData, getReqHeaders); 
  }
 /*
   to delete selected purchase order details..
  */
 deletePurchaseOrder(purchaseOrderId:any,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/PurchaseOrders/${purchaseOrderId}/${userId}`,getReqHeaders); 
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
      formData.append('file[]',data.File,"SPOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/PurchaseOrders`,formData,getReqHeaders); 
  
  }
  // printDetails(purchaseOrderId:any)
  // {
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderPrint/${purchaseOrderId}`, getReqHeaders); 
  // }

  printDetails(purchaseOrderId:any, purchaseOrderTypeId: any, companyId: any)
  {   
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/purchaseOrderPrint/${purchaseOrderId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders);
  }

  sendPurchaseOrderMailtoSupplier(purchaseOrderId:number, companyId: number, purchaseOrderTypeId:number) {      
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrders/sendPurchaseOrderMailtoSupplier/${purchaseOrderId}/${companyId}/${purchaseOrderTypeId}`, getReqHeaders,null,true); 
  }

  //sendPurchaseOrderMailtoSupplierContactPerson(emailIds:string,purchaseOrderId:number, companyId: number, purchaseOrderTypeId:number) {      
  //   sendPurchaseOrderMailtoSupplierContactPerson(displayInput:any) {      
  //   let getReqHeaders = new HttpHeaders();
  //   let httpParam = new HttpParams({
  //     fromObject:displayInput
  //   });
  //   //return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrders/sendPurchaseOrderMailtoSupplierContactPerson/${emailIds}/${purchaseOrderId}/${companyId}/${purchaseOrderTypeId}`, getReqHeaders,null,true); 
  //   return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders/sendPurchaseOrderMailtoSupplierContactPerson`, getReqHeaders,httpParam);
  // }

  sendPurchaseOrderMailtoSupplierContactPerson(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.putData(`${this.itemsEndpoint}/PurchaseOrders/sendPurchaseOrderMailtoSupplierContactPerson`, displayInput,getReqHeaders);
  }

  sendForApproval(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.putData(`${this.itemsEndpoint}/PurchaseOrders/SendForApproval`, displayInput,getReqHeaders);
  }
  updatePurchaseOrderApprovalStatus(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/purchaseOrderStatusUpdate`,displayInput,getReqHeaders); 
  }

  recallPoApproval(approvalObj:any)
  {
    const getReqHeaders = new HttpHeaders();
    //let httpParam = new HttpParams({});
    return this.apiService.postData(`${this.itemsEndpoint}/purchaseOrder/recallPoApproval`, approvalObj, getReqHeaders);
  }

}


