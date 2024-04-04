import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FacilityLayoutComponent } from './components/facility-layout/facility-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacilitiesManagementComponent } from './components/facilities-management/facilities-management.component';
import { EngineerManagementComponent } from './components/engineer-management/engineer-management.component';
import { PreventiveMaintenanceComponent } from './components/preventive-maintenance/preventive-maintenance.component';
import { TicketManagementComponent } from './components/ticket-management/ticket-management.component';
import { SubcontractManagementComponent } from './components/subcontract-management/subcontract-management.component';
import { PoVendorComponent } from './components/po-vendor/po-vendor.component';
import { VendorBillingentryComponent } from './components/vendor-billingentry/vendor-billingentry.component';
import { EngineerTicketMontoringComponent } from './components/engineer-ticket-montoring/engineer-ticket-montoring.component';
import { GenerateBillingComponent } from './components/generate-billing/generate-billing.component';
import { AccpacIntegrationComponent } from './components/accpac-integration/accpac-integration.component';
import { ReportsComponent } from './components/reports/reports.component';
const routes: Routes = [
  {
    path: '', component: FacilityLayoutComponent,  
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent     
      },  
      {
        path: 'facilitiesmanagement',
        component: FacilitiesManagementComponent     
      },
      {
        path: 'engineermanagement',
        component: EngineerManagementComponent     
      }, 
      {
        path: 'preventivemaintenance',
        component: PreventiveMaintenanceComponent     
      }, 
      {
        path: 'ticketmanagement',
        component: TicketManagementComponent     
      }, 
      {
        path: 'subcontractmanagement',
        component: SubcontractManagementComponent     
      }, 
      {
        path: 'povendor',
        component: PoVendorComponent     
      }, 
      {
        path: 'vendorbilling',
        component: VendorBillingentryComponent     
      }, 
      {
        path: 'engineerticket',
        component: EngineerTicketMontoringComponent     
      }, 
      {
        path: 'generatebilling',
        component: GenerateBillingComponent     
      }, 
      {
        path: 'accpacintegration',
        component: AccpacIntegrationComponent     
      }, 
      {
        path: 'reports',
        component: ReportsComponent     
      },   
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacilityRoutingModule { }
