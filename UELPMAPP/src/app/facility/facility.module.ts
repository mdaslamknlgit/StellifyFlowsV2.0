import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { SharedModule } from '../shared/shared.module';
import { FacilityRoutingModule } from './facility-routing.module';
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

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import {CalendarModule} from 'primeng/calendar';
import { MatTableModule } from "@angular/material/table";
import { TableModule } from 'primeng/table';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CalendarModule as CalendarModuleSchedule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarSchedulerComponent } from './components/calendar-scheduler/calendar-scheduler.component';


 
 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,     
    SharedModule,
    FacilityRoutingModule,
    NgbModule,
    TableModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    ConfirmDialogModule,
    MatTableModule,
    CalendarModule,
    AutoCompleteModule,
    NgMultiSelectDropDownModule.forRoot(),
    CalendarModuleSchedule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgbModalModule
  ],
  exports:[
    MatSlideToggleModule
  ],
  declarations: [FacilityLayoutComponent, DashboardComponent, FacilitiesManagementComponent, EngineerManagementComponent, PreventiveMaintenanceComponent,
     TicketManagementComponent, SubcontractManagementComponent, PoVendorComponent, VendorBillingentryComponent, EngineerTicketMontoringComponent,
      GenerateBillingComponent, AccpacIntegrationComponent, ReportsComponent, CalendarSchedulerComponent]
})
export class FacilityModule { }
