import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import { NgxSpinnerService } from 'ngx-spinner';
import { observable } from 'rxjs';
import { SessionStorageService } from './sessionstorage.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(public httpClient: HttpClient ,
    private sessionService: SessionStorageService
    ) {

  }
  results: string[];
  getResultsTest(url: string, reqHeaders: HttpHeaders, reqParams: HttpParams = null) {
    
    const token = "Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q0QHNwYXJzaGNvbS5uZXQiLCJQYXNzd29yZCI6ImFpbXNqdWp1YmUiLCJ1cm46b2F1dGg6c2NvcGUiOiIiLCJuYmYiOjE1MzA3ODExOTAsImV4cCI6MTU2Njc3NzU5MSwiaXNzIjoiaHR0cDovL2FwaWF1dGhlbnRpY2F0aW9udGVzdC5henVyZXdlYnNpdGVzLm5ldC8ifQ.M3iajv5PvTpaHCV1WUN7sIbCLUx7AF28LjTXMX-xSD4";
    reqHeaders = reqHeaders.append('Authorization', `${token}`);
    //let myheaders = new HttpHeaders();
    reqHeaders.append("OData-Version","4.0");
    reqHeaders.append("Content-Type","application/json;odata.metadata=minimal");
   
    // myheaders.append("Accept","application/json");
    //myheaders.append('authorization', `${token}`);

    const results =   this.httpClient.get<any>(url, {headers: reqHeaders});
    return results;
   }
   
  getResults(url: string, reqHeaders: HttpHeaders, reqParams: HttpParams = null, showSpinner?: boolean) {
    if (showSpinner == true) {
      //this.spinnerObj.show();
    }

    // const token = this.sessionService.getToken();
    // reqHeaders = reqHeaders.append('StellifyAuthToken', `${token}`);

    // reqHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0' );  
    // reqHeaders.set('Pragma', 'no-cache' );  
    // reqHeaders.set('Expires', '0' );  
    // reqHeaders.set('If-Modified-Since', '0' );  

    const results = this.httpClient.get(url, { headers: reqHeaders, params: reqParams }).finally(() => {
      if (showSpinner == true) {
        //this.spinnerObj.hide();
      }
    });
    return results;
  }
  getResultss(url: string, reqHeaders: HttpHeaders, reqParams: HttpParams = null) {
    
    //const token = this.sessionService.getToken();
    //reqHeaders = reqHeaders.append('StellifyAuthToken', `${token}`);
    const results =   this.httpClient.get(url, {headers: reqHeaders, params: reqParams});
    return results;
   }

  postData(url: string, body, reqHeaders: HttpHeaders) {
    //this.spinnerObj.show();
    reqHeaders = reqHeaders.append('Content-Type', 'application/json');

    return this.httpClient.post(url, body, { headers: reqHeaders }).map((data) => {
     // this.spinnerObj.hide();
      return data;
    })
    // .finally(() => {
    //   debugger
    //   this.spinnerObj.hide()
    // }
   // );
  }
  postwithExcelData(url: string, body, reqHeaders: HttpHeaders) {
    //this.spinnerObj.show();
    reqHeaders = reqHeaders.append('Content-Type', 'application/json');

    return this.httpClient.post(url, body, { headers: reqHeaders }).map((data) => {
      //this.spinnerObj.hide();
      return data;
    })
    // .finally(() =>
    //   //this.spinnerObj.hide()
    // );
  }



  postDataWithAttachments(url: string, body, reqHeaders: HttpHeaders) {
    //this.spinnerObj.show();
    return this.httpClient.post(url, body, { headers: reqHeaders }).map((data) => {
      //this.spinnerObj.hide();
      return data;
    })
    // .finally(() => {
    //   this.spinnerObj.hide()
    // }
    // );
  }

  putDataWithAttachments(url: string, body, reqHeaders: HttpHeaders) {
    //this.spinnerObj.show();
    return this.httpClient.put(url, body, { headers: reqHeaders }).map((data) => {
      //this.spinnerObj.hide();
      return data;
    })
    // .finally(() =>
    //   //this.spinnerObj.hide()
    // );
  }

  putData(url: string, body, reqHeaders: HttpHeaders, hideNotification?: boolean) {
    if (hideNotification == null || hideNotification == undefined || hideNotification != true) {
      //this.spinnerObj.show();
    }
    reqHeaders = reqHeaders.append('Content-Type', 'application/json');
    return this.httpClient.put(url, body, { headers: reqHeaders }).map((data) => {
      if (hideNotification == null || hideNotification == undefined || hideNotification != true) {
       // this.spinnerObj.hide();
      }
      return data;
    }).finally(() => {
      if (hideNotification == null || hideNotification == undefined || hideNotification != true) {
        //this.spinnerObj.hide();
      }
    });
  }

  deleteData(url: string, reqHeaders: HttpHeaders) {
    //this.spinnerObj.show();
    return this.httpClient.delete(url, { headers: reqHeaders }).map((data) => {
      //this.spinnerObj.hide();
      return data;
    })
    // .finally(() =>
    //   //this.spinnerObj.hide()
    // );
  }

  getPDFResults(url: string, reqHeaders: HttpHeaders, reqParams: HttpParams = null) {
    reqHeaders = reqHeaders.append('Content-Type', 'application/pdf');
    //this.spinnerObj.show();
    const results = this.httpClient.get(url, { headers: reqHeaders, responseType: 'blob', params: reqParams },).map((data) => {
      //this.spinnerObj.hide();
      return data;
    });
    // .finally(() =>
    //   //this.spinnerObj.hide()
    // );
    return results;
  }
}
