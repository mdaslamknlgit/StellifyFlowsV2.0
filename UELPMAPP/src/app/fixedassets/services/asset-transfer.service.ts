import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class AssetTransferService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getAssetTransferRequest(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTransferReq`, getReqHeaders,httpParam); 
  }
  getAssetTransferRequestForApproval(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTransferReq/approvals`, getReqHeaders,httpParam); 
  }
  searchAssetTransferRequest(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTransferReq/search`, getReqHeaders,httpParam); 
  }
  getAssetTransferReqDetails(assetTransferId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetTransferReq/${assetTransferId}/${userId}`, getReqHeaders); 
  } 
  createAssetTransferRequest(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assetTransferReq`,data, getReqHeaders); 
  }
  deleteAssetTransferRequest(assetTransferId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assetTransferReq/${assetTransferId}/${userId}`,getReqHeaders); 
  } 
  updateAssetTransferRequest(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assetTransferReq`,data,getReqHeaders); 
  } 
}


