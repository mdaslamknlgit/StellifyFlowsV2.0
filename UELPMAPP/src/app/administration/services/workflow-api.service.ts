import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable({
    providedIn: 'root',
})
export class WorkFlowApiService {
    workFlowConfigurationEndpoint: string = `${environment.apiEndpoint}/workFlowConfigurations`;
    workFlowProcessesEndpoint: string = `${environment.apiEndpoint}/workFlowProcesses`;
    usersEndpoint: string = `${environment.apiEndpoint}/GetUser`;
    documentworkflowEndpoint: string = `${environment.apiEndpoint}/documentWorkFlow`;
    constructor(private apiService: ApiService) { }

    // getWorkFlowProcesses(searchKey: string) {
    //     let getReqHeaders = new HttpHeaders();
    //     return this.apiService.getResults( `${this.workFlowProcessesEndpoint}/${searchKey}`, getReqHeaders);
    // }

    getWorkFlowProcesses(searchKey: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: searchKey
        });
        return this.apiService.getResults(`${this.workFlowProcessesEndpoint}`, getReqHeaders, httpParam);
    }

    getUsers() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.usersEndpoint, getReqHeaders);
    }

    getWorkFlowConfigurations(displayInput: any) {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });

        return this.apiService.getResults(`${this.workFlowConfigurationEndpoint}/byCompany`, reqHeaders, httpParam);
    }

    getAllSearchWorkFlowConfigurations(displayInput: any) {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });
        return this.apiService.getResults(`${this.workFlowConfigurationEndpoint}/searchAll`, reqHeaders, httpParam);
    }

    getWorkFlowConfiguationId(workFlowConfigurationId: Number, companyId: number, locationId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.workFlowConfigurationEndpoint}/${workFlowConfigurationId}/${companyId}/${locationId}`, getReqHeaders);
    }

    DeleteWorkFlowConfiguration(workFlowConfiguration: any) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.workFlowConfigurationEndpoint}/DeleteWorkFlowConfiguration`, workFlowConfiguration, getReqHeaders);
    }

    createWorkFlow(workFlowObj): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.postData(this.workFlowConfigurationEndpoint, workFlowObj, reqHeaders);
    }

    updateWorkFlow(workFlowObj: any): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.workFlowConfigurationEndpoint}/`, workFlowObj, reqHeaders);
    }

    getDocumentWorkFlow(documentWorkFlowObj): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.postData(this.documentworkflowEndpoint, documentWorkFlowObj, reqHeaders);
    }


}

