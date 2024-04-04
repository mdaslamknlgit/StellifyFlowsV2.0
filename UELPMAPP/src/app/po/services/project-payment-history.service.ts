import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PORSearch } from '../models/purchase-order-request.model';
import { ReportParams } from '../models/project-payment-history.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectPaymentMasterService {
  itemsEndpoint: string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) {

  }
  createProjectPaymentContract(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("purchaseOrder", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/projectPaymentContract`, formData, getReqHeaders);
  }
  getCertificatesByPaymentContractId(POPId: number, PaymentContractId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getCertificatesByPaymentContractId/${POPId}/${PaymentContractId}`, getReqHeaders);
  }
  getProjectPaymentContracts(requestConfig: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: requestConfig
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/getProjectPaymentContracts`, getReqHeaders, httpParam);
  }
  CheckPendingApprovals(POPId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/CheckPendingApprovals/${POPId}`, getReqHeaders);
  }

  getPaymentListFilterData(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/projectPaymentList/filter`, getReqHeaders, httpParam);
  }

  getProjectPaymentReport(docs: ReportParams) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/getProjectPaymentReport`, docs, getReqHeaders);
  }
}