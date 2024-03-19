import { ItemMaster, Attachments, Suppliers } from "../../shared/models/shared.model";

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
    MeasurementUnitCode:string;
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
