import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdhocRoutingModule } from './adhoc-routing.module';
import { IpsLibrariesModule } from '../ips-libraries/ips-libraries.module';
import { AdhocLayoutComponent } from './components/adhoc-layout/adhoc-layout.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { BankMasterComponent } from './components/bank-master/bank-master.component';
import { CreditTermComponent } from './components/credit-term/credit-term.component';
import { CustomerTypeComponent } from './components/customer-type/customer-type.component';
import { EmailConfigComponent } from './components/email-config/email-config.component';
import { LocationMasterComponent } from './components/location-master/location-master.component';
import { TaxMasterComponent } from './components/tax-master/tax-master.component';
import { TaxTypeComponent } from './components/tax-type/tax-type.component';
import { TenantsTypeComponent } from './components/tenants-type/tenants-type.component';
import {  TaxGroupOldComponent } from './components/tax-group-old/tax-group-old.component';
import { CustomerComponent } from './components/customer/customer.component';
import { CustomerImportComponent } from './components/customer-import/customer-import.component';
import { QuotationListComponent } from './components/quotation-list/quotation-list.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuotationLineItemsComponent } from './components/quotation-line-items/quotation-line-items.component';
import { SalesInvoiceComponent } from './components/sales-invoice/sales-invoice.component';
import { SalesInvoiceListComponent } from './components/sales-invoice-list/sales-invoice-list.component';
import { SalesInvoiceExportComponent } from './components/sales-invoice-export/sales-invoice-export.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    IpsLibrariesModule,
    AdhocRoutingModule
  ],
  declarations: [AdhocLayoutComponent, CustomerListComponent, BankMasterComponent, CreditTermComponent,
    CustomerTypeComponent, EmailConfigComponent, LocationMasterComponent, TaxMasterComponent, TaxTypeComponent, TenantsTypeComponent,
     TaxGroupOldComponent, CustomerComponent, CustomerImportComponent, QuotationListComponent, QuotationComponent, QuotationLineItemsComponent, SalesInvoiceComponent, SalesInvoiceListComponent, SalesInvoiceExportComponent]
})
export class AdhocModule { }
