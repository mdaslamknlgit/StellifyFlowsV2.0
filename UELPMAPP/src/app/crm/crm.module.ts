import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrmRoutingModule } from './crm-routing.module';

import { ImportcsvComponent } from './components/importcsv/importcsv.component';
import { CrmlayoutComponent } from './components/crmlayout/crmlayout.component';
import { SharedModule as PrimeNgSharedModule } from "primeng/shared";
import { SharedModule } from '../shared/shared.module';
import { BackgroundprocessComponent } from './components/backgroundprocess/backgroundprocess.component';
import {  LeadsListComponent } from './components/leadslist/leads-list.component';
import { CrmtemplatesComponent } from './components/crmtemplates/crmtemplates.component';

import { CrmcampaignsComponent } from './components/crmcampaigns/crmcampaigns.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { CrmdashboardComponent } from './components/crmdashboard/crmdashboard.component';
import { CrmconnectionsListComponent } from './components/crmconnectionslist/crmconnections-list.component';
import { CrmconnectionsComponent } from './components/crmconnections/crmconnections.component';
import { CrmconnectionsdetailsComponent } from './components/crmconnectionsdetails/crmconnectionsdetails.component';
import { TreeTableModule } from "primeng/treetable";
import { TableModule } from "primeng/table";
import { TreeNode } from "primeng/api";
import { NodeService } from './services/node-service';
// import { TreeTableTogglerComponent } from '../shared/externalbuttons/components/tree-table-toggler/tree-table-toggler.component';
import { TreetableComponent } from './components/treetable/treetable.component';
import { AssignedToDialog, LeadConvertDialog, LeadQualifyDialog, LeadsComponent } from './components/leads/leads.component';
import { AppCustomMaterialModuleModule } from '../shared/app-custom-material-module/app-custom-material-module.module';
import { LeadListsComponent } from './components/leadlists/lead-lists.component';
import { NgbActiveModal, NgbDateParserFormatter, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MomentDateFormatter } from '../po/helpers/momentdate';
import { OpenCloseComponent } from './components/open-close/open-close.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { PermissionFormComponent } from './permission-form/permission-form.component';
import { LeadsearchComponent } from './leadsearch/leadsearch.component';
import { LeadsearchmodalComponent } from './leadsearchmodal/leadsearchmodal.component';
import { LeadfilterComponent } from './components/leadfilter/leadfilter.component';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatNativeDateModule, MatPaginatorModule, MatRadioModule, MatSelectModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';
import { AnimationslideComponent } from './animationslide/animationslide.component'
import { Animationfadeomponent } from './animationtest/animationfade.component';
import { OpportunitieslistComponent } from './components/opportunitieslist/opportunitieslist.component';
import { OpportunitiesComponent } from './components/opportunities/opportunities.component';
import { FilterLeadComponent  } from './components/filterlead/filter-lead.component';
import { ContactImportDoalog, ContactslistComponent } from './components/contactslist/contactslist.component';
import { ContactsComponent, DealAccountCDialog } from './components/contacts/contacts.component';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { BlockUIModule } from "ng-block-ui";
import { AccountslistComponent } from './components/accountsslist/accountslist.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogModule } from 'primeng/dialog';
import { EmailImportComponent } from './components/email-import/email-import.component';
import { TreeTableModule as NgTreeTableModule } from 'ng-treetable';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CRMActivitiesListComponent } from './components/crmactiviteslist/crmactivitieslist.component';
import { CrmactivityComponent } from './components/crmactivity/crmactivity.component';
import { CrmactivityPhoneComponent } from './components/crmactivityphone/crmactivity-phone.component';
import { CrmactivityLogACallComponent } from './components/crmactivitylogacall/crmactivity-logacall.component';
import { TimeMaskDirective } from './directives/time-mask.directive';
import { LeadconvertComponent } from './components/leadconvert/leadconvert.component';
import { DealListsComponent } from './components/deallists/deal-lists.component';
import { DealAccountDialog, DealAssignedToDialog, DealCloseWonDialog, DealComponent, DealContactDialog } from './components/deals/deal.component';
import { EntityImportComponent } from './components/entity-import/entity-import.component';
// import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  imports: [
    NgTreeTableModule,
    NgSelectModule,
    //NgxIntlTelInputModule,
    DialogModule,
    ConfirmDialogModule,
    MalihuScrollbarModule,
    CommonModule,
    NgbModule.forRoot(),
    NgbDropdownModule,
    FormsModule,
    ReactiveFormsModule,    
    CrmRoutingModule,
    SharedModule,
    TableModule,
    TreeTableModule,
    AppCustomMaterialModuleModule,
    NgbPaginationModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatToolbarModule,
    BlockUIModule.forRoot(),
   
  ],
  entryComponents:[
    LeadsearchComponent,LeadsearchmodalComponent,CrmactivityLogACallComponent,
    LeadfilterComponent,LeadQualifyDialog,AssignedToDialog,LeadConvertDialog,LeadconvertComponent,
    DealAssignedToDialog,DealAccountDialog,DealContactDialog,
    DealCloseWonDialog,DealAccountCDialog,ContactImportDoalog
  ],
  declarations: [
    ContactImportDoalog,
    DealAccountDialog,DealContactDialog,
    DealAssignedToDialog,
    DealCloseWonDialog,
    DealAccountCDialog,
    AssignedToDialog,
    LeadQualifyDialog,
    LeadConvertDialog,
    OnlyNumberDirective,PhoneMaskDirective,EmailImportComponent,
    EntityImportComponent,
    CrmlayoutComponent, ImportcsvComponent, BackgroundprocessComponent, 
    LeadsListComponent, LeadsComponent,LeadListsComponent,
    DealComponent,DealListsComponent,
    CrmtemplatesComponent, CrmconnectionsListComponent, 
    CrmcampaignsComponent, AnalyticsComponent, CrmdashboardComponent, CrmconnectionsComponent, 
    CrmconnectionsdetailsComponent,
    TreetableComponent,
    OpenCloseComponent,
    PermissionFormComponent,
    LeadsearchComponent,
    LeadsearchmodalComponent,
    LeadfilterComponent,
    Animationfadeomponent,
    AnimationslideComponent,
    OpportunitieslistComponent,
    OpportunitiesComponent,
    FilterLeadComponent,
    ContactslistComponent,
    ContactsComponent,
    AccountslistComponent,
    AccountsComponent,
    DashboardComponent,
    CRMActivitiesListComponent,
    CrmactivityComponent,
    CrmactivityPhoneComponent,
    CrmactivityLogACallComponent,
    LeadconvertComponent
  ],
    providers:[NodeService,NgbActiveModal,NgbDropdownModule,
      {provide: NgbDateParserFormatter, useClass: MomentDateFormatter}]
})
export class CrmModule { }
