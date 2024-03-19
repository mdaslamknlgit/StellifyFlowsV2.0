import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class SOCreationService {

  itemsEndpoint: string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) {
  }

  getSalesOrders(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrders`, reqHeaders, httpParam);
  }

  getAllSearchSalesOrders(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrders/SearchAll`, reqHeaders, httpParam);
  }

  getSalesOrderDetails(salesOrderId: number, isApprovalPage?: boolean, userId?: number) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrders/${salesOrderId}/${userId}`, reqHeaders);
  }

  createSalesOrder(data: any, files: any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });

    formData.append("salesOrder", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/salesOrders`, formData, reqHeaders);
  }

  deleteSalesOrder(salesOrderId: any, userId: number) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/salesOrders/${salesOrderId}/${userId}`, reqHeaders);
  }

  updateSalesOrder(data: any, files: any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('file[]', element, element.name);
    });

    formData.append("salesOrder", JSON.stringify(data));
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/salesOrders`, formData, reqHeaders);
  }

  printDetails(salesOrderId: any, companyId: any, type: string) {
    const reqHeaders = new HttpHeaders();
    return this.apiService.getPDFResults(`${this.itemsEndpoint}/salesOrderPrint/${salesOrderId}/${companyId}/${type}`, reqHeaders);
  }

  sendSalesOrderMailtoCustomer(salesOrderId: number, companyId: number) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrders/sendSalesOrderMailtoCustomer/${salesOrderId}/${companyId}`, reqHeaders, null, true);
  }

  sendForApproval(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.putData(`${this.itemsEndpoint}/salesOrders/SendForApproval`, displayInput, reqHeaders);
  }

  getTicketDetails(ticketId: number) {
    let reqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/Tickets/${ticketId}`, reqHeaders);
  }

  updateSalesOrderStatus(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/salesOrderStatusUpdate`, displayInput, reqHeaders);
  }

  getAllSearchTickets(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrders/ticketSearch`, reqHeaders, httpParam);
  }

  getSalesOrdersApprovals(displayInput: any) {   
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrderApprovals`, reqHeaders, httpParam);
  }

  searchSalesOrdersForApproval(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/salesOrderApprovals/search`, reqHeaders, httpParam);
  }

  updateSalesOrderApprovalStatus(displayInput: any) {
    let reqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/salesOrderApprovals`, displayInput, reqHeaders);
  }
  
  //sales invoices
  getSalesInvoices(displayInput:any) {   
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}/salesInvoice`, reqHeaders,httpParam); 
  }
 
  getAllSearchSalesInvoices(displayInput:any)
  {
    let reqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/salesInvoice/Search`, reqHeaders,httpParam); 
  } 

  getSalesInvoiceDetails(salesInvoiceId:number) {   
    let reqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/salesInvoice/${salesInvoiceId}`, reqHeaders);     
  } 

  createSalesInvoice(data:any,files:any) {   
    let reqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });

    formData.append("salesInvoice",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/salesInvoice`,formData, reqHeaders); 
  }

  updateSalesInvoice(data:any,files:any) {   
    let reqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(element => {
      formData.append('file[]',element,element.name);  
    });
    formData.append("salesInvoice",JSON.stringify(data)); 
    return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/salesInvoice`,formData,reqHeaders); 
  } 

  deleteSalesInvoice(salesInvoiceId:number,userId:number) {   
    let reqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/salesInvoice/${salesInvoiceId}/${userId}`,reqHeaders);   
  } 
}


