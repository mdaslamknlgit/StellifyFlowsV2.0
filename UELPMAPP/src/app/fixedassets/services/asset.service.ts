import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class AssetService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getAssets(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assets`, getReqHeaders,httpParam); 
  }
  searchAssets(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assets/search`, getReqHeaders,httpParam); 
  }
  getAssetDetails(assetDetailId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assets/${assetDetailId}`, getReqHeaders); 
  } 
  createAsset(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/assets`,data, getReqHeaders); 
  }
  deleteAsset(assetDetailId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/assets/${assetDetailId}/${userId}`,getReqHeaders); 
  } 
  updateAsset(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/assets`,data,getReqHeaders); 
  }
  //this is For asset upload
  UploadAssetSubcategory(userId: any, file: any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append("userId", JSON.stringify(userId));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/assets/UploadAssetDetails`, formData, reqHeaders);
}
getImportAssetsDetails(CompanyId: number) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/assets/getImportAssetsDetails/${CompanyId}`, getReqHeaders); 
} 

}


