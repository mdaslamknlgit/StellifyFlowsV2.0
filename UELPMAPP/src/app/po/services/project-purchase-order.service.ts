import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PORSearch } from '../models/purchase-order-request.model';

@Injectable()
export class ProjectPurchaseOrderService
{

    itemsEndpoint : string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { 
  
    }
    /*
     purpose:calling the api method to fetch all purchase orders
    */
    getCostTypes(){
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders/CostTypes`, getReqHeaders,httpParam); 
    }
    getProjectPurchaseOrders(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders`, getReqHeaders,httpParam); 
    }
    getProjectPurchaseOrdersForApproval(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders/approval`, getReqHeaders,httpParam); 
    }
    getProjectPurchaseOrderDetails(projectPurchaseOrderId:number,userId:number) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({});
        return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders/${projectPurchaseOrderId}/${userId}`, getReqHeaders,httpParam); 
    }
    getAllSearchProjectPurchaseOrders(displayInput:PORSearch)
    {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:<any> displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders/Search`, getReqHeaders,httpParam); 
    } 
    createProjectPurchaseOrder(data:any,files:any) {   
        let getReqHeaders = new HttpHeaders();
        let formData:FormData = new FormData();  
        files.forEach(element => {
          formData.append('file[]',element,element.name);  
        });
        formData.append("purchaseOrder",JSON.stringify(data)); 
        return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/projectPurchaseOrders`,formData, getReqHeaders); 
    }
    searchProjectPurchaseOrder(displayInput:any)
    {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/projectPurchaseOrders/search`, getReqHeaders,httpParam); 
    }
    updateProjectPurchaseOrder(data:any,files:any) {   
        let getReqHeaders = new HttpHeaders();
        let formData:FormData = new FormData();  
        files.forEach(element => {
          formData.append('file[]',element,element.name);  
        });
        formData.append("purchaseOrder",JSON.stringify(data)); 
        return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/projectPurchaseOrders`,formData,getReqHeaders); 
    } 
}