import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectLayoutComponent } from './components/project-layout/project-layout.component';
import { ProjectCreationComponent } from './components/project-creation/project-creation.component';
import { DashboradComponent } from './components/dashborad/dashborad.component';
import { ProjectGanttchartComponent } from './components/project-ganttchart/project-ganttchart.component';
import { BudgetComponent } from './components/budget/budget.component';
import { ProjectBillingComponent } from './components/project-billing/project-billing.component';
import { ProjectCustomerreceiptComponent } from './components/project-customerreceipt/project-customerreceipt.component';
import { ProjectRetentionmanagementComponent } from './components/project-retentionmanagement/project-retentionmanagement.component';
const routes: Routes = [
  {
    path: '', component: ProjectLayoutComponent,  
    children: [
      {
        path: 'dashboard',
        component: DashboradComponent     
      },  
      {
        path: 'project-creation',
        component: ProjectCreationComponent     
      },    
      {
        path: 'project-ganttchart',
        component: ProjectGanttchartComponent     
      },    
      {
        path: 'project-billing',
        component: ProjectBillingComponent     
      },   
      {
        path: 'project-customerreceipt',  
        component: ProjectCustomerreceiptComponent     
      },   
      {
        path: 'project-retention',  
        component: ProjectRetentionmanagementComponent     
      },   
      {
        path: 'budget',
        component: BudgetComponent     
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
export class ProjectRoutingModule { }
