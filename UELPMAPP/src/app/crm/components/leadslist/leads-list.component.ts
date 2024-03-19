import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CRMService } from '../../services/crm.service';
import { Observable } from 'rxjs';
import { Lead } from '../../models/Lead';
import { NodeService } from '../../services/node-service';

import { TreeTableModule, TreeTable } from "primeng/treetable";
import { TreeNode } from "primeng/api";
import { SelectionModel } from "@angular/cdk/collections";
import { Email } from '../../models/Emails';
import { PageTreeNode, RoleAccessLevel, RolePageModule } from '../../../administration/models/role';
import { RoleManagementApiService } from '../../../administration/services/role-management-api.service';
import { Table } from 'jspdf-autotable';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
//'src/app/administration/services/role-management-api.service';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css']
})
export class LeadsListComponent implements OnInit {
  
  files: TreeNode[];
  selectedFiles: TreeNode[] = [];
  dataArray: string[] = [];


  selectedFiles2: any;
  ShowColumn: boolean = true;
  Showother: boolean = false;
  selection = new SelectionModel<Email>(true, []);
  //SelectedEmailsList: Email[] = [];
  SelectedLeadsList: Lead[] = [];
   SelectedConnectionsIds = [];
  SelectedConnections: any;
  HeaderTitle: string;

  gridColumns: Array<{ field: string, header: string }> = [];
  pageModules: PageTreeNode[];
  loading: boolean;
  roleAccessLevels: RoleAccessLevel[];
  hideInput: boolean = false;

  SelectedListId: number = 0;
  SelectedList: number;
  Listss: Array<any> = [];
  //MyLists: Lists[] = [];

  @ViewChild("MyLeadsTable") public MyLeadsTableEl: ElementRef;
  @ViewChild("MyLeadsTable") public MyLeadsTableElTbl: TreeTable;
  
  // @ViewChild('treeTable') table: TreeTable;

  @ViewChild("MyLeadsTable") MyLeadsTableT: TreeTable;
  //MyLeadsTable
  userDetails: UserDetails = null;
  UserId:any;
  LeadsList: TreeNode[];
  LeadsSelectedList: any;

  LeadNames: any[] = [];

    //Titles:LeadTitles[] = [];
  //LeadTitle:LeadTitles;
  public ImportCSVResult = [];


  FileImportUpload: boolean = false;
  CSVExportFileName: string;
  ExcelExportFileName: string;

  showdropdown: boolean = false;
  OnlyWithEmails: boolean = false;


  fileImportInput: any;
  csvRecords = [];
  settings: any;
  ListPresent: boolean = true;
  ProbabilityList = [];
  PrevProbabilityList = [];
  MyLead: Lead;
  SelectedLeadId: number;
  MyLeadIds = [];
  formError: string;
  LeadPipelineId: number;
  private result;
  ProbabilityIdSelected: number = -1;

  files1: TreeNode[];

  files2: TreeNode[];

  cols: any[];
  selectedColumns: any[];
  constructor(
    private router: Router,
    private roleApiService: RoleManagementApiService,
    private CRMService: CRMService,
    private nodeService: NodeService,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
  ) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    //this.CompanyId = this.sessionService.getCompanyId();
  }

  ImportFileCancel(event) {
    this.FileImportUpload = false;
  }
  openImportToList(event) {
    //this.ImportFileRef.nativeElement.top=event.clientX+100;
    //this.ImportFileRef.nativeElement.left=event.clientY+10;
    //  this.ImportFileRef.nativeElement.width=event.target.parentElement.parentElement.clientWidth/2;
    this.FileImportUpload = true;
  }

  // ngAfterViewInit(): void {
  //   this.EmailDataSource.paginator = this.paginator;
  // }
  ngAfterViewInit() {
    //this.SetGroupHighlight(this.LeadPipelineId);
  }
  checkNode(nodes:TreeNode[], str:string[]) {
    nodes.forEach(node => {
      //check parent      
      if(str.includes(node.label)) {
        this.selectedFiles.push(node);
      }

      if(node.children != undefined){
        node.children.forEach(child => {
          //check child if the parent is not selected
          if(str.includes(child.label) && !str.includes(node.label)) {
            node.partialSelected = true;
            child.parent = node;
          }

          //check the child if the parent is selected
          //push the parent in str to new iteration and mark all the childs
          if(str.includes(node.label)){
            child.parent = node;
            str.push(child.label);
          }
        });
      }else{
        return;
      }

      this.checkNode(node.children, str);

      node.children.forEach(child => {
        if(child.partialSelected) {
          node.partialSelected = true;
        }
      });
    });
  }
  ngOnInit() {
    //***************************************************************************************************************/
    //* Checking temporary code
    //***************************************************************************************************************/

  //   this.files = [{
  //     label:"Documents",
  //     expandedIcon: "pi pi-folder-open",
  //     collapsedIcon: "pi pi-folder",
  //     children:
  //     [
  //         {
  //             label: "Work",
  //             expandedIcon: "pi pi-folder-open",
  //             collapsedIcon: "pi pi-folder",
  //             children: [
  //               {label: "Expenses.doc", icon: "pi pi-file"}, 
  //               {label: "Resume.doc", icon: "pi pi-file"}
  //           ]
  //         }
  //     ]
  // }];

  // this.dataArray = ["Expenses.doc"];
  // this.checkNode(this.files, this.dataArray);
  //***************************************************************************************************************/

    this.selectedFiles2 = [];
    this.hideInput=true;
    this.gridColumns = [
      // { field: 'SNo', header: '#' },
      { field: 'stage', header: 'Stage' },
      { field: 'compName', header: 'Account Name' },
      { field: 'firstName', header: 'First Name' },
      { field: 'lastName', header: 'Last Name' },
      { field: 'emailId', header: 'Email Id' },
      { field: 'mobile', header: 'Mobile' },
      { field: 'StringCreatedDate', header: 'Lead Date' },
      { field:'',header: 'Actions'}
      ];
      
    
    this.LeadsSelectedList = [];
    //this.getPageModules();
    this.GetLeadsGroupByStages();



    //this.GetLeadListS();
    //this.GetProbabilityList();

    this.route.paramMap.subscribe((param: ParamMap) => {
      this.LeadPipelineId = +param.get("PipelineId");
      //alert("Lead Pipeline :" + this.LeadPipelineId);
    });

    //
    //this.nodeService.getFilesystem().then(filess => this.files1 = filess);
    //this.nodeService.getFilesystem().then(filess => this.files2 = filess);

    //this.nodeService.getLedsFilesystem().then(filess => this.files1 = filess);
    this.nodeService.getLedadsByGroupFilesystem().then((res) => {
      // Success
      //console.log(res.json());
      //resolve();
      //
      
      //debugger;
      
      this.files1 = res;
    });

    // this.nodeService.getFilesystem().then((res) => {
    //   // Success
    //   //console.log(res.json());
    //   //resolve();
    //   //
    //   debugger;
    //   this.files1 = res;
    // });
    
    // this.cols = [
    //   { field: "name", header: "Name" },
    //   { field: "size", header: "Size" },
    //   { field: "type", header: "Type" },
    // ];
    // this.selectedColumns = this.cols;

    // this.cols = [
    //   { field: "name", header: "Name" },
    //   { field: "size", header: "Size" },
    //   { field: "type", header: "Type" },
    // ];


    this.cols = [
      { field: "firstName", header: "First Name" },
      { field: "lastName", header: "Last Name" },
      { field: "stage", header: "Stage" },
    ];

    // let promise = new Promise((resolve, reject) => {
    //   let apiURL = `http://localhost:4204/assets/showcase/data/filesystem.json`;
    //   this.http.get(apiURL)
    //     .toPromise()
    //     .then(
    //       res => { // Success
    //         console.log(res.json());
    //         resolve();
    //       }
    //     );
    // });



    //
  }

  getPageModules(): void {
    this.loading = true;
    let pageModuleResult = <Observable<RolePageModule>>this.roleApiService.getPageModules();
    pageModuleResult.subscribe((data) => {
      debugger;
      this.pageModules = data.PageTreeNodes;
      this.roleAccessLevels = data.RoleAccessLevels;
      this.loading = false;
      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
        this.SetGroupHighlighT(1);
      }, 300);
    });
  }
  GetLeadsGroupByStages() {
    //this.blockUI.start("Loading..."); // Start blocking
    this.UserId=this.userDetails.UserID;
    let lead = <Observable<any>>this.CRMService.GetLeadsGroupByStages(this.UserId);
    lead.subscribe((ResLeadListResult) => {
      //debugger;
      if (ResLeadListResult != null) {
        // for (var i = 0; i < ResLeadListResult.LeadByGroup.length; i++) {
        //   for (
        //     var j = 0;
        //     j < ResLeadListResult.LeadByGroup[i].children.length;
        //     j++
        //   ) {
        //     let FormatValue = Intl.NumberFormat("en-US", {
        //       minimumFractionDigits: 2,
        //       maximumFractionDigits: 2,
        //     }).format(
        //       Number(
        //         ResLeadListResult.LeadByGroup[i].children[j].data.ActualRevenue
        //       )
        //     );
        //     ResLeadListResult.LeadByGroup[i].children[j].data.ActualRevenue =
        //       this.baseCurrencySymbol.transform(FormatValue);
        //   }
        // }
        
        //debugger;
        
        this.LeadsList = ResLeadListResult.LeadByGroup;
        this.LeadNames = ResLeadListResult.LeadNames;

        //this.files1=ResLeadListResult.LeadByGroup;

        //this.nodeService.getLedsFilesystem().then(filess => this.files1 = filess);

        // this.nodeService.getLedsFilesystem().then((res) => {
        //   debugger;
        //   this.files1 = res;
        // });

        // this.files2=ResLeadListResult.LeadByGroup;
      }
      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
        this.SetGroupHighlight(this.LeadPipelineId);
      }, 300);
    });
  }

  // GetProbabilityList() {
  //   let lead = <Observable<any>>this.probabilityService.GetProbabilityList();
  //   lead.subscribe((ResProbability) => {
  //     if (ResProbability != null) {
  //       this.ProbabilityList = ResProbability;
  //       this.ProbabilityIdSelected = 0;
  //     }
  //   });
  // }
  SetGroupHighlighT(id) {
    //$(".ui-treetable-row:eq(2)").css("border", "1px solid red");
    debugger;
    //let A=this.MyLeadsTableT;
    let k = this.MyLeadsTableElTbl;

    let mm = this.MyLeadsTableEl.nativeElement;

    let mlength = k.tableViewChild.nativeElement.children.length;
    for (var i = 0; i <= mlength - 1; i++) {
      k.tableViewChild.nativeElement.children[i].removeAttribute(
        "class",
        "HighlightClass"
      );
    }

    k.tableViewChild.nativeElement.children[id].setAttribute(
      "class",
      "HighlightClass"
    );
  }


  SetGroupHighlight(id) {
    //$(".ui-treetable-row:eq(2)").css("border", "1px solid red");
    debugger;
    let A=this.MyLeadsTableT;
    let k = this.MyLeadsTableElTbl;

    let mm = this.MyLeadsTableEl.nativeElement;

    // let mlength = k.tableViewChild.nativeElement.children.length;
    // for (var i = 0; i <= mlength - 1; i++) {
    //   k.tableViewChild.nativeElement.children[i].removeAttribute(
    //     "class",
    //     "HighlightClass"
    //   );
    // }

    // k.tableViewChild.nativeElement.children[id].setAttribute(
    //   "class",
    //   "HighlightClass"
    // );

  }


  ClickNewLead(event)
  {
    this.router.navigate([`/crm/leads/${'NEW'}/${0}/1`]);
  }
  MyLeadEdit(event, rowdata) {
    debugger;
    let leadid=rowdata.LeadId
    this.router.navigate([`/crm/leads/${'EDIT'}/${leadid}/1`]);
  }
  isRowSelected(rowNode: any): boolean {
    return this.selectedFiles2.indexOf(rowNode.node) >= 0;
  }

  toggleRowSelection(rowNode: any): void {
    if (this.isRowSelected(rowNode)) {
      this.selectedFiles2.splice(this.selectedFiles2.indexOf(rowNode.node), 1);
    } else {
      this.selectedFiles2.push(rowNode.node);
    }

    this.selectedFiles2 = [...this.selectedFiles2];
  }
  
  expandChildren(node:TreeNode){
    if(node.children){
      node.expanded=true;
      for(let cn of node.children){
        this.expandChildren(cn);
      }
    }
  }

  expandTreeNodes() {
    // if (this.treeNodeData) {
    //   this.treeNodeData.forEach(x => this.expandChildren(x));

    //   // Below line is important as it would refresh the TreeTable data,
    //   // which would force automatic update of nodes and since expanded
    //   // has been set to true on the expandChildren() method.

    //   this.treeNodeData = [...this.treeNodeData ]; 
    //}
  }

  exapandORcollapse(nodes) {
    debugger;
    for (let node of nodes) {
      if (node.children) {
        if (node.expanded == true)
          node.expanded = false;
        else
          node.expanded = true;
        for (let cn of node.children) {
          this.exapandORcollapse(node.children);
        }
      }
    }
  }
  handleClick(event: any) {
    // this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Node Collapsed',
    //     detail: 'Welcome to GeeksforGeeks',
    // });
}

  nodeSelect(event, files) {
    //debugger;
    this.selectedFiles2 = [];
    this.LeadsSelectedList = [];
    // for (var i = 0; i < files.value.length; i++) {
    //   if (files.value[i].expanded != undefined) files.value[i].expanded = false;
    // }
    // if (event.node.data.ProbabilityId <= 2) {
    //   this.ShowColumn = true;
    //   this.Showother = false;
    // } else {
    //   this.ShowColumn = false;
    //   this.Showother = true;
    // }

    console.log(event);
  }
  EditLead() {
    const self = this;
    this.MyLeadIds = [];
    let LeadId;
    for (var i = 0; i < this.LeadsSelectedList.length; i++) {
      debugger;

      this.MyLead = new Lead();
      this.MyLead.Id = this.LeadsSelectedList[i].data.Id;
      if (this.MyLead.Id != undefined) {
        this.MyLeadIds.push(this.MyLead);
        LeadId = this.LeadsSelectedList[i].data.Id;
      }
    }

    if (this.LeadsSelectedList.length == 0 || this.LeadsSelectedList == undefined) {
      // self.snackBar.open("please select Lead...!!!", null, {
      //   duration: 5000,
      //   verticalPosition: "top",
      //   horizontalPosition: "right",
      //   panelClass: "stellify-snackbar",
      // });
    } else if (this.MyLeadIds.length > 1) {
      // self.snackBar.open(
      //   "You have selected multiple lead, please select only One lead...!!!",
      //   null,
      //   {
      //     duration: 5000,
      //     verticalPosition: "top",
      //     horizontalPosition: "right",
      //     panelClass: "stellify-snackbar",
      //   }
      // );
    } else {
      this.router.navigate(["/crm/leads/" + LeadId]);
    }
  }

  onProbabilityChange(ProbabilityId) {
    this.MyLeadIds = [];
    const self = this;
    let abc = this.LeadsSelectedList;

    //this.ClickCount = CampaignsInfoRes.CampaignList.filter(x => x.IsClick == true).length;
    let convertToprocpect = this.ProbabilityList.filter(
      (x) => x.Id == ProbabilityId
    )[0].ConvertToProcpect;
    let ConvertProbabilityId = this.ProbabilityList.filter(
      (x) => x.ConvertToProcpect == true
    )[0].Id;

    if (this.LeadsSelectedList.length == 0 || this.LeadsSelectedList == undefined) {
      this.ProbabilityIdSelected = -1;
      // this.GetProbabilityList();
      // self.snackBar.open("please select Lead...!!!", null, {
      //   duration: 5000,
      //   verticalPosition: "top",
      //   horizontalPosition: "right",
      //   panelClass: "stellify-snackbar",
      // });
    } else if (
      convertToprocpect == false &&
      ProbabilityId > 2 &&
      this.LeadsSelectedList[0].data.ProbabilityId < 3
    ) {
      this.ProbabilityIdSelected = -1;
      // this.GetProbabilityList();
      // self.snackBar.open("Please Qualify the Lead First...!!!", null, {
      //   duration: 5000,
      //   verticalPosition: "top",
      //   horizontalPosition: "right",
      //   panelClass: "stellify-snackbar",
      // });
    } else {
      for (var i = 0; i < this.LeadsSelectedList.length; i++) {
        //********************************************************************************************************** */
        //Check if the leads probability is choosen other than convertoproces id
        //it should not update
        //TODO if probabilityid is greated the convertoproces it should conver to opportunity
        //********************************************************************************************************** */
        // if(this.selectedFiles2[i].data.Converted==false)
        // {
        //   if (ConvertProbabilityId>this.selectedFiles2[i].data.ProbabilityId)
        //   {
        //     self.snackBar.open("Please Qualified the leads 1st", null, {
        //       duration: 5000, verticalPosition: 'top',
        //       horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        //     });
        //     this.ProbabilityIdSelected=-1;
        //     this.GetProbabilityList();
        //     return false;
        //   }
        // }
        //********************************************************************************************************** */

        this.MyLead = new Lead();

        this.MyLead.Id = this.LeadsSelectedList[i].data.Id;
        this.MyLead.OppId = this.LeadsSelectedList[i].data.OppId;
        this.MyLead.ProbabilityId = ProbabilityId;

        this.MyLead.CreatedDate = this.LeadsSelectedList[i].data.CreatedDate;
        this.MyLead.UpdatedDate = this.LeadsSelectedList[i].data.UpdatedDate;
        this.MyLead.EstBudget = this.LeadsSelectedList[i].data.EstBudget;
        this.MyLead.PreviousProbabilityId =
          this.LeadsSelectedList[i].data.ProbabilityId;

        if (this.MyLead.Id != undefined) {
          this.MyLeadIds.push(this.MyLead);
        }
      }

      if (this.MyLeadIds.length == 0) {
        // self.snackBar.open("please select Lead...!!!", null, {
        //   duration: 5000,
        //   verticalPosition: "top",
        //   horizontalPosition: "right",
        //   panelClass: "stellify-snackbar",
        // });
      } else {
        //this.blockUI.start("Updating Status...!!!"); // Start blocking

        // this.result = this.leadService
        //   .ChangeLeadStatus(this.MyLeadIds)
        //   .subscribe(
        //     (data: any) => {
        //       if (data.Status == "SUCCESS") {
        //         setTimeout(() => {
        //           this.blockUI.stop(); // Stop blocking
        //         }, 300);

        //         self.snackBar.open("Lead Updated Successfully", null, {
        //           duration: 5000,
        //           verticalPosition: "top",
        //           horizontalPosition: "right",
        //           panelClass: "stellify-snackbar",
        //         });
        //         this.selectedFiles2 = [];
        //         this.GetLeadList();
        //         this.GetProbabilityList();
        //       } else if (data.Status == "ERROR") {
        //         setTimeout(() => {
        //           this.blockUI.stop(); // Stop blocking
        //         }, 500);

        //         self.snackBar.open(data.Message, null, {
        //           duration: 5000,
        //           verticalPosition: "top",
        //           horizontalPosition: "right",
        //           panelClass: "stellify-snackbar",
        //         });
        //       } else {
        //         setTimeout(() => {
        //           this.blockUI.stop(); // Stop blocking
        //         }, 500);

        //         self.snackBar.open(
        //           "Problem in  Updating lead please try again",
        //           null,
        //           {
        //             duration: 5000,
        //             verticalPosition: "top",
        //             horizontalPosition: "right",
        //             panelClass: "stellify-snackbar",
        //           }
        //         );
        //       }
        //     },
        //     // Errors will call this callback instead:
        //     (err) => {
        //       ////
        //       if (err.error == "FAIL") {
        //         //this.formError = err.error.ExceptionMessage;

        //         setTimeout(() => {
        //           this.blockUI.stop(); // Stop blocking
        //         }, 500);

        //         self.snackBar.open(
        //           "Problem in  Updating lead please try again",
        //           null,
        //           {
        //             duration: 5000,
        //             verticalPosition: "top",
        //             horizontalPosition: "right",
        //             panelClass: "stellify-snackbar",
        //           }
        //         );
        //       } else {
        //         this.formError = err.statusText;
        //       }
        //     }
        //   );
      }
    }
  }

  test(e) {
    console.log(e.target.value);
  }

  onRowSelect(event) {
    //

    console.log("On Row Select " + event + " Id : " + event.data.Id);
  }

  onUserRowSelect(event) {
    console.log(
      "On User Row Select " +
        event +
        " Id : " +
        event.data.Id +
        " Selected " +
        event.selected.length
    );
  }

  showDropDown() {
    this.showdropdown = !this.showdropdown;
  }

  // fileChangeListener($event): void {

  //   var text = [];

  //   var target = $event.target || $event.srcElement;
  //   var files = target.files;

  //   if (Constants.validateHeaderAndRecordLengthFlag) {
  //     if (!this._fileUtil.isCSVFile(files[0])) {
  //       alert("Please import valid .csv file.");
  //       this.fileReset();
  //     }
  //   }
  //   var input = $event.target;
  //   let file = input.files[0];
  //   var dataset = {};
  //   this.papa.parse(file, {
  //     header: true,
  //     dynamicTyping: true,
  //     complete: function(results,file) {

  //       console.log('Parsed: ', results, file);
  //       this.ImportCSVResult=results;
  //       this.CSVResult$=results;
  //       dataset=results.data;
  //       this.itemSubscription=results.data;
  //       let mresults=results.data;

  //       //this.subject.next({ text: mresults });
  //       this.subject1.next(mresults);
  //       //this.ImportCSVSuccess(results);
  //       //this.sessionService.setImportCSV(mresults);
  //     },
  //     error:function(data,file) {
  //         alert("Error occured ");
  //     }
  //   });

  //   this.subject1.subscribe((value) => {

  //     console.log("Subscription got", value); // Subscription wont get
  //                                             // anything at this point
  //   });

  //   let timeoutId = setTimeout(() => {

  //     let k =this.subject.asObservable();
  //    if(this.CSVResult$ !=null)
  //    {

  //      let im=this.sessionService.getImportCSV();
  //      console.log("Import CSV Results " +this.CSVResult$);
  //      this.ImportCSVSuccess(this.CSVResult$);
  //    }
  //   }, 500);
  // };

  fileReset() {
    this.fileImportInput.nativeElement.value = "";
    this.csvRecords = [];
  }

  ImportCSVSuccess(ImportResult: any): void {
    alert("Result : " + ImportResult);
  }

 

 

  //Move To List Code
  //Starts Here

  NoOfProfilesSelected(): number {
    // debugger;
    // let noofprofileselected: number;
    // let ShowSelectedProfileIDS = this.GetSelectedProfileIDS();
    // if (ShowSelectedProfileIDS != "") {
    //   let SplitStr = ShowSelectedProfileIDS.split(",");
    //   noofprofileselected = this.GetSelectedProfileIDS().split(",").length;
    // } else {
    //   noofprofileselected = 0;
    // }
    //return noofprofileselected;
    return 1;
  }

  GetSelectedProfileIDS(): string {
    this.SelectedLeadsList = [];
    let SelectedProfileIds: string;
    let SelectedRows = this.selection.selected;
    SelectedRows.forEach((SelectedConnections) => {
      this.SelectedConnectionsIds.push(SelectedConnections.emaillistId);
      //this.SelectedLeadsList.push(SelectedConnections);
    });
    //SelectedProfileIds = this.toCSV(this.SelectedConnectionsIds, ",");

    return SelectedProfileIds;
  }

  MoveToList(event) {
    const self = this;
    //debugger;
    // if (this.NoOfProfilesSelected() > 0) {
    //   this.SelectedConnections = this.GetSelectedProfileIDS();
    //   //alert("Selected Profiles " +this.SelectedConnections);
    // } else {
    //   //alert("Please select atleast 1 profile ");
    //   self.snackBar.open("Please select atleast 1 profile", null, {
    //     duration: 2500,
    //     verticalPosition: "top",
    //     horizontalPosition: "right",
    //     panelClass: "patasala-snackbar",
    //   });
    //   return;
    // }
    this.HeaderTitle = "Move to list ";

    //Filter the list
    let FilterList = this.Listss.filter((x) => x.ListId != this.SelectedListId);
    debugger;
    this.MyLeadIds = [];
    for (var i = 0; i < this.LeadsSelectedList.length; i++) {
      //********************************************************************************************************** */
      //Check if the leads probability is choosen other than convertoproces id
      //it should not update
      //TODO if probabilityid is greated the convertoproces it should conver to opportunity
      //********************************************************************************************************** */

      this.MyLead = new Lead();

      this.MyLead.Id = this.LeadsSelectedList[i].data.Id;
      this.MyLead.OppId = this.LeadsSelectedList[i].data.OppId;
      this.MyLead.ProbabilityId = this.LeadsSelectedList[i].data.ProbabilityId;

      this.MyLead.CreatedDate = this.LeadsSelectedList[i].data.CreatedDate;
      this.MyLead.UpdatedDate = this.LeadsSelectedList[i].data.UpdatedDate;
      this.MyLead.EstBudget = this.LeadsSelectedList[i].data.EstBudget;
      this.MyLead.PreviousProbabilityId =
        this.LeadsSelectedList[i].data.ProbabilityId;

      if (this.MyLead.Id != undefined) {
        this.MyLeadIds.push(this.MyLead);
      }
    }

    if (this.LeadsSelectedList.length == 0) {
      {
        // self.snackBar.open("please select lead only not group ..!!!", null, {
        //   duration: 5000,
        //   verticalPosition: "top",
        //   horizontalPosition: "right",
        //   panelClass: "stellify-snackbar",
        // });
        return;
      }
    }
    // let dialogRef = this.dialog.open(MoveleadstolistComponent, {
    //   width: "350px",
    //   height: "300px",
    //   disableClose: true,
    //   data: {
    //     CurrentListID: this.SelectedConnections,
    //     HeaderTitle: this.HeaderTitle,
    //     ListData: this.selectedFiles2[0].data,
    //     SelectedConnections: [],
    //   },
    // });

    //SelectedConnections: this.GetSelectedProfileIDS(),
    //Dialog before close
    // dialogRef.beforeClose().subscribe((result) => {
    //   let mlistname = dialogRef;

    //   if (dialogRef.componentInstance.data.SaveClick != "NO") {
    //     if (
    //       this.SelectedList == dialogRef.componentInstance.data.SelectedListID
    //     ) {
    //       alert("You Selected Current List Id : " + this.SelectedList);
    //       return;
    //     }
    //     if (dialogRef.componentInstance.data.SelectedListID == undefined) {
    //       alert("Please select the list");
    //     }

    //     //this.removeSelectedRows();
    //   }
    // });
    //Dialog after closed
    // dialogRef.afterClosed().subscribe((result) => {
    //   let selectedlistid = dialogRef.componentInstance.data.SelectedListID;

    //   if (dialogRef.componentInstance.data.SaveClick == "NO") {
    //     console.log("in No btnClick");
    //   } else if (dialogRef.componentInstance.data.SaveClick == "YES") {
    //     console.log("in Yes btnClick");
    //     //this.getList();
    //   }
    // });
  }

  //Move To List Code
  //Starts Here
}
