import { Customer } from "../../administration/models/customer";

export class FacilityManagementModel
{
    FacilityId:number;
    CompanyId :number;
    UnitNumber:string;
    OwnerDetails:OwnerCustomer;
    OwnerName:string;
    OwnerCity:string;
    OwnerContactNo:string;
    OwnerEmail :string;
    OwnerBillingCountryId:number;
    OwnerBillingCountryName:string;
    OwnerBillingAddress: string;

    //TenantDetails:Customer;
    TenantDetails:TenantCustomer;
    TenantName:string;
    TenantCity:string;
    TenantContactNo:string;
    TenantEmail:string;
    TenantBillingAddress:string;
    TenantBillingCountryId:number;
    TenantBillingCountryName:string;

    //IsActive:boolean
    CreatedBy:number    
    ModifiedBy:number

    checkOwner:number;
    checkTenant:number;
    OwnerId:number;
    TenantId:number;

}

export class FacilityManagementDisplayResult
{
    FacilityManagementList:Array<FacilityManagementList>;
     TotalRecords :number;
}

export class FacilityManagementList
{
    FacilityId :number;
    UnitNumber:string ;
    OwnerName :string;
    TenantName:string ;
}

export class OwnerCustomer
{
    CustomerId :  number  ;
    CustomerCode :   string ;
    OwnerName :  string  ;
    CustomerEmail :  string  ;
    BillingCity :  string  ;
    BillingAddress :  string  ;
    BillingTelephone : string   ;
    BillingCountryId:number;
}

export class TenantCustomer
{
    CustomerId :  number  ;
    CustomerCode :   string ;
    TenantName :  string  ;
    CustomerEmail :  string  ;
    BillingCity :  string  ;
    BillingAddress :  string  ;
    BillingTelephone : string   ;
    BillingCountryId:number;
}