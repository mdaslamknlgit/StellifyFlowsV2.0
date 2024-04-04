import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AnimationStyleMetadata } from '@angular/animations';
import { RequestConfig } from '../models/RequestConfig';

@Injectable({
  providedIn: 'root'
})
export class ProjectContractVariationApiService {
  projectContractVariationOrderEndpoint: string = `${environment.apiEndpoint}/projectContractVariationOrder`;
  ApprovalEndpoint: string = `${environment.apiEndpoint}/projectContractVariationApprovals`;
  constructor(private apiService: ApiService) { }

  getProjectContractVariationOrders(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}`, getReqHeaders, httpParam);
  }

  getProjectContractVariationApprovals(displaySupplierGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displaySupplierGrid
    });

    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/approval`, getReqHeaders, httpParam);
  }

  GetAllSearchProjectContractVariationOrders(displaySupplierGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displaySupplierGrid
    });

    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/search`, getReqHeaders, httpParam);
  }

  getProjectContractVariationOrderById(projectContractVariationOrderId: number, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/${projectContractVariationOrderId}/${companyId}`, getReqHeaders);
  }

  getProjectContractCostTypes(projectContractMasterId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/costTypes/${projectContractMasterId}`, getReqHeaders);
  }

  getProjectContractApportionmentMethods(projectContractMasterId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/apportionment/${projectContractMasterId}`, getReqHeaders);
  }

  createProjectContractVariationOrder(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("purchaseOrder", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.projectContractVariationOrderEndpoint}`, formData, getReqHeaders);
  }

  updateProjectContractVariationOrder(variationOrder: any): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.projectContractVariationOrderEndpoint}/`, variationOrder, reqHeaders);
  }
  getVOList(requestConfig: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: requestConfig
    });
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/getVOList`, getReqHeaders, httpParam);
  }
  getVODetailsbyId(POPId: number, VOId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.projectContractVariationOrderEndpoint}/getVODetailsbyId/${POPId}/${VOId}`, getReqHeaders);
  }
}
