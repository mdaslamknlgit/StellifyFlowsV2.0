import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Location, ResponseMessage } from "../models/shared.model";

import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SharedService {

  itemsEndpoint: string = `${environment.apiEndpoint}`;
  paymentTermsEndpoint: string = `${environment.apiEndpoint}/paymentTermsList`;
  serviceCategroiesEndpoint: string = `${environment.apiEndpoint}/serviceCategroies`;
  private showSuccessMessage = new Subject<ResponseMessage>();
  public showSuccessMessage$: Observable<ResponseMessage> = this.showSuccessMessage.asObservable();
  private hideAppBarMessage = new Subject<boolean>();
  public hideAppBar$: Observable<boolean> = this.hideAppBarMessage.asObservable();
  public deliveryAddress = new Subject<string>();
  public deliveryAddress$: Observable<string> = this.deliveryAddress.asObservable();
  public companyId = new Subject<number>();
  public CompanyId$: Observable<number> = this.companyId.asObservable();
  public companyName = new Subject<string>();
  public companyName$: Observable<string> = this.companyName.asObservable();
  public IsCompanyChanged = new Subject<boolean>();
  public IsCompanyChanged$: Observable<boolean> = this.IsCompanyChanged.asObservable();
  PORecordslength: number;
  PoDraftVisible: boolean;
  constructor(private apiService: ApiService) {

  }
  showMessage(messageObj: ResponseMessage) {
    this.showSuccessMessage.next(messageObj);
  }
  hideAppBar(hide: boolean) {
    this.hideAppBarMessage.next(hide);
  }
  updateDeliveryAddress(address: string) {
    this.deliveryAddress.next(address);
  }
  updateCompanyId(CompanyId: number) {
    this.companyId.next(CompanyId);

  }

  updateCompany(isCompanyChanged: boolean) {
    this.IsCompanyChanged.next(isCompanyChanged);

  }
  updateCompanyName(companyName: string) {
    this.companyName.next(companyName);

  }
  /**
   * to get the list of item masters based on key...
   * @param searchKey 
   */
  getItemMasterByKey(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetItemMasters`, getReqHeaders, httpParam);
  }
  GetGlcodes(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetGlcodes`, getReqHeaders, httpParam);
  }

  getSupplierCategoryByKey(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetSupplierCategory`, getReqHeaders, httpParam);
  }

  getSupplierByKey(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetTicketSupplier`, getReqHeaders, httpParam);
  }

  getGRNS(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetGRNS`, getReqHeaders, httpParam);
  }


  getServicesByKey(accountCode: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: accountCode

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/services`, getReqHeaders, httpParam);
  }
  getExpenseByKey(accountCode: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: accountCode

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/Expense`, getReqHeaders, httpParam);
  }


  getServicesByKeyforExpense(accountCode: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: accountCode

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/byCategory`, getReqHeaders, httpParam);
  }

  getAccountCodesbySubcat(accountCode: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: accountCode

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/bySubCategory`, getReqHeaders, httpParam);
  }

  /*
  purpose:calling the api method to departments
  */
  getDepartments() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/Departments`, getReqHeaders);
  }

  getDepartmentsByCompany(companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getDepartments/${companyId}`, getReqHeaders);
  }

  getDepartmentsWorkFlow(companyId: number, processId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getDepartmentsWorkFlow/${companyId}/${processId}`, getReqHeaders);
  }
  getUserDepartments(companyId: number, processId: number, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getUserDepartments/${companyId}/${processId}/${userId}`, getReqHeaders);
  }

  GetUserCompanyDepartments(companyId: number, userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetUserCompanyDepartments/${companyId}/${userId}`, getReqHeaders);
  }

  getCompanyDetails(companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getCompany/${companyId}`, getReqHeaders);
  }

  getAllSearchDepartments(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });

    return this.apiService.getResults(`${this.itemsEndpoint}/allSearchDepartments`, getReqHeaders, httpParam);
  }

  getItemMastersbasedLocationID(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj
    });
    //console.log(itemObj);
    return this.apiService.getResults(this.itemsEndpoint + `${"/GetItemMastersbasedLocationID"}`, getReqHeaders, httpParam);
  }
  /**
 * to get the list of locations based on key...
 * @param searchKey 
 */
  getLocationByKey(searchKey: string, companyId: number = 0) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetLocations?searchKey=${searchKey}&companyId=${companyId}`, getReqHeaders);
  }

  getAllDepartments() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAllDepartments`, getReqHeaders);
  }

  getAllUniqueDepartments() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAllUniqueDepartments`, getReqHeaders);
  }


  getFacilities(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetFacilities`, getReqHeaders, httpParam);
  }

  getAllDetails(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAllDetails`, getReqHeaders, httpParam);
  }

  /*
  purpose:calling the api method to fetch the details of the selected inventory request record ...
  */
  getItemMasterByLocation(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/ItemMasterByLocation`, getReqHeaders, httpParam);
  }
  /**
   * to get all the suppliers..
   */
  getSuppliers(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allsuppliers`, getReqHeaders, httpParam);
  }

  getActiveSuppliers(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/getActiveSuppliers`, getReqHeaders, httpParam);
  }

  getOtherEntitySuppliers(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/otherEntitySuppliers`, getReqHeaders, httpParam);
  }
  getAllSearchCustomers(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allSearchCustomers`, getReqHeaders, httpParam);
  }

  getPaymentType() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetPaymentType`, getReqHeaders);
  }
  /**
   * to get all the currencies..
   */
  getCurrencies() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/currencies`, getReqHeaders);
  }
  getItemsfortransfer(itemObj: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: itemObj
    });
    //console.log(itemObj);
    return this.apiService.getResults(this.itemsEndpoint + `${"/GetItemsfortransfer"}`, getReqHeaders, httpParam);
  }
  getPaymentTerms(CompanyId: Number) {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.paymentTermsEndpoint}/${CompanyId}`, getReqHeaders);
  }
  //GetUOM
  getUOMList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetUOMList"}`, getReqHeaders);
  }

  getPriorityList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/GetPriorityList"}`, getReqHeaders);
  }

  getEngineerList(ticketId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetEngineerList/${ticketId}`, getReqHeaders);
  }

  getCompaniesbykey(searchKey: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetCompanies?searchKey=${searchKey}`, getReqHeaders);
  }

  getCompaniesbyuserId(userid: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetCompaniesByUserId?userid=${userid}`, getReqHeaders);
  }

  getEngineersbykey(searchKey: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetEngineers?searchKey=${searchKey}`, getReqHeaders);
  }

  getServiceCategroies() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(this.serviceCategroiesEndpoint, getReqHeaders);
  }
  getServiceCategoriesList() {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.getResults(`${this.itemsEndpoint}/supplierService/serviceCategoriesList`, getReqHeaders);
  }
  getTaxGroups(taxClass: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getTaxes/${taxClass}`, getReqHeaders);
  }

  getSupplierCategoryGroups() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetSupplierCategory`, getReqHeaders);
  }

  getAllDeliveryTerms(CompanyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/allDeliveryTerms/${CompanyId}`, getReqHeaders);
  }

  getallNotifications(userId: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: userId
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allNotifications`, getReqHeaders, httpParam);
  }

  getNewNotifications(userId: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: userId
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/newNotifications`, getReqHeaders, httpParam);
  }

  updateNotifications(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/updateNotifications`, data, getReqHeaders, true);
  }

  getAllSearchPurchaseOrders(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    let result = this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders/SearchAll`, getReqHeaders, httpParam);

    return result;
  }

  getAllSearchSalesOrders(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    let result = this.apiService.getResults(`${this.itemsEndpoint}/salesOrders/SearchAll`, getReqHeaders, httpParam);

    return result;
  }

  getPORequest(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allPORequest`, getReqHeaders, httpParam);
  }
  getPORequestForQuotation(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allPORequestforQuotation`, getReqHeaders, httpParam);
  }


  getINVRequest(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allCreditNoteINVRequest`, getReqHeaders, httpParam);
  }

  getUsers(userName: string, companyId: number = 0) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/companyUsers/${userName}/${companyId}`, getReqHeaders);
  }

  getExpenseTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/expenseTypes`, getReqHeaders);
  }

  updateWorkFlowDocApprovalStatus(workFlwData: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/workFlowApproval`, workFlwData, getReqHeaders);
  }

  workFlowClarificationReply(workFlowData: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/workFlowClarificationReply`, workFlowData, getReqHeaders);
  }

  sendForApproval(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/sendForWorkFlowApproval`, displayInput, getReqHeaders);
  }

  getAllJobCategory(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/AllJobCategory`, getReqHeaders, httpParam);
  }


  getWorkFlowStatus(WorkFlowPrcoessId?: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/workFlowStatus?WorkFlowPrcoessId=${WorkFlowPrcoessId}`, getReqHeaders);
  }

  getItemCategorys(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetItemCategorys`, getReqHeaders, httpParam);
  }

  getItemMasterName(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetItemMasterName`, getReqHeaders, httpParam);
  }

  getItemTypes(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/GetItemTypes`, getReqHeaders, httpParam);
  }

  voidPurchaseOrder(obj: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/purchaseOrder/void`, obj, getReqHeaders);
  }

  getAccountCodesByCategory(accountCode: any) {

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: accountCode

    });
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/byCategory`, getReqHeaders, httpParam);
  }

  getTaxGroupList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetTaxGroups`, getReqHeaders);
  }

  getCountries() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/countries`, getReqHeaders);
  }
  getAllUsers() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAllUsers`, getReqHeaders);
  }
  getBillingFrequencies() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetBillingFrequencies`, getReqHeaders);
  }
  getCostCentres() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetCostCentres`, getReqHeaders);
  }
  getAllServiceTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAllServiceTypes`, getReqHeaders);
  }

  getTaxClasses(taxGroupId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getTaxClasses/${taxGroupId}`, getReqHeaders);
  }

  GetAccountCodesByAccountType(companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accountCodes/byType/${companyId}`, getReqHeaders);
  }

  // getSupplierSubCodes(supplierId: number, companyId: number) {   
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.getResults(`${this.itemsEndpoint}/subCodes/${supplierId}/${companyId}`,getReqHeaders); 
  // }

  getSupplierSubCodes(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: <any>displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/subCodes`, getReqHeaders, httpParam);
  }

  getSupplierContact(supplierId: number, companyId: number, purchaseOrderId: number, PoTypeId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/SupplierContact/${supplierId}/${companyId}/${purchaseOrderId}/${PoTypeId}`, getReqHeaders);
  }


  getAccountTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accountTypes`, getReqHeaders);
  }

  getBillingTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/billingTypes`, getReqHeaders);
  }

  supplierVerificationApproval(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/supplierVerificationApproval`, displayInput, getReqHeaders);
  }
  GetJVACode() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/JVACode`, getReqHeaders);
  }
  SetJVACode(JVANumber: any) {
    let getReqHeaders = new HttpHeaders();

    return this.apiService.postData(`${this.itemsEndpoint}/setJVACode/${JVANumber}`, "", getReqHeaders);
  }

  checkIsSupplierVerifier(userId: number, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/checkIsSupplierVerifier/${userId}/${companyId}`, getReqHeaders);
  }

  getAllSearchProjectContracts(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    let result = this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/search`, getReqHeaders, httpParam);

    return result;
  }
  getuserManagementRole(searchKey: string) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetuserManagementRole?searchKey=${searchKey}`, getReqHeaders);
  }

  getRolesAccessByRoleId(roleIds: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetRoleAccessLevel/${roleIds}`, getReqHeaders);
  }

  getAssetSubcatgories(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/AssetSubcategories/searchKey`, getReqHeaders, httpParam);
  }

  getSupplierVerifiers() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getSupplierVerifiers`, getReqHeaders);
  }

  getUsersByCompany(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/getUsersByCompany`, getReqHeaders, httpParam);
  }

  getUserRolesByCompany(userId: number, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/getUserRolesByCompany/${userId}/${companyId}`, getReqHeaders);
  }

  getSearchCountries(searchInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: searchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/allCountries`, getReqHeaders, httpParam);
  }

  GetDocumentAddress(processId: any, documentId: any, companyId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetDocumentAddress/${processId}/${documentId}/${companyId}`, getReqHeaders);
  }

  GetTransactionTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetTransactionTypes`, getReqHeaders);
  }

  GetNationalities() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetNationalities`, getReqHeaders);
  }

  GetAddressTypes() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/GetAddressTypes`, getReqHeaders);
  }
}