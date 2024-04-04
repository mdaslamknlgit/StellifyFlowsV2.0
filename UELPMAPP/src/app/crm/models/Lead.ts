import { AccountsDTO } from "./AccountsDTO";
import { ContactDTO } from "./ContactDTO";
import { DomainItem } from "./DomainItem";
import {TreeNode} from 'primeng/api';

export interface LeadInfo
{
    Id:number;
    firstName:string;
    lastName:string;
    topic:string;
    emailId:string;
    mobile:string; 
}

export class Lead
{
    Id:number;
    SalutationId:number;
    FirstName:string;
    LastName:string;
    Topic:string;
    EmailId:string;
    Mobile:string; 

    JobTitle:string;
    BusPhone:string;
    CompName:string;
    SouceCampaign:string;
    AnnualRevenue:number;
    EstBudget:number;
    NoOfEmployees:number;
    ProbabilityId:number;   
    SourceCampaign:string;
    LeadSource:number;
    LeadSourceId:number;
    RatingId:number;
    CurId:number;
    WebSite:string;    
    Street1:string;
    Street2:string;
    Street3:string;
    Country:string;
    City:string;
    Locality:string;
    LandMark:string;
    PinCode:number;
    CreatedBy:number;
    CreatedDate:Date;
    UpdatedBy:number;
    UpdatedDate:Date;
    PreviousProbabilityId:number;
    Converted:boolean;
    OppId:number;
    UserId:number;
    CompanyId:number;
    LeadStatId:number;
    IndsId:number;
    LeadRating:number;
    LeadRatingId:number;
    OwnerId:number;

    AccountId:number;
    ContactId:number;
    OpportunityId:number;
    OpportunityTopic:string;
}


export class LeadListResponce{
    Name:string;
    LeadsList:TreeNode[]=[];
}


export class LeadListResult
{  
     StatusCode:string;
    StatusMessage:string;

    Titles :DomainItem[]=[];
    LeadsList:Lead[]=[];
    Groups :DomainItem[]=[];
}

export class ExportLeads
{
    Id:number;
    firstName:string;
    lastName:string;
    topic:string;
    emailId:string;
    mobile:string; 
}

export class LeadStatusDomainItem
{
    LeadStatId:number;
    LeadStatName:string;
}

export class LeadQualifyInput
{
    LeadId:number;
    LeadTopic:string;
    AccountId:number;
    ContactId:number;
    OportunityId:number;
    OpportunityTopic:string;
    CreatedBy:number;
    ConvertedBy:number;
    OpportunityStageId:number;

    CreateAccount:string;
    CreateContact:string;
    CreateOpportunity:string;
    DontCreateOpportunity:boolean;

    Contact:ContactDTO;
    Account:AccountsDTO;

    TotalAmount:number;
    UpfrontOrAdvance:number;
    PoNumber:string;
    Balance:string;
    Remarks:string;
}