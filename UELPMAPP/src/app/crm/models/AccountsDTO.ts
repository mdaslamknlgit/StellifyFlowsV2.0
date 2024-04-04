

export class AccountsDomainItem
{
    AccountId:number;
    AccountName:string;
}

export class ContactsAccountsDomainItems
{
   ContactId:number;
   ContactName:string;
   AccountId:number;
   AccountName:string;
}
export class IndustryDomainItem
{
    IndsId:number;
    IndustryName:string;
}
export class AccountsDTO
{
    Id:number;
    AcctNo:string;
    AccountName:string;   
    MainPhone:string;
    OtherPhone:string;
    Mobile:string;
    EmailId:string;
    IndsId:number;
    NoOfEmployees:number;
    Website:string;
    LeadId:number;
    CurId:number;
    AnnualRevenue:number;
    CreatedBy:number;
    UpdatedBy:number;
    UserId:number;
}
export class Accounts
{
    Id:number;
    AcctNo:string;
    AccountName:string;
    MainPhone:string;
    OtherPhone:string;
    Mobile:string;
    EmailId:string;
    IndsId:number;
    NoOfEmployees:number;
    Website:string;
    CreatedBy:number;
    CreatedDate:Date;
    UpdatedBy:number;
    UpdatedDate:Date;
}

