import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkFlowParameter } from '../../administration/models/workflowcomponent';
import { environment } from '../../../environments/environment';
import { ApiService } from '../services/api.service';
import { WorkFlowApproval } from '../models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  endpoint: string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { }
  RecallDocumentApproval(approvalObj: any) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/RecallDocumentApproval`, approvalObj, getReqHeaders);
  }
  VoidDocument(workFlowApproval: any) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/VoidDocument`, workFlowApproval, getReqHeaders);
  }
  checkPendingDocuments(document: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/checkPendingDocuments`, document, getReqHeaders);
  }
  sendForApproval(workFlowDetails: WorkFlowParameter) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/SendDocumentForApproval`, workFlowDetails, getReqHeaders);
  }
  SendForClarificationDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/SendForClarificationDocument`, workFlowDetails, getReqHeaders);
  }
  ReplyDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/ReplyDocument`, workFlowDetails, getReqHeaders);
  }
  RejectDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/RejectDocument`, workFlowDetails, getReqHeaders);
  }
  ApproveDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/ApproveDocument`, workFlowDetails, getReqHeaders);
  }
  CancelApprovalDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/CancelApprovalDocument`, workFlowDetails, getReqHeaders);
  }
  CancelDraftDocument(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/_CancelDraftDocument`, workFlowDetails, getReqHeaders);
  }
  PrintDocument(DocumentId: any, ProcessId: any, CompanyId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.endpoint}/PrintDocument/${DocumentId}/${ProcessId}/${CompanyId}`, getReqHeaders);
  }
  SendDocumentEmail(DocumentId: number, ProcessId: number, CompanyId: number, DepartmentId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.endpoint}/SendDocumentEmail/${DocumentId}/${ProcessId}/${CompanyId}/${DepartmentId}`, getReqHeaders);
  }
  UpdateDocumentStatus(workFlowDetails: WorkFlowApproval) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.endpoint}/UpdateDocumentStatus`, workFlowDetails, getReqHeaders);
  }
}
