import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrmlayoutComponent } from './components/crmlayout/crmlayout.component';
import { ImportcsvComponent } from './components/importcsv/importcsv.component';
import { BackgroundprocessComponent } from './components/backgroundprocess/backgroundprocess.component';
import {  LeadsListComponent } from './components/leadslist/leads-list.component';
import { CrmtemplatesComponent } from './components/crmtemplates/crmtemplates.component';
import { CrmconnectionsListComponent } from './components/crmconnectionslist/crmconnections-list.component';
import { CrmcampaignsComponent } from './components/crmcampaigns/crmcampaigns.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { CrmdashboardComponent } from './components/crmdashboard/crmdashboard.component';
import { CrmconnectionsComponent } from './components/crmconnections/crmconnections.component';
import { CrmconnectionsdetailsComponent } from './components/crmconnectionsdetails/crmconnectionsdetails.component';
import { TreetableComponent } from './components/treetable/treetable.component';
import { LeadsComponent } from './components/leads/leads.component';
import { LeadListsComponent } from './components/leadlists/lead-lists.component';
import { OpenCloseComponent } from './components/open-close/open-close.component';
import { PermissionFormComponent } from './permission-form/permission-form.component';
import { AnimationslideComponent } from './animationslide/animationslide.component';
import { Animationfadeomponent } from './animationtest/animationfade.component';
import { OpportunitieslistComponent } from './components/opportunitieslist/opportunitieslist.component';
import { OpportunitiesComponent } from './components/opportunities/opportunities.component';
import { FilterLeadComponent } from './components/filterlead/filter-lead.component';
import { ContactslistComponent } from './components/contactslist/contactslist.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { AccountslistComponent } from './components/accountsslist/accountslist.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { EmailImportComponent } from './components/email-import/email-import.component';
import { CRMActivitiesListComponent } from './components/crmactiviteslist/crmactivitieslist.component';
import { CrmactivityComponent } from './components/crmactivity/crmactivity.component';
import { DealListsComponent } from './components/deallists/deal-lists.component';
import { DealComponent } from './components/deals/deal.component';
import { EntityImportComponent } from './components/entity-import/entity-import.component';

const routes: Routes = [
  {
    path: '', component: CrmlayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: CrmdashboardComponent,
      },
      {
        path: 'emailimportcsv',
        component: EmailImportComponent,
      },
      {
        path: 'entityimport',
        component: EntityImportComponent,
      },
      {
        path: 'importcsv',
        component: ImportcsvComponent,
      },
      {
        path: 'backgroundprocess',
        component: BackgroundprocessComponent,
      },
      {
        path: 'leadlists/:id',
        component: LeadListsComponent,
      },
      {
        path: 'crmactivities/:id',
        component:CRMActivitiesListComponent
      },
      {
        path: 'crmactivity/:mode/:Id/:activitytype/:return/:returnid',
        component:CrmactivityComponent
      },
      {
        path: 'contactslist/:id',
        component: ContactslistComponent,
      },
      {
        path: 'contacts/:mode/:Id/:return/:returnid',
        component: ContactsComponent,
      },
      {
        path: 'deallist/:id',
        component: DealListsComponent,
      },
      {
        path: 'deal/:mode/:Id/:return',
        component: DealComponent,
      },
      {
        path: 'deal/:mode/:Id/:return/:ContactId/:AccountId',
        component: DealComponent,
      },
      {
        path: 'accountslist/:id',
        component: AccountslistComponent,
      },
      {
        path: 'accounts/:mode/:Id/:return',
        component: AccountsComponent,
      },
      {
        path: 'animationfade',
        component: Animationfadeomponent,
      },
      {
        path: 'animationslide',
        component: AnimationslideComponent,
      },
      {
        path: 'leadslist',
        component: LeadsListComponent,
      },
      {
        path: 'leads/:mode/:Id/:return',
        component: LeadsComponent,
      },
      {
        path: 'leads/:mode/:Id/:return/:ContactId/:AccountId',
        component: LeadsComponent,
      },
      {
        path: 'treetable',
        component: TreetableComponent,
      },
      {
        path: 'crmtemplates',
        component: CrmtemplatesComponent,
      },
      {
        path: 'crmconnectionslist',
        component: CrmconnectionsListComponent,
      },
      {
        path: 'crmconnections/:mode/:Id',
        component: CrmconnectionsComponent,
      },
      {
        path: 'crmconnectionsdetails/:mode/:Id',
        component: CrmconnectionsdetailsComponent,
      },
      {
        path: 'crmcampaigns',
        component: CrmcampaignsComponent,
      },
      {
        path: 'opportunities',
        component: OpportunitieslistComponent,
      },
      {
        path: 'opportunities/:mode/:Id/:returnentityid',
        component: OpportunitiesComponent,
      },
      
      {
        path: 'crmanalytics',
        component: AnalyticsComponent,
      },
      {
        path: 'crmdashboard',
        component: CrmdashboardComponent,
      },
      {
        path: 'openc',
        component: OpenCloseComponent,
      },
      {
        path: 'permissionform',
        component: PermissionFormComponent,
      },
      {
        path: 'filterlead',
        component: FilterLeadComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
