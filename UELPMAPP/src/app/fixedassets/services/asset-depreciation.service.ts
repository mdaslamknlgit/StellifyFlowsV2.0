import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class AssetDepreciationService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getAssetDepReq(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDepReq`, getReqHeaders,httpParam); 
  }
  getAssetDepReqForApproval(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDepReq/approvals`, getReqHeaders,httpParam); 
  }
  searchAssetDepReq(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDepReq/search`, getReqHeaders,httpParam); 
  }
  getAssetDepReqDetails(assetDepReqId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDepReq/${assetDepReqId}`, getReqHeaders); 
  } 
  createAssetDepreciation(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assetDepReq`,data, getReqHeaders); 
  }
  deleteAssetDepreciation(assetCategoryId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assetDepReq/${assetCategoryId}/${userId}`,getReqHeaders); 
  } 
  updateAssetDepreciation(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assetDepReq`,data,getReqHeaders); 
  } 
}


