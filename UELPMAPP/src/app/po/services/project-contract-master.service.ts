import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PORSearch } from '../models/purchase-order-request.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectContractMasterService
{

    itemsEndpoint : string = `${environment.apiEndpoint}`;

    constructor(private apiService: ApiService) { 
  
    }
    /*
     purpose:calling the api method to fetch all purchase orders
    */
    getCostTypes(){
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/CostTypes`, getReqHeaders,httpParam); 
    }
    getProjectMasterContracts(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract`, getReqHeaders,httpParam); 
    }
    getProjectMasterContractsForApproval(displayInput:any) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/approval`, getReqHeaders,httpParam); 
    }
    getProjectMasterContractDetails(projectMasterContractId:number) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({});
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/${projectMasterContractId}`, getReqHeaders,httpParam); 
    }
    getAllSearchMasterContracts(displayInput:PORSearch)
    {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
        fromObject:<any> displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/Search`, getReqHeaders,httpParam); 
    } 
    createProjectMasterContract(data:any,files:any) {   
        let getReqHeaders = new HttpHeaders();
        let formData:FormData = new FormData();  
        files.forEach(element => {
          formData.append('file[]',element,element.name);  
        });
        formData.append("purchaseOrder",JSON.stringify(data)); 
        return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/projectMasterContract`,formData, getReqHeaders); 
    }
    searchProjectMasterContract(displayInput:any)
    {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/search`, getReqHeaders,httpParam); 
    }
    updateProjectMasterContract(data:any,files:any) {   
        let getReqHeaders = new HttpHeaders();
        let formData:FormData = new FormData();  
        files.forEach(element => {
          formData.append('file[]',element,element.name);  
        });
        formData.append("purchaseOrder",JSON.stringify(data)); 
        return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/projectMasterContract`,formData,getReqHeaders); 
    }
    GetProjectMasterApprovedDetails(companyId:number,userId:number) {   
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({});
        return this.apiService.getResults(`${this.itemsEndpoint}/projectMasContract/${companyId}/${userId}`, getReqHeaders,httpParam); 
    } 
    getPaymentProjectMasterFilterData(displayInput:any)
    {
      let getReqHeaders = new HttpHeaders();
      let httpParam = new HttpParams({
        fromObject:displayInput
      });
      return this.apiService.getResults(`${this.itemsEndpoint}/projectMasterContract/filter`, getReqHeaders,httpParam); 
    }
}