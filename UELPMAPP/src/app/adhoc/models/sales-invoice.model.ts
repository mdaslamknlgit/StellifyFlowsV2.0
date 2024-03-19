import { MeasurementUnit } from "./../../inventory/models/uom.model";
import { AccountCode, AccountType } from "./../../po/models/account-code.model";
import { Locations } from "./../../inventory/models/item-master.model";
import { AddressType, ApprovalDocumentInfo, AssetSubCategory, Currency } from "./../../shared/models/shared.model";
import { Bank, CreditTerm, CustomerTypeMaster, LocationMaster, TaxGroup, TaxMaster, TaxType } from "./adhoc-master.model";
import { Supplier } from "./../../po/models/supplier";
import { SchedulerNo } from "./../../po/models/scheduler-no.model";
import { SalesCustomer } from "./customer-master.model";

export class SalesInvoice extends ApprovalDocumentInfo {
    InvoiceId: number;
    CompanyId: number;
    QuotationId: number;
    DocumentCode: string;
    QuotationCode: string;
    DraftCode: string;
    CustomerType: CustomerTypeMaster;
    Customer: any;
    UnitNo: string;
    Reference: string;
    Attention: string;
    AddressType: AddressType;
    Address: string;
    CustomerEmail: string;
    Subject: string;
    Department: Locations;
    Location: LocationMaster;
    ProjectName: string;
    CreditTerm: CreditTerm;
    Currency: Currency;
    TaxGroup: TaxGroup;
    TaxMaster: TaxMaster;
    TaxType: TaxType;
    Bank: Bank;
    CustomerRefNo: string;
    CustomerAcceptanceDate: Date;
    PurchaseIncurred: boolean;
    Supplier: Supplier;
    PoRef: any;
    Remarks: string;
    JobSheetNo: string;
    JobSheetStatus: string;
    JobSheetDescription: string;
    JobCompletedDate: Date;
    TotalLineAmount: number;
    Discount: number;
    TotalBeforeTax: number;
    TaxAmount: number;
    Scheduler: SchedulerNo;
    Total: number;
    LineItems: LineItem[];
    CreatedDate: Date;
    POCode: string;
    TotalAdjustment: number;
    NetTotal: number;
    SubTotal: number;
    TaxAdjustment: number;
    SchedulerInfo: string;
    InvoiceDetail: string;
    CustomerData: SalesCustomer;
}
export class LineItem {
    LineItemId: number;
    DocumentId: number;
    AccountTypeId: number;
    SubCategoryId: number;
    AccountCodeId: number;
    Code: string;
    Description: string;
    Qty: number;
    UOMId: number;
    UOM: string;
    UnitPrice: number;
    TotalBeforeDiscount: number;
    Discount: number;
    TotalBeforeTax: number;
    TaxTypeId: number;
    TaxType: string;
    TaxPercentage: number;
    TaxAmount: number;
    TotalAfterTax: number;
}
export class SalesInvoiceSearch {
    CompanyId: number;
    IsApprovalPage: boolean;
    UserId: number;
    FetchFilterData: boolean;
    CustomerName: string;
    CustomerId: number;
    DocumentCode: string;
    SearchTerm?: string;
}

export class SalesInvoiceGrid {
    CustomerIPSId: number;
    CustomerTypeName: string;
    CustomerName: string;
    CustomerId: number;
    Department: string;
    Location: string;
    TenantTypeName: string;
    Total: number;
    Remarks: string;
    Status: string;
}