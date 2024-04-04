export class OpportunityDTO
{
    Id : number;
    OppNo:string;
    OppTopic:string;
    AccountId:number;
    ContactId:number;
    RegardingId: number;
    RegarId: number;
    RelId: number;
    PriceListId: number;
    CurId: number;
    LeadId: number;
    CloseRevenue:number;
    CloseDate:Date;
    EstRevenue:number;
    EstCloseDate:string;
    ProbabilityId: number;
    ActualRevenue:number;
    OppStatReasonId: number;
    StatusReasonId: number;
    WonLost:boolean;
    CampaignId: number;
    OppCloseDesc:string;
    OppDesc:string;
    IsActive:boolean;
    IsClose:boolean;
    CreatedBy:number;
    CreatedDate:Date;
    UpdatedBy:number
    UpdatedDate:Date;
    DeletedBy:number
    DeletedDate:Date;

    constructor()
    {
        
    }


}

export class ProbabilityDomainItem
{
    Id:number;
    value:number;
    Name:string;
}

export class ContactsAccountsList{
    ContactId:number;
    ContactName:string;
    AccountId:number;
    AccountName:string;
    Contact_Account:string;
}


