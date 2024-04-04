import { Roles } from "./role";

export class WorkFlowReAssignment
{   
    CurrentApproverUserId: number
    CurrentApproverUserName: string
    AlternateApproverUserId: number
    AlternateApproverUserName: number
    WorkFlowReAssignmentLogId: number
    UserRoles:Roles[];
    WorkflowItems: WorkflowItems[];
    Documents: Documents[];
    CompanyId:number
    CreatedBy: number;
    preview:boolean;
}
export class WorkflowItems
{
    WorkFlowLevelId: number;
    WorkFlowReAssignmentStrucutreLogId: number   
    SNo: number;
    ProcessName: string
    DepartmentName: string
    LevelIndex: number
    RoleName:string   
    CompanyName: string
}

export class Documents
{
    WorkFlowId:number
    DocumentId:number
    WorkFlowReAssignmentDocumentLogId: number  
    SNo: number;
    DocumentCode: string
    ProcessName: string
    LevelIndex: number
    WorkFlowStatus:string   
    CompanyName: string
}


