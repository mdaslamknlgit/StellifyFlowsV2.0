import { Attachments, Suppliers, ItemMaster, QuotationAttachment, GridDisplayInput, Assets } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { ExpenseMaster } from "./expense-master.model";
import { AccountCodeMaster } from "./account-code.model";

export class PurchaseOrderRequestDetails
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
   PurchaseOrderRequestId:number;
   CreatedBy:number;
   CreatedDate:Date;
   PurchaseOrderRequestItemsToDelete:Array<number>;
   PurchaseOrderRequestVendorItemsToDelete:Array<number>;
   PurchaseOrderRequestCode:string;
   CostOfServiceId:number;
   CostofService:string;
   PurchaseOrderStatusText:string;
   PurchaseOrderStatusId:number;
   PurchaseOrderRequestItems:Array<PurchaseOrderRequestItems>;
   PurchaseOrderRequestVendorItems:Array<PurchaseOrderRequestVendorItems>;
   Discount:number;
   TotalTax:number;
   ShippingCharges:number;
   OtherCharges:number;
   TotalAmount:number;
   Instructions:string;
   Justifications:string;
   TaxRate:number;
   Attachments:Attachments[];   
   QuotationAttachment:QuotationAttachment[];  
   AttachmentsDelete:Array<Attachments>;
   QuotationAttachmentDelete:Array<QuotationAttachment>;
   IsGstRequired:boolean;
   PaymentTermId:number;
   PaymentTerms:string;
   DeliveryTermId:number;
   DeliveryTerm:string;
   DeliveryAddress:string;
   Supplier:Suppliers;
   SubTotal:number;
   WorkFlowStatusText:string;
   CurrentApproverUserId:number;
   CurrentApproverUserName:string;
   CompanyId:number;
   WorkFlowComments:Array<WorkflowAuditTrail>;
   Reasons:string;
   QuotationRequestRemarks:string;
   IsDocumentApproved:boolean;
   DraftCode:string;
}

export class PurchaseOrderRequestItems
{
    Sno?:number;
    IsDetailed?:boolean;
    PurchaseOrderRequestItemId:number;
    ItemQty:number;
    Unitprice:number;
    IsModified?:boolean;
    TaxTotal:number;
    Item:ItemMaster;
    Asset:Assets;
    //Expense:ExpenseMaster;
    Expense:AccountCodeMaster;
    Service: AccountCodeMaster;
    ItemMasterCode:string;
    ItemDescription:string;
    MeasurementUnitID:number;
    AccountCodeName:string;
    TypeId: number;
    AccountCodeCategoryId: number
    constructor()
    {
        this.ItemMasterCode ="";
        this.PurchaseOrderRequestItemId =0;
        this.ItemQty=0;
        this.Unitprice=0;
        this.IsModified=false;
        this.TaxTotal =0;
        this.ItemDescription="";
        this.Item = {
            ItemMasterId:0,
            ItemName:"",
            Description:"",
            MeasurementUnitID:0,
            MeasurementUnitCode:""
        };
    }
}
export class PORSearch
{
    Skip?:number;
    Take?:number;
    Search:string;
    CompanyId:number;
    ProcessId?:number;
    PurchaseOrderReqId?:number;
    PORCodeFilter?:string="";
    SupplierNameFilter?:string;
    WorkFlowStatusId?:number;
    POTypeId?:number;
}

export class PurchaseOrderRequestVendorItems
{
    QuotationId:number;
    QuotatedAmount:number;
    IsModified?:boolean;
    IsSelected:boolean;
    QuotationSupplier:Suppliers; 
    Remarks: string;
    constructor()
    {
        this.QuotationId =0;
        this.QuotatedAmount=0;
        this.IsModified=false;  
        this.Remarks = "";      
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

export class PurchaseOrderRequestDisplayResult
{
    PurchaseOrdersRequest:Array<PurchaseOrderRequestList>;
    TotalRecords:number;
}

export class PurchaseOrderRequestList
{
    PurchaseOrderRequestCode:string;
    PurchaseOrderRequestId:number;
    SupplierName:string;
    WorkFlowStatusText:string;
    POTypeId:number;  
    ProcessId:number;
    IsDocumentApproved:boolean;
    DraftCode:string;
    WorkFlowStatusId:number
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

export class PORFilterDisplayInput extends GridDisplayInput
{
    PORCodeFilter:string;
    SupplierNameFilter :string;
    CompanyId:number;
}