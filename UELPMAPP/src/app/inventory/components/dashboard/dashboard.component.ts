import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../../../shared/services/dashboard.service';
import { SharedService } from '../../../shared/services/shared.service';
import { DashboardData, DashboardCount } from '../../../shared/models/shared.model'
import { Observable } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  results: DashboardData = new DashboardData();
  dashboardCount: DashboardCount;
  constructor(private dashboardService: DashBoardService,
    private sharedServiceObj:SharedService) { 
    this.getDashboardResults(this.companyId);  
  }
  purchasesubmenu =false;
  companyId: number = 6; //default 
  ngOnInit() {
    // this.getDashboardCount();
    this.sharedServiceObj.CompanyId$
      .subscribe((data)=>{
          this.getDashboardCount(data);
      });
  }
  purchaseorderclick (e){
    this.purchasesubmenu= !this.purchasesubmenu;
  }
  getDashboardResults(companyId: number) {   
    this.results = this.dashboardService.getDashboardResults(companyId);
    //console.log(this.results.Reservations);   
  }

  getDashboardCount(companyId: number){
    let dashboardCount = <Observable<DashboardCount>>this.dashboardService.getDashboardCount(companyId);
    dashboardCount.subscribe((data)=>{
      if(data!=null){
        this.dashboardCount=data;
      }
    })
  }
}
