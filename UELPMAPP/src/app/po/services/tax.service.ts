import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

import { environment } from '../../../environments/environment';
import { HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Tax } from '../models/tax.model';


@Injectable()
export class TaxService {

    taxEndpoint : string = `${environment.apiEndpoint}`;
    
    constructor(private apiService: ApiService) { 
    

    }
      getTaxes(displayInput:any) {
    
        let getReqHeaders = new HttpHeaders();
    
        let httpParam = new HttpParams({
    
          fromObject:displayInput
    
        });
        return this.apiService.getResults(this.taxEndpoint+`${"/GetTaxes"}`, getReqHeaders,httpParam); 
      } 


      getFilterTaxes(displayInput:any) {
    
        let getReqHeaders = new HttpHeaders();
    
        let httpParam = new HttpParams({
    
          fromObject:displayInput
    
        });
        return this.apiService.getResults(this.taxEndpoint+`${"/GetFilterTaxes"}`, getReqHeaders,httpParam); 
      } 

      getTaxesByTaxGroup(taxGroupId: number) {
        let getReqHeaders = new HttpHeaders();        
        return this.apiService.getResults(`${this.taxEndpoint}/TaxesByTaxGroup/${taxGroupId}`, getReqHeaders);
      }
      GetTaxByTaxId(taxId: number) {
        let getReqHeaders = new HttpHeaders();        
        return this.apiService.getResults(`${this.taxEndpoint}/GetTaxByTaxId/${taxId}`, getReqHeaders);
      }

      createTax(taxObj:Tax): Observable<any> {
        let reqHeaders = new HttpHeaders();
         return this.apiService.postData(`${this.taxEndpoint}`+`${"/CreateTax"}`, taxObj, reqHeaders);  
      }

      updateTax(taxObj:Tax): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return  this.apiService.postData(`${this.taxEndpoint}`+`${"/UpdateTax"}`, taxObj, reqHeaders);  
      }  

      deleteTax(taxId:number,userId:number): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return  this.apiService.deleteData(`${this.taxEndpoint}/DeleteTax/${taxId}/${userId}`, reqHeaders);  
      } 
      uploadTaxes(userId: any, file: any) {
          let reqHeaders = new HttpHeaders();
          let formData: FormData = new FormData();
          formData.append('file', file, file.name);
        
          formData.append("userId", JSON.stringify(userId));
          return this.apiService.postDataWithAttachments(`${this.taxEndpoint}/uploadTaxes`, formData, reqHeaders);
      }

      getTaxClassCount(taxGroupId:number,taxClass:number) {   
        let getReqHeaders = new HttpHeaders();    
        return this.apiService.getResults(`${this.taxEndpoint}/Taxes/${taxGroupId}/${taxClass}`, getReqHeaders); 
      } 


}