import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class AssetCategoryService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getAssetCategory(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetCategories`, getReqHeaders,httpParam); 
  }
  searchAssetCategories(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetCategories/search`, getReqHeaders,httpParam); 
  }
  getAssetCategoryDetails(assetCategoryId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetCategories/${assetCategoryId}`, getReqHeaders); 
  } 
  createAssetCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assetCategories`,data, getReqHeaders); 
  }
  deleteAssetCategory(assetCategoryId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assetCategories/${assetCategoryId}/${userId}`,getReqHeaders); 
  } 
  updateAssetCategory(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assetCategories`,data,getReqHeaders); 
  } 
}


