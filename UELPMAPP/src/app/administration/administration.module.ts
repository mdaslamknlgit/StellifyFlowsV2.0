import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationLayoutComponent } from './components/administration-layout/administration-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserComponent } from './components/user/user.component';
import { UserGridComponent } from './components/user-grid/user-grid.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {  WorkFlowEntryComponent } from './components/work-flow-entry/work-flow-entry.component';
import { ChildComponent } from './components/child/child.component';
import { MenuControlsComponent } from './components/menu-controls/menu-controls.component';
import { ApprovalComponent } from './components/approval/approval.component';
import { ChildNodeComponent } from './components/child-node/child-node.component';
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { SiteLogComponent } from './components/site-log/site-log.component';
import { TableModule } from "primeng/table";
import { CompaniesListComponent } from './components/companies-list/companies-list.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CurrenciesComponent } from './components/currencies/currencies.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DepartmentsListComponent } from './components/department-list/department-list.component';
import { ReportingManagerDialog, UserManagementComponent } from './components/user-management/user-management.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';

import { TreeNode } from 'primeng/api';
import { WorkflowReAssignmentComponent } from './components/workflow-re-assignment/workflow-re-assignment.component';
import { CurrenciesListComponent } from './components/currencies-list/currencies-list.component';
import { UserProfileComponent } from '../inventory/components/user-profile/user-profile.component';
import { RoleManagementListComponent } from './components/role-management-list/role-management-list.component';
import { DepartmentComponent } from './components/department/department.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { WorkFlowListComponent } from './components/work-flow-list/work-flow-list.component';
import { WorkFlowComponent } from './components/work-flow/work-flow.component';
import { AppCustomMaterialModuleModule } from '../shared/app-custom-material-module/app-custom-material-module.module';
import { MatDialog, MatDialogModule, MatIconModule } from '@angular/material';
import { TreeTableModule } from 'primeng/primeng';
import { TreeTableModule as NgTreeTableModule } from 'ng-treetable';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TableModule,
    TreeTableModule,
    NgTreeTableModule,
    SharedModule,
    AdministrationRoutingModule,
    NgbModule,
    MalihuScrollbarModule,
    ConfirmDialogModule,
    MatSlideToggleModule,
    MatDialogModule,
    DialogModule,
    AppCustomMaterialModuleModule,
    NgMultiSelectDropDownModule.forRoot(),
    
  ],
  entryComponents: [
    ChildComponent, ApprovalComponent, ChildNodeComponent, MenuControlsComponent,ReportingManagerDialog
  ],
  exports: [
    MatSlideToggleModule
  ],
  declarations: [AdministrationLayoutComponent,
    ChildComponent, DashboardComponent, UserComponent, UserGridComponent,
    WorkFlowComponent,  WorkFlowEntryComponent,WorkFlowListComponent,
    MenuControlsComponent, ApprovalComponent, ChildNodeComponent, CustomerProfileComponent, 
    SiteLogComponent, CompaniesComponent, CompaniesListComponent, CurrenciesComponent, CurrenciesListComponent,
    DepartmentComponent, DepartmentsListComponent, 
    UserManagementComponent, UserProfileComponent,
    ReportingManagerDialog,
    ChangePasswordComponent, RoleManagementComponent, RoleManagementListComponent,
    WorkflowReAssignmentComponent]
})
export class AdministrationModule { }
