import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class CompanyApiService {
  companyEndpoint: string = `${environment.apiEndpoint}/company`;
  organizationEndpoint: string = `${environment.apiEndpoint}/GetOrganizations`;
  constructor(private apiService: ApiService) { }

  createCompany(companyObj): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return this.apiService.postData(this.companyEndpoint,companyObj,reqHeaders);
  }

  updateCompany(companyObj: any): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.companyEndpoint}/`, companyObj, reqHeaders);
  }
  getCompanies(companyGrid: any) {
    let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: companyGrid
        });
        return this.apiService.getResults(`${this.companyEndpoint}`, getReqHeaders, httpParam);
  }
  getCompanyById(companyId: Number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.companyEndpoint}/${companyId}`, getReqHeaders);
  }
  deleteCompany(companyId: Number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.companyEndpoint}/${companyId}`, getReqHeaders);
  }
  getOrganizations() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.organizationEndpoint}`, getReqHeaders);
  }
  getAllSearchCompanies(companyGrid: any) {
    let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: companyGrid
        });
        return this.apiService.getResults(`${this.companyEndpoint}/search`, getReqHeaders, httpParam);
  }
  getAllSearchCompaniesFilter(companyGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
        fromObject: companyGrid
    });
    return this.apiService.getResults(`${this.companyEndpoint}/searchall`, getReqHeaders, httpParam);
  }
}
