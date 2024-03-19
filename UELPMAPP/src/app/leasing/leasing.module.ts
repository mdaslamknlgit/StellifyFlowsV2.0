import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatTableModule } from "@angular/material/table";
import { TableModule } from "primeng/table";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { SharedModule } from '../shared/shared.module';
import { LeasingRoutingModule } from './leasing-routing.module';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { CapexLayoutComponent } from "./components/leasing-layout/leasing-layout.component";
import { UtilitymanagementComponent } from './components/utilitymanagement/utilitymanagement.component';
import { RentrollmanagementComponent } from './components/rentrollmanagement/rentrollmanagement.component';
import { ContractManagementComponent } from './components/contract-management/contract-management.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    TableModule,//prime ng table module
    ReactiveFormsModule,     
    SharedModule,
    LeasingRoutingModule, 
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    MatTableModule,
    ConfirmDialogModule
  ],
  exports:[
    MatSlideToggleModule
  ],
    declarations: [CapexLayoutComponent, UtilitymanagementComponent, RentrollmanagementComponent, ContractManagementComponent]
})
export class LeasingModule {


 }
