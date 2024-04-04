export class PoApproval
{
    PurchaseOrderId:number;
    PurchaseOrderCode:string;
    ApproverUserId:number;
    WorkFlowStatusId:number;
    UserId:number;
    Remarks:string;
    PurchaseOrderRequestUserId:number;
    ProcessId:number;
    StartDate?:Date;
    EndDate?:Date;
    BillingFrequencyId?:number;
    PODate?:Date;
    CompanyId:number;
    IsVoid?:boolean;
    IsAccept?:boolean;
    WorkFlowStatusPTA?: number;
}

export class PoApprovalUpdateStatus{
    StatusId:number;
    Remarks:string;
    ProcessId:number;
    PoCode:string;
    ApproverUserId:number; 
    StartDate?:Date;
    EndDate?:Date;
    BillingFrequencyId?:number;
    PODate?:Date;
    CompanyId:number;
    IsVoid?:boolean;
    IsAccept?:boolean;
    PendingTA?: number;
}