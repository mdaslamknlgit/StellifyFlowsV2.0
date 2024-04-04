import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
// import { UserDetails } from 'src/app/shared/models/shared.model';
@Injectable({
  providedIn: 'root',
})
export class WorkFlowReAssignmentAPIService {
  workFlowReAssignmentEndpoint: string = `${environment.apiEndpoint}/workFlowReAssignment`;
  constructor(private apiService: ApiService) { }

  getUserWorkFlowReAssignDetails(userId: number, companyId: number) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.workFlowReAssignmentEndpoint}/${userId}/${companyId}`, reqHeaders);
  }

  createWorkFlowReAssignment(workFlowReAssignObj: any) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.workFlowReAssignmentEndpoint}`, workFlowReAssignObj, reqHeaders);
  }

  printDetails(workFlowReAssignData: any) {
    const getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: workFlowReAssignData
    });

    return this.apiService.getPDFResults(`${this.workFlowReAssignmentEndpoint}/print`, getReqHeaders, httpParam);
  }
  VerifyAlternateUser(currentUserId: number, alternateUserId: number) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.workFlowReAssignmentEndpoint}/VerifyAlternateUser/${currentUserId}/${alternateUserId}`, reqHeaders);
  }
}

