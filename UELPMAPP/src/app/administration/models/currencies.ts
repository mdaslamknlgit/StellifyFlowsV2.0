import { GridDisplayInput } from "../../shared/models/shared.model";

export class Currency
{
    Id:number;
    Name:string;
    Code:string;
    Status?:number;
    Symbol:string;
}

export class CurrencyDisplayResult
{
    CurrencyManagementList:Array<Currency>;
    TotalRecords :number;
}

export class CurrencyFilterDisplayInput extends GridDisplayInput
{
    UserNameFilter:string;
    RolesNameFilter :string;
}