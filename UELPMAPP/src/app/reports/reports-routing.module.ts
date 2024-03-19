import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminWorkflowComponent } from './components/admin-workflow/admin-workflow.component';
import { APCreditnoteComponent } from './components/ap-creditnote/ap-creditnote.component';
import { ApInvoiceComponent } from './components/ap-invoice/ap-invoice.component';
import { CashflowComponent } from './components/cashflow/cashflow.component';
import { COAComponent } from './components/coa/coa.component';
import { POItemsComponent } from './components/po-items/po-items.component';
import { POComponent } from './components/po/po.component';
import { POCMasterComponent } from './components/poc-master/poc-master.component';
import { POCComponent } from './components/poc/poc.component';
import { POPInvoiceComponent } from './components/pop-invoice/pop-invoice.component';
import { POPMasterComponent } from './components/pop-master/pop-master.component';
import { ReportsLayoutComponent } from './components/reports-layout/reports-layout.component';
import { SupplierComponent } from './components/supplier/supplier.component';

const routes: Routes = [
  {
    path: '', component: ReportsLayoutComponent,
    children: [
      {
        path: 'supplier', component: SupplierComponent
      },
      {
        path: 'ap-invoice', component: ApInvoiceComponent
      },
      {
        path: 'adminworkflow', component: AdminWorkflowComponent
      },
      {
        path: 'po', component: POComponent
      },
      {
        path: 'po-items', component: POItemsComponent
      },
      {
        path: 'poc-master', component: POCMasterComponent
      },
      {
        path: 'poc', component: POCComponent
      },
      {
        path: 'coa', component: COAComponent
      },
      {
        path: 'ap-creditnote', component: APCreditnoteComponent
      },
      {
        path: 'pop-master', component: POPMasterComponent
      },
      {
        path: 'pop-invoice', component: POPInvoiceComponent
      },
      {
        path: 'cashflow', component: CashflowComponent
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
export class ReportsRoutingModule { }
