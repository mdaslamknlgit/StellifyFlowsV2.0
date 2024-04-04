import { Time } from "@angular/common";
import { Attachments, ItemMaster, SupplierCategorys, Suppliers, GridDisplayInput } from "../../shared/models/shared.model";
import { SupplierCategory } from "../../po/models/supplier-category.model";
import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";
import { Customer } from "../../administration/models/customer";
export class TicketManagementModel
{
    TicketId: number;
    TicketNo: string;
    FacilityID: number;
    TicketPriority: string;
    PreferredServiceDatetime: Date|string;
    PrefferedFromTime:Date|string;
    PrefferedToTime:Date|string;
    isBillable: boolean;
    IsbilltoTenant: number;
    JobStatus:string;
    BillAmount:number;
    JobDesciption: string;
    CreatedBy: number;
    CompanyId:number;
    Updatedby: number;
    Remarks : string;
    UnitNumber:string;
    SubTotal: number;
    TotalAmount: number;
    Attachments:Attachments[];
    AttachmentsDelete?:Array<Attachments>;
    EngineerAssignList:Array<EmployeeAssign>;
    EmployeeAssignToDelete:Array<number>;
    InventoryItems:Array<InventoryItems>;
    InventoryItemsToDelete:Array<number>;
    SubContractorItem:Array<SubContractorItem>;
    SubContractorItemToDelete:Array<number>;
    PriorityId:number;
    PriorityName:string;
    TicketQuotationAttachment:TicketQuotationAttachments[];  
    TicketQuotationAttachmentDelete:Array<TicketQuotationAttachments>;
    TicketQuotationAttachmentUpdateRowId:TicketQuotationAttachments[];  
    WorkFlowComments:Array<WorkflowAuditTrail>;
    TicketSendMessages:Array<TicketSendMessages>;
    OwnerDetails: Customer;
}

export class TicketDisplayInput
{
    FacilityId:number;
    Skip:number;
    Take:number;
    SortExpr:string;
    SortDir:string;
}

export class TicketDisplayResult
{
    Tickets: Array<TicketList> ;
    TotalRecords:number;
}

export class TicketList
{
    TicketId :number;
    TicketNo : string;
    UnitNumber :string;
    JobStatus :string;
    PriorityName:string;
    PreferredServiceDatetime:Date|string;
}


export class EmployeeAssignDisplayInput
{
    UserId:number
    AssignDate:Date;
    FromTime:Time;
    ToTime:Time;
    Skip:number;
    Take:number;
    SortExpr:string;
    SortDir:string;
}

export class TicketManagement
{
    TicketId:number;
    TicketEngineerId:number;
    EngineerStatusId:number;
}

export class EmployeeAssign
{
    UserId:number;
    Name:string;
    Contact:string;
    Email:string;
    IsAssigned:boolean;
    IsAdded:boolean;
    AssignmentFromDateTime:Date;
    AssignmentToDateTime:Date;
    CreatedBy: number;
    CompanyId:number;
    IsAvailable:string;
    TicketEngineerId:number;
    EngineerStatusId:number;
    StatusName:string;

}

export class InventoryItems
{
    Sno?:number;
    IsDetailed?:boolean;
    InventoryItemId:number;
    ItemQty:number;  
    ExistingQuantity:number;
    Price: number;  
    IsModified?:boolean;
    Item:ItemMaster;    
    Status:string;
    ItemMasterCode:string;
    ItemDescription:string;
    MeasurementUnitID:number;
    constructor()
    {
        this.ItemMasterCode ="";
        this.InventoryItemId =0;
        this.ItemQty=0;        
        this.Price=0;        
        this.ExistingQuantity=0;
        this.Status="";
        this.IsModified=false;
        this.ItemDescription="";
        this.Item = {
            ItemMasterId:0,
            ItemName:"",
            Description:"",
            MeasurementUnitID:0,
            MeasurementUnitCode:"",
            ExistingQuantity:0
        };
    }
}


export  class SubContractorItem
{
    SubContractorId:number;
    SupplierCategoryID:number;
    BillingTelephone:string;
    SupplierEmail:string;
    Supplier:Suppliers;
    QuotationAmount:number;
    IsModified?:boolean;
    constructor()
    {
       this.SupplierCategoryID=0;
       this.QuotationAmount=0;
       this.SupplierEmail="";
       this.BillingTelephone="";
        this.Supplier = {
            SupplierId:0,
            SupplierTypeID:0,
            SupplierCode:"",
            SupplierName:"",
            PreviousSupplierName:"",
            BillingAddress1:"",
            BillingAddress2:"",
            BillingFax:"",
            BillingTelephone:"",
            SubCodeCount:0,
            WorkFlowStatus:"",
            IsFreezed: false,
            SupplierAddress:""
        };

    }
}

export class TicketFilterDisplayInput extends GridDisplayInput
{
    TicketNoFilter:string;
    FacilityFilter :string;
    PriorityFilter :string;
    CompanyId:number;
}

export class TicketQuotationAttachments
{
    SubContractorQuotationId:number;
    TicketId:number;
    SubContractorId:number;
    FileName:string;
    RowId:number;
    IsDelete?:boolean;
}

export class TicketSendMessages
{
    TicketId:number;
    UserId:number;
    Engineer_TenantId:number;
    Remarks:string;    
    UserName:string;
    Engineer_TenantName:string;
    ProcessId:number;
    TicketNo:string;
    CompanyId:number;

}