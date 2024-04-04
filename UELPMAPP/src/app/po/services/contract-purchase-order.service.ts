import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ContractPurchaseOrderAccure, ContractPurchaseOrder } from '../models/contract-purchase-order.model';

@Injectable()
export class ContractPurchaseOrderService {
  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) {

  }
  /*
   purpose:calling the api method to fetch all purchase orders
   */
  getContractPurchaseOrders(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders`, getReqHeaders, httpParam);
  }


  getCPOAccuralManagement(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accuralomanagement`, getReqHeaders, httpParam);
  }

  getCPOAccuralReverse(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accuralreverse`, getReqHeaders, httpParam);
  }

  getAssets(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allAssets`, getReqHeaders, httpParam);
  }
  /*
   to get the purchase order details.
  */
  getPurchaseOrderDetails(purchaseOrderId: number) {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders/${purchaseOrderId}`, getReqHeaders);
  }

  /*
   to create purchase order details..
   */
  createPurchaseOrder(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("purchaseOrder", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/contractPurchaseOrders`, formData, getReqHeaders);
  }
  /*
    to delete selected purchase order details..
   */
  deletePurchaseOrder(purchaseOrderId: any, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/contractPurchaseOrders/${purchaseOrderId}/${userId}`, getReqHeaders);
  }
  /*
   to update the selected purchase order details...
   */
  updatePurchaseOrder(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("purchaseOrder", JSON.stringify(data));
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/contractPurchaseOrders`, formData, getReqHeaders);

  }
  updateAccraulCode(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("purchaseOrder", JSON.stringify(data));
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/contractPurchaseOrders/AccrualCodeUpdate`, formData, getReqHeaders);

  }
  printDetails(purchaseOrderId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/purchaseOrderPrint/${purchaseOrderId}`, getReqHeaders);
  }
  sendForApproval(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/contractPurchaseOrders/sendForApproval`, displayInput, getReqHeaders);
  }
  generatePoc(pocObj: any) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/contractPurchaseOrders/generatePoc`, pocObj, getReqHeaders);
  }
  exportAccrualGL(data: Array<any>) {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}/contractPurchaseOrders/exportAccrualGL`, data, getReqHeaders);
  }
  ChangePOCStatus(contractPurchaseOrders: ContractPurchaseOrder[], workflowStatusId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/contractPurchaseOrders/changePOStatus/${workflowStatusId}`, contractPurchaseOrders, getReqHeaders);
  }
  GetPocCount(CPOID: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contractPurchaseOrders/getPocLists/${CPOID}`, getReqHeaders);
  }
  updateCPOJVACode(CPONumber: string, CPOJVACode: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/UpdateJVACode/${CPONumber}/${CPOJVACode}`, getReqHeaders);
  }
}


