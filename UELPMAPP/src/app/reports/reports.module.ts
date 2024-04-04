import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsLayoutComponent } from './components/reports-layout/reports-layout.component';
import { DataGridComponent } from './components/data-grid/data-grid.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IpsLibrariesModule } from '../ips-libraries/ips-libraries.module';
import { SupplierComponent } from './components/supplier/supplier.component';
import { ApInvoiceComponent } from './components/ap-invoice/ap-invoice.component';
import { AdminWorkflowComponent } from './components/admin-workflow/admin-workflow.component';
import { POComponent } from './components/po/po.component';
import { POItemsComponent } from './components/po-items/po-items.component';
import { POCMasterComponent } from './components/poc-master/poc-master.component';
import { POCComponent } from './components/poc/poc.component';
import { COAComponent } from './components/coa/coa.component';
import { APCreditnoteComponent } from './components/ap-creditnote/ap-creditnote.component';
import { POPMasterComponent } from './components/pop-master/pop-master.component';
import { POPInvoiceComponent } from './components/pop-invoice/pop-invoice.component';
import { CashflowComponent } from './components/cashflow/cashflow.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    IpsLibrariesModule,
    ReportsRoutingModule
  ],
  declarations: [ReportsLayoutComponent, DataGridComponent, SupplierComponent, ApInvoiceComponent, AdminWorkflowComponent, POComponent, POItemsComponent, POCMasterComponent, POCComponent, COAComponent, APCreditnoteComponent, POPMasterComponent, POPInvoiceComponent, CashflowComponent]
})
export class ReportsModule { }
