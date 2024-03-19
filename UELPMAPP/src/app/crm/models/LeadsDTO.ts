export interface LeadsDTO
{
    Id : number;
    LeadId:number;
    Topic : string;
    FirstName: string;
    LastName: string;
    SalutationId: number;
    JobTitle: string;
    RatingId: number;
    CurId:number;
    PriceListId:number;
    CompName: string;
    OwnerId
    UserId
    BusPhone: string;
    HomePhone: string;
    OthPhone: string;
    Mobile: string;
    EmailId: string;
    WebSite: string;
    SourceId:number;
    SourceChildId:number;
    StatReasonId:number;
    StatId:number;
    IndsId:number;
    AnnualRevenue:number;
    EstBudget:number;
    NoOfEmployees:number;
    SicCode: string;
    LeadRatingId:number;
    LeadRating:number;
    CampaignId:number;
    Description: string;
    IsClose :boolean;
    IsEmail :boolean;
    IsBulkEmail :boolean;
    IsCall :boolean;
    IsSMS :boolean;
    Status :boolean;
    Converted :boolean;
    ConvDate:Date;
    ConvUserId:number;
    OppId :number;
    IsQualified:boolean;
    CustomerTypeId :number;
    CustomerSubTypeId :number;
    ProbabilityId :number;
    SourceCampaign:string;
    LeadSource: string;
    Street1: string;
    Street2: string;
    Street3: string;
    Country: string;
    City: string;
    Locality: string;
    LandMark: string;
    PinCode: string;
    CreateBy :number;
    CreatedDate  :Date;
    UpdateBy :number;
    UpdatedDate :Date;
    PreviousProbabilityId :number;
    LeadSourceId:number;
    LeadStatId:number;
    CreatedBy:number;
    ConvertedBy:number;
    ConvertedDate:Date;

    AccountId:number;
    ContactId:number;
    OpportunityId:number;
    OpportunityTopic:string;
}

export class ContactGroups{
    RegardingId:number;
    RegarId:number;
    ContactId:number;
    Leadid:number;
    UserId:number;
    ListIds:ListIds[]=[];
}

export class ListIds
{
    ListId:number;
    constructor(value:any)
    {
        this.ListId = value;
    }
}

export class LeadQualifyRequest {
    LeadId: number
    UserId: number
    SalutationId: number
    FirstName: string
    LastName: string
    Mobile: string
    EmailId: string
    CompanyName: string
    LeadQualifyDetail: LeadQualifyDetail
  }
  
  export class LeadQualifyDetail {
    ContactId: number
    ContactName: string
    AccountId: number
    AccountName: string
    CanCreateContact: string
    CanCreateAccount: string
    CanCreateOpportunity: string
    DontCreateOpportunity:boolean

    OpportunityTopic: string
  }
  