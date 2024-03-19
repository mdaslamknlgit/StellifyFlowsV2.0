import { GridDisplayInput } from "../../shared/models/shared.model";

export class TaxGroupManagement
{
    TaxGroupId : number;
    TaxGroupName : string;    
    Description : string;
    CreatedDate : Date;
    CreatedBy : number;    
    IsDeleted : number;
}

export class TaxGroupManagementDisplayResult
{
    TaxGroupList:Array<TaxGroupManagement>;
    TotalRecords :number;
}
