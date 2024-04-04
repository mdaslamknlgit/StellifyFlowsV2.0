import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class DeliveryTermsService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getDeliveryTerms(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/deliveryTerms`, getReqHeaders,httpParam); 
  }
 getDeliveryTermDetails(deliveryTermId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/deliveryTerms/${deliveryTermId}`, getReqHeaders); 
  } 
 createDeliveryTerm(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/deliveryTerms`,data, getReqHeaders); 
  }
 deleteDeliveryTerm(deliveryTermId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/deliveryTerms/${deliveryTermId}/${userId}`,getReqHeaders); 
  } 
  updateDeliveryTerm(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/deliveryTerms`,data,getReqHeaders); 
  } 

  getAllDeliveryTerms(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/deliveryTerms/search"}`, getReqHeaders, httpParam);
  }

}


