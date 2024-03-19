import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GoodsReceivedNotesService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }
  getGoodsReceivedNotes(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReceivedNotes`, getReqHeaders,httpParam); 
  }
  getGoodsReceivedNotesDetails(grnNoteId:number,purchaseOrderId:number, purchaseOrderTypeId:number, companyId: number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReceivedNotes/${grnNoteId}/${purchaseOrderId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders); 
  } 

  getDraftCount(purchaseOrderId:number,purchaseOrderTypeId:number,companyId:number) {   
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/getDraft/${purchaseOrderId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders); 
  } 

  createGoodsReceivedNotes(data:any,files:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    formData.append("GoodsReceivedNotes",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/goodsReceivedNotes`,formData, getReqHeaders); 
  }
  // createGoodsReceivedNotes(data:any) {   
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/goodsReceivedNotes`,data, getReqHeaders); 
  // }

  updateGoodReceivedNotes(data:any,files:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    formData.append("GoodsReceivedNotes",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/goodsReceivedNotes`,formData,getReqHeaders); 
  } 
  // updateGoodReceivedNotes(data:any) {   
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/goodsReceivedNotes`,data,getReqHeaders); 
  // } 

  
  deleteGoodsReceivedNotes(goodsReceivedNoteId:number,userId:number,purchaseOrderId:number,poTypeId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/goodsReceivedNotes/${goodsReceivedNoteId}/${userId}/${purchaseOrderId}/${poTypeId}`,getReqHeaders); 
  } 
  getAllSearchGoodsReceivedNotes(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReceivedNotes/Search`, getReqHeaders,httpParam); 
  } 

  printDetails(grnNoteId:number, purchaseOrderTypeId:number, companyId: number)
  { 
    const getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/goodsReceivedNotesPrint/${grnNoteId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders);
  }

  // voidGRN(goodsReceivedNoteId:number,userId:number,reasons:string)
  // {
  //   let getReqHeaders = new HttpHeaders();
  //   let obj:any = {
  //     UserId:userId,
  //     Reasons:reasons,
  //     GoodsReceivedNoteId:goodsReceivedNoteId
  //   };
  //   return this.apiService.postData(`${this.itemsEndpoint}/goodsReceivedNotes/void`,obj,getReqHeaders); 
  // }


  voidGRN(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
   // formData.append("GoodsReceivedNotes",JSON.stringify(displayInput)); 
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/goodsReceivedNotes/void"}`, displayInput, getReqHeaders);
  }

  checkvoidGRN(GoodsReceivedNoteId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReceivedNotes/checkvoid/${GoodsReceivedNoteId}`, getReqHeaders); 
  }


  getFilterGRN(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/goodsReceivedNotes/Filter"}`, getReqHeaders, httpParam);
  }

  getEditGRNDetails(GoodsReceivedNoteId:number,purchaseOrderId:number,POTypeId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/goodsReceivesNotes/${GoodsReceivedNoteId}/${purchaseOrderId}/${POTypeId}`, getReqHeaders); 
  } 

}


