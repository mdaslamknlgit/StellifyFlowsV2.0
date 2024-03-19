import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdhocLayoutComponent } from './components/adhoc-layout/adhoc-layout.component';
import { BankMasterComponent } from './components/bank-master/bank-master.component';
import { CreditTermComponent } from './components/credit-term/credit-term.component';
import { CustomerImportComponent } from './components/customer-import/customer-import.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerTypeComponent } from './components/customer-type/customer-type.component';
import { CustomerComponent } from './components/customer/customer.component';
import { EmailConfigComponent } from './components/email-config/email-config.component';
import { LocationMasterComponent } from './components/location-master/location-master.component';
import { QuotationListComponent } from './components/quotation-list/quotation-list.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { TaxMasterComponent } from './components/tax-master/tax-master.component';
import { TaxTypeComponent } from './components/tax-type/tax-type.component';
import { TenantsTypeComponent } from './components/tenants-type/tenants-type.component';
import { SalesInvoiceComponent } from './components/sales-invoice/sales-invoice.component';
import { SalesInvoiceListComponent } from './components/sales-invoice-list/sales-invoice-list.component';
import { SalesInvoiceExportComponent } from './components/sales-invoice-export/sales-invoice-export.component';
import { TaxGroupOldComponent } from './components/tax-group-old/tax-group-old.component';
const routes: Routes = [
  {
    path: '', component: AdhocLayoutComponent,
    children: [
      {
        path: 'bank-master',
        component: BankMasterComponent
      },
      {
        path: 'credit-term',
        component: CreditTermComponent
      },
      {
        path: 'customer-type',
        component: CustomerTypeComponent
      },
      {
        path: 'email-config',
        component: EmailConfigComponent
      },
      {
        path: 'location',
        component: LocationMasterComponent
      },
      {
        path: 'tax-group-old',
        component: TaxGroupOldComponent
      },
      {
        path: 'tax-master',
        component: TaxMasterComponent
      },
      {
        path: 'tax-type',
        component: TaxTypeComponent
      },
      {
        path: 'tenants-type',
        component: TenantsTypeComponent
      },
      {
        path: 'customer/import',
        component: CustomerImportComponent
      },
      {
        path: 'customer/list/approval',
        component: CustomerListComponent
      },
      {
        path: 'customer/list/request',
        component: CustomerListComponent
      },
      {
        path: 'customer/:type/:id',
        component: CustomerComponent
      },
      {
        path: 'customer/:type',
        component: CustomerComponent
      },
      {
        path: 'quotation/list/approval',
        component: QuotationListComponent
      },
      {
        path: 'quotation/list/request',
        component: QuotationListComponent
      },
      {
        path: 'quotation/:type/:id',
        component: QuotationComponent
      },
      {
        path: 'quotation/:type',
        component: QuotationComponent
      },
      {
        path: 'invoice/list/approval',
        component: SalesInvoiceListComponent
      },
      {
        path: 'invoice/list/request',
        component: SalesInvoiceListComponent
      },
      {
        path: 'invoice/export',
        component: SalesInvoiceExportComponent
      },
      {
        path: 'invoice/:type/:id',
        component: SalesInvoiceComponent
      },
      {
        path: 'invoice/:type',
        component: SalesInvoiceComponent
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
export class AdhocRoutingModule { }
