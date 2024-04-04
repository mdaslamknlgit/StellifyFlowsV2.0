import { Location } from "../../shared/models/shared.model";

export  class ExpenseMaster
{
    public ExpensesMasterId :number;
    public ExpensesDetail:string;
    public ExpensesTypeId:number;
    public ExpensesType:string;
    public Location:Location;
    public Skip:number;
    public Take:number;
    public CreatedBy:number;
    public CreatedDate:Date;
}

export class ExpensesType
{
    public ExpenseTypeId:number;
    public ExpenseType:string;
}