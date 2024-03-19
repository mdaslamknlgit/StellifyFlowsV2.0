import { Attachments, Suppliers } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { AccountCodeMaster } from "./account-code.model";
import { SupplierSubCode, SupplierContactPerson } from './supplier';
export class ExpensePurchaseOrder {
    ExpensesPurchaseOrderCode: string;
    ExpensesPurchaseOrderId: number;
    CompanyId: number;
    LocationId: number;
    Location: string;
    RequestedBy: number;
    RequestedByUserName: string;
    Designation: string;
    WorkFlowStatusId: number;
    WorkFlowStatusText: string;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    Discount: number;
    ShippingCharges: number;
    OtherCharges: number;
    TotalAmount: number;
    SubTotal: number;
    SupplierAddress: string;
    CostOfServiceId: number;
    CostOfService: string;
    POTypeId: number;
    CurrencyId: number;
    CurrencyCode: string;
    CurrencySymbol: string;
    StatusId: number;
    Instructions: string;
    ExpectedDeliveryDate: Date | string;
    Justifications: string;
    CreatedBy: number;
    CreatedDate: Date;
    IsGstRequired: boolean;
    IsGstBeforeDiscount: boolean;
    PaymentTermId: number;
    PaymentTerms: string;
    DeliveryTermId: number;
    DeliveryTerm: string;
    Reason: string;
    DeliveryAddress: string;
    PurchaseOrderItemsToDelete: Array<number>;
    PurchaseOrderType: string;
    PurchaseOrderStatusText: string;
    PurchaseOrderStatusId: number;
    PurchaseOrderItems: Array<ExpensesPurchaseOrderItems>;
    TaxRate: number;
    TotalTax: number;
    TaxTotal: number;
    Attachments: Array<Attachments>;
    IsApprovalPage: boolean;
    WorkFlowComments: WorkflowAuditTrail[];
    ProcessId: number;
    Supplier: Suppliers;
    ReasonstoVoid: string;
    IsDocumentApproved: boolean;
    DraftCode: string;
    ReasonsToReject: string;
    VendorReferences: string;
    EXPOQuotationItem: Array<EXPOQuotationItem>;
    EXPOQuotationItemToDelete: Array<number>;
    EXPOQuotationAttachment: EXPOQuotationAttachments[];
    EXPOQuotationAttachmentDelete: Array<EXPOQuotationAttachments>;
    EXPOQuotationAttachmentUpdateRowId: EXPOQuotationAttachments[];
    RemarksQuotation: string;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    ContactPersons: Array<SupplierContactPerson>;
    RequestorEmailID: string;
    AmountInWords: string;
    InvoiceLimit: number;
    ContactPersonName: string;
    ContactNo: string;
    ContactEmail: string;
    PriceSubTotal: number;
    DiscountSubTotal: number;
    TotalbefTaxSubTotal: number;
    InventoryRequestId: string;
}

export class ExpensesPurchaseOrderItems {
    ExpensesPOItemId: number;
    AccountCodeCategoryId: number;
    ExpensesQty: number;
    MeasurementUnitID: number;
    MeasurementUnitCode: string;
    Unitprice: number;
    ExpensesDescription: string;
    Expense: AccountCodeMaster;
    //Expense:ExpenseMaster;
    AccountCode: string;
    TaxID: number;
    TaxGroupId: number;
    TaxAuthority: string;
    TaxName: string;
    TaxAmount: number;
    TaxTotal: number;
    Discount: number;
    ItemTotalPrice: number;
    IsModified: boolean;
    ServiceText: string;
    AccountCodeName: string;
    PurchaseOrderId?: number;
    PurchaseOrderCode: string;
    Totalprice: number;
    TotalbefTax: number;
}

export class ExpensePurchaseOrderDisplayResult {
    PurchaseOrders: Array<ExpensePurchaseOrder>;
    TotalRecords: number;
}


export class EXPOQuotationItem {
    QuotationId: number;
    SupplierEmail: string;
    QuotationRemarks: string;
    // Supplier:Suppliers;
    Supplier: string;
    POTypeId: number;
    QuotationAmount: number;
    IsModified?: boolean;
    constructor() {
        this.QuotationAmount = 0;
        this.SupplierEmail = "";
        this.POTypeId = 0;
        this.QuotationRemarks = "";
        this.Supplier = "";
        //    this.Supplier = {
        //         SupplierId:0,
        //         SupplierTypeID:0,
        //         SupplierCode:"",
        //         SupplierName:"",
        //         PreviousSupplierName:"",
        //         BillingAddress1:"",
        //         BillingAddress2:"",
        //         BillingFax:"",
        //         BillingTelephone:"",
        //         SubCodeCount:0,
        //         WorkFlowStatus:""
        //     };

    }
}

export class EXPOQuotationAttachments {
    SPOQuotationId: number;
    PurchaseOrderId: number;
    QuotationId: number;
    FileName: string;
    POTypeId: number;
    RowId: number;
    IsDelete?: boolean;
}