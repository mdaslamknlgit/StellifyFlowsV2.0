import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CapexLayoutComponent } from "./components/leasing-layout/leasing-layout.component";
import { UtilitymanagementComponent } from './components/utilitymanagement/utilitymanagement.component';
import { RentrollmanagementComponent } from './components/rentrollmanagement/rentrollmanagement.component';
import { ContractManagementComponent } from './components/contract-management/contract-management.component';

const routes: Routes = [
  {
    path: '', component: CapexLayoutComponent,  
    children: [    
      {
        path:'utilitymanagement',
        component:UtilitymanagementComponent
      },
      {
        path:'rentrollmanagement',
        component:RentrollmanagementComponent
      },
      {
        path:'contractmanagement',
        component:ContractManagementComponent
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
export class LeasingRoutingModule { }
