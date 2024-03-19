import { ItemMaster, GRNS, Attachments, Suppliers, GridDisplayInput } from "../../shared/models/shared.model";
import { AccountCodeMaster } from "./account-code.model";
import { GoodsReceivedNotes } from "./goods-received-notes.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Asset } from "../../fixedassets/models/asset.model";

export class GoodsReturnedNotes
{
   GoodsReturnNoteId:  number;
   GoodsReceivedNoteId: number;
   PurchaseOrderid: number;
   GRTCode: string ;
   WorkFlowComments:Array<WorkflowAuditTrail>;
   CurrentApproverUserId:  number;
   CurrentApproverUserName: string ;
   WorkFlowStatus:  string;
   CreatedBy:  number;
   GRNRemarks:  string;
   GRN:GRNS;
   PurchaseOrderCode:string;
   PurchaseOrderType:string;
   DeliveryAddress:string;
   CostOfService:string;
   CurrencyCode:string;
   CurrencySymbol:string;
   StatusText:string;
   Supplier:Suppliers;
   CreatedDate:Date;
   POTypeId?:number;
   DeliveryTerm:string;
   RequestedByUserName:string;
   Designation:string;
   Location:string;
   CompanyId:number;
   Attachments:Attachments[];
   IsGstBeforeDiscount:boolean;   
   LocationID:number;
   Status:number;
   Assets:Asset[];
   ItemsList:Array<GoodsReturnedNotesItems>;
   WorkFlowStatusId:number;
   DraftCode:string;
   IsDocumentApproved:boolean;
}

export class GoodsReturnedNotesItems
{
    GoodsReturnNoteItemId:number; 
    TypeId: number;
    Category: number;
    ItemType: string;
    Item:ItemMaster; 
    Service:AccountCodeMaster; 
    MeasurementUnitCode:string;
    ItemDescription:string;
    OriginalQty:number;
    TotalReceivedQty:number;
    RTNQty:number;
    IsModified:boolean;
    RecordId:number;
    PurchaseValue:number;
    ItemMasterId?: number;
}


export class GoodsReturnedNotesDisplayResult
{
    GoodsReturnNotesList:Array<GoodsReturnNotesList>;
    TotalRecords: number ;
}

export class GoodsReturnNotesList
{
   GoodsReturnNoteId: number;
   SupplierDoNumber:string;
   GRTCode:  string;
   GRNRemarks:  string;
   WorkFlowStatus:  string;
   DraftCode:string;
   IsDocumentApproved:boolean;
}

export class GoodReturnedNotesDelete
{
   ModifiedBy:  number;;
   GoodsReturnNoteId:  number;
}

export class GoodsReturnNoteFilterDisplayInput extends GridDisplayInput
{
    GRTCodeFilter:string;
    SupplierNameFilter :string;
    InvoiceCodeFilter : string;
    CompanyId:number;
}