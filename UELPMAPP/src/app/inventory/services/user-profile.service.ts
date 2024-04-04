import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserProfileService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}/items`;

  constructor(private apiService: ApiService) { 



  }

 /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */
  getUserProfile(itemId: Number) {   


    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/${itemId}`, getReqHeaders); 

  } 

   /*
  
  purpose:calling the api method to fetch the details of the selected item type...

  */

 saveUserProfile(data:any) {   

    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}`,data, getReqHeaders); 

  } 


}


