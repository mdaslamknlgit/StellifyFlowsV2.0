import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class AssetRegisterService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getAssetRegister(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetRegister`, getReqHeaders,httpParam); 
  }
  searchAsset(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/assetRegister/search`, getReqHeaders,httpParam); 
  }
  printDetails(displayInput:any)
  {   
    const getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/assetRegister/print`, getReqHeaders,httpParam);
  }
  getPostedDepDetails(assetDetailId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/assetRegister/postedAssetDetails/${assetDetailId}`, getReqHeaders); 
  } 
}


