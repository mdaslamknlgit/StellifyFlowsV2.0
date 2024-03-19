import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../shared/services/api.service';
import { environment } from './../../../environments/environment';
import { MasterProcess } from './../../adhoc/models/adhoc-master.model';

@Injectable({
  providedIn: 'root'
})
export class AdhocMasterService {
  adhocMasterEndPoint: string = `${environment.apiEndpoint}/adhoc`;
  customerTypeEndPoint: string = `${this.adhocMasterEndPoint}/CustomerType`;
  bankMasterEndPoint: string = `${this.adhocMasterEndPoint}/BankMaster`;
  tenantTypeEndPoint: string = `${this.adhocMasterEndPoint}/TenantType`;
  serviceTypeCodeEndPoint: string = `${this.adhocMasterEndPoint}/ServiceTypeCode`;
  taxGroupEndPoint: string = `${this.adhocMasterEndPoint}/TaxGroup`;
  taxTypeEndPoint: string = `${this.adhocMasterEndPoint}/TaxType`;
  taxMasterEndPoint: string = `${this.adhocMasterEndPoint}/TaxMaster`;
  serviceMasterEndPoint: string = `${this.adhocMasterEndPoint}/ServiceMaster`;
  locationMasterEndPoint: string = `${this.adhocMasterEndPoint}/LocationMaster`;
  emailConfigEndPoint: string = `${this.adhocMasterEndPoint}/EmailConfig`;
  customerMasterEndPoint: string = `${this.adhocMasterEndPoint}/CustomerMaster`;
  creditTermEndPoint: string = `${this.adhocMasterEndPoint}/CreditTerm`;
  constructor(private apiService: ApiService, private http: HttpClient) {

  }

