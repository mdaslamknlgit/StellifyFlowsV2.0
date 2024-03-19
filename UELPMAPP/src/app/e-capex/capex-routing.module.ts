import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestTypeComponent } from './components/request-type/request-type.component';
import { CapexNatureComponent } from './components/capex-nature/capex-nature.component';
import { CapexPurposeComponent } from './components/capex-purpose/capex-purpose.component';
import { ApprovalLimitProfileComponent } from "./components/approval-limit-profile/approval-limit-profile.component";
import { CapexLayoutComponent} from './components/capex-layout/capex-layout.component';
import { CapexComponent } from './components/capex/capex.component';
import { BudgetProfileComponent } from "./components/budget-profile/budget-profile.component";
import { CapexApprovalComponent } from './components/capex-approval/capex-approval.component';
import { CapexDisposalComponent } from './components/capex-disposal/capex-disposal.component';
import { CapexDisposalApprovalComponent } from './components/capex-disposal-approval/capex-disposal-approval.component';

const routes: Routes = [
  {
    path: '', component: CapexLayoutComponent,
    children: [
      {
        path:'approvallimitprofile',
        component:ApprovalLimitProfileComponent
      },
      {
        path: 'requesttype',
        component: RequestTypeComponent
      },
      {
        path: 'capexnature',
        component: CapexNatureComponent
      },
      {
        path: 'capexpurpose',
        component: CapexPurposeComponent
      },
      {
        path: 'capex',
        component: CapexComponent
      },    
      {
      path: 'budgetprofile',
      component: BudgetProfileComponent     
      },
      {
        path: 'capex-approval',
        component: CapexApprovalComponent
      },
      {
        path: 'capex-disposal',
        component: CapexDisposalComponent
      },
      {
        path: 'capex-disposal-approval',
        component: CapexDisposalApprovalComponent
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
export class CapexRoutingModule { }
