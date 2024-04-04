import { ItemMaster, Attachments, Suppliers, Assets, AssetSubCategory } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { AccountCodeMaster } from "./account-code.model";
import { SupplierSubCode, SupplierContactPerson } from './supplier';
export class FixedAssetDetails {
    FixedAssetPurchaseOrderId: number;
    FixedAssetPurchaseOrderCode: string;
    RequestedBy: number;
    RequestedByUserName: string;
    Designation: string;
    LocationId: number;
    LocationName: string;
    Category: string;
    CostOfService: string;
    POTypeId: number;
    PurchaseOrderType: string;
    SupplierAddress: string;
    ExpectedDeliveryDate: Date | string;
    VendorReferences: string;
    CurrencyId: number;
    CurrencyCode: string;
    CurrencySymbol: string;
    WorkFlowStatusId: number;
    WorkFlowStatusText: string;
    CreatedBy: number;
    CreatedDate: Date;
    PurchaseOrderItemsToDelete: Array<number>;
    CostofService: string;
    PurchaseOrderStatusText: string;
    PurchaseOrderStatusId: number;
    PurchaseOrderItems: Array<FixedAssetPurchaseOrderItems>;
    Discount: number;
    TotalTax: number;
    TaxTotal: number;
    ShippingCharges: number;
    OtherCharges: number;
    TotalAmount: number;
    Instructions: string;
    Justifications: string;
    TaxRate: number;
    Attachments: Attachments[];
    AttachmentsDelete: Array<number>;
    IsGstRequired: boolean;
    PaymentTermId: number;
    PaymentTerms: string;
    DeliveryTerm: string;
    DeliveryAddress: string;
    Supplier: Suppliers;
    SubTotal: number;
    ReasonForPurchase: string;
    CompanyId: number;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    IsGstBeforeDiscount: boolean;
    DeliveryTermId: number;
    ReasonstoVoid: string;
    DraftCode: string;
    IsDocumentApproved: boolean;
    ReasonsToReject: string;
    APOQuotationItem: Array<APOQuotationItem>;
    APOQuotationItemToDelete: Array<number>;
    APOQuotationAttachment: APOQuotationAttachments[];
    APOQuotationAttachmentDelete: Array<APOQuotationAttachments>;
    APOQuotationAttachmentUpdateRowId: APOQuotationAttachments[];
    RemarksQuotation: string;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    ContactPersons: Array<SupplierContactPerson>;
    RequestorEmailID: string;
    InvoiceLimit: number;
    ContactPersonName: string;
    ContactNo: string;
    ContactEmail: string;
    PriceSubTotal: number;
    DiscountSubTotal: number;
    TotalbefTaxSubTotal: number;
    InventoryRequestId: string;
}

export class FixedAssetPurchaseOrderItems {
    Sno: any;
    IsDetailed: boolean;
    FixedAssetPOItemId: number;
    TypeId: number;
    ItemType: string;
    TaxID: number;
    TaxGroupId: number;
    TaxAuthority: string;
    TaxName: string;
    TaxAmount: number;
    TaxTotal: number;
    Discount: number;
    AssetQty: number;
    Unitprice: number;
    Totalprice: number;
    TotalbefTax: number;
    IsModified?: boolean;
    AssetSubCategory: AssetSubCategory;
    Asset: Assets;
    Service: AccountCodeMaster;
    AssetDescription: string;
    MeasurementUnitID: number;
    PurchaseOrderId?: number;
    PurchaseOrderCode: string;
    GlDescription: string;
    constructor() {
        this.Sno = 0;
        this.IsDetailed = false;
        this.FixedAssetPOItemId = 0;
        this.TaxID = 0;
        this.TaxGroupId = 0;
        this.TaxAuthority = "";
        this.TaxName = "";
        this.TaxTotal = 0;
        this.TaxAmount = 0;
        this.AssetQty = 0;
        this.Unitprice = 0;
        this.Totalprice = 0;
        this.TotalbefTax = 0;
        this.IsModified = false;
        this.AssetDescription = "";
        this.GlDescription = "";
        this.AssetSubCategory = {
            AssetSubcategoryId: 0,
            AssetSubcategory: "",
            AccountCode: "",
            AssetType: "",
            Description: "",
        };
        this.Asset = {
            AssetId: 0,
            AssetName: "",
            AssetDescription: "",
            AssetCode: "",
            AccountCode: ""
        };
    }
}



export class APOQuotationItem {
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
        // this.Supplier = {
        //     SupplierId:0,
        //     SupplierTypeID:0,
        //     SupplierCode:"",
        //     SupplierName:"",
        //     PreviousSupplierName:"",
        //     BillingAddress1:"",
        //     BillingAddress2:"",
        //     BillingFax:"",
        //     BillingTelephone:"",
        //     SubCodeCount:0,
        //     WorkFlowStatus:""
        // };

    }
}

export class APOQuotationAttachments {
    SPOQuotationId: number;
    PurchaseOrderId: number;
    QuotationId: number;
    FileName: string;
    POTypeId: number;
    RowId: number;
    IsDelete?: boolean;
}



