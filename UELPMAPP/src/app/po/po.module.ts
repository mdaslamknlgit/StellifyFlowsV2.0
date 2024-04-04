import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule ,MatSlideToggleModule,MatCheckboxModule,MatMenuModule } from '@angular/material';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { SharedModule as PrimeNgSharedModule } from "primeng/shared";
import { SharedModule } from '../shared/shared.module';
import { PoRoutingModule } from './po-routing.module';
import { PoLayoutComponent } from './components/po-layout/po-layout.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SuppliersListComponent } from './components/suppliers-list/suppliers-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PoCreationComponent } from './components/po-creation/po-creation.component';
import { PoListComponent } from './components/po-list/po-list.component';
import { SupplierCategoryComponent } from './components/supplier-category/supplier-category.component';
import { PurchaseOrderRequestComponent } from './components/purchase-order-request/purchase-order-request.component';
import { CreditNoteComponent } from './components/credit-note/credit-note.component';
import { PaymentTermsOldComponent } from './components/payment-terms-old/payment-terms-old.component';
import { SupplierServicesComponent } from './components/supplier-services/supplier-services.component';
import { QuotationRequestComponent } from "./components/quotation-request/quotation-request.component";
import { SupplierInvoiceComponent } from "./components/supplier-invoice/supplier-invoice.component";
import { DeliveryOrderComponent } from "./components/delivery-order/delivery-order.component";
import { SupplierPaymentComponent } from "./components/supplier-payment/supplier-payment.component";
import { PurchaseOrderRequestApprovalComponent } from "./components/purchase-order-request-approval/purchase-order-request-approval.component";
import { QuotationResponseComponent } from "./components/quotation-response/quotation-response.component";
import { QuotationResponseApprovalComponent } from "./components/quotation-response-approval/quotation-response-approval.component";
import { SalesOrderCreationComponent } from "./components/sales-order/sales-order.component";
import { SalesOrderApprovalComponent } from "./components/sales-order-approval/sales-order-approval.component";
import { ContractPurchaseOrderComponent } from "./components/contract-purchase-order/contract-purchase-order.component";
import { StandardPurchaseOrderComponent } from "./components/standard-purchase-order/standard-purchase-order.component";
import { AssetPurchaseOrderComponent } from "./components/asset-purchase-order/asset-purchase-order.component";
import { ProjectContractMasterComponent } from "./components/project-contract-master/project-contract-master.component";
import { ProjectPurchaseOrderComponent } from "./components/project-purchase-order/project-purchase-order.component";
import { ExpensePurchaseOrderComponent } from "./components/expense-purchase-order/expense-purchase-order.component";
import { ServiceCategoryComponent } from "./components/service-category/service-category.component";
import { DeliveryTermsComponent } from "./components/delivery-terms/delivery-terms.component";
import { GoodReceivedNotesComponent } from "./components/goods-received-notes/goods-received-notes.component";
import { PoApprovalComponent } from "./components/po-approval/po-approval.component";
import { TaxComponent } from './components/tax/tax.component';
import { DetailedNumberFormatPipe } from "./pipes/detailed-number.pipe";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { StandardSalesOrderComponent } from './components/standard-sales-order/standard-sales-order.component';
import { ExpenseMasterComponent } from './components/expense-master/expense-master.component';
import { CustomerPaymentComponent } from './components/customer-payment/customer-payment.component';
import { VoidPurchaseOrderPopUpComponent } from './components/void-purchase-order-popup/void-purchase-order-popup.component';
import { ServiceTypeComponent } from './components/service-type/service-type.component';
import { AccountCodeComponent } from './components/account-code/account-code.component';
import { GoodsReturnedNotesComponent } from './components/goods-returned-notes/goods-returned-notes.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ExportInvoiceComponent } from './components/export-invoice/export-invoice.component';
import { AccrualManagementComponent } from './components/accrual-management/accrual-management.component';
import { CustomObjArrayFilterPipe } from "./pipes/custom-object-array-filter.pipe";
import { CustomFilterPipe } from "./pipes/custom-filter.pipe";
import { EmailPurchaseOrderPopupComponent } from './components/email-purchase-order-popup/email-purchase-order-popup.component';
import { CoaAccountTypeComponent } from './components/coa-account-type/coa-account-type.component';
import { TaxGroupComponent } from './components/tax-group/tax-group.component';
import { AccountSubCategoryComponent } from './components/account-sub-category/account-sub-category.component';
import { ProjectVariationOrderComponent } from './components/project-variation-order/project-variation-order.component';
import {  CheckboxModule } from 'primeng/primeng';
import { VendorsExportComponent } from './components/vendors-export/vendors-export.component';
import { SupplierRejectPopupComponent } from './components/supplier-reject-popup/supplier-reject-popup.component';
import {NgxScrollToFirstInvalidModule} from '@ismaestro/ngx-scroll-to-first-invalid';
import { ProjectPaymentHistoryComponent } from './components/project-payment-history/project-payment-history.component';
import { ExpenseTypeComponent } from './components/expense-type/expense-type.component';
import { ImportPaymentsComponent } from './components/import-payments/import-payments.component';

