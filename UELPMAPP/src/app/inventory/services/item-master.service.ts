import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ItemMasterDisplayInput } from "../models/item-master.model";

@Injectable()
export class ItemMasterService {
  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) {
  }

  // Getting Data
  getItemMaster(displayInput: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetItemMaster"}`, getReqHeaders, httpParam);
  }


  GetItemMasterById(ItemMasterId:any,CompanyId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetItemMasterById/${ItemMasterId}/${CompanyId}`,getReqHeaders); 
  }

  GetAllSearchItemMasters(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetItemMaster/search"}`, getReqHeaders, httpParam);
  }


  // saving data
  saveItemMaster(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/CreateItemMaster"}`, data, getReqHeaders);
  }

  //   Delete data
  deleteItemMaster(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}` + `${"/DeleteItemMaster/"}` + data, getReqHeaders);
  }

  GetItemcategorylist(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetItemcategorylist/"}` + data, getReqHeaders);
  }



  //   Update Data
  updateItemMaster(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/UpdateItemMaster"}`, data, getReqHeaders);
  }


  //Getlocations
  GetLocationsList(companyId:number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetLocationList/${companyId}`, getReqHeaders);
  }

  //GetUOM
  GetUOMList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetUOMList"}`, getReqHeaders);
  }

  //GetUOM
  GetItemTypeList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetItemTypeList"}`, getReqHeaders);
  }
  UploadItems(userId: any, file: any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append("userId", JSON.stringify(userId));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/ItemMaster/UploadItems`, formData, reqHeaders);
  }
}

