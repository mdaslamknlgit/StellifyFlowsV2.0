import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DeliveryOrderService 
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
    return this.apiService.getResults(`${this.itemsEndpoint}/deliveryorders`, getReqHeaders,httpParam); 
  }
  getAllSearchPurchaseOrders(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/deliveryorders/Search`, getReqHeaders,httpParam); 
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
 getPurchaseOrderDetails(purchaseOrderId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/deliveryorders/${purchaseOrderId}`, getReqHeaders); 
  } 

 /*
  to create purchase order details..
  */
 createPurchaseOrder(data:any,files:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/deliveryorders`,formData, getReqHeaders); 
  }
 /*
   to delete selected purchase order details..
  */
 deletePurchaseOrder(purchaseOrderId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/deliveryorders/${purchaseOrderId}`,getReqHeaders); 
  } 
 /*
  to update the selected purchase order details...
  */
  updatePurchaseOrder(data:any,files:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/deliveryorders`,formData,getReqHeaders); 
  } 

}


