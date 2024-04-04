import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../shared/services/api.service';
import { environment } from './../../../environments/environment';
import { SalesCustomerSearch } from '../models/customer-master.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  customerEndPoint: string = `${environment.apiEndpoint}/Customer`;
  constructor(private apiService: ApiService, private http: HttpClient) { }
  GetCustomers(config: SalesCustomerSearch) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.customerEndPoint}/GetCustomers`, config, getReqHeaders);
  }
  GetCustomer(id) {
    return this.http.get(`${this.customerEndPoint}/GetCustomer/${id}`)
  }
  PostCustomer(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    if (files != '' && files != null) {
      files.forEach(element => {
        formData.append('files[]', element, element.name);
      });
    }
    formData.append("Customer", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.customerEndPoint}/PostCustomer`, formData, getReqHeaders);
  }
  uploadCustomers(file: File,CompanyId:number) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.apiService.postDataWithAttachments(`${this.customerEndPoint}/UploadCustomers/${CompanyId}`, formData, reqHeaders);
  }
  PostCustomers(file: Blob, UserId: number, CompanyId: number) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append('file', file);
    return this.apiService.postDataWithAttachments(`${this.customerEndPoint}/PostCustomers/${UserId}/${CompanyId}`, formData, reqHeaders);
  }
}
