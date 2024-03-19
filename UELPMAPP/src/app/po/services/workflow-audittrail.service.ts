import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { WorkflowAuditTrail } from '../models/workflow-audittrail.model';

@Injectable()
export class WorkflowAuditTrailService {

    workFlowAuditEndPoint : string = `${environment.apiEndpoint}`;
    constructor(private apiService: ApiService) { 
    

    }
    getWorkFlowAuditTrails(displayInput:any) {
    
        let getReqHeaders = new HttpHeaders();
    
        let httpParam = new HttpParams({
    
          fromObject:displayInput
    
        });
        return this.apiService.getResults(this.workFlowAuditEndPoint+`${"/WorkflowAuditTrail"}`, getReqHeaders,httpParam); 
      } 
      createTax(workflowAuditTrailObj:WorkflowAuditTrail): Observable<any> {
        let reqHeaders = new HttpHeaders();
         return this.apiService.postData(`${this.workFlowAuditEndPoint}`+`${"/CreateTax"}`, workflowAuditTrailObj, reqHeaders);  
      }
}