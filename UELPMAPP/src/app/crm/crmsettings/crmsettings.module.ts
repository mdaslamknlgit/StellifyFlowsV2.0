import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmsettingsLayoutComponent } from './components/crmsettings-layout/crmsettings-layout.component';
import { CrmsettingsMenuComponent } from './components/crmsettings-menu/crmsettings-menu.component';
import { LeadsettingsComponent } from './components/leadsettings/leadsettings.component';
import { CrmleadsettingsComponent } from './components/crmleadsettings/crmleadsettings.component';
import { CrmsettingsRoutingModule } from './crmsettings-routing.module';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, 
  MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatNativeDateModule,
   MatPaginatorModule, MatRadioModule, MatSelectModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import {  ConfirmDialogModule, DialogModule,  TreeTableModule } from 'primeng/primeng';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { NgbActiveModal, NgbDateParserFormatter, NgbDropdownModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AppCustomMaterialModuleModule } from '../../shared/app-custom-material-module/app-custom-material-module.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BlockUIModule } from "ng-block-ui";
import { NodeService } from '../services/node-service';
import { MomentDateFormatter } from '../../po/helpers/momentdate';
import { SharedModule } from '../../shared/shared.module';
import { CrmsettingsComponent } from './components/crmsettings/crmsettings.component';
import { CrmcontactssettingsComponent } from './components/crmcontactssettings/crmcontactssettings.component';
@NgModule({
  imports: [
    CommonModule,
    CrmsettingsRoutingModule,
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
  declarations: [CrmsettingsLayoutComponent, CrmsettingsMenuComponent, 
    LeadsettingsComponent, CrmleadsettingsComponent, CrmleadsettingsComponent, CrmsettingsComponent, CrmcontactssettingsComponent],
    providers:[NodeService,NgbActiveModal,NgbDropdownModule,
      {provide: NgbDateParserFormatter, useClass: MomentDateFormatter}]
})
export class CrmsettingsModule { }
