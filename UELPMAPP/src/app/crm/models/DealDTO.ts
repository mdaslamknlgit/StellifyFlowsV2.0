export interface DealDTO {
    DealId: number;
    DealName: string;
    AccountId: number;
    AccountName:string;
    ContactId: number;
    ContactName:string;
    DealTypeId: number;
    DealTypeName: string;
    NextStep: string;
    LeadSourceId: number;
    RatingId:number;
    Amount: number;
    ClosingDate: string;
    PipelineId: number;
    DealStageId: number;
    DealStageName: string;
    Probability: number;
    ExpectedRevenue: number;
    CampaignSource: string;
    DealDescription: string;
    OwnerName: string;
    OwnerId: number;
    CreatedBy: number;
    UpdatedBy: number;

    CreatedDate:Date;

    UpdatedDate:Date;
    DealClose:boolean;
    DealLost:boolean;

    TotalAmount:number;
    UpfrontOrAdvance:number;
    PoNumber:string;
    Balance:number;
    Remarks:string;
    ClosedBy:number;
    ClosedDate:string;

}

export class ContactsAccountDetailsDTO
{
    
    ContactId :number;
    ContactName :string;
    AccountId :number;
    AccountName :string;
}