import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SupplierPaymentService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }

  getSupplierPayment(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/SupplierPayment`, getReqHeaders,httpParam); 
  }

  getSupplierPaymentDetails(supplierPaymentId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/SupplierPayment/${supplierPaymentId}`, getReqHeaders); 
  } 

  getEditSupplierPaymentDetails(supplierPaymentId:number,supplierId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/SupplierPayment/${supplierPaymentId}/${supplierId}`, getReqHeaders); 
  } 

  getInvoicewithSupplierdetails(supplierId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/SupplierPayments/${supplierId}`, getReqHeaders); 
  } 

  getSupplier(supplierId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetSupplier/${supplierId}`, getReqHeaders); 
  }
  
  getAllSuppliersinSupplierPayment(searchInput:any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allsupplierspayment`, getReqHeaders,httpParam);
  }

  createSupplierPayment(data:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    formData.append("supplierPayment",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/SupplierPayment`,formData, getReqHeaders); 
  }

  updateSupplierPayment(data:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    formData.append("supplierPayment",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/SupplierPayment`,formData, getReqHeaders); 
  }

  deleteSupplierPayment(supplierPaymentId:any,userId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/SupplierPayment/${supplierPaymentId}/${userId}`,getReqHeaders); 
  }  
  //////////////////////////
  getSupplierPayments(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierpayment`, getReqHeaders,httpParam); 
  }

  getAllSearchSupplierPayments(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/supplierpayment/Search`, getReqHeaders,httpParam); 
  }  

  getPDFoucher(supplierPaymentId: number, companyId: number)
  {   
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/paymentVoucherPrint/${supplierPaymentId}/${companyId}`, getReqHeaders);
  }
}


