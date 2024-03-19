import { Component, OnInit } from '@angular/core';
import { ConnectionsDisplayResult, ConnectionsLists,  Emails,  ListResult, MarketingList } from "../../models/crm.models";

import { PagerConfig } from "../../../shared/models/shared.model";
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CRMService } from '../../services/crm.service';

@Component({
  selector: 'app-crmconnectionsdetails',
  templateUrl: './crmconnectionsdetails.component.html',
  styleUrls: ['./crmconnectionsdetails.component.css']
})
export class CrmconnectionsdetailsComponent implements OnInit {
  showLeftPanelLoadingIcon: boolean = false;
  ConnectionId:Number=0;
  RecordMode:any;
  Total0: number = 0;
  Total1: number = 0;
  currentPage:number=0;
  ListName:string;

  ConnectionsListsCols: any[];
  //ConnectionsLists: Array<ConnectionsLists> = [];
  //purchaseOrdersList: Array<PurchaseOrderList> = [];

  FilterConnectionsLists: Array<ConnectionsLists> = [];

  ConnectionsPagerConfig: PagerConfig;

  
  ConnectionsLists: Array<MarketingList>=[];

  ConnectionsEmailLists: Emails[]=[];

  totalEmails:Number=0;
  EmailList:Emails[]=[];

  constructor(
    private CRMService: CRMService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
  ) { }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      //debugger;
      if (param.get('mode') != undefined) {
        this.RecordMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.ConnectionId =parseInt(param.get('Id').toString());
      }
      //alert("Record Mode : " + this.RecordMode + "\n Connection ID : " + this.ConnectionId);

    });
    
    this.Total0 - 5;
    this.Total1 = 4;
    this.ConnectionsPagerConfig = new PagerConfig();
    this.resetPagerConfig();
    this.ConnectionsListsCols = [
      { field: 'Regarding', header: 'Regarding', width: '100px' },
      { field: 'FirstName', header: 'First Name', width: '100px' },
      { field: 'LastName', header: 'Last Name', width: '200px' },
      { field: 'Company', header: 'Company', width: '150px' },
      { field: 'Title', header: 'Title', width: '150px' },
      { field: 'Email', header: 'Email', width: '150px' },
      { field: '', header: 'Action', width: '100px' },
    ];

    let customObj = new ConnectionsLists();
      customObj.ConnectionId = 1;
      customObj.ConnectionName = "List";
      customObj.FirstName="Mohammed";
      customObj.LastName="Aslam";
      customObj.Company="Sparsh";
      customObj.Title="Project Lead";
      customObj.Email="mdaslamknl@gmail.com";
      customObj.Phone="1212";
      customObj.CampaignId=1;

    //this.ConnectionsLists.push(customObj);

    //this.GetConnectionWithDetails();

    this.GetMarketingListWithDetailsByListId(this.ConnectionId);
  }
  GetConnectionWithDetails()
  {
    const self = this;
    this.CRMService.GetConnectionWithDetails()
    .subscribe((data:ConnectionsDisplayResult) => {
        debugger;
        this.showLeftPanelLoadingIcon = false;
        //alert(this.ConnectionId);
        this.ListName=data.ConnectionsList.filter(y => y.Id==this.ConnectionId)[0].ListName;
        this.ConnectionsEmailLists=data.ConnectionsList.filter(x =>x.Id==this.ConnectionId)[0].EmailLists;


        //this.ConnectionsEmailLists=data.ConnectionsList.filter(x =>x.ListId==1)[0].EmailLists;

        if(this.ConnectionsEmailLists!=null)
        {
          this.totalEmails=this.ConnectionsEmailLists.length;
        }
        let WaitHere="Wait Here";

    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        debugger;
    });
  }
  GetMarketingListWithDetailsByListId(ListId:any)
  {
    const self = this;
    this.CRMService.GetMarketingListWithDetailsByListId(ListId)
    .subscribe((data:ConnectionsDisplayResult) => {
        debugger;
        this.showLeftPanelLoadingIcon = false;
        //alert(this.ConnectionId);
        //this.ListName=data.ConnectionsList.filter(y => y.Id==this.ConnectionId)[0].ListName;
        //this.ConnectionsEmailLists=data.ConnectionsList.filter(x =>x.Id==this.ConnectionId)[0].EmailLists;

        this.ListName=data.ConnectionsList[0].ListName;
        this.ConnectionsEmailLists=data.ConnectionsList[0].EmailLists;


        if(this.ConnectionsEmailLists!=null)
        {
          this.totalEmails=this.ConnectionsEmailLists.length;
        }
        let WaitHere="Wait Here";

  
    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        debugger;
    });
  }



   
  
  resetPagerConfig() {
    this.ConnectionsPagerConfig.RecordsToSkip = 0;
    this.ConnectionsPagerConfig.RecordsToFetch = 25;
    this.currentPage = 1;
}
ClickBack(e)
{
  this.router.navigate([`/crm/crmconnectionslist`]);
}





}
