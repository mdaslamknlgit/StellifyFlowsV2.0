import { Injectable } from '@angular/core';
import { DashboardData } from '../models/shared.model';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
@Injectable({
    providedIn: 'root',
})
export class DashBoardService {
    dashboardData: any[];
    results: DashboardData = new DashboardData();
    dashboardEndpoint: string = `${environment.apiEndpoint}`;
    constructor(private apiService: ApiService
    ) {
        this.dashboardData =
            [
                {
                    CompanyId: 6,
                    Reservations: 38,
                    Services: 2,
                    Billing: 10,
                    Cleaning: 22,
                    Maintanance: 5,
                    Properties: 10
                },
                {
                    CompanyId: 7,
                    Reservations: 50,
                    Services: 5,
                    Billing: 20,
                    Cleaning: 15,
                    Maintanance: 10,
                    Properties: 30
                }
            ]
    }

    getDashboardResults(companyId: number) {
        this.results = this.dashboardData.filter(x => x.CompanyId === companyId)[0];
        return this.results;
    }
    getDashboardCount(companyId: number) {
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.dashboardEndpoint}/GetDashboardCount?CompanyId=`+companyId, getReqHeaders);
    }

    logOffUser(Id: number){
        let getReqHeaders = new HttpHeaders();
        return this.apiService.getResults(`${this.dashboardEndpoint}/LogoffUser?Id=`+Id, getReqHeaders);
    }

}