  GetCustomerTypes() {
    return this.http.get(`${this.customerTypeEndPoint}/GetCustomerTypes`);
  }
  GetCustomerTypeById(Id) {
    return this.http.get(`${this.customerTypeEndPoint}/GetCustomerTypeById/` + Id)
  }
  PostCustomerTypeMaster(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.customerTypeEndPoint}/PostCustomerType`, data, getReqHeaders);
  }

  GetBanks(CompanyId) {
    return this.http.get(`${this.bankMasterEndPoint}/GetBanks/${CompanyId}`);
  }
  GetBankById(BankMasterId) {
    return this.http.get(`${this.bankMasterEndPoint}/GetBankById/${BankMasterId}`);
  }
  GetDefaultBank(CompanyId) {
    return this.http.get(`${this.bankMasterEndPoint}/GetDefaultBank/${CompanyId}`);
  }
  PostBank(data: any, files: any) {
    let getReqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append('Image', element, element.name);
    });
    formData.append("Bank", JSON.stringify(data));
    return this.apiService.postDataWithAttachments(`${this.bankMasterEndPoint}/PostBank`, formData, getReqHeaders);
  }

  GetTenantTypes() {
    return this.http.get(`${this.tenantTypeEndPoint}/GetTenantTypes`);
  }
  GetTenantsById(Id) {
    return this.http.get(`${this.tenantTypeEndPoint}/GetTenantsById/${Id}`)
  }
  PostTenantType(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.tenantTypeEndPoint}/PostTenantType`, data, getReqHeaders);
  }

  GetCreditTerms(CompanyId) {
    return this.http.get(`${this.creditTermEndPoint}/GetCreditTerms/${CompanyId}`);
  }
  GetCreditTermById(CreditTermMasterId) {
    return this.http.get(`${this.creditTermEndPoint}/GetCreditTermById/` + CreditTermMasterId)
  }
  PostCreditTerm(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.creditTermEndPoint}/PostCreditTerm`, data, getReqHeaders);
  }

  GetLocations(CompanyId) {
    return this.http.get(`${this.locationMasterEndPoint}/GetLocations/${CompanyId}`);
  }
  GetLocationById(LocationId) {
    return this.http.get(`${this.locationMasterEndPoint}/GetLocationById/${LocationId}`);
  }
  PostLocation(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.locationMasterEndPoint}/PostLocation`, data, getReqHeaders);
  }

  GetTaxGroups(CompanyId: number) {
    return this.http.get(`${this.taxGroupEndPoint}/GetTaxGroups/${CompanyId}`);
  }
  GetAssignedTaxGroups(CompanyId: number) {
    return this.http.get(`${this.taxGroupEndPoint}/GetAssignedTaxGroups/${CompanyId}`);
  }
  GetTaxGroupById(Id) {
    return this.http.get(`${this.taxGroupEndPoint}/GetTaxGroupById/${Id}`);
  }
  PostTaxGroup(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.taxGroupEndPoint}/PostTaxGroup`, data, getReqHeaders);
  }

  GetTaxMasters(CompanyId) {
    return this.http.get(`${this.taxMasterEndPoint}/GetTaxMasters/${CompanyId}`);
  }
  GetTaxMasterById(CompanyId, TaxMasterId) {
    return this.http.get(`${this.taxMasterEndPoint}/GetTaxMasterById/${CompanyId}/${TaxMasterId}`)
  }
  PostTaxMaster(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.taxMasterEndPoint}/PostTaxMaster`, data, getReqHeaders);
  }

  GetTaxTypes(CompanyId) {
    return this.http.get(`${this.taxTypeEndPoint}/GetTaxTypes/${CompanyId}`);
  }
  GetTaxTypesByTaxGroupId(CompanyId, taxGroupId) {
    return this.http.get(`${this.taxTypeEndPoint}/GetTaxTypesByTaxGroupId/${CompanyId}/${taxGroupId}`);
  }
  GetTaxTypeById(CompanyId, TaxtypeId) {
    return this.http.get(`${this.taxTypeEndPoint}/GetTaxTypeById/${CompanyId}/${TaxtypeId}`);
  }
  PostTaxType(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.taxTypeEndPoint}/PostTaxType`, data, getReqHeaders);
  }

  GetEmailConfigurations(CompanyId) {
    return this.http.get(`${this.emailConfigEndPoint}/GetEmailConfigurations/${CompanyId}`);
  }
  GetEmailConfigurationById(CompanyId, Id) {
    return this.http.get(`${this.emailConfigEndPoint}/GetEmailConfigurationById/${CompanyId}/${Id}`);
  }
  getEmailConfigProcesses() {
    return this.http.get(`${this.emailConfigEndPoint}/GetEmailConfigProcesses`);
  }
  GetUsers(CompanyId, DepartmentId) {
    return this.http.get(`${this.emailConfigEndPoint}/GetUsers/${CompanyId}/${DepartmentId}`);
  }
  PostEmailConfiguration(data: any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.emailConfigEndPoint}/PostEmailConfiguration`, data, getReqHeaders);
  }
  GetAllUser() {
    //debugger
    return this.http.get(`${this.emailConfigEndPoint}/GetAllUsers`);
  }
  GetProcessTypes() {
    //debugger
    return this.http.get(`${this.emailConfigEndPoint}/GetProcessTypes`);
  }


  GetCustomerMasterType(CompanyId) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetCustomerType/` + CompanyId);
  }
  GetCreditTermMasterType(CompanyId) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetCreditTerm/` + CompanyId);
  }
  GetCurrencyType() {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetCurrencyType`);
  }

  GetTenantType(CompanyId) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetTenants/` + CompanyId);
  }

  CheckCustomerId(CustomerID) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/CheckCustomerId/` + CustomerID);
  }

  GetTaxMasterType(companyId) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetTaxMaster/` + companyId);
  }

  GetTaxTypeType(companyId) {
    //debugger
    return this.http.get(`${this.customerMasterEndPoint}/GetTaxType/` + companyId);
  }

  DeleteTaxTypeGrid(TaxtypeId) {
    return this.http.get(`${this.customerMasterEndPoint}/DeleteTaxTypeGrid/` + TaxtypeId)
  }

  ChangeMasterProcessStatus(masterProcess: MasterProcess) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.adhocMasterEndPoint}/ChangeMasterProcessStatus`, masterProcess, getReqHeaders);
  }
  ChangeDefault(masterProcess: MasterProcess) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.adhocMasterEndPoint}/ChangeDefault`, masterProcess, getReqHeaders);
  }
}
