import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../shared/services/api.service';
import { environment } from './../../../environments/environment';
import { SalesInvoiceSearch } from '../models/sales-Invoice.model';

@Injectable({
  providedIn: 'root'
})
export class SalesInvoiceService {
  invoiceEndPoint: string = `${environment.apiEndpoint}/SalesInvoice`;
  constructor(private apiService: ApiService, private http: HttpClient) { }
  GetSalesInvoices(config: SalesInvoiceSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.invoiceEndPoint}/GetSalesInvoices`, config, getReqHeaders);
  }
  GetOpenSalesInvoices(config: SalesInvoiceSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.invoiceEndPoint}/GetOpenSalesInvoices`, config, getReqHeaders);
  }
  GetSalesInvoice(id) {
    return this.http.get(`${this.invoiceEndPoint}/GetSalesInvoice/${id}`)
  }
  PostSalesInvoice(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    if (files != '' && files != null) {
      files.forEach(element => {
        formData.append('files[]', element, element.name);
      });
    }
    formData.append("SalesInvoice", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.invoiceEndPoint}/PostSalesInvoice`, formData, getReqHeaders);
  }
  GetInvoicesSearch(search: SalesInvoiceSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.invoiceEndPoint}/GetInvoicesSearch`, search, getReqHeaders);
  }
  ExportSIDocument(DocumentId: any, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.invoiceEndPoint}/ExportSIDocument/${DocumentId}/${userId}`, getReqHeaders);
  }
}
