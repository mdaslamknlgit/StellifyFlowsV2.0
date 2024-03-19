import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class AssetDisposalService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getAssetDisposalRequest(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDisposalReq`, getReqHeaders,httpParam); 
  }
  getAssetDisposalRequestForApproval(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDisposalReq/approvals`, getReqHeaders,httpParam); 
  }
  searchAssetDisposalRequest(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDisposalReq/search`, getReqHeaders,httpParam); 
  }
  getAssetDisposalReqDetails(assetDisposalReqId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetDisposalReq/${assetDisposalReqId}/${userId}`, getReqHeaders); 
  } 
  createAssetDisposalRequest(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assetDisposalReq`,data, getReqHeaders); 
  }
  deleteAssetDisposalRequest(assetDisposalReqId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assetDisposalReq/${assetDisposalReqId}/${userId}`,getReqHeaders); 
  } 
  updateAssetDisposalRequest(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assetDisposalReq`,data,getReqHeaders); 
  } 
}


