import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FacilityManagementService {

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) {

   }

   //get facility data
   getFacilityManagement(displayInput:any) {  

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/FacilityManagement"}`, getReqHeaders,httpParam); 
  } 

  getfacilityDetails(facilityId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/FacilityManagement/${facilityId}`, getReqHeaders); 
  } 

  getCustomersDetails(customerId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/FacilityManagements/${customerId}`, getReqHeaders); 
  } 


  getFacilityManagementById(displayInput:any) {  

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetFacilityManagementById"}`, getReqHeaders,httpParam); 
  } 

  //delete facility  record
   //   Delete data
   deleteFacilityManagement(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}`+`${"/FacilityManagement/"}`+data, getReqHeaders); 
  }

   // saving data
   createFacilityManagement(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}`+`${"/FacilityManagement"}`,data, getReqHeaders); 
  } 

  
    //   Update Data
    updateFacilityManagement(data:any) {   
      let getReqHeaders = new HttpHeaders();
      return this.apiService.putData(`${this.itemsEndpoint}`+`${"/FacilityManagement"}`,data,getReqHeaders);
    } 

    getOwnerForfacility(searchInput:any) {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject: searchInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/GetOwnerForfacility`, getReqHeaders,httpParam);
    }

    getTenantForfacility(searchInput:any) {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject: searchInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/GetTenantForfacility`, getReqHeaders,httpParam);
    }

}
