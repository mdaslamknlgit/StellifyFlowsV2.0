import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class AssetTypeService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getAssetType(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTypes`, getReqHeaders,httpParam); 
  }
  searchAssetTypes(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTypes/search`, getReqHeaders,httpParam); 
  }
  getAssetTypeDetails(assetTypeId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTypes/${assetTypeId}`, getReqHeaders); 
  } 
  createAssetType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assetTypes`,data, getReqHeaders); 
  }
  deleteAssetType(assetTypeId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assetTypes/${assetTypeId}/${userId}`,getReqHeaders); 
  } 
  updateAssetType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assetTypes`,data,getReqHeaders); 
  } 
}


