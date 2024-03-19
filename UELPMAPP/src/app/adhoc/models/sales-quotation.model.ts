import { Locations } from "./../../inventory/models/item-master.model";
import { AddressType, ApprovalDocumentInfo, Attachments, Currency } from "./../../shared/models/shared.model";
import { Bank, CreditTerm, CustomerTypeMaster, LocationMaster, TaxGroup, TaxMaster, TaxType } from "./adhoc-master.model";
import { Supplier } from "./../../po/models/supplier";
import { SalesInvoice } from "./sales-Invoice.model";
import { SalesCustomer } from "./customer-master.model";

export class SalesQuotation extends ApprovalDocumentInfo {
    QuotationId: number;
    CompanyId: number;
    DocumentCode: string;
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
    ValidityDate: Date;
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
    Total: number;
    LineItems: LineItem[];
    CreatedDate: Date;
    POCode: string;
    MarkForBilling: boolean;
    BillingInstruction: string;
    FileDetails: string;
    ShowMarkForBilling: boolean;
    BillingInfos: BillingInfo[];
    CanMarkForBilling: boolean;
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
export class SalesQuotationSearch {
    CompanyId: number;
    IsApprovalPage: boolean;
    UserId: number;
    FetchFilterData: boolean;
    CustomerName: string;
    CustomerId: number;
    DocumentCode: string;
    SearchTerm?: string;
    CustomerIPSId?: number;
}
export class BillingInfo {
    BillingInfoId: number;
    DocumentId: number;
    ShortNarration: string;
    PercentageToBill: number;
    AmountToBill: number;
    ExpectedBillingDate: Date;
    CreditTerm: CreditTerm;
    Attachments: Attachments[];
    InvoiceDocument: SalesInvoice;
}
export class SalesQuotationGrid {
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