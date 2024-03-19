import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PaymentTermsService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getPaymentTerms(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/paymentTerms`, getReqHeaders,httpParam); 
  }
 getPaymentTermDetails(paymentTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/paymentTerms/${paymentTermId}`, getReqHeaders); 
  } 
 createPaymentTerm(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/paymentTerms`,data, getReqHeaders); 
  }
 deletePaymentTerm(paymentTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/paymentTerms/${paymentTermId}`,getReqHeaders); 
  } 
  updatePaymentTerm(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/paymentTerms`,data,getReqHeaders); 
  } 

  getAllpaymentTerms(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/paymentTerms/search"}`, getReqHeaders, httpParam);
  }
  convertToPdf() {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({});
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/paymentTermsPdf"}`, getReqHeaders, httpParam);
  }
}


