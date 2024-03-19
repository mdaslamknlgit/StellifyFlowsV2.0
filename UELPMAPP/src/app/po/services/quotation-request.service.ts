import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class QuotationRequestService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
 /*
  purpose:calling the api method to fetch all purchase orders
  */
 getQuotationsRequest(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/QuotationsRequest`, getReqHeaders,httpParam); 
  }

  getAllSearchQuotationRequest(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/QuotationsRequest/search"}`, getReqHeaders, httpParam);
  }

  getFilterQuotationRequest(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/QuotationsRequest/Filter"}`, getReqHeaders, httpParam);
  }

  getQuotationRequestDetails(quotationRequestId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/QuotationsRequest/${quotationRequestId}`, getReqHeaders); 
  } 

  getPurchaseQuotationRequestDetails(purchaseOrderRequestId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/QuotationsRequests/${purchaseOrderRequestId}`, getReqHeaders); 
  } 

  printDetails(quotationRequestId:any, companyId: any)
  { 
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/quotationRequestPrint/${quotationRequestId}/${companyId}`, getReqHeaders);
  }

  sendQuotationRequestMailtoSuppliers(quotationRequestId:number, companyId: number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/sendQuotationRequestMailtoSuppliers/${quotationRequestId}/${companyId}`, getReqHeaders, null,true); 
  } 

  selectQuotation(quotationRequestId:number,quotationId:number)
  {
    
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/SelectQuotation/${quotationRequestId}/${quotationId}`,getReqHeaders);

  }
   /*
   to delete selected quotation request..
  */
  deleteQuotationRequest(quotationRequestId:any,userId:number) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.deleteData(`${this.itemsEndpoint}/QuotationsRequest/${quotationRequestId}/${userId}`,getReqHeaders); 
  } 
/*
  to create quotation request..
  */
  createQuotationRequest(data:any,vendorfiles) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    vendorfiles.forEach((data) => {
      formData.append('file[]',data.File,"Quotation@"+data.RowIndex+"!"+data.File.name);  
    });
    formData.append("quotationRequests",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/QuotationsRequest`,formData, getReqHeaders); 
  }
/*
  to update quotation request..
  */
  updateQuotationRequest(data:any,vendorfiles) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData(); 
    vendorfiles.forEach((data) => {
      formData.append('file[]',data.File,"Quotation@"+data.RowIndex+"!"+data.File.name);  
    }); 
    formData.append("quotationRequests",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/QuotationsRequest`,formData,getReqHeaders); 
  } 

  getAllSearchPurchaseOrders(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrderRequest/Search`, getReqHeaders,httpParam); 
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

    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrderRequest/${purchaseOrderId}`, getReqHeaders); 
  } 

}


