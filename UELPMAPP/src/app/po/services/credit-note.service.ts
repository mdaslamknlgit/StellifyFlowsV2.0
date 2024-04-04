import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CreditNoteService {

  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService, private http: HttpClient) {

  }
  GetCreditNotesList(requestConfig: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: requestConfig
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetCreditNotesList`, getReqHeaders, httpParam);
  }
  getCreditNoteById(CreditnoteId) {
    return this.http.get(`${this.itemsEndpoint}/GetCreditNoteById/` + CreditnoteId);
  }
  GetOriginalQTYPRICE(CreditnoteDetailsId) {
    return this.http.get(`${this.itemsEndpoint}/GetOriginalQTYPRICE/` + CreditnoteDetailsId);
  }
  GetCreditNoteINVDetails(InvoiceId: number) {
    return this.http.get(`${this.itemsEndpoint}/GetCreditNoteINVDetails/` + InvoiceId);
  }
  Get_Existing_InvoiceId(InvoiceId: number) {
    return this.http.get(`${this.itemsEndpoint}/Get_Existing_InvoiceId/${InvoiceId}`);
  }
  getFilterCreditNotes(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/creditNotes/Filter"}`, getReqHeaders, httpParam);
  }
  getCreditNoteDetails(createNoteId: number, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/creditNotes/${createNoteId}/${userId}`, getReqHeaders);
  }
  getInvoicesBySupplier(supplierId: number, companyid) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/invoicesBySupplier/${supplierId}/${companyid}`, getReqHeaders);
  }
  postCreditNote(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    if (files != '' && files != null) {
      files.forEach(element => {
        formData.append('files[]', element, element.name);
      });
    }
    formData.append("creditNotes", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/creditNotes`, formData, getReqHeaders);
  }
  CancelDraftDocument(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    return this.apiService.postData(`${this.itemsEndpoint}/CancelDraftDocument`, displayInput, getReqHeaders);
  }
  deleteCreditNote(createNoteId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/creditNotes/${createNoteId}`, getReqHeaders);
  }
  updateCreditNote(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });
    formData.append("creditNotes", JSON.stringify(data));
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/creditNotes`, data, getReqHeaders);
  }
  printDetails(creditNoteId: any, companyId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/creditNotePrint/${creditNoteId}/${companyId}`, getReqHeaders);
  }
  searchCreditNote(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/creditNotes/search`, getReqHeaders, httpParam);
  }
  getTaxesByTaxGroup(taxId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/TaxesByTaxId/${taxId}`, getReqHeaders);
  }
  getCreditNoteForApproval(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/creditNotes/approvals`, getReqHeaders, httpParam);
  }
  ExportCNDocument(DocumentId: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/ExportCNDocument/${DocumentId}`, getReqHeaders);
  }
  ValidateCNNo(details: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();

    return this.apiService.postData(`${this.itemsEndpoint}/ValidateCNNo`, details, getReqHeaders);
  }
}