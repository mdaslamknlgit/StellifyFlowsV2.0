import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FixedAssetPurchaseOrderService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
 /*
  purpose:calling the api method to fetch all purchase orders
  */
  getFixedAssetPurchaseOrders(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/fixedAssetPurchaseOrders`, getReqHeaders,httpParam); 
  }
  getAssets(displayInput:any){
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
        fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allAssets`, getReqHeaders,httpParam); 
  }
 /*
  to get the purchase order details.
 */
 getPurchaseOrderDetails(purchaseOrderId:number, companyId: number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/fixedAssetPurchaseOrders/${purchaseOrderId}/${companyId}`, getReqHeaders); 
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
      formData.append('file[]',data.File,"APOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/fixedAssetPurchaseOrders`,formData, getReqHeaders); 
  }
 /*
   to delete selected purchase order details..
  */
 deletePurchaseOrder(purchaseOrderId:any,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/fixedAssetPurchaseOrders/${purchaseOrderId}/${userId}`,getReqHeaders); 
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
      formData.append('file[]',data.File,"APOFiles@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("purchaseOrder",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/fixedAssetPurchaseOrders`,formData,getReqHeaders); 
  
  }
  printDetails(purchaseOrderId:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderPrint/${purchaseOrderId}`, getReqHeaders); 
  }
  sendForApproval(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/fixedAssetPurchaseOrders/sendForApproval`,displayInput, getReqHeaders); 
  }
}


