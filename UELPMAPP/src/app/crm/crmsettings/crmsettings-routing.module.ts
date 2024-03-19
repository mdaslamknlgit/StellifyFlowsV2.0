import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrmsettingsMenuComponent } from './components/crmsettings-menu/crmsettings-menu.component';
import { LeadsettingsComponent } from './components/leadsettings/leadsettings.component';
import { CrmleadsettingsComponent } from './components/crmleadsettings/crmleadsettings.component';
import { CrmsettingsLayoutComponent } from './components/crmsettings-layout/crmsettings-layout.component';
import { CrmsettingsComponent } from './components/crmsettings/crmsettings.component';
import { CrmcontactssettingsComponent } from './components/crmcontactssettings/crmcontactssettings.component';

const routes: Routes = [
  {
    path: '', component: CrmsettingsMenuComponent,
    children: [
      {
        path: 'crmsettings',
        component: CrmsettingsComponent,
      },
      {
        path: 'leadsettings',
        component: LeadsettingsComponent,
      },
      {
        path: 'crmleadsettings',
        component: CrmleadsettingsComponent,
      },
      {
        path: 'contactssettings',
        component: CrmcontactssettingsComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmsettingsRoutingModule { }
