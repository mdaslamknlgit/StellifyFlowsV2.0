import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionsDisplayResult, ConnectionsLists,  Emails,  ListResult,  ListsFilterModel, MarketingList } from "../../models/crm.models"
import { CRMService } from '../../services/crm.service';
import { PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { trigger, state, style, animate, transition, query, group } from '@angular/animations';
import { TreeTableModule, TreeTable } from "primeng/treetable";
import { SortEvent, TreeNode } from "primeng/api";
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConnectionsDTO } from '../../models/ConnectionsDTO';

import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as moment from 'moment';
interface People {
  firstname?: string;
  lastname?: string;
  age?: string;
}
@Component({
  selector: 'app-crmconnections-list',
  templateUrl: './crmconnections-list.component.html',
  styleUrls: ['./crmconnections-list.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        style({opacity:0}), //style only for transition transition (after transiton it removes)
        animate(500, style({opacity:1})) // the new state of the transition(after transiton it removes)
      ]),
      transition('* => void', [
        animate(500, style({opacity:0})) // the new state of the transition(after transiton it removes)
      ])
    ]),
        trigger('flyInOut', [
          state('in', style({transform: 'translateX(0)'})),
          transition('void => *', [
            style({transform: 'translateX(-100%)'}),//
            animate(100)
          ]),
          transition('* => void', [
            animate(100, style({transform: 'translateX(100%)'}))
          ])
        ]),
        trigger('slideInOut', [
            state('in', style({
                'max-height': '500px', 'opacity': '1', 'visibility': 'visible'
            })),
            state('out', style({
                'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
            })),
            transition('in => out', [group([
                
                animate('700ms ease-in-out', style({
                    'visibility': 'hidden'
                })),
              
                animate('300ms ease-in-out', style({
                    'max-height': '0px'
                })),
                  animate('400ms ease-in-out', style({
                    'opacity': '0'
                }))
            ]
            )]),
            transition('out => in', [group([
                animate('1ms ease-in-out', style({
                    'visibility': 'visible'
                })),
                animate('600ms ease-in-out', style({
                    'max-height': '500px'
                })),
                animate('500ms ease-in-out', style({
                    'opacity': '1'
                }))
            ]
            )])
        ]),    
  ],
})

export class CrmconnectionsListComponent implements OnInit {
//#region  Variables

FileName:string="";
FileNo:number=0;
CurrentDate:string="";
exportColumns;
SelexportColumns;
interval;
IsFilterDataArrive: boolean = false;
ConnectionsInfo:ConnectionsDTO;
ExportConnectionsLists:ConnectionsDTO[]=[];

public selectedItems: any[];
//ConnectionIds:string;
ConnectionIds=[];
filterMessage:string;
SelectedConnections: string = '';
TotalSelectedConnections: number = 0;
clickedDivState = 'start';
userDetails: UserDetails = null;
ShowToolBar:boolean=false;
UserId:number;
CompanyId:number;
@BlockUI() blockUI: NgBlockUI;
showfilters:boolean=true;
ConnectionsSearch: string;
showLeftPanelLoadingIcon: boolean = false;
ConnectionsPagerConfig: PagerConfig;
ConnectionsListsCols: any[];
TotalRecords:number=0;

ConnectionsLists:MarketingList[]=[];
FilterConnectionsLists:MarketingList[]=[];


TotalListss:Number=0;
//#endregion
  constructor(
    private exportService: ExportService,
    private router: Router,
    private CRMService: CRMService,
    private sessionService: SessionStorageService,
  ) { 
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.CompanyId = this.sessionService.getCompanyId();
  }

  resetPagerConfig() {
    this.ConnectionsPagerConfig = new PagerConfig();
    this.ConnectionsPagerConfig.RecordsToSkip = 0;
    this.ConnectionsPagerConfig.RecordsToFetch = 25;
    //this.currentPage = 1;
}
  ngOnInit() {
    
    this.resetPagerConfig();
    this.ConnectionsListsCols = [
      { field: 'ListName', header: 'List Name', width: '200px' },
      { field: 'ListDesc', header: 'List Desc', width: '200px' },
      { field: 'IsActive', header: 'Status', width: '100px' },
      { field: 'CreatedDate', header: 'Created On', width: '200px' },
      { field: 'EmailCount', header: 'Email Count', width: '200px' },
      { field: '', header: 'Action', width: '300px' },
    ];
    this.GetList();

    //this.FilterData();
  }
  FilterData() {
    //debugger;

    this.filterMessage = "";

    let ListFilterData: ListsFilterModel =  new ListsFilterModel();

    ListFilterData.ListName = this.ConnectionsSearch;
    ListFilterData.ListDesc="";
    ListFilterData.UserId=this.UserId;
    ListFilterData.CompanyId=this.CompanyId;

   
    //Call API 
    
    this.SearchList(ListFilterData);

}
  SearchList(ListFilterData?: ListsFilterModel) {
        
    this.blockUI.start("Searching ...!!!"); // Start blocking
    this.UserId=this.userDetails.UserID;
    let LeadSearchInput = {
        Skip: this.ConnectionsPagerConfig.RecordsToSkip,
        Take: this.ConnectionsPagerConfig.RecordsToFetch,
        ListName: ListFilterData.ListName,
        ListDesc: ListFilterData.ListDesc,
        UserId:this.UserId,
        CompanyId:this.CompanyId

    };
    this.showLeftPanelLoadingIcon = true;
    this.CRMService.SearchList(LeadSearchInput)
        .subscribe((data: any) => {
            this.showLeftPanelLoadingIcon = false;
            this.TotalRecords = data.TotalRecords;
            //debugger;
            this.IsFilterDataArrive=true;
            if (data.TotalRecords > 0) {
                ////debugger;
                this.blockUI.stop(); // Stop blocking
                this.TotalRecords = data.TotalRecords;
                this.ConnectionsLists = data.Connections;
                this.FilterConnectionsLists = data.Connections;
                this.ConnectionsPagerConfig.TotalRecords = data.TotalRecords;

            }
            else {
              this.blockUI.stop(); // Stop blocking
                this.TotalRecords = data.TotalRecords;
                this.ConnectionsLists = data.Connections;
                this.FilterConnectionsLists=data.Connections;
                this.ConnectionsPagerConfig.TotalRecords = data.TotalRecords;
                this.filterMessage = "No matching records are found";
            }
        }, (error) => {
          this.blockUI.stop(); // Stop blocking
            this.showLeftPanelLoadingIcon = false;
            this.IsFilterDataArrive=false;
        });
}
  GetList()
  {
    const self = this;
    this.CRMService.GetList()
    .subscribe((data:any) => {
        ////debugger;
        this.IsFilterDataArrive=true;
        this.ConnectionsLists=data;
        this.FilterConnectionsLists=data;
        this.TotalRecords=this.ConnectionsLists.length;
        

    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        //debugger;
    });
  }
  ConnectionsSearchChange(e)
  {
    
    if(this.ConnectionsSearch.length>2)
    {
      //debugger;
      this.FilterData();
    }
    if(this.ConnectionsSearch.length==0)
    {
      this.GetList();
    }

  }
  ClickNewConnection()
  {
   this.router.navigate([`/crm/crmconnections/${'NEW'}/${0}`]);
  }
  ClickConnectionDetails(value)
  {
    this.router.navigate([`/crm/crmconnectionsdetails/${'VIEW'}/${value}`]);
  }

  RedirectToConnections(value)
  {

    this.router.navigate([`/crm/crmconnections/${'EDIT'}/${value}`]);
  }

  //Grid Functions
  ShowHideToolBar()
  {
      this.clickedDivState = 'end';
      setTimeout(() => {
        this.clickedDivState = 'start';
          if (this.TotalSelectedConnections > 0) {
              this.ShowToolBar = true;
          }
          else {
              this.ShowToolBar = false;
          }
      }, 100);

  }
  onRowUnselect(event) {
    let i = 0;
    this.SelectedConnections = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedConnections == "") {
            this.SelectedConnections = this.selectedItems[i].Id;
        }
        else {
            this.SelectedConnections = this.SelectedConnections + "," + this.selectedItems[i].Id;
        }
    }
    this.TotalSelectedConnections = this.selectedItems.length;
    if(this.TotalSelectedConnections==0)
    {
        this.SelectedConnections="";
    }
    //alert("Un Selected Leads : " + this.SelectedConnections + "\n Total Un Selected Leads : " + this.TotalSelectedConnections);
    //this.ShowHideToolBar();
}

onRowSelect(event) {
    let i = 0;
    this.SelectedConnections = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedConnections == "") {
            this.SelectedConnections = this.selectedItems[i].Id;
        }
        else {
            this.SelectedConnections = this.SelectedConnections + "," + this.selectedItems[i].Id;
        }
    }
    this.TotalSelectedConnections = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedConnections + "\n Total Selected Leads : " + this.TotalSelectedConnections);
    //this.ShowHideToolBar();
}

customSort(event: SortEvent) {
  event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;
      if (value1 == null && value2 != null)
          result = -1;
      else if (value1 != null && value2 == null)
          result = 1;
      else if (value1 == null && value2 == null)
          result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2);
      else
          result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
  });
}

  sortTableData(event) {
  event.data.sort((data1, data2) => {
    let value1 = data1[event.field];
    let value2 = data2[event.field];
    let result = null;
    if (value1 == null && value2 != null) result = -1;
    else if (value1 != null && value2 == null) result = 1;
    else if (value1 == null && value2 == null) result = 0;
    else if (typeof value1 === 'string' && typeof value2 === 'string')
      result = value1.localeCompare(value2);
    else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

    return event.order * result;
  });
}


//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV(e) {
  const self=this;
  //TODO
  // if (this.TotalSelectedLeads == 0) {
  //     alert("Please Select atleast 1 lead ");
  // }
  // else
  // {
  //     alert("Exporting to CSV ");
  // }

  ////debugger;
  //Set Records To Fetch
  this.ConnectionsPagerConfig.RecordsToSkip = 0;
  this.ConnectionsPagerConfig.RecordsToFetch = 0;
  
  //debugger;
  let data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  let idsToFilter = [5, 4];

  let filteredItems = data.filter(item => idsToFilter.includes(item.id));

  //this.FilterData();
  this.GetList();
  this.interval = setTimeout(() => {
      //alert("Alert activated")
      ////debugger;
      if (this.IsFilterDataArrive) {
          ////debugger;
          this.resetPagerConfig();
          if (this.ConnectionsLists.length > 0) {             
              //debugger;                
              //  console.log(newArr);
              this.ExportConnectionsLists= new Array<ConnectionsDTO>();

              for(var i=0;i<=this.ConnectionsLists.length-1;i++)
              {
                  const contact=this.ConnectionsLists[i];
                  
                  this.ConnectionsInfo=new ConnectionsDTO();
                  this.ConnectionsInfo.Id=contact.Id;
                  this.ConnectionsInfo.ListName=contact.ListName;
                  this.ConnectionsInfo.ListDesc=contact.ListDesc;
                  this.ConnectionsInfo.CreatedDate=contact.CreatedDate;
                  this.ExportConnectionsLists.push(this.ConnectionsInfo);
              }

              //Filter Here Based On User Selection Of List
              // let filteredItems = data.filter(item => idsToFilter.includes(item.id));
            debugger;
            let ExportConnectionsFilter=null;
            if (this.SelectedConnections !== undefined && this.SelectedConnections!== null && this.SelectedConnections!== "")
             {

              let ExportConnectionsListsa = this.ExportConnectionsLists;
              let UserSelectedConnections = this.SelectedConnections;
              let UserSelectedConnectionsId = UserSelectedConnections.split(',');

              // You can also use the '+' operator for conversion: .map(item => +item);
              // Split the comma-delimited string into an array and parse each item as an integer
              let integerArray = UserSelectedConnections.split(',').map(item => parseInt(item, 10));


              ExportConnectionsFilter = this.ExportConnectionsLists.filter(item => integerArray.includes(item.Id));
            }
            else {
              ExportConnectionsFilter = this.ExportConnectionsLists;
            }
              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 10);
              this.FileName="ConnectionsLists_" + this.CurrentDate+"_"+this.FileNo.toString();
              //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
              const options = {
                  fieldSeparator: ',',
                  quoteStrings: '"',
                  decimalSeparator: '.',
                  showLabels: true,
                  //showTitle: true,
                  //title: 'Contacts List',
                  useTextFile: false,
                  useBom: true,
                  filename:this.FileName,
                  headers: ['List Id','List Name', 'List Description','CreatedOn']
              };
              const csvExporter = new ExportToCsv(options);
              //csvExporter.generateCsv(this.ExportConnectionsLists);
              csvExporter.generateCsv(ExportConnectionsFilter);
              this.stopTime();
          }
      }
  }, 1000);

}
exportToExcel(e): void {

  const edata: Array<ExcelJson> = [];
  const udt: ExcelJson = {
      data: [
          { A: 'Connections Lists' }, // title
          { A: 'List Name', B: 'List Description',C:'Created On' }, // table header
      ],
      skipHeader: true
  };
  this.ConnectionsLists.forEach(contact => {
      udt.data.push({
          A: contact.ListName,
          B: contact.ListDesc,
          C: contact.CreatedDate
      });
  });
  edata.push(udt);

  this.exportService.exportJsonToExcel(edata, 'ConnectionsLists');
}
ExportToExcel(e) {
  const self=this;
  //debugger;

  this.blockUI.start("Preparing Data...!!!"); // Start blocking
  this.GetList();
  this.interval = setTimeout(() => {
      //alert("Alert activated")
      //debugger;
      if (this.IsFilterDataArrive) {
          //debugger;
          this.blockUI.update("Exporting Data...!!!");
          this.blockUI.start("Exporting Data...!!!"); // Start blocking
          if (this.ConnectionsLists.length > 0) {
              //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
              //this.exportToExcel();
              const edata: Array<ExcelJson> = [];
              const udt: ExcelJson = {
                  data: [
                      { A: 'Leads Lists' }, // title
                      { A: 'List Name', B: 'List Description',C:'Created On' }, // table header
                  ],
                  skipHeader: true
              };
              this.ConnectionsLists.forEach(polist => {
                  udt.data.push({
                      A: polist.ListName,
                      B: polist.ListDesc,
                      C: polist.CreatedDate
                  });
              });
              edata.push(udt);

              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 10);
              this.FileName="ConnectionsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

              this.exportService.exportJsonToExcel(edata, this.FileName);
              this.stopTime();
          }
      }
  }, 1000);
}

ExportToPDF(e) {
  //debugger;

  //Get Filter Data
  this.blockUI.start("Preparing Data...!!!"); // Start blocking
  this.GetList();

  this.interval = setTimeout(() => {
      //alert("Alert activated")
      //debugger;
      if (this.IsFilterDataArrive) {
          //debugger;
          if (this.ConnectionsLists.length > 0) {
              //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

              this.exportColumns = this.ConnectionsListsCols.map((col) => ({
                  title: col.header,
                  dataKey: col.field,
              }));

              //Remove Action Column
              this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
              const doc = new jsPDF('p', 'pt');
              doc['autoTable'](this.SelexportColumns, this.ConnectionsLists);
              // doc.autoTable(this.exportColumns, this.products);

              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 10);
              this.FileName="LeadsList_" + this.CurrentDate+"_"+this.FileNo.toString();

              doc.save(this.FileName+ '.pdf');

              //doc.save('PurchaseOrdersList.pdf');
              this.IsFilterDataArrive = false;
              this.stopTime();
          }
      }
  }, 1000);
}
stopTime() {
  clearInterval(this.interval);
  this.showLeftPanelLoadingIcon = false;
  this.blockUI.start("Done Data...!!!"); // Start blocking
  this.blockUI.stop();
}
//*********************************************************************************************************************/
//Export Code Ends Here
//*********************************************************************************************************************/


}
