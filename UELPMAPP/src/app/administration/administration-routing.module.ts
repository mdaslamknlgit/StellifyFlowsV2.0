import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministrationLayoutComponent } from './components/administration-layout/administration-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserComponent } from './components/user/user.component';
import { UserGridComponent } from './components/user-grid/user-grid.component';
import {  WorkFlowEntryComponent } from './components/work-flow-entry/work-flow-entry.component';
import { CustomerProfileComponent } from "./components/customer-profile/customer-profile.component";
import { SiteLogComponent } from './components/site-log/site-log.component';
import {  CompaniesListComponent } from './components/companies-list/companies-list.component';
import { CurrenciesComponent } from './components/currencies/currencies.component';
import {  DepartmentsListComponent } from './components/department-list/department-list.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { WorkflowReAssignmentComponent } from './components/workflow-re-assignment/workflow-re-assignment.component';
import { CurrenciesListComponent } from './components/currencies-list/currencies-list.component';
import { UserProfileComponent } from '../inventory/components/user-profile/user-profile.component';
import { RoleManagementListComponent } from './components/role-management-list/role-management-list.component';
import { DepartmentComponent } from './components/department/department.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { WorkFlowListComponent } from './components/work-flow-list/work-flow-list.component';
import { WorkFlowComponent } from './components/work-flow/work-flow.component';

const routes: Routes = [
  {
    path: '', component: AdministrationLayoutComponent,  
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent     
      },
      {
        path: 'users',
        component: UserGridComponent      
      },   
      {
        path: 'user',
        component: UserComponent      
      },
      {
        path: 'workflowe/:mode/:ProcessId/:CompanyId/:LocationId',
        component: WorkFlowEntryComponent      
      },
      {
        path: 'workflowl',
        component: WorkFlowListComponent      
      },
      {
        path: 'workflow',
        component: WorkFlowComponent      
      },
      {
        path: 'user/:id',
        component: UserComponent       
      },  
      {
        path:'customers',
        component:CustomerProfileComponent
      },
      {
        path:'auditlog',
        component:SiteLogComponent
      },
      {
        path:'companies',
        component:CompaniesListComponent
      },
      {
        path:'companies/:mode/:Id',
        component:CompaniesComponent
      },
      {
        path:'currencies/:Id',
        component:CurrenciesComponent
      },
      {
        path:'currencieslist/:Id',
        component:CurrenciesListComponent
      },
      {
        path:'departments',
        component:DepartmentsListComponent
      },
      {
        path:'departments/:mode/:Id',
        component:DepartmentComponent
      },
      {
        path:'usermanagement',
        component:UserManagementComponent
      },
      {
        path:'userprofile',
        component:UserProfileComponent
      },
      {
        path:'changepassword',
        component:ChangePasswordComponent
      },
      {
       path: 'rolemanagementlist',
       component: RoleManagementListComponent
      },
      {
        path: 'rolemanagement/:Id',
        component: RoleManagementComponent
       },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'workflowreassignment',
        component: WorkflowReAssignmentComponent      
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
