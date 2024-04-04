import { ItemMaster, Attachments, Suppliers } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Customer } from "../../administration/models/customer";
export class SalesOrderDetails
{
   RequestedBy:number;
   RequestedByUserName:string;
   Designation:string;
   LocationId:number;
   LocationName:string;
   Category:string;
   CostOfService:string;   
   ExpectedDeliveryDate:Date|string;  
   CurrencyId:number;
   CurrencyCode:string;
   CurrencySymbol:string;
   WorkFlowStatusId:number;
   WorkFlowStatusText:string;
   SalesOrderId:number;  
   CreatedBy:number;
   CreatedDate:Date;
   SalesOrderItemsToDelete:Array<number>;  
   SalesOrderCode:string;
   CostofService:string;
   SalesOrderStatusText:string;
   SalesOrderStatusId:number;
   SalesOrderItems:Array<SalesOrderItems>;  
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
   Customer:Customer;
   Ticket: Ticket;
   SubTotal:number;
   ReasonForPurchase:string;
   CompanyId:number;
   ProcessId:number;
   WorkFlowComments:Array<WorkflowAuditTrail>;
   CurrentApproverUserId:number;
   CurrentApproverUserName:string;
   IsGstBeforeDiscount:boolean;
   DeliveryTermId: number;
   Reasons: string;
   //SalesInvoice
   SalesInvoiceId: number;
   TicketId: number;
   SalesInvoiceCode:string;
   OutStandingAmount: number;
   SalesInvoiceItems:Array<SalesOrderItems>;
   SalesInvoiceItemsToDelete:Array<number>;
   InvoiceText: string;
   InvoiceStatusId: number;
   TaxId: number;
   TaxName: string;
   InvoiceStatus: string;
   DraftCode:string;
   IsDocumentApproved:boolean;  
}

export class SalesOrderItems
{
    SalesOrderItemId:number;
    SalesInvoiceItemId:number;    
    TaxID:number;
    TaxName:string;
    TaxAmount:number;
    TaxTotal:number;
    Discount:number;
    ItemQty:number;
    Unitprice:number;
    IsModified?:boolean;
    Item:ItemMaster;
    //AccountCode:string;
    ItemDescription:string;
    MeasurementUnitID:number;    
    MeasurementUnitCode:string;
    constructor()
    {
        this.SalesOrderItemId =0;
        this.TaxID =0;
        this.TaxName ="";
        this.TaxTotal =0;
        this.TaxAmount=0;
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

        this.MeasurementUnitCode="";
    }
}

export class SalesOrderDisplayResult
{
    SalesOrders:Array<SalesOrderList>;
    TotalRecords:number;
}

export class SalesInvoiceDisplayResult
{
    SalesInvoices:Array<SalesInvoiceList>;
    TotalRecords:number;
}

export class SalesInvoiceList
{
    SalesInvoiceCode:string;
    SalesInvoiceId:number;  
    CustomerName:string;   
    TotalAmount:number;
    OutStandingAmount:number;
    CurrencySymbol:string;
}

export class SalesOrderList
{
    SalesOrderCode:string;
    DraftCode:string;
    IsDocumentApproved:boolean;
    SalesOrderId:number;  
    CustomerName:string;
    CreatedBy:number;
    FirstName :string;
    CreatedDate :Date;
    TotalAmount :number;
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

export class Ticket
{
    TicketId:number
    TicketNo:string;
    UnitNumber:string;   
    BillAmount:number;    
}

export class TicketList
{
    TicketId:number
    TicketNo:string;
    UnitNumber:string;   
    BillAmount:number;     
    TicketyInventoryItems:Array<SalesOrderItems>; 
}

export class InvoiceDisplayResult
{
    Invoice:Array<InvoiceList>;
    TotalRecords:number;
}

export class InvoiceList
{
    InvoiceCode:string;
    InvoiceId:number;
    CustomerName:string;
    TotalAmount:number;
    OutStandingAmount:number;
    CurrencySymbol:string;
}
