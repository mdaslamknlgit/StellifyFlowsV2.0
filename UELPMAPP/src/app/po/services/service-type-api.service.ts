import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ServiceTypeDisplayInput } from "../models/service-type.model";

@Injectable({
  providedIn: 'root',
})

export class ServiceTypeAPIService {

  serviceTypeEndpoint: string = `${environment.apiEndpoint}/serviceTypes`;

  constructor(private apiService: ApiService) {
  }

  getServiceTypes(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.serviceTypeEndpoint}`, getReqHeaders, httpParam);
  }

  GetAllServiceTypes(displayItemTypeGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemTypeGrid
    });

    return this.apiService.getResults(`${this.serviceTypeEndpoint}/search`, getReqHeaders, httpParam);
  }

  saveServiceType(serviceType: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.serviceTypeEndpoint}`, serviceType, getReqHeaders);
  }

  updateServiceType(serviceType: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.serviceTypeEndpoint}`, serviceType, getReqHeaders);
  }

  deleteServiceType(serviceTypeId: number): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.serviceTypeEndpoint}/${serviceTypeId}`, reqHeaders);
  }
}


