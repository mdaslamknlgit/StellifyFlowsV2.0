import { GridDisplayInput } from "../../shared/models/shared.model";

export class DepartmentManagement
{
    LocationId : number;
    Name : string;
    Code : string;
    IsDepartment?: number;
    Description : string;
    CreatedDate : Date;
    CreatedBy : number;
    CompanyId : number;
    IsDeleted? : number;
}

export class DepartmentManagementDisplayResult
{
    DepartmentList:Array<DepartmentManagement>;
    TotalRecords :number;
}
