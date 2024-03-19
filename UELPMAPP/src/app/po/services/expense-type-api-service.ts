import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class ExpenseTypeService 
{
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private apiService: ApiService) { 

  }

  getExpenseTypes(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/expenseType`, getReqHeaders,httpParam); 
  }

  createExpenseType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/expenseType`,data, getReqHeaders); 
  }
  deleteExpenseType(expenseTypeId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/expenseType/${expenseTypeId}/${userId}`,getReqHeaders); 
  } 
  updateExpenseType(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/expenseType`,data,getReqHeaders); 
  } 

  getExpenseTypeDetails(expenseTypeId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/expenseType/${expenseTypeId}`, getReqHeaders); 
  } 

  getAllServiceCategories(displayItemMasterGrid: any) {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject: displayItemMasterGrid
    });
  }

}