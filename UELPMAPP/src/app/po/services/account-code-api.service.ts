import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})

export class AccountCodeAPIService {
    accountCodeEndpoint: string = `${environment.apiEndpoint}/accountCodes`;
    accountCodeCatogiresEndpoint: string = `${environment.apiEndpoint}/accountCodeCategories`;
    allAccountCodeCatogiresEndpoint: string = `${environment.apiEndpoint}/allAccountCodeCategories`;
    constructor(private apiService: ApiService) {
    }

    getAccountCodeCategories(companyId : number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.accountCodeCatogiresEndpoint}/${companyId}`, getReqHeaders);
    }

    deleteAccountcodes(accountCatId:any,accountcodeId:any,companyId:number,userId:number) {   
        let getReqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.accountCodeEndpoint}/DeleteAccountCategory/${accountCatId}/${accountcodeId}/${companyId}/${userId}`,getReqHeaders); 
      } 

    getAllAccountCodeCategories() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.allAccountCodeCatogiresEndpoint, getReqHeaders);
    }
   
    getAccountTypes(companyId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.accountCodeEndpoint}/accountTypes/${companyId}`, getReqHeaders);
    }

    // getAccountCodesByAccountType(accountType: string, companyId: number, searchKey: string) {
    //     let getReqHeaders = new HttpHeaders();
    //     return this.apiService.getResults(`${this.accountCodeEndpoint}/${accountType}/${companyId}/${searchKey}`, getReqHeaders);
    // }

    getAllSearchAccountCodes(displayInput: any) {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject: displayInput
        });
        return this.apiService.getResults(`${this.accountCodeEndpoint}/searchAll`, reqHeaders, httpParam);
      }

      getAllSearchSubCategory(displayInput: any) {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
          fromObject: displayInput
        });
        return this.apiService.getResults(`${this.accountCodeEndpoint}/subcategory/searchAll`, reqHeaders, httpParam);
      }

    uploadAccountCodes(companyId: any, userId: any, file: any) {
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();
        formData.append('file', file, file.name);
        formData.append("companyId", JSON.stringify(companyId));
        formData.append("userId", JSON.stringify(userId));
        return this.apiService.postDataWithAttachments(`${this.accountCodeEndpoint}`, formData, reqHeaders);
    }
    
    createAccountCode(accountObj): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.postData(`${this.accountCodeEndpoint}/insert`, accountObj, reqHeaders);
    }

    updateAccountCodes(accountCodes: any) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.accountCodeEndpoint}`, accountCodes, getReqHeaders);
    }
}


