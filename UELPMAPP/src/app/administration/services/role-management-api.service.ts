import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})
export class RoleManagementApiService {
    rolesEndpoint: string = `${environment.apiEndpoint}/rolesManager`;
    constructor(private apiService: ApiService) { }

    getPageModules() {
        let getReqHeaders = new HttpHeaders();     
        return this.apiService.getResults(`${environment.apiEndpoint}/pageModules`, getReqHeaders);
    }

    getRoles(displayRoleGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayRoleGrid
        });

        return this.apiService.getResults(`${this.rolesEndpoint}`, getReqHeaders, httpParam);
    }

    GetAllSearchRoles(displayRoleGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayRoleGrid
        });

        return this.apiService.getResults(`${this.rolesEndpoint}/search`, getReqHeaders, httpParam);
    }

    getRoleById(roleId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.rolesEndpoint}/${roleId}`, getReqHeaders);
    }

    
    createRole(roleObj: any) {
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();      

        formData.append("role", JSON.stringify(roleObj));
        return this.apiService.postDataWithAttachments(`${this.rolesEndpoint}`, formData, reqHeaders);
    }

    updateRole(roleObj: any): Observable<any> {     
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();      

        formData.append("role", JSON.stringify(roleObj));
        return this.apiService.putDataWithAttachments(`${this.rolesEndpoint}`, formData, reqHeaders);       
    }

    deleteRole(roleId: number): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.rolesEndpoint}/${roleId}`, reqHeaders);
    }

}

