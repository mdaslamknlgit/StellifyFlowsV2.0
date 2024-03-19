export class Tax
{
    TaxId:number;
    TaxName:string;
    TaxType:number;
    TaxAmount:number;
    TaxClass: number;
    TaxGroupId:number;
    // TaxAuthority:string;
    CreatedBy:number;
   
}

export class TaxDisplayInput
{
    Skip:number;
    Take:number;
    Search:string;
  
}

export class TaxFilterDisplayInput
{
    Skip:number;
    Take:number;
    TaxnameFilter:string;
    AuthorityFilter:string;
    TaxAmountFilter:string;
}

export class TaxGroup
{
    TaxGroupId:number;
    TaxGroupName:string;   
}