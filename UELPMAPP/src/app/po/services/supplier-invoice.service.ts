import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { InvoiceDetails, InvoiceList } from '../models/supplier-invoice.model';
import { GoodsReceivedNotes } from '../models/goods-received-notes.model';

@Injectable()
export class SupplierInvoiceService {

  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) {

  }

  getInvoices(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice`, getReqHeaders, httpParam);
  }

  getExportInvoice(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/ExportInvoice`, getReqHeaders, httpParam);
  }

  searchInvoice(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/search`, getReqHeaders, httpParam);
  }

  getInvoicesForApprovals(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/approval`, getReqHeaders, httpParam);
  }

  getInvoiceCount(InvoiceId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoices/${InvoiceId}`, getReqHeaders);
  }
  SaveInvoiceGlCode(InvoiceGlCode: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: InvoiceGlCode
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/SaveInvoiceGlCode`, getReqHeaders, httpParam);
  }


  getGoodsReceivedNotes(POId: string, purchaseOrderTypeId: number, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GRNByPurchaseOrder/${POId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders, httpParam);
  }

  getGoodsReceivedNotesCount(POId: number, purchaseOrderTypeId: number, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetGRNCountByPurchaseOrder/${POId}/${purchaseOrderTypeId}/${companyId}`, getReqHeaders, httpParam);
  }

  getsupplierdetails(supplierId: number, purchaseOrderId: number) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/InvoiceSupplier/${supplierId}/${purchaseOrderId}`, getReqHeaders, httpParam);
  }
  // getAllSearchInvoices(displayInput:any)
  // {
  //   let getReqHeaders = new HttpHeaders();
  //   let httpParam = new HttpParams({
  //     fromObject:displayInput
  //   });
  //   return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/Search`, getReqHeaders,httpParam); 
  //} 
  getInvoiceDetails(InvoiceId: number, invoiceTypeId: number, poTypeId?: number, companyId?: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/${InvoiceId}/${invoiceTypeId}/${poTypeId}/${companyId}`, getReqHeaders);
  }

  createInvoice(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("Invoice", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/Invoice`, formData, getReqHeaders);
  }
  deleteInvoice(InvoiceId: number, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/Invoice/${InvoiceId}/${userId}`, getReqHeaders);
  }
  updateInvoice(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("Invoice", JSON.stringify(data));
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/Invoice`, formData, getReqHeaders);
  }
  exportInvoice(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postwithExcelData(`${this.itemsEndpoint}/Invoice/Export`, data, getReqHeaders);
  }
  exportBulkInvoice(data: Array<InvoiceList>, userId: number, companyId) {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}/Invoice/BulkExport/${userId}/${companyId}`, data, getReqHeaders);
  }
  BulkExportUpdateLog(data: Array<InvoiceList>, userId: number, companyId) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/Invoice/BulkExportUpdateLog/${userId}/${companyId}`, data, getReqHeaders);
  }
  printDetails(purchaseOrderId: any, InvoiceTypeId: number, POTypeId?: number, companyId?: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/InvoicePrint/${purchaseOrderId}/${InvoiceTypeId}/${POTypeId}/${companyId}`, getReqHeaders);
  }

  supplierInvoicePrintDetails(InvoiceId: number, InvoiceTypeId: number, POTypeId?: number, companyId?: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/SupplierInvoicePrint/${InvoiceId}/${InvoiceTypeId}/${POTypeId}/${companyId}`, getReqHeaders);
  }
  // voidSuppplierInvoice(invoiceId:number,userId:number,reasons:string,selectedGRNs:Array<GoodsReceivedNotes>)
  // {
  //   let getReqHeaders = new HttpHeaders();
  //   let obj:any = {
  //     UserId:userId,
  //     Reasons:reasons,
  //     InvoiceId:invoiceId,
  //     SelectedGRNs:selectedGRNs
  //   };
  //   return this.apiService.postData(`${this.itemsEndpoint}/Invoice/void`,obj,getReqHeaders); 
  // }
  voidSuppplierInvoice(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/Invoice/void"}`, displayInput, getReqHeaders);
  }

  rejectInvoice(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/Invoice/reject"}`, displayInput, getReqHeaders);
  }

  cancelDraftInvoice(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    return this.apiService.postData(`${this.itemsEndpoint}` + `${"/Invoice/cancelDraft"}`, displayInput, getReqHeaders);
  }


  ChangeInvoiceStatus(invoiceId: number, userId: number, workFlowStatusId: number, currentUserId: number) {
    let getReqHeaders = new HttpHeaders();
    let obj: any = {
      UserId: userId,
      WorkFlowStatusId: workFlowStatusId,
      InvoiceId: invoiceId,
      CurrentUserId: currentUserId
    };
    return this.apiService.postData(`${this.itemsEndpoint}/Invoice/ChangeStatus`, obj, getReqHeaders);
  }

  recallInvoiceApproval(approvalObj: any) {
    const getReqHeaders = new HttpHeaders();
    //let httpParam = new HttpParams({});
    return this.apiService.postData(`${this.itemsEndpoint}/Invoice/recallInvoiceApproval`, approvalObj, getReqHeaders);
  }

  // getPreviousInvoiceSubTotal(purchaseOrderId:number,companyId:number)
  // {
  //   let getReqHeaders = new HttpHeaders();    
  //   return this.apiService.getResults(`${this.itemsEndpoint}/Invoicesubtotal/${purchaseOrderId}/${companyId}`, getReqHeaders); 
  // }

  getPreviousInvoiceSubTotal(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoicesubtotal`, getReqHeaders, httpParam);
  }
  getFilterSIC(SINVFilterDisplayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: SINVFilterDisplayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/Invoice/Filter`, getReqHeaders, httpParam);
  }
  // BulkChangeInvoiceStatus(data:Array<InvoiceList>,userId:number)
  // {
  //   let getReqHeaders = new HttpHeaders();

  //   return this.apiService.postData(`${this.itemsEndpoint}/Invoice/BulkInvoiceChangeStatus/${userId}`,data,getReqHeaders); 
  // }
  VerifyInvoice(invoice: InvoiceDetails) {
    const getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/Invoice/VerifyInvoice`, invoice, getReqHeaders);
  }


}


