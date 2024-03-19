import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreditNoteComponent } from './components/credit-note/credit-note.component';
import { DeliveryOrderComponent } from "./components/delivery-order/delivery-order.component";
import { DeliveryTermsComponent } from "./components/delivery-terms/delivery-terms.component";
import { ExpenseMasterComponent } from "./components/expense-master/expense-master.component";
import { PoLayoutComponent } from './components/po-layout/po-layout.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { PoCreationComponent } from './components/po-creation/po-creation.component';
import { PoListComponent} from './components/po-list/po-list.component';
import { SupplierCategoryComponent } from './components/supplier-category/supplier-category.component';
import { PurchaseOrderRequestComponent } from './components/purchase-order-request/purchase-order-request.component';
import { PaymentTermsOldComponent } from './components/payment-terms-old/payment-terms-old.component';
import { SupplierServicesComponent } from './components/supplier-services/supplier-services.component';
import { QuotationRequestComponent } from "./components/quotation-request/quotation-request.component";
import { SupplierInvoiceComponent } from "./components/supplier-invoice/supplier-invoice.component";
import { SupplierPaymentComponent } from "./components/supplier-payment/supplier-payment.component";
import { PurchaseOrderRequestApprovalComponent } from "./components/purchase-order-request-approval/purchase-order-request-approval.component";
import { QuotationResponseComponent } from "./components/quotation-response/quotation-response.component";
import { QuotationResponseApprovalComponent } from "./components/quotation-response-approval/quotation-response-approval.component";
import { SalesOrderCreationComponent } from "./components/sales-order/sales-order.component";
import { SalesOrderApprovalComponent } from "./components/sales-order-approval/sales-order-approval.component";
import { GoodReceivedNotesComponent } from "./components/goods-received-notes/goods-received-notes.component";
import { TaxComponent } from './components/tax/tax.component';
import { ServiceCategoryComponent } from "./components/service-category/service-category.component";
import { PoApprovalComponent } from "./components/po-approval/po-approval.component";
import { CustomerInvoiceTotal, CustomerPayment } from './models/customer-payment.model';
import { CustomerPaymentComponent } from './components/customer-payment/customer-payment.component';
import { ServiceTypeComponent } from './components/service-type/service-type.component';
import { AccountCodeComponent } from './components/account-code/account-code.component';
import { GoodsReturnedNotesComponent } from './components/goods-returned-notes/goods-returned-notes.component';
import { ExportInvoiceComponent } from './components/export-invoice/export-invoice.component';
import { AccrualManagementComponent } from './components/accrual-management/accrual-management.component';
import { ProjectContractMasterComponent } from "./components/project-contract-master/project-contract-master.component";
import { ProjectVariationOrderListComponent } from './components/project-variation-order-list/project-variation-order-list.component';
import { ProjectPurchaseOrderComponent } from "./components/project-purchase-order/project-purchase-order.component";
import { CoaAccountTypeComponent } from './components/coa-account-type/coa-account-type.component';
import { TaxGroupComponent } from './components/tax-group/tax-group.component';
import { AccountSubCategoryComponent } from './components/account-sub-category/account-sub-category.component';
import { ProjectVariationOrderComponent } from "./components/project-variation-order/project-variation-order.component";
import { VendorsExportComponent } from './components/vendors-export/vendors-export.component';
import { ProjectPaymentHistoryComponent } from './components/project-payment-history/project-payment-history.component';
import { ImportPaymentsComponent } from './components/import-payments/import-payments.component';
import { ExpenseTypeComponent } from "./components/expense-type/expense-type.component";
import { ProjectPaymentListComponent } from './components/project-payment-list/project-payment-list.component';

