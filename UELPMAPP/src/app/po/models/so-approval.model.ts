export class SoApproval
{
    SalesOrderId:number;
    SalesOrderCode:string;
    ApproverUserId:number;
    WorkFlowStatusId:number;
    UserId:number;
    Remarks:string;
    SalesOrderRequestUserId:number;
    ProcessId:number;
    StartDate?:Date;
    EndDate?:Date;
    BillingFrequencyId?:number;
    SODate?:Date;
    CompanyId:number;
}

export class SoApprovalUpdateStatus{
    StatusId:number;
    Remarks:string;
    ProcessId:number;
    SoCode:string;
    ApproverUserId:number; 
    StartDate?:Date;
    EndDate?:Date;
    BillingFrequencyId?:number;
    SODate?:Date;
    CompanyId:number;
}