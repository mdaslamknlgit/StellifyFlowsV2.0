import { SupplierServices } from "../../po/models/supplier-service.model";
import { GridDisplayInput, Facilities } from "../../shared/models/shared.model";

export class EngineerManagementModel
{
    EngineerId:number;
    EngineerCode:string;
    FirstName:string;
    LastName:string;
    IsActive:boolean;
    Contact : string;
    AltContact : string;
    Email:string;
    Address:string;
    JobCategory: Array<SupplierServices>;
    Facility:Array<Facilities>;
    CompanyId: number;
    CreatedBy:number;
}

export class EngineerManagementDisplayResult
{
    EngineerManagementList: Array<EngineerManagementList> ;
    TotalRecords:number;
}

export class EngineerManagementList
{
    EngineerId :number;
    Name: string;
    JobCategoryName: string;
    FacilityName: string;
    EngineerCode:string;
}

export class EngineerManagementFilterDisplayInput extends GridDisplayInput
{
     NameFilter : string ;
     JobCategoryFilter : string ;
     FacilityFilter :  string;
     EngineerCodeFilter:string;
     CompanyId:number;
}