import { ProjectVOComponent } from './components/project-vo/project-vo.component';
import { ProjectPaymentReportComponent } from './components/project-payment-report/project-payment-report.component';
import { CreditNoteListComponent } from './components/credit-note-list/credit-note-list.component';
import { SchedulerMasterComponent } from './components/scheduler-master/scheduler-master.component';
import { PListComponent } from './components/p-list/p-list.component';
import { ContractMasterListComponent } from './components/contract-master-list/contract-master-list.component';
import { ExpenseTypeListComponent } from './components/expense-type-list/expense-type-list.component';
import { PoApprovalListComponent } from './components/po-approval-list/po-approval-list.component';
import { GoodReceivedNotesListComponent } from './components/goods-received-notes-list/goods-received-notes-list.component';
import { SupplierInvoiceListComponent } from './components/supplier-invoice-list/supplier-invoice-list.component';
import { PoListNewComponent } from './components/po-list-new/po-list-new.component';
import { PoCreationNewComponent } from './components/po-creation-new/po-creation-new.component';
import { SuppliersListComponent } from './components/suppliers-list/suppliers-list.component';
import { TaxListComponent } from './components/tax-list/tax-list.component';
import { ContractMasterOldComponent } from './components/contract-master-old/contract-master-old.component';
import { ContractPurchaseOrder } from './models/contract-purchase-order.model';
import { ContractPurchaseOrderComponent } from './components/contract-purchase-order/contract-purchase-order.component';
import {  PaymentTermsListComponent } from './components/payment-terms-list/payment-terms-list.component';
import { PaymentTermsComponent } from './components/payment-terms/payment-terms.component';
import { SuppliersOldComponent } from './components/suppliers-old/suppliers-old.component';
import { SuppliersOldLayoutComponent } from './components/suppliers-old-layout/suppliers-old-layout.component';



