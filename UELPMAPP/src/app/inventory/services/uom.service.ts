import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MeasurementUnit,MeasurementUnitDisplayInput } from "../models/uom.model";
import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UomService {

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }

  getUnits(displayInput:any) {
    
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/MeasurementUnits`, getReqHeaders,httpParam); 
  } 
  // GetListInfo(ListId:any,CompanyId:any) {   
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetListInfo/${ListId}/${CompanyId}`,getReqHeaders); 
  // }

  getUnitById(measurementUnitId: Number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetMeasurementUnitById/${measurementUnitId}`, getReqHeaders); 
  } 

  createUnit(measurementUnitObj:MeasurementUnit): Observable<any> {
    let reqHeaders = new HttpHeaders();
     return this.apiService.postData(`${this.itemsEndpoint}/CreateMeasurementUnit`, measurementUnitObj, reqHeaders);  
  }

  updateUnit(measurementUnitObj:MeasurementUnit): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.postData(`${this.itemsEndpoint}/UpdateMeasurementUnit`, measurementUnitObj, reqHeaders);  
  }  

  deleteUnit(measurementUnitId:number,userId:number): Observable<any> {
    let reqHeaders = new HttpHeaders();
    return  this.apiService.deleteData(`${this.itemsEndpoint}/DeleteMeasurementUnit/${measurementUnitId}/${userId}`, reqHeaders);  
  }  

  getAllMeasurementUnits(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}/MeasurementUnits/search`, getReqHeaders, httpParam);
  }

}


