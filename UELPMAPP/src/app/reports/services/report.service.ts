import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../shared/services/api.service';
import { environment } from './../../../environments/environment';
import { ReportParameter } from '../models/report-parameter';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  reportsEndPoint: string = `${environment.apiEndpoint}/Reports`;
  constructor(private apiService: ApiService, private http: HttpClient) { }
  GetReportData(params: ReportParameter) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.reportsEndPoint}/GetReportData`, params, getReqHeaders);
  }
  GetParamData(userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.reportsEndPoint}/GetParamData/${userId}`, getReqHeaders);
  }
}