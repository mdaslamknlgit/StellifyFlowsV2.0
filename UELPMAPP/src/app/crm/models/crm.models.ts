export class ConnectionsLists{
    ConnectionId:Number;
    ConnectionName:string;
    FirstName:string;
    LastName:string;
    Company:string;
    Title:string;
    Email:string;
    Phone:string;
    CampaignId:any;
}

export class CrmconnectionsdetailsComponent{
    ConnectionId:any;
    FirstName:string;
    LastName:string;
    Company:string;
    Title:string;
    Email:string;
    Phone:string;
    CampaignId:any;
}

export class ConnectionsDisplayResult {
  ConnectionsList: Array<MarketingList>;
  TotalRecords: number;
}


export class MarketingList {
  Id:number;
  ListId: number
  ListName: string
  ListDesc: any
  TenantId: number
  UserId: number
  CreatedBy:number;
  CreatedDate:string
  UpdatedBy:number;
  UpdateDate: string
  IsActive: boolean
  CompanyId:number;
  EmailCount: number
  EmailLists: Emails[]
}

export class Emails {
  Id: number
  ListId: number
  EmaillistId: number
  FirstName: string
  LastName: string
  AliasName: any
  Email?: string
  Phone: any
  Mobile: any
  Title: any
  Company: any
  CompanyId: any
  Website: any
  Location: any
  Url: any
  PhotoUrl: any
  Profileid: any
  TypeId: number
  Degree: any
  Connectiontype: any
  CompanyURL: any
  Status: any
  MessageBody: any
  ProfileView: boolean
  Campaigns: any
  CampaignIds: any
  IsPositive: number
  FullName: any
  RecipientSelected: boolean
  FromCampaign: boolean
  ListName: any
  ExpiredDate: string
  ExpiredDays: number
  RecentTime: any
  CreateBy: number
  CreatedDate: string
  UpdateBy: number
  UpdatedDate: string
  DeleteBy: number
  DeletedDate: string
  Country: any
  City: any
  Industry: any
}


export class ListResult {
  ListInfo: Array<MarketingList>;
  TotalRecords: number;
}

export class LeadsFilterModel {
  public Name: string;
  public Topic: string;
  public FirstName :string;
  public LastName: string;
  public Company: string;
  public Mobile: string;
  public Email: string;
  public RatingId: string;
  public LeadSourceId: string;
  public Industry: string;
  public FromDate: Date;
  public ToDate: Date;
  public UserId:number;

  public Moduleid:number;
  public FormId:number;
  public ViewId:number;
  constructor() {

      this.Name = "";
      this.FromDate = null;
      this.ToDate = null;
  }
}

export class ListsFilterModel
{
  public Id:number;
  public ListName:string;
  public ListDesc:string;
  public UserId:number;
  public CompanyId:number;
  public Skip:number;
  public Take:number;
  
}
export class ContactsFilterModel {
  public Name:string;
  public FirstName :string;
  public LastName: string;
  public Company: string;
  public Mobile: string;
  public Email: string;
  public FromDate?: Date;
  public ToDate?: Date;
  public UserId:number;
  public ModuleId:number;
  public FormId:number;
  public ViewId:number;
  constructor() {

      this.FromDate = null;
      this.ToDate = null;
  }
}

export class ActivityFilterModel {
  public ActivityTypeId:number;
  public ActivitySubject :string;
  public ActivityDesc: string;
  public StartDate: string;
  public EndDate: string;
  public DueDate: string;
  public UserId:number;
  public ModuleId:number;
  public FormId:number;
  public ViewId:number;

  public RegardingId:number;
  public RegarId:number;
  constructor() {

      this.StartDate = "";
      this.EndDate = "";
  }
}

export class AccountsFilterModel {
  public AccountName:string;
  public MainPhone:string;
  public Mobile: string;
  public EmailId: string;
  public FromDate?: Date;
  public ToDate?: Date;
  public UserId:number;
  constructor() {

      this.FromDate = null;
      this.ToDate = null;
  }
}
export class OpportunityFilterModel {
  public OppNo:string;
  public OppTopic:string;
  public AccountId: string;
  public ContactId: string;
  public FromDate?: Date;
  public ToDate?: Date;
  public UserId:number;
  constructor() {

      this.FromDate = null;
      this.ToDate = null;
  }
}

export class DateObj {
  year:string;
  month:string;
  day:string;
}

export class DealsSearch {

  public DealId:number;
  public DealName:string;
  public DealTypeId:string;
  public DealStageId:string;

  public ModuleId:number;
  public FormId:number;
  public ViewId:number;

  public FromDate?: Date;
  public ToDate?: Date;

}