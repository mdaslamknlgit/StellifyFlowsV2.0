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
import { CapexRoutingModule } from './capex-routing.module';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ApprovalLimitProfileComponent } from "./components/approval-limit-profile/approval-limit-profile.component";
import { BudgetProfileComponent } from './components/budget-profile/budget-profile.component';
import { CapexLayoutComponent } from './components/capex-layout/capex-layout.component';
import { CapexNatureComponent } from './components/capex-nature/capex-nature.component';
import { CapexPurposeComponent } from './components/capex-purpose/capex-purpose.component';
import { CapexComponent } from './components/capex/capex.component';
import { CapexApprovalComponent } from './components/capex-approval/capex-approval.component';
import { CapexDisposalComponent } from './components/capex-disposal/capex-disposal.component';
import { RequestTypeComponent } from './components/request-type/request-type.component';
import { CapexDisposalApprovalComponent } from './components/capex-disposal-approval/capex-disposal-approval.component';

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
    CapexRoutingModule, 
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

declarations: [ApprovalLimitProfileComponent ,RequestTypeComponent, BudgetProfileComponent, CapexLayoutComponent, CapexNatureComponent, CapexPurposeComponent, CapexComponent, CapexApprovalComponent, CapexDisposalComponent, CapexDisposalApprovalComponent]

})
export class CapexModule {


 }
