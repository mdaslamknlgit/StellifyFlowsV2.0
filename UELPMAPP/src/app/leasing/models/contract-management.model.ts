export class ContractDetails
{

    ContractCode:string;
    ContractName:string;
    StartDate:Date;
    EndDate:Date;
    ContractType:string;
    PaymentTermId:number;
    PaymentTerms:string;
    CustomerName:string;
    BillingAddress:string;
    ShippingAddress:string;
    SigningDate:Date;
    ContractAmount:number;
    UnitDetails:Array<UnitDetails>;
    BillingDetails:Array<BillingDetails>;
}

export class UnitDetails
{
    UnitNumber:string;
    OwnerName:string;
    OwnerPhNo:string;
    TenantName:string;
    TenantPhNo:string;
}

export class BillingDetails
{
    Description:string;
    Amount:number;
}