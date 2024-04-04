import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SchedulerNoService {
  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService, private http: HttpClient) {

  }

  GetSchedulerNo() {
    return this.http.get(`${this.itemsEndpoint}/schedulerno`);
  }

  GetSchedulerByType(Type: string) {
    return this.http.get(`${this.itemsEndpoint}/GetSchedulerByType/${Type}`);
  }

  CheckSchedulerNo(schedule) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/CheckSchedulerNo`, schedule, getReqHeaders);
  }

  GetSchedulerNoById(SchedulerNoId) {
    return this.http.get(`${this.itemsEndpoint}/GetGetSchedulerNoById/` + SchedulerNoId);
  }

  DeleteSchedulerNo(SchedulerNoId, Updateby) {
    return this.http.get(`${this.itemsEndpoint}/DeleteSchedulerNo/${SchedulerNoId}/${Updateby}`);
  }
  ChangeStatus(data: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append("PostSchedulerNo", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/ChangeStatus`, formData, getReqHeaders);
  }

  PostSchedulerNo(data: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append("PostSchedulerNo", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/PostSchedulerNo`, formData, getReqHeaders);
  }
  GetScheduleCategories() {
    return this.http.get(`${this.itemsEndpoint}/GetScheduleCategories`);
  }
  GetScheduleTypes() {
    return this.http.get(`${this.itemsEndpoint}/GetScheduleTypes`);
  }
}
