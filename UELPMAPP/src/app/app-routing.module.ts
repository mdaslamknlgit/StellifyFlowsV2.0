
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { AuthGuardService } from './shared/services/auth-guard.service';
import { AuthenticateGuardService } from './shared/services/authenticate-guard.service';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
const routes: Routes = [
  {
    path:'crm',
    loadChildren:'app/crm/crm.module#CrmModule',
    //canActivate:[AuthGuardService]
  },
  {
    path:'crmsettings',
    loadChildren:'app/crm/crmsettings/crmsettings.module#CrmsettingsModule'
  },
  {
    path: 'inventory',
    loadChildren: 'app/inventory/inventory.module#InventoryModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'asset',
    loadChildren: 'app/asset/asset.module#AssetModule',
    canActivate: [AuthGuardService]

  },
  {
    path: 'facility',
    loadChildren: 'app/facility/facility.module#FacilityModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'fixedassets',
    loadChildren: 'app/fixedassets/fixedassets.module#FixedassetsModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'po',
    loadChildren: 'app/po/po.module#PoModule',
    canActivate: [AuthGuardService]
    //canActivateChild: [AuthenticateGuardService],
    //data:['po']
  },
  // {
  //   path: 'inventorymanagement',
  //   loadChildren: 'app/inventorymanagement/inventorymanagement.module#InventorymanagementModule',
  // },
  {
    path: 'project',
    loadChildren: 'app/project/project.module#ProjectModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'user',
    loadChildren: 'app/user/user.module#UserModule'
  },
  {
    path: 'admin',
    loadChildren: 'app/administration/administration.module#AdministrationModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'ecapex',
    loadChildren: 'app/e-capex/capex.module#CapexModule',
    canActivate: [AuthGuardService],
  },

  {
    path: 'leasing',
    loadChildren: 'app/leasing/leasing.module#LeasingModule',
    canActivate: [AuthGuardService],
  },
  {
    path: 'adhoc',
    loadChildren: 'app/adhoc/adhoc.module#AdhocModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'reports',
    loadChildren: 'app/reports/reports.module#ReportsModule'
  },
  {
    path: 'releasenotes',
    component: ReleaseNotesComponent
  },

  {
    path: '',
    //loadChildren: 'app/inventory/inventory.module#InventoryModule'  
    loadChildren: 'app/user/user.module#UserModule'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
