import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GoodsReturnedNotesService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }

  searchGRN(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnedNotes/search`, getReqHeaders,httpParam); 
  }

  getGRTForApproval(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnedNotes/approvals`, getReqHeaders,httpParam); 
  }

  getGoodsReturnedNotes(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnedNotes`, getReqHeaders,httpParam); 
  }

  createGoodsReturnedNotes(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/goodsReturnedNotes`,data, getReqHeaders); 
  }

  updateGoodReturnedNotes(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/goodsReturnedNotes`,data,getReqHeaders); 
  } 
  
  deleteGoodsReturnedNotes(goodsReceivedNoteId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/goodsReturnedNotes/${goodsReceivedNoteId}/${userId}`,getReqHeaders); 
  } 

  getAllSearchGoodsReturnedNotes(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnedNotes/Search`, getReqHeaders,httpParam); 
  } 

  printDetails(grnNoteId:number,poType:number, companyId: number)
  { 
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/goodsReturnedNotesPrint/${grnNoteId}/${poType}/${companyId}`, getReqHeaders);
  }

  getGoodsReturnedNotesDetails(grnNoteId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();                                                             
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnsNotes/${grnNoteId}/${userId}`, getReqHeaders); 
  } 
  
  GetGRNDetails(grnNoteId:number,purchaseOrderTypeId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReturnNotes/${grnNoteId}/${purchaseOrderTypeId}`, getReqHeaders); 
  } 

  getFilterGoodsReturnNotes(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/goodsReturnedNotes/Filter"}`, getReqHeaders, httpParam);
  }




}