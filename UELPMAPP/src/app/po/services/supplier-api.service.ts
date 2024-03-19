import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { VendorsList } from '../models/supplier';
@Injectable({
    providedIn: 'root',
})
export class SupplierApiService {
    suppliersEndpoint: string = `${environment.apiEndpoint}/suppliers`;
    supplierUploadEndpoint: string = `${environment.apiEndpoint}/uploadSuppliers`;
    supplierServicesEndpoint: string = `${environment.apiEndpoint}/supplierServices`;
    countriesEndpoint: string = `${environment.apiEndpoint}/countries`;
    gstEndPoint: string = `${environment.apiEndpoint}/GSTStatus`;
    currenciesEndpoint: string = `${environment.apiEndpoint}/currencies`;
    ApprovalEndpoint: string = `${environment.apiEndpoint}/supplierApprovals`;
    constructor(private apiService: ApiService) { }

    getSuppliers(displaySupplierGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displaySupplierGrid
        });
        return this.apiService.getResults(`${this.suppliersEndpoint}`, getReqHeaders, httpParam);

    }

    getSupplierApproval(displaySupplierGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displaySupplierGrid
        });

        return this.apiService.getResults(`${this.ApprovalEndpoint}`, getReqHeaders, httpParam);
    }

    GetAllSearchSuppliers(displaySupplierGrid: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displaySupplierGrid
        });

        return this.apiService.getResults(`${this.suppliersEndpoint}/search`, getReqHeaders, httpParam);
    }

    getSupplierServices(supplierId?: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.supplierServicesEndpoint}/${supplierId}`, getReqHeaders);
    }

    getCountries() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.countriesEndpoint, getReqHeaders);
    }
    getGSTStatus() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.gstEndPoint, getReqHeaders);
    }
    getCurrencies() {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(this.currenciesEndpoint, getReqHeaders);
    }

    getSupplierById(supplierId: number, companyId: number, loggedInUserId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.suppliersEndpoint}/${supplierId}/${companyId}/${loggedInUserId}`, getReqHeaders);
    }

    CheckVerifystatus(companyid: number, userid: number, deptid: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.suppliersEndpoint}/CheckVerifystatus/${companyid}/${userid}/${deptid}`, getReqHeaders);
    }

    // createSupplier(supplierObj): Observable<any> {
    //     let reqHeaders = new HttpHeaders();
    //     return this.apiService.postData(this.suppliersEndpoint, supplierObj, reqHeaders);
    // }

    getAllSearchSuppliers(displayInput: any) {
        let getReqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });
        return this.apiService.getResults(`${this.suppliersEndpoint}/searchAll`, getReqHeaders, httpParam);
    }

    createSupplier(supplierObj: any, files: any) {
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();
        files.forEach(element => {
            formData.append('file[]', element, element.name);
        });

        formData.append("supplier", JSON.stringify(supplierObj));
        return this.apiService.postDataWithAttachments(`${this.suppliersEndpoint}`, formData, reqHeaders);
    }

    // updateSupplier(supplierObj: any): Observable<any> {
    //     let reqHeaders = new HttpHeaders();
    //     return this.apiService.putData(`${this.suppliersEndpoint}/`, supplierObj, reqHeaders);
    // }

    updateSupplier(supplierObj: any, files: any) {
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();
        files.forEach(element => {
            formData.append('file[]', element, element.name);
        });

        formData.append("supplier", JSON.stringify(supplierObj));
        return this.apiService.putDataWithAttachments(`${this.suppliersEndpoint}`, formData, reqHeaders);
    }

    uploadSupplier(companyId: any, userId: any, file: any) {
        let reqHeaders = new HttpHeaders();
        let formData: FormData = new FormData();
        formData.append('file', file, file.name);
        formData.append("companyId", JSON.stringify(companyId));
        formData.append("userId", JSON.stringify(userId));
        return this.apiService.postDataWithAttachments(`${this.supplierUploadEndpoint}`, formData, reqHeaders);
    }

    deleteSupplier(supplierId: number, companyId: number): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.deleteData(`${this.suppliersEndpoint}/${supplierId}/${companyId}`, reqHeaders);
    }

    detachSupplier(supplierToDetach: any): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.putData(`${this.suppliersEndpoint}/detach`, supplierToDetach, reqHeaders);
    }
    ExportSupplier(): Observable<any> {
        let reqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.suppliersEndpoint}/ExportAll`, reqHeaders);
    }
    VendorsExport(displayInput: any): Observable<any> {
        let reqHeaders = new HttpHeaders();
        let httpParam = new HttpParams({
            fromObject: displayInput
        });
        return this.apiService.getResults(`${this.suppliersEndpoint}/vendorsExport`, reqHeaders, httpParam)
    }

    exportVendorDataById(data: Array<VendorsList>, companyId: number): Observable<any> {
        let getReqHeaders = new HttpHeaders();

        return this.apiService.postData(`${this.suppliersEndpoint}/vendorsExportById/${companyId}`, data, getReqHeaders);
    }

    ChangeVendorStatus(supplierId: number, workFlowStatusId: number, companyId: number) {
        let getReqHeaders = new HttpHeaders();
        let obj: any = {
            SupplierId: supplierId,
            WorkFlowStatusId: workFlowStatusId

        };
        return this.apiService.postData(`${this.suppliersEndpoint}/changeWorkflowStatus/${companyId}`, obj, getReqHeaders);
    }

    exportVendorByNewCreateSup(ExportSupplierId: number, companyid: number): Observable<any> {
        let getReqHeaders = new HttpHeaders();

        return this.apiService.getResults(`${this.suppliersEndpoint}/vendorsExportByNewCreateSup/${ExportSupplierId}/${companyid}`, getReqHeaders);
    }

    recallPoApproval(approvalObj: any) {
        const getReqHeaders = new HttpHeaders();
        //let httpParam = new HttpParams({});
        return this.apiService.postData(`${this.suppliersEndpoint}/recallPoApproval`, approvalObj, getReqHeaders);
    }

    CheckDuplicateSupplier(SupplierId: number, SupplierName: any) {
        let getReqHeaders = new HttpHeaders();

        return this.apiService.getResults(`${this.suppliersEndpoint}/CheckDuplicateSupplier/${SupplierId}/${SupplierName}`, getReqHeaders);
    }
}

