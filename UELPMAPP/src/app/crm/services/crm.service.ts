import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({providedIn: 'root'})
export class CRMService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  private _webApiUrl = environment.apiEndpoint;
  usersEndpoint: string = `${environment.apiEndpoint}`;
  currenciesEndpoint: string = `${environment.apiEndpoint}/currencies`;

  //debugger;
  constructor(private apiService: ApiService) { 

  }

  // ********************************************************************************************************************* 
  // Connection Starts Here
  // *********************************************************************************************************************

  GetConnectionWithDetails() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetConnectionWithDetails`,getReqHeaders); 
  }

  GetMarketingListWithDetailsByListId(ListId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetMarketingListWithDetailsByListId/${ListId}`,getReqHeaders); 
  }
  GetList() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetList`,getReqHeaders); 
  }


  GetUserInfoByUserId(userId: number) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/users/${userId}`, getReqHeaders);
  }
  SearchList(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/SearchList`, getReqHeaders,httpParam); 
  }

  GetListInfo(ListId:any,CompanyId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetListInfo/${ListId}/${CompanyId}`,getReqHeaders); 
  }

  GetListDetails(ListId:any,CompanyId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/connection/GetListDetails/${ListId}/${CompanyId}`,getReqHeaders); 
  }

  CreateList(MyAccount:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/connection/CreateList`, MyAccount, getReqHeaders);
  }
  UpdateList(MyAccount:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/connection/UpdateList`, MyAccount, getReqHeaders);
  }  
  GetListById(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/PurchaseOrders/SearchAll`, getReqHeaders,httpParam); 
  } 
  // ********************************************************************************************************************* 
  // Connection Ends Here
  // *********************************************************************************************************************

  
  // ********************************************************************************************************************* 
  // Leads Starts Here
  // *********************************************************************************************************************

  // GetLeadById(Id:number) {
  //   let getReqHeaders = new HttpHeaders();
  //   return this.apiService.getResults(`${this._webApiUrl}Leads/GetLeadById/${Id}`, getReqHeaders);       
  // }  
  GetLeadsGroupByStages(UserId:any)
  {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadsGroupByStages/${UserId}`,getReqHeaders); 
  }

  GetLeadsList() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadsList`,getReqHeaders); 
  }
  GetLeadsByPagination(skip:number,take:number,UserId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadsByPagination?skip=${skip}&take=${take}&UserId=${UserId}`,getReqHeaders); 
  }

  SearchLeads(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/SearchLeads`, getReqHeaders,httpParam); 
  }


  SearchLeadsByViews(ModuleId:any,FormId:any,ViewId:any,displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/SearchLeads/${ModuleId}/${FormId}/${ViewId}`, getReqHeaders,httpParam); 
  }

  //http://localhost:49266/api/appviews/SearchAppViews?Skip=0&Take=25&UserId=649&ViewName=Converted&ViewAlias=&IsActive=1
  SearchAppViews(AppViewsInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:AppViewsInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/appviews/SearchAppViews`, getReqHeaders,httpParam); 
  }
  
  //Contact API Starts Here
 
  SearchContacts(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/SearchContact`, getReqHeaders,httpParam); 
  }

  GetContactDetailById(ContactId:any,UserId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/GetContactDetailById/${ContactId}/${UserId}`, getReqHeaders);  
  }

  GetContactByContactId(ContactId:any,UserId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/GetContactByContactId/${ContactId}/${UserId}`, getReqHeaders);  
  }

  UpdateContact(MyContact:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/contacts/UpdateContact`, MyContact, getReqHeaders);
  }

  CreateContact(MyContact:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/contacts/CreateContact`, MyContact, getReqHeaders);
  }

  GetMaritalStatus() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/GetMaritalStatus/`, getReqHeaders);  
  }

  GetMaritalStatusById(Id:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/GetMaritalStatusById/${Id}`, getReqHeaders);  
  }
  GetAccountsDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accounts/GetAccountsDomainItem`, getReqHeaders);  
  }

  GetContactsByAccount() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accounts/GetContactsByAccount`, getReqHeaders);  
  }


  GetContactsByAccounts(searchTerm:string) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accounts/GetContactsByAccounts?SearchTerm=${searchTerm}`,getReqHeaders); 
  }

  GetContactsByAccountId(AccountId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/contacts/GetContactsByAccountId/${AccountId}`, getReqHeaders);  
  }

  GetIndustryDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/accounts/GetIndustryDomainItem`, getReqHeaders);  
  }

//Contact API Ends Here


