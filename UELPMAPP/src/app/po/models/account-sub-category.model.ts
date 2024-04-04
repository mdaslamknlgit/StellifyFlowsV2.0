import { GridDisplayInput } from "../../shared/models/shared.model";

export class AccountCodeCategory
{
    AccountCodeCategoryId : number;
    AccountCodeName : string;    
    Description : string;
    CreatedDate : Date;
    CreatedBy : number;
    CompanyId : number;    
    IsDeleted : number;
}

export class AccountCodeCategoryDisplayResult
{
    AccountCodeCategoryList:Array<AccountCodeCategory>;
    TotalRecords :number;
}
