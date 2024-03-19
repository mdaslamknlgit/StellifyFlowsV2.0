import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class LoginService {

  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) {


  }
  /**
   * to get the list of item masters based on key...
   * @param searchKey 
   */
  login(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
   
    return this.apiService.postData(`${this.itemsEndpoint}/Login`, itemObj,getReqHeaders);
  }
}


