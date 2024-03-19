import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../shared/services/api.service';
import { environment } from './../../../environments/environment';
import { SalesQuotationSearch } from '../models/sales-quotation.model';

@Injectable({
  providedIn: 'root'
})
export class SalesQuotationService {
  quotationEndPoint: string = `${environment.apiEndpoint}/SalesQuotation`;
  constructor(private apiService: ApiService, private http: HttpClient) { }
  GetSalesQuotations(config: SalesQuotationSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.quotationEndPoint}/GetSalesQuotations`, config, getReqHeaders);
  }
  GetSalesQuotation(id) {
    return this.http.get(`${this.quotationEndPoint}/GetSalesQuotation/${id}`)
  }
  PostSalesQuotation(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    if (files != '' && files != null) {
      files.forEach(element => {
        formData.append('files[]', element, element.name);
      });
    }
    formData.append("SalesQuotation", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.quotationEndPoint}/PostSalesQuotation`, formData, getReqHeaders);
  }
  PostSalesQuotationBillingInfo(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    if (files != '' && files != null) {
      files.forEach(element => {
        formData.append('files[]', element, element.name);
      });
    }
    formData.append("SalesQuotation", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.quotationEndPoint}/PostSalesQuotationBillingInfo`, formData, getReqHeaders);
  }
  PostSalesQuotationCustomerInfo(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.quotationEndPoint}/PostSalesQuotationCustomerInfo`, data, getReqHeaders);
  }
  GetQuotationsSearch(search: SalesQuotationSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.quotationEndPoint}/GetQuotationsSearch`, search, getReqHeaders);
  }
}