const routes: Routes = [
  {
    path: '', component: PoLayoutComponent,
    children: [
      {
        path: 'suppliersoldl/:type',
        component: SuppliersOldLayoutComponent,
        data: ['suppliers']
      },
      {
        path: 'suppliersold/:type',
        component: SuppliersOldComponent,
        data: ['suppliers']
      },
      {
        path: 'supplierslist/:type',
        component: SuppliersListComponent,
        data: ['suppliers']
      },
      {
        path: 'suppliers/:type/:id',
        component: SuppliersComponent,
        data: ['suppliers']
      },
      {
        path: 'suppliers/:type',
        component: SuppliersComponent,
        data: ['suppliers']
      },
      {
        path: 'vendorsexport',
        component: VendorsExportComponent
      },
      {
        path:'polistnew',
        component:PoListNewComponent
      },
      {
        path: 'pocreationnew/:poorderid/:poordertypeid/:supplierid',
        component: PoCreationNewComponent
      },
      {
        path: 'pocreation/:poorderid/:poordertypeid/:supplierid',
        component: PoCreationComponent
      },
      {
        path: 'contractmasterold/:type/:r',
        component: ContractMasterOldComponent,
      },
      {
        path: 'contractpolist/:type/:r',
        component: ContractMasterListComponent,
      },
      {
        path: 'contractpo/:type/:id',
        component: ContractPurchaseOrderComponent,
      },

      {
        path: 'taxes',
        component: TaxListComponent
      },
      {
        path: 'taxes/:mode/:Id',
        component: TaxComponent
      },
      {
        path: 'salesorder',
        component: SalesOrderCreationComponent
      },
      {
        path: 'salesorder/:type',
        component: SalesOrderCreationComponent
      },
      {
        path: 'salesorder/:type/:id',
        component: SalesOrderCreationComponent
      },
      {
        path: 'salesorderapproval',
        component: SalesOrderApprovalComponent
      },
      {
        path: 'PurchaseOrderRequest',
        component: PurchaseOrderRequestComponent
      },
      {
        path:'polist',
        component:PoListComponent
      },
      {
        path:'plist',
        component:PListComponent
      },
      {
        path: 'pocreation/:poorderid/:poordertypeid/:supplierid',
        component: PoCreationComponent
      },
      {
        path: 'pocreation',
        component: PoCreationComponent
      },
      {
        path: 'SupplierCategory',
        component: SupplierCategoryComponent
      },
      {
        path: 'paymenttermsold',
        component: PaymentTermsOldComponent
      },
      {
        path: 'paymentterms',
        component: PaymentTermsListComponent
      },
      {
        path: 'paymentterms/:mode/:Id',
        component: PaymentTermsComponent
      },
      {
        path: 'supplierservices',
        component: SupplierServicesComponent
      },
      {
        path: 'supplierinvoice/:type/:InvoiceId/:InvoiceTypeId/:PoTypeId',
        component: SupplierInvoiceComponent
      },
      {
        path: 'supplierinvoicelist/:type',
        component: SupplierInvoiceListComponent
      },
      {
        path: 'deliveryorder',
        component: DeliveryOrderComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'supplierpayment',
        component: SupplierPaymentComponent
      },
      {
        path: 'porequestapproval',
        component: PurchaseOrderRequestApprovalComponent
      },
      {
        path: 'porequestapproval/:id',
        component: PurchaseOrderRequestApprovalComponent
      },
      {
        path: 'quotationresponse',
        component: QuotationResponseComponent
      },
      {
        path: 'CreditNote/request/:id',
        component: CreditNoteComponent
      },
      {
        path: 'CreditNote/approval/:id',
        component: CreditNoteComponent
      },
      {
        path: 'CreditNote/request',
        component: CreditNoteComponent
      },
      {
        path: 'CreditNote/approval',
        component: CreditNoteComponent
      },
      {
        path: 'creditnotelist/request',
        component: CreditNoteListComponent
      },
      {
        path: 'creditnotelist/approval',
        component: CreditNoteListComponent
      },
      {
        path: 'CreditNote/request/:id?from=inv',
        component: CreditNoteComponent
      },
      {
        path: 'quotationrequest',
        component: QuotationRequestComponent
      },
      {
        path: 'quotationrequest/:id',
        component: QuotationRequestComponent
      },
      {
        path: 'quotationresponseapproval',
        component: QuotationResponseApprovalComponent
      },
      {
        path: 'deliveryterms',
        component: DeliveryTermsComponent
      },
      {
        path: 'goodsreceivednotes/:type/:id',
        component: GoodReceivedNotesComponent
      },
      {
        path: 'goodsreceivednoteslist/:type',
        component: GoodReceivedNotesListComponent
      },
      {
        path: 'servicecategory',
        component: ServiceCategoryComponent
      },
      // {
      //   path: 'poapproval',
      //   component: PoApprovalComponent,
      // },
      {
        path: 'poapproval',
        component: PoApprovalListComponent,
      },
      {
        path: 'poapproval/:id/:typeid',
        component: PoApprovalComponent
      },
      {
        path: 'expenses',
        component: ExpenseMasterComponent
      },
      {
        path: 'customerpayment',
        component: CustomerPaymentComponent
      },
      {
        path: 'servicetypes',
        component: ServiceTypeComponent
      },
      {
        path: 'accountcodes',
        component: AccountCodeComponent
      },
      {
        path: 'exportinvoice',
        component: ExportInvoiceComponent
      },
      {
        path: 'goodsreturnednotes/:type',
        component: GoodsReturnedNotesComponent
      },
      {
        path: 'accrualmanagement/:type',
        component: AccrualManagementComponent
      },
      {
        path: 'projectcontractmaster/:type',
        component: ProjectVariationOrderListComponent
      },
      // {
      //   path: 'projectcontractmaster/:type',
      //   component: ProjectContractMasterComponent
      // },
      {
        path: 'projectpo/:type',
        component: ProjectPurchaseOrderComponent
      },     
      {
        path: 'projectpaymenthistory/:type/:popid/:id',
        component: ProjectPaymentHistoryComponent
      },
      {
        path: 'projectpaymenthistory/:type/:popid/:id/:cid',
        component: ProjectPaymentHistoryComponent
      },
      {
        path: 'projectpaymentreport/:pmcid/:ppcid',
        component: ProjectPaymentReportComponent
      },
      {
        path: 'projectpaymentlist/:type',
        component: ProjectPaymentListComponent
      },
      {
        path: 'accounttypes',
        component: CoaAccountTypeComponent
      },
      {
        path: 'taxgroup',
        component: TaxGroupComponent
      },
      {
        path: 'accountsubcategory',
        component: AccountSubCategoryComponent
      },
      {
        path: 'expensetypelist',
        component: ExpenseTypeListComponent
      },
      {
        path: 'expensetype/:Id',
        component: ExpenseTypeComponent
      },
      {
        path: 'payments/import',
        component: ImportPaymentsComponent
      },
      {
        path: 'projectcontractvariation/:type/:popid/:id',
        component: ProjectVOComponent  // ProjectVariationOrderComponent
      },
      {
        path: 'projectcontractvariation/:type/:popid/:id/:cid',
        component: ProjectVOComponent  // ProjectVariationOrderComponent
      },
      {
        path: 'projectvariationorderlist/:type',
        component: ProjectVariationOrderListComponent
      },
      // Added by Achyuta 07/10/2021
      {
        path: 'SchedulerMaster',
        component: SchedulerMasterComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoRoutingModule { }
