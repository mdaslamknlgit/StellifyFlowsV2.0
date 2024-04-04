import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})

export class AuditLogAPIService {
    auditLogEndPoint: string = `${environment.apiEndpoint}/auditLogs`;
    constructor(private apiService: ApiService) {
    }
     
    getAuditLogs(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.auditLogEndPoint}/GetAuditLogs`, getReqHeaders,httpParam); 
      }
    filterAuditLog(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.auditLogEndPoint}/search`, getReqHeaders,httpParam); 
      }
      GetAuditLogsByDocumentId(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.auditLogEndPoint}/GetAuditLogsByDocumentId`, getReqHeaders,httpParam); 
      }
}


