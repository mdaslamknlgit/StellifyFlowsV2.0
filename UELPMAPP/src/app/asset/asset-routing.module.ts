import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetLayoutComponent } from './components/asset-layout/asset-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
const routes: Routes = [
  {
    path: '', component: AssetLayoutComponent,  
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent     
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
export class AssetRoutingModule { }
