import { ItemMaster, Attachments, Suppliers, GridDisplayInput, QuotationAttachment } from "../../shared/models/shared.model";
import { PurchaseOrderRequestDetails, PurchaseOrderRequestItems } from "./purchase-order-request.model";

export class PurchaseOrderDetails
{
   RequestedBy:number;
   RequestedByUserName:string;
   Designation:string;
   LocationId:number;
   LocationName:string;
   Category:string;
   CostOfService:string;
   POTypeId:number;
   PurchaseOrderType:string;
   ExpectedDeliveryDate:Date|string;
   VendorReferences:string;
   CurrencyId:number;
   CurrencyCode:string;
   CurrencySymbol:string;
   WorkFlowStatusId:number;
   PurchaseOrderId:number;
   CreatedBy:number;
   CreatedDate:Date;
   PurchaseOrderItemsToDelete:Array<number>;
   PurchaseOrderCode:string;
   CostofService:string;
   PurchaseOrderStatusText:string;
   PurchaseOrderStatusId:number;
   PurchaseOrderItems:Array<PurchaseOrderItems>;
   Discount:number;
   TotalTax:number;
   ShippingCharges:number;
   OtherCharges:number;
   TotalAmount:number;
   Instructions:string;
   Justifications:string;
   TaxRate:number;
   Attachments:Attachments[];
   AttachmentsDelete:Array<number>;
   IsGstRequired:boolean;
   PaymentTermId:number;
   PaymentTerms:string;
   DeliveryTerm:string;
   DeliveryAddress:string;
   Supplier:Suppliers;
   SubTotal:number;
   SupplierEmail?:string;//need to check if required.
}

export class PurchaseOrderItems
{
    PurchaseOrderItemId:number;
    ItemQty:number;
    Unitprice:number;
    IsModified?:boolean;
    Item:ItemMaster;
    //AccountCode:string;
    ItemDescription:string;
    MeasurementUnitID:number;
    constructor()
    {
        this.PurchaseOrderItemId =0;
        this.ItemQty=0;
        this.Unitprice=0;
        this.IsModified=false;
        this.ItemDescription="";
        this.Item = {
            ItemMasterId:0,
            ItemName:"",
            Description:"",
            MeasurementUnitID:0,
            MeasurementUnitCode:""
        };
        //this.AccountCode=""
    }
}

export class PurchaseOrderDisplayResult
{
    PurchaseOrders:Array<PurchaseOrderList>;
    TotalRecords:number;
}

export class PurchaseOrderList
{
    PurchaseOrderCode:string;
    PurchaseOrderId:number;
    SupplierName:string;
}

export class PurchaseOrderTypes
{
    PurchaseOrderTypeId:number;
    PurchaseOrderType:string;
}

export class Department
{
    DepartmentId:number;
    Department:string;
}

export class CostOfService
{
    CostofServiceId:number;
    CostofService:string;
}


export class QuotationRequest
{
    QuotationRequestId:number;
    QuotationRequestCode:number;
    PurchaseOrderRequestId:number;
    PurchaseOrderRequestItems:Array<PurchaseOrderRequestItems>;
    Attachments:Attachments[];
    PurchaseOrderRequest:PurchaseOrderRequestDetails;
    QuotationRequestSupplier:Array<QuotationRequestSupplier>;
    deletedQuotationSupplierItems:Array<number>;
    QuotationVendorItemsToDelete:Array<number>;
    QuotationVendorItems:Array<QuotationVendorItems>;
    QuotationAttachment:QuotationAttachment[];  
    QuotationAttachmentDelete:Array<QuotationAttachment>;
    QuotationAttachmentUpdateRowId:QuotationAttachment[];  
    CreatedDate:Date;
    CreatedBy:number;
    CompanyId:number;
    Remarks:string;

}


export class QuotationVendorItems
{
    QuotationId:number;
    QuotatedAmount:number;
    BillingTelephone:string;
    SupplierEmail:string;
    IsMailSent:boolean;
    IsSelected:boolean;
    IsModified?:boolean;
    QuotationSupplier:Suppliers; 
    constructor()
    {
        this.QuotationId =0;
        this.QuotatedAmount=0;
        this.SupplierEmail="";
        this.BillingTelephone = "";
        this.IsModified=false;  
        this.IsMailSent =false; 
        this.IsSelected = false;     
        this.QuotationSupplier = {
            SupplierId:0,
            SupplierTypeID:0,
            SupplierCode:"",
            SupplierName:"",
            PreviousSupplierName:"",
            BillingAddress1:"",
            BillingAddress2:"",
            BillingFax:"",
            SubCodeCount:0,
            WorkFlowStatus:"",
            IsFreezed:false,
            SupplierAddress:""
        };
    }
}

export class QuotationSupplier
{
   SupplierId : number;
}

export class QuotationRequestList
{
    QuotationRequestId:number;
    QuotationRequestCode:string;
    PurchaseOrderRequestId:number;
    SupplierName:string;
    PurchaseOrderRequestCode:string;
    IsDocumentApproved:boolean;
    DraftCode:string;
}

export class QuotationResult
{
    QuotationRequestId : number;
    PurchaseOrderRequestId :number;
}


export class QuotationRequestDisplayResult
{
    QuotationRequest: Array<QuotationRequestList> ;
    TotalRecords:number;
}

export class QuotationFilterDisplayInput extends GridDisplayInput
{
    QuotationRequestFilter:string;
    SupplierNameFilter :string;
    PurchaseOrderRequestCodeFilter:string;
    CompanyId:number;
}

export class QuotationRequestSupplier
{
    QuotationRequestSupplierId:number;
    IsModified?:boolean;
    BillingTelephone:string;
    SupplierEmail:string;
    QuotationSupplier:Suppliers; 
    IsMailSent:boolean;
    constructor()
    {
        this.QuotationRequestSupplierId =0;
        this.IsModified=false;   
        this.IsMailSent = false;     
        this.QuotationSupplier = {
            SupplierId:0,
            SupplierTypeID:0,
            SupplierCode:"",
            SupplierName:"",
            PreviousSupplierName:"",
            BillingAddress1:"",
            BillingAddress2:"",
            BillingFax:"",
            SubCodeCount:0,
            WorkFlowStatus:"",
            IsFreezed:false,
            SupplierAddress:""
        };
    }
}


