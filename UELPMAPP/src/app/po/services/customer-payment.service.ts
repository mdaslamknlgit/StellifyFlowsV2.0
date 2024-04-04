import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CustomerPaymentAPIService {
    customerPaymentEndpoint: string = `${environment.apiEndpoint}/customerPayment`;
    constructor(private apiService: ApiService) {
    }

    getCustomerPayments(displayInput: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });

        return this.apiService.getResults(`${this.customerPaymentEndpoint}`, getReqHeaders, httpParam);
    }
    
    getAllSearchCustomerPayments(displayInput: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });

        return this.apiService.getResults(`${this.customerPaymentEndpoint}/search`, getReqHeaders, httpParam);
    }

    getAllFilteredCustomerPayments(displayInput: any) {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject: displayInput
        });
        return this.apiService.getResults(`${this.customerPaymentEndpoint}/searchAll`, reqHeaders, httpParam);
      }
    

    getCustomerPaymentDetails(customerPaymentId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.customerPaymentEndpoint}/${customerPaymentId}`, getReqHeaders);
    }
    
    createCustomerPayment(customerPayment: any) {
        let getReqHeaders = new HttpHeaders();      
        return this.apiService.postData(`${this.customerPaymentEndpoint}`, customerPayment, getReqHeaders);      
    }

    updateCustomerPayment(customerPayment: any) {
        let getReqHeaders = new HttpHeaders();      
        return this.apiService.putData(`${this.customerPaymentEndpoint}`, customerPayment, getReqHeaders);
    }

    deleteCustomerPayment(customerPaymentId: any) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.customerPaymentEndpoint}/${customerPaymentId}`, getReqHeaders);
    }  

    getCustomerPaymentsSummary(customerPaymentId: number, customerId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.customerPaymentEndpoint}/${customerPaymentId}/${customerId}`, getReqHeaders);
    }

    getPDFoucher(customerPaymentId: number, companyId: number) {
        const getReqHeaders = new HttpHeaders();
        return this.apiService.getPDFResults(`${this.customerPaymentEndpoint}/paymentVoucherPrint/${customerPaymentId}/${companyId}`, getReqHeaders);
    }

    getInvoiceDetailsByCustomer(customerId: number) {
        let getReqHeaders = new HttpHeaders();

        return this.apiService.getResults(`${this.customerPaymentEndpoint}/${customerId}`, getReqHeaders);
    }  

    getCustomerInvoices(customerId:number) {   
        let getReqHeaders = new HttpHeaders();    
        return this.apiService.getResults(`${this.customerPaymentEndpoint}/invoices/${customerId}`, getReqHeaders); 
      } 
}


