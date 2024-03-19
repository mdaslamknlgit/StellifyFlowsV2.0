import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TicketManagementService {

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) {

   }

   getTickets(displayInput:any) {  

    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/Tickets"}`, getReqHeaders,httpParam); 
  } 

  //delete facility  record
   //   Delete data
   deleteTicket(data:any,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/Tickets/${data}/${userId}`,getReqHeaders); 
  }

  getFilterTicket(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}` + `${"/Tickets/Filter"}`, getReqHeaders, httpParam);
  }

  getEngineerslist(displayInput: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetEngineerslist"}`, getReqHeaders, httpParam); 
  }

  ticketsendmessage(input:any)
  {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/TicketSendMessage/`,input, getReqHeaders); 
  }

  getEngineerslist1() {
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetAllEngineerslist"}`, getReqHeaders); 
  }

  getAssignEngineerlist(){
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetAssignEngineerlist"}`, getReqHeaders); 
  }

  createAssignEngineer(data:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    formData.append("ticket",JSON.stringify(data)); 
    return this.apiService.postData(`${this.itemsEndpoint}/AssignEngineer`,data, getReqHeaders); 
  }

  deleteuncheckEngineer(data:any){
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/DeleteUncheck`,data, getReqHeaders); 
  }

   // saving data
  createTicket(data:any,files:any,ContractorFiles:any) {   
    let getReqHeaders = new HttpHeaders();
    let formData:FormData = new FormData();  
    files.forEach(data => {
      formData.append('file[]',data,data.name);  
    });  
    ContractorFiles.forEach(data => {
      formData.append('file[]',data.File,"TicketSubContractor@"+data.RowIndex+"!"+data.File.name);  
    });   
    formData.append("ticket",JSON.stringify(data)); 
    return this.apiService.postDataWithAttachments(`${this.itemsEndpoint}/Tickets`,formData, getReqHeaders); 
  }

  
    //   Update Data    
    updateTicket(data:any,files:any,ContractorFiles:any) {   
        let getReqHeaders = new HttpHeaders();
        let formData:FormData = new FormData();  
        files.forEach(element => {
          formData.append('file[]',element,element.name);  
        });
        ContractorFiles.forEach(data => {
          formData.append('file[]',data.File,"TicketSubContractor@"+data.RowIndex+"!"+data.File.name);  
        });   
        formData.append("ticket",JSON.stringify(data)); 
        return this.apiService.putDataWithAttachments(`${this.itemsEndpoint}/Tickets`,formData,getReqHeaders); 
      } 

      getTicketDetails(ticketId:number) {   
        let getReqHeaders = new HttpHeaders();    
        return this.apiService.getResults(`${this.itemsEndpoint}/Tickets/${ticketId}`, getReqHeaders); 
      } 

      // getTicketAttachment(ticketId:number) {   
      //   let getReqHeaders = new HttpHeaders();    
      //   return this.apiService.getResults(`${this.itemsEndpoint}/Tickets/${ticketId}`, getReqHeaders); 
      // } 

      
      getEngineerAssignListing(displayInput:any) {  

        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject:displayInput
        });
        return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/GetEngineerAssignListing"}`, getReqHeaders,httpParam); 
      } 

      checkEngineerStatus(data:any) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.itemsEndpoint}`+`${"/EngineerAvailableStatus/"}`+data, getReqHeaders); 
      }

      getTicketEngineer(ticketId:number) {   
        let getReqHeaders = new HttpHeaders();    
        return this.apiService.getResults(`${this.itemsEndpoint}/GetTicketEngineer/${ticketId}`, getReqHeaders); 
      } 

      deleteEngineer(userId:number){
        let getReqHeaders = new HttpHeaders();
         return this.apiService.deleteData(`${this.itemsEndpoint}/Tickets/${userId}`,getReqHeaders); 
      }
}