import { ProjectPaymentListComponent } from './components/project-payment-list/project-payment-list.component';
import { ProjectVariationOrderListComponent } from './components/project-variation-order-list/project-variation-order-list.component';
import { ProjectVOComponent } from './components/project-vo/project-vo.component';
import { NgxCurrencyModule } from "ngx-currency";
import { SetParenthesisPipe } from './pipes/set-parenthesis.pipe';
import { ProjectPaymentReportComponent } from './components/project-payment-report/project-payment-report.component';
import { CreditNoteListComponent } from './components/credit-note-list/credit-note-list.component';
import { SchedulerMasterComponent } from './components/scheduler-master/scheduler-master.component';
import { SetSupplierCodePipe } from './pipes/set-supplier-code.pipe';
import { PListComponent } from './components/p-list/p-list.component';
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import {MomentDateFormatter } from './helpers/momentdate'
import { ContractMasterListComponent } from './components/contract-master-list/contract-master-list.component';
import { ProjectContractMasterListComponent } from './components/project-contract-master-list/project-contract-master-list.component';
import { ExpenseTypeListComponent } from './components/expense-type-list/expense-type-list.component';
import { PoApprovalListComponent } from './components/po-approval-list/po-approval-list.component';
import { GoodReceivedNotesListComponent } from './components/goods-received-notes-list/goods-received-notes-list.component';
import { SupplierInvoiceListComponent } from './components/supplier-invoice-list/supplier-invoice-list.component';

import { PoListNewComponent } from './components/po-list-new/po-list-new.component'; 
import { PoCreationNewComponent } from './components/po-creation-new/po-creation-new.component';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TaxListComponent } from './components/tax-list/tax-list.component';
import { ContractMasterOldComponent } from './components/contract-master-old/contract-master-old.component';
import { ContractPurchaseOrderOldComponent } from './components/contract-purchase-order-old/contract-purchase-order-old.component';
import {  PaymentTermsListComponent } from './components/payment-terms-list/payment-terms-list.component';
import { PaymentTermsComponent } from './components/payment-terms/payment-terms.component';
import { SuppliersOldComponent } from './components/suppliers-old/suppliers-old.component';
//import { ContractMasterComponent }  from "./components/contract-master/contract-master.component";
import { BlockUIModule } from "ng-block-ui";
import { SuppliersOldLayoutComponent } from './components/suppliers-old-layout/suppliers-old-layout.component';

@NgModule({
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,     
    SharedModule,    
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,    
    PoRoutingModule,
    MatCheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    MatAutocompleteModule, 
    MatFormFieldModule,
    MatInputModule,
    AutoCompleteModule,
    MultiSelectModule,
    CheckboxModule,
    PrimeNgSharedModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxScrollToFirstInvalidModule,
    NgxCurrencyModule,
    MatMenuModule,
    NgbPaginationModule,
    BlockUIModule.forRoot(),
  ],
  declarations: [PoLayoutComponent, 
                SuppliersComponent,SuppliersListComponent,SuppliersOldComponent,SuppliersOldLayoutComponent,
                 DeliveryOrderComponent,DashboardComponent, PoCreationComponent,
                 PoListComponent,PListComponent,
                 SupplierCategoryComponent, PurchaseOrderRequestComponent, CreditNoteComponent, 
                 PaymentTermsOldComponent, PaymentTermsListComponent,PaymentTermsComponent,
                 SupplierServicesComponent,QuotationRequestComponent,
                 SupplierInvoiceComponent,SupplierInvoiceListComponent, SupplierPaymentComponent,PurchaseOrderRequestApprovalComponent,
                 QuotationResponseComponent,QuotationResponseApprovalComponent,SalesOrderCreationComponent,
                 SalesOrderApprovalComponent,ContractPurchaseOrderComponent,StandardPurchaseOrderComponent,
                 AssetPurchaseOrderComponent,
                 ProjectContractMasterComponent,
                 ProjectContractMasterListComponent,
                 ProjectPurchaseOrderComponent,
                 ExpensePurchaseOrderComponent,DeliveryTermsComponent,
                 QuotationResponseComponent,QuotationResponseApprovalComponent,SalesOrderCreationComponent,
                 ServiceCategoryComponent,
                 SalesOrderApprovalComponent, TaxComponent,TaxListComponent,
                 GoodReceivedNotesComponent,GoodReceivedNotesListComponent,
                 PoApprovalComponent,PoApprovalListComponent,
                 DetailedNumberFormatPipe, StandardSalesOrderComponent, ExpenseMasterComponent, 
                 CustomerPaymentComponent,VoidPurchaseOrderPopUpComponent, 
                 ServiceTypeComponent, AccountCodeComponent, GoodsReturnedNotesComponent,
                 ContractMasterListComponent,
                 ContractMasterOldComponent,ContractPurchaseOrderOldComponent,
                 ExportInvoiceComponent, AccrualManagementComponent,CustomObjArrayFilterPipe,CustomFilterPipe, EmailPurchaseOrderPopupComponent, CoaAccountTypeComponent, TaxGroupComponent, AccountSubCategoryComponent, ProjectVariationOrderComponent, VendorsExportComponent, 
                 SupplierRejectPopupComponent, ProjectPaymentHistoryComponent, ExpenseTypeComponent, ExpenseTypeListComponent,
                 ImportPaymentsComponent, ProjectPaymentListComponent, ProjectVariationOrderListComponent, ProjectVOComponent, SetParenthesisPipe, ProjectPaymentReportComponent, CreditNoteListComponent, SchedulerMasterComponent, SetSupplierCodePipe,
                 PoListNewComponent , PoCreationNewComponent
                ],
  providers: [
    {provide: NgbDateParserFormatter, useClass: MomentDateFormatter}
  ]              
})
export class PoModule { }
