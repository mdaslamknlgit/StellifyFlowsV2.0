import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectLayoutComponent } from './components/project-layout/project-layout.component';
import { ProjectCreationComponent } from './components/project-creation/project-creation.component';
import { DashboradComponent } from './components/dashborad/dashborad.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProjectGanttchartComponent } from './components/project-ganttchart/project-ganttchart.component';
import { BudgetComponent } from './components/budget/budget.component';
// import { GanttModule } from 'gantt-ui-component';
import { ProjectBillingComponent } from './components/project-billing/project-billing.component';
import { TableModule } from "primeng/table";
import { CheckboxModule } from 'primeng/checkbox';
import { ProjectCustomerreceiptComponent } from './components/project-customerreceipt/project-customerreceipt.component';
import { ProjectRetentionmanagementComponent } from './components/project-retentionmanagement/project-retentionmanagement.component';
import { DropdownModule, SliderModule } from 'primeng/primeng';
import { CalendarModule } from 'primeng/calendar';
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    NgbModule,
    MalihuScrollbarModule,
    ProjectRoutingModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    // Specify as an import
    // GanttModule.forRoot(),
    TableModule,
    CheckboxModule,
    DropdownModule,
    SliderModule,
    CalendarModule
  ],
  exports: [
    MatSlideToggleModule
  ],
  declarations: [ProjectLayoutComponent, ProjectCreationComponent, DashboradComponent, ProjectGanttchartComponent, BudgetComponent, ProjectBillingComponent, ProjectCustomerreceiptComponent, ProjectRetentionmanagementComponent]
})
export class ProjectModule { }
