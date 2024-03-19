import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map'

import 'rxjs/add/operator/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


import { MarketingList } from '../models/crm.models';
import { ListByEmail } from '../models/ListByEmails';

@Injectable({providedIn: 'root'})
export class ListserviceService {
  static nextEmailListId = 100;
  private _webApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient, private apiService: ApiService) { }
  
  // IEnumerable<ListDTO> GetList(UserInfo MyUserInfo);
  // ListDTO GetListInfo(int Id, UserInfo MyUserInfo);
  // int CreateList(ListDTO listDTO, UserInfo MyUserInfo);
  // ListDTO UpdateList(ListDTO listDTO, UserInfo MyUserInfo);
  // int DeleteList(int Id, UserInfo MyUserInfo);
  // int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo);

  //let fileUploadRoute = environment.apiEndpoint + "CSVAutomapUpload1" + `/${0}/${this.UserId}`;
  UploadFile(data: any, files: any,UserId:any,CompanyId:any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();

    // files.forEach(element => {
    //   formData.append('file[]', element, element.name);
    // });

    //formData.append("salesOrder", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this._webApiUrl}/AutoMap/CSVAutomapUpload/${UserId}/${CompanyId}`, data, reqHeaders);
  }

  CreateList(listDTO :any ,tenantId:number,userId: number)
  {
    const getReqHeaders = new HttpHeaders();
    
    return  this.apiService.postData(`${this._webApiUrl}/list/CreateList/${tenantId}/${userId}`,listDTO, getReqHeaders);  
  }
  CreateListWithEmails(listbyemail :ListByEmail ,tenantId:number,userId: number)
  {
    const getReqHeaders = new HttpHeaders();
    
    return  this.apiService.postData(`${this._webApiUrl}/list/CreateListWithEmails/${tenantId}/${userId}`,listbyemail, getReqHeaders);  
  }

  UpdateList(listDTO :any ,tenantId:number,userId: number)
  {
    const getReqHeaders = new HttpHeaders();
    return  this.apiService.postData(`${this._webApiUrl}/list/UpdateList/${tenantId}/${userId}`,listDTO, getReqHeaders);  
  }
  MoveToList(EmailIds: any, listId: number, tenantId: number, userId: number) {

    const getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}/list/MoveToList/${EmailIds}/${listId}/${tenantId}/${userId}`,  getReqHeaders);
  }
  GetList(tenantId:number,userId: number): Observable<any> {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}/list/getlist/${tenantId}/${userId}`, getReqHeaders); 

  }

  GetListWithEmailDetails(tenantId:number,userId: number): Observable<any> {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}list/GetListWithEmailDetails/${tenantId}/${userId}`, getReqHeaders); 

  }

  
  GetRecipients(RecipientType:string): Observable<any> {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}list/GetRecipients/${RecipientType}`, getReqHeaders); 

  }

  GetListDetails(Id:number): Observable<any> {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}list/GetListDetails/${Id}`, getReqHeaders); 

  }

  GetList1(tenantId:number,userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}list/getlist/${tenantId}/${userId}`, getReqHeaders); 
    //return this.apiService.getResults(this._webApiUrl+'GetEmails', getReqHeaders); 
  } 
  
  GetListById(tenantId:number,userId: number,listId:number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this._webApiUrl}list/getlist/${tenantId}/${userId}`, getReqHeaders); 
    //return this.apiService.getResults(this._webApiUrl+'GetEmails', getReqHeaders); 
  } 

  private extractString(res: Response) {
    let body = res.json();
    return body || [];
  }


  private extractUpdateData(res: Response) {
    let body = res.json();
    return body || [];
  }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }



}
