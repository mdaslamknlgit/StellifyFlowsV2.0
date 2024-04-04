import { GridDisplayInput } from "../../shared/models/shared.model";

export class AccountTypes
{
    COAAccountTypeId : number;
    AccountType : string;
    Description : string;
    IsDeleted : number;
}

export class AccountTypesDisplayResult
{
    AccountTypesList:Array<AccountTypes>;
    TotalRecords :number;
}

export class AccountTypesFilterDisplayInput extends GridDisplayInput
{
    UserNameFilter:string;
    RolesNameFilter :string;
}