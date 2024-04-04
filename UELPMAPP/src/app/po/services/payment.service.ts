import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/Payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  paymentsEndpoint: string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { }
  uploadPayments(file: File) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.apiService.postDataWithAttachments(`${this.paymentsEndpoint}/UploadPayments`, formData, reqHeaders);
  }
  SavePayments(payments: Payment[], userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.paymentsEndpoint}/SavePayments/${userId}`, payments, getReqHeaders);
  }
  getPaymentDetails(InvoiceId: number, companyId: number, ProcessId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.paymentsEndpoint}/GetPaymentDetails/${InvoiceId}/${companyId}/${ProcessId}`, getReqHeaders);
  }
}
