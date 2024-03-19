import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable({
    providedIn: 'root',
})
export class CustomerApiService {
    customersEndpoint: string = `${environment.apiEndpoint}/customers`;
    customerCategoriesEndpoint: string = `${environment.apiEndpoint}/customerCategories`;
    gstEndPoint: string = `${environment.apiEndpoint}/GSTStatus`;
    currenciesEndpoint: string = `${environment.apiEndpoint}/currencies`;
    constructor(private apiService: ApiService) { }

    getCustomers(customerGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: customerGrid
        });

        return this.apiService.getResults(`${this.customersEndpoint}`, getReqHeaders, httpParam);
    }

    GetAllSearchCustomers(customerGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: customerGrid
        });

        return this.apiService.getResults(`${this.customersEndpoint}/search`, getReqHeaders, httpParam);
    }

    getCustomerById(customerId: Number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.customersEndpoint}/${customerId}`, getReqHeaders);
    }

    createCustomer(customerObj): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.postData(this.customersEndpoint, customerObj, reqHeaders);
    }

    updateCustomer(customerObj: any): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.customersEndpoint}/`, customerObj, reqHeaders);
    }

    deleteCustomer(customerId: number): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.customersEndpoint}/${customerId}`, reqHeaders);
    }

    getCustomerCategories() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.customerCategoriesEndpoint, getReqHeaders);
      } 
}