//Accounts API Starts Here
SearchAccounts(displayInput:any) {   
  let getReqHeaders = new HttpHeaders();
  let httpParam = new HttpParams({
    fromObject:displayInput
  });
  return this.apiService.getResults(`${this.itemsEndpoint}/accounts/SearchAccounts`, getReqHeaders,httpParam); 
}

SearchAccountsWithViews(ModuleId:any,FormId:any,ViewId:any,displayInput:any) {   
  let getReqHeaders = new HttpHeaders();
  let httpParam = new HttpParams({
    fromObject:displayInput
  });
  return this.apiService.getResults(`${this.itemsEndpoint}/accounts/SearchAccountsWithViews/${ModuleId}/${FormId}/${ViewId}`, getReqHeaders,httpParam); 
}

GetAccountById(LeadId:any,UserId:any) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/accounts/GetAccountById/${LeadId}/${UserId}`, getReqHeaders);  
}
CreateAccount(MyAccount:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/accounts/CreateAccount`, MyAccount, getReqHeaders);
}
UpdateAccount(MyAccount:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/accounts/UpdateAccount`, MyAccount, getReqHeaders);
}
//Accounts API Ends Here
  SearchLeadNames(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/SearchLeadNames`, getReqHeaders,httpParam); 
  }
  UploadFile(data: any, UserId:any,CompanyId:any) {
    let reqHeaders = new HttpHeaders();
    let formData: FormData = new FormData();

    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/contacts/ImportContacts/${UserId}/${CompanyId}`, data, reqHeaders);
  }
  GetSalutation() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetSalutation`,getReqHeaders); 
  }

  GetLeadSource() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadSource`,getReqHeaders); 
  }

  GetLeadStatus() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadStatus`,getReqHeaders); 
  }

  GetLeadStatusDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadStatusDomainItem`,getReqHeaders); 
  }

  GetLeadsById(LeadId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadsById/${LeadId}`, getReqHeaders);  
  }

  GetLeadById(LeadId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadById/${LeadId}`, getReqHeaders);  
  }
  GetLeadRatingDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/leads/GetLeadRatingDomainItems`, getReqHeaders);  
  }
  GetReportingUsers(CompanyId:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.usersEndpoint}/Users/GetReportingUsers/${CompanyId}`, getReqHeaders);       
  } 
  
  UpdateLead(MyLead:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/UpdateLead`, MyLead, getReqHeaders);
  }

  CreateLead(MyLead:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/CreateLead`, MyLead, getReqHeaders);
  }

  UpdateContactGroupsOfLead(ContactGroups:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/UpdateContactGroupsOfLead`, ContactGroups, getReqHeaders);
  }

  UpdateContactGroupsOfContact(ContactGroups:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/UpdateContactGroupsOfContact`, ContactGroups, getReqHeaders);
  }
  ConvertToLead(MyEmailList:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/ConvertToLead`, MyEmailList, getReqHeaders);
  }
  GetJobQueueList() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}Leads/GetJobQueueList`, getReqHeaders);
  }
  AddToQueue(MyEmailList:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/AddToQueue`, MyEmailList, getReqHeaders);
  }
  ChangeLeadStatus(MyLeadIds:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/ChangeLeadStatus`, MyLeadIds, getReqHeaders);
  }

  QualifyLead(MyLeadQualityInfo:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/QualifyLead`, MyLeadQualityInfo, getReqHeaders);
  }

  GetLeadInfoToConvert(MyLeadQualifyRequest:any) {
    // let getReqHeaders = new HttpHeaders();
    // return this.apiService.postData(`${this.itemsEndpoint}/leads/GetLeadInfoToConvert`, MyLeadIds, getReqHeaders);

    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/leads/GetLeadInfoToConvert`, MyLeadQualifyRequest, getReqHeaders);
  }



  CheckAPI() {
    let getReqHeaders = new HttpHeaders();
    
    var url="http://apishippingintegratorservicetest.azurewebsites.net/odata/v1/picktickets";
    return this.apiService.getResultsTest(url, getReqHeaders);       
  }  
  // *********************************************************************************************************************
  // Leads Ends Here
  // *********************************************************************************************************************

  // *********************************************************************************************************************
  // Currencies Code Starts Here
  // *********************************************************************************************************************

  GetAllCurrencies() {
    //currencies
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/currencies`, getReqHeaders);
  }

  // *********************************************************************************************************************
  // Currencies Code Ends Here
  // *********************************************************************************************************************


  //Opportunity
  SearchOpportunity(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/opportunity/SearchOpportunity`, getReqHeaders,httpParam); 
  }

  GetOpportunityInfo(OppId:any,UserId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/opportunity/GetOpportunityInfo/${OppId}/${UserId}`, getReqHeaders);  
  }

  GetOpportunityProducts(OpportunityId:any,UserId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/opportunity/GetOpportunityProductsDetailsList/${OpportunityId}/${UserId}`, getReqHeaders);  
  }

  

  GetProbabilityDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/opportunity/GetProbabilityDomainItem`, getReqHeaders);  
  }

  CreateOpportunity(MyOpp:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/opportunity/CreateOpportunity`, MyOpp, getReqHeaders);
  }

  UpdateOpportunity(MyOpp:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/opportunity/UpdateOpportunity`, MyOpp, getReqHeaders);
  }

  //
  AddOpportunityProducts(MyOppProduct:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/opportunity/AddOpportunityProducts`, MyOppProduct, getReqHeaders);
  }
  

  //Products
  SearchProducts(SearchInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:SearchInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/products/SearchProducts`, getReqHeaders,httpParam); 
  }



  //Activities
  

  SearchActivities(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/activity/SearchActivities`, getReqHeaders,httpParam); 
  }

  //http://localhost:49266/api/activity/SearchActivities/1/2/1004?Skip=0&Take=25&UserId=808
  SearchActivitiesByViews(ModuleId:any,FormId:any,ViewId:any,displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/activity/SearchActivities/${ModuleId}/${FormId}/${ViewId}`, getReqHeaders,httpParam); 
  }

  
  CreateActivity(MyLead:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/activity/CreateActivity`, MyLead, getReqHeaders);
  }
  
  UpdateActivity(MyLead:any) {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/activity/UpdateActivity`, MyLead, getReqHeaders);
  }

  GetActivityById(ActivityId:any,UserId:any) {   
    let getReqHeaders = new HttpHeaders();
    //return this.apiService.getResults(`${this.itemsEndpoint}/activity/GetActivityById/${ActivityId}/${UserId}`, getReqHeaders);  
    return this.apiService.getResults(`${this.itemsEndpoint}/activity/GetActivityById/${ActivityId}`, getReqHeaders);  
  }

  GetActivityStatusDomainItem() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/activity/GetActivityStatusDomainItem`, getReqHeaders);  
  }

  GetContactDomainItems() {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/activity/GetContactDomainItems`, getReqHeaders);  
  }

  //Deals
SearchDeals(ModuleId:any,FormId:any,ViewId:any,displayInput:any) {   
  let getReqHeaders = new HttpHeaders();
  let httpParam = new HttpParams({
    fromObject:displayInput
  });
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/SearchDeals/${ModuleId}/${FormId}/${ViewId}`, getReqHeaders,httpParam); 
}

GetDealType() {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealType`,getReqHeaders); 
}

GetDealStage() {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealStage`,getReqHeaders); 
}

GetDealById(DealId:any) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealById/${DealId}`, getReqHeaders);  
}

CreateDeal(MyDeal:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/deal/CreateDeal`, MyDeal, getReqHeaders);
}

UpdateDeal(MyDeal:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/deal/UpdateDeal`, MyDeal, getReqHeaders);
}

GetContactsByAccountsId(AccountId:any) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetContactsByAccountId/${AccountId}`, getReqHeaders);  
}

CreateQuickAccount(MyDeal:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/deal/CreateQuickAccount`, MyDeal, getReqHeaders);
}

CreateQuickContact(MyDeal:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/deal/CreateQuickContact`, MyDeal, getReqHeaders);
}

CloseDeal(MyDealCloseForm:any) {
  let getReqHeaders = new HttpHeaders();
  return this.apiService.postData(`${this.itemsEndpoint}/deal/CloseDeal`, MyDealCloseForm, getReqHeaders);
}

GetDealResonForLossList() {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealResonForLossList`,getReqHeaders); 
}

GetDealResonForLossDomainItems() {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealResonForLossDomainItems`,getReqHeaders); 
}


GetDealResonForLosById(DealReasonId:any) {   
  let getReqHeaders = new HttpHeaders();
  return this.apiService.getResults(`${this.itemsEndpoint}/deals/GetDealResonForLosById/${DealReasonId}`, getReqHeaders);  
}


UploadEntity(data: any, files: any,EntityId:any,EntityName:any,UserId:any,CompanyId:any) {
  let reqHeaders = new HttpHeaders();
  let formData: FormData = new FormData();

  // files.forEach(element => {
  //   formData.append('file[]', element, element.name);
  // });

  //formData.append("salesOrder", JSON.stringify(data));
  return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/contacts/EntityImport/${EntityId}/${EntityName}/${UserId}/${CompanyId}`, data, reqHeaders);
}


}




