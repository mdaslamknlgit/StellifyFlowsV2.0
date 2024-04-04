import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService, SortEvent } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { CostCentreService } from '../../services/cost-centre.service';
import { PagerConfig, Messages, ResponseStatusTypes, MessageTypes, UserDetails } from '../../../shared/models/shared.model';
import { CostCentre } from '../../models/cost-centre.model';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as moment from 'moment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cost-center-list',
  templateUrl: './cost-center-list.component.html',
  styleUrls: ['./cost-center-list.component.css'],
  providers:[CostCentreService]
})
export class CostCenterListComponent implements OnInit {
  FileName:string="";
  FileNo:number=0;
  CurrentDate:string="";
  exportColumns;
  SelexportColumns;
  @BlockUI() blockUI: NgBlockUI;
  public selectedItems: any[];
  SelectedItemCostCenter: string = '';
  TotalSelectedItemCostCenter: number = 0;
  ExportTotalContacts: boolean = false;
  interval;

  CostCenterFilterForm: FormGroup;
  @ViewChild('rightPanel') rightPanelRef;
  costCentrePagerConfig:PagerConfig;
  IsFilterDataArrive:boolean=false;
  selectedRecordDetails:CostCentre;
  hideText: boolean=true;
  hideInput: boolean=false;
  leftSection:boolean=false;
  rightSection:boolean=false;
  scrollbarOptions:any;
  costCentresList:Array<CostCentre>=[];
  isDisplayMode?: boolean = true;
  FilterCostCentresList:Array<CostCentre>=[];
  costCentresListCols:any[];
  costCentreForm:FormGroup;
  showLeftPanelLoadingIcon:boolean=false;
  showRightPanelLoadingIcon:boolean=false;
  errorMessage: string = Messages.NoRecordsToDisplay;
  searchKey:string = "";
  currentPage:number =1;
  TotalRecords:number=0;
  filterMessage: string = "";
  isFilterApplied: boolean = false;
  SearchString:string;
  initDone = false;
  constructor(
              private costCentreObj:CostCentreService,
              private exportService: ExportService,
              private router: Router,
              private formBuilderObj:FormBuilder,
              private fb: FormBuilder,
              private sharedServiceObj:SharedService,
              public sessionService: SessionStorageService,
              private confirmationServiceObj:ConfirmationService) { 

    this.costCentrePagerConfig = new PagerConfig();
    this.costCentrePagerConfig.RecordsToSkip = 0;
    this.costCentrePagerConfig.RecordsToFetch = 10;
    this.costCentreForm = this.formBuilderObj.group({
      'CostCenterName':["", [Validators.required]],
      'Description':[""],
      'CostCenterId':[0]
    });
  }
  private InitFilterForm(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    this.CostCenterFilterForm = this.fb.group({
        Name: [''],
        Description: ['']
    });
  }

  ngOnInit() {

    this.costCentresListCols = [
      //{ field: 'CostCenterId', header: 'Id', width: '400px' },
      { field: 'CostCenterName', header: 'Name', width: '400px' },
      { field: 'Description', header: 'Description', width: '150px' },
      { field: 'CreatedDate', header: 'CreatedOn', width: '150px' },
      { field: '', header: 'Action', width: '100px' },
  ];
    this.InitFilterForm();
    this.selectedRecordDetails = new CostCentre();
    this.getCostCentres(0);
  }

  getCostCentres(costCentreId:number)
  {


    let input = {
      Skip:this.costCentrePagerConfig.RecordsToSkip,
      Take:this.costCentrePagerConfig.RecordsToFetch
    };
    this.showLeftPanelLoadingIcon = true;
    this.costCentreObj.getCostCentres(input).subscribe((data:{ CostCentres:Array<CostCentre> ,TotalRecords:number })=>{

        this.showLeftPanelLoadingIcon = false;
        this.costCentresList = data.CostCentres;
        this.FilterCostCentresList=data.CostCentres;
        this.costCentrePagerConfig.TotalRecords = data.TotalRecords;
        this.TotalRecords=data.TotalRecords;
        if(this.costCentresList.length > 0)
        {
          this.IsFilterDataArrive=true;
          
        }
        else
        {
          this.selectedRecordDetails = new CostCentre();
        }
    },()=>{
      this.showLeftPanelLoadingIcon = false;
    });
  }

  searchForCostCentres()
  {
    let input = {
      Skip:this.costCentrePagerConfig.RecordsToSkip,
      Take:this.costCentrePagerConfig.RecordsToFetch,
      Search:this.searchKey
    };
    this.showLeftPanelLoadingIcon = true;
    this.costCentreObj.searchCostCentres(input).subscribe((data:{ CostCentres:Array<CostCentre> ,TotalRecords:number })=>{

        this.showLeftPanelLoadingIcon = false;
        this.costCentresList = data.CostCentres;
        this.costCentrePagerConfig.TotalRecords = data.TotalRecords;
        if(this.costCentresList.length > 0)
        {
          this.onRecordSelection(this.costCentresList[0].CostCenterId);
        }
    },()=>{
      this.showLeftPanelLoadingIcon = false;
    });
  }

  onRecordSelection(costCentreId:number)
  {
    this.showRightPanelLoadingIcon  = true;
    this.costCentreObj.getCostCentreDetails(costCentreId)
        .subscribe((data:CostCentre)=>{
          if (data != null)
          {
            this.showRightPanelLoadingIcon = false;
            this.selectedRecordDetails = data;
            this.costCentreForm.patchValue(data);
          }
          this.hideText=true;
          this.hideInput=false;

        },()=>{
          this.showRightPanelLoadingIcon = false;
        });
  }

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
  }

  addRecord(){
    this.hideText=false;
    this.hideInput=true;
    this.clearForm();
  }

  clearForm()
  {
    this.costCentreForm.reset();
  }
  split(){ 
    this.leftSection= !this.leftSection;
    this.rightSection= !this.rightSection;
  }
  cancelRecord(){ 
    this.hideText=true;
    this.hideInput=false;
  }
  saveRecord()
  {
    let status = this.costCentreForm.status;
    if(status!="INVALID")
    {
      let costCentreData:CostCentre = this.costCentreForm.value;
      let userDetails = <UserDetails >this.sessionService.getUser();
      costCentreData.CreatedBy = userDetails.UserID;
      if(costCentreData.CostCenterId==null||costCentreData.CostCenterId==0)
      {
        costCentreData.CostCenterId = 0;
        this.costCentreObj.createCostCentre(costCentreData).subscribe((data)=>{

            this.sharedServiceObj.showMessage({
                ShowMessage:true,
                Message:Messages.SavedSuccessFully,
                MessageType:MessageTypes.Success
            });
            this.costCentrePagerConfig.RecordsToSkip = 0;
            this.currentPage = 1;
            this.getCostCentres(0);

        },(data:HttpErrorResponse)=>{       
            if(data.error.Message==ResponseStatusTypes.Duplicate)
            {
              this.showDuplicateMessage();
            }
        });
      }
      else
      {
        this.costCentreObj.updateCostCentre(costCentreData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.UpdatedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.costCentrePagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getCostCentres(0);

        },(data:HttpErrorResponse)=>{       
            if(data.error.Message==ResponseStatusTypes.Duplicate)
            {
              this.showDuplicateMessage();
            }
        });
      }
    }
    else
    {
        Object.keys(this.costCentreForm.controls).forEach((key:string) => {
            if(this.costCentreForm.controls[key].status=="INVALID" && this.costCentreForm.controls[key].touched==false)
            {
              this.costCentreForm.controls[key].markAsTouched();
            }
        });  
    }
  }
  editRecord()
  {
    this.hideText = false;
    this.hideInput = true;
    this.clearForm();
    this.costCentreForm.patchValue(this.selectedRecordDetails);
  }
  deleteRecord()
  {
    let recordId:number = this.selectedRecordDetails.CostCenterId;
    let userDetails = <UserDetails >this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {     

          this.costCentreObj.deleteCostCentre(recordId, userDetails.UserID).subscribe((data)=>{
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.DeletedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.getCostCentres(0);
          });
          
        },
        reject: () => {
        }
    });
  }
  showDuplicateMessage()
  {
    this.costCentreForm.get('CostCenterName').setErrors({'duplicate':true});
  }

  onSearch(event: any) {
    if (event.target.value != "") {
        // if (event.target.value.length >= 3) {
          this.searchForCostCentres();
        //}
    }
    else {
      this.getCostCentres(0);
    }
  }

  pageChange(currentPageNumber:number)
  {
      this.costCentrePagerConfig.RecordsToSkip = this.costCentrePagerConfig.RecordsToFetch*(currentPageNumber-1);
      if(this.searchKey==null||this.searchKey=="")
      {
        this.getCostCentres(0);
      }
      else
      {
        this.searchForCostCentres();
      }
  }

  //New Code Starts Here
  filterData() {
    let CostCenterName = "";
    let description = "";
    this.filterMessage = "";

    debugger;
    if (this.CostCenterFilterForm.get('Name').value != "") {
      CostCenterName = this.CostCenterFilterForm.get('Name').value;
    }
    if (this.CostCenterFilterForm.get('Description').value != "") {
        description = this.CostCenterFilterForm.get('Description').value;
    }
    if (CostCenterName === "" && description === "") {
        if (open) {
            this.filterMessage = "Please select any filter criteria";
        }
        return;
    }

    if(CostCenterName !="" && description!=""){
        this.SearchString=CostCenterName+' '+description;;
    }
    else if(CostCenterName !="" && description===""){
      this.SearchString=CostCenterName;
    }
    else if(CostCenterName ==="" && description!=""){
      this.SearchString=description;
    }


    this.isFilterApplied = true;
    this.getCostCentres(0);
    this.initDone = false;
}
resetFilters() {
  this.CostCenterFilterForm.get('Name').setValue("");
  this.CostCenterFilterForm.get('Description').setValue("");
  this.filterMessage = "";
  this.FilterCostCentresList = this.costCentresList;
  this.costCentrePagerConfig.TotalRecords = this.FilterCostCentresList.length;
  if (this.costCentresList.length > 0) {
      this.getCostCentres(0);
  }
  else {
      this.isDisplayMode = null;
  }
  this.isFilterApplied = false;
}

  ClickNewCostCenter(e)
  {
    this.router.navigate([`inventory/costcenter/${'NEW'}/${0}`]);
  }
  ClickEditCostCenter(costCentreId:number)
  {
    this.router.navigate([`inventory/costcenter/${'EDIT'}/${costCentreId}`]);
  }
  ResetPagerConfig() {
    this.costCentrePagerConfig.RecordsToSkip = 0;
    this.costCentrePagerConfig.RecordsToFetch = 100;

    this.currentPage = 1;
}
//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV() {
  const self=this;
  debugger;
  
  //Set Records To Fetch
  this.costCentrePagerConfig.RecordsToSkip = 0;
  this.costCentrePagerConfig.RecordsToFetch = 1000;

  //this.filterData();
  this.getCostCentres(0);

  this.interval = setTimeout(() => {
      //alert("Alert activated")
      //
      if (this.IsFilterDataArrive) {
          //
          this.ResetPagerConfig();
          if (this.FilterCostCentresList.length > 0) {
              debugger;

              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 20);
              this.FileName="CostCenterList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
                  headers: ['ID','Name', 'Description','CreatedBy','CreatedOn']
              };
              const csvExporter = new ExportToCsv(options);
              csvExporter.generateCsv(this.FilterCostCentresList);
              this.stopTime();
          }
      }
  }, 1000);

}

ExportToExcel() {
  const self=this;

  this.blockUI.start("Preparing Data...!!!"); // Start blocking
  this.getCostCentres(0);
  this.interval = setTimeout(() => {
      //alert("Alert activated")
      
      if (this.IsFilterDataArrive) {
          
          this.blockUI.update("Exporting Data...!!!");
          this.blockUI.start("Exporting Data...!!!"); // Start blocking
          if (this.FilterCostCentresList.length > 0) {
              //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
              //this.exportToExcel();
              const edata: Array<ExcelJson> = [];
              const udt: ExcelJson = {
                  data: [
                      { A: 'Cost Center Lists' }, // title
                      { A:'Id',B:'Name' ,C:  'Description',D: 'CreatedBy',E:'Created On' }, // table header
                  ],
                  skipHeader: true
              };
              this.FilterCostCentresList.forEach(polist => {
                  udt.data.push({
                      A: polist.CostCenterId,
                      B: polist.CostCenterName,
                      C: polist.Description,
                      D: polist.CreatedBy,
                      E: polist.CreatedDate,
                  });
              });
              edata.push(udt);

              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 10);
              this.FileName="CostCenterList_" + this.CurrentDate+"_"+this.FileNo.toString();

              this.exportService.exportJsonToExcel(edata, this.FileName);
              this.stopTime();
          }
      }
  }, 1000);
}

ExportToPDF() {
  //Get Filter Data
  this.blockUI.start("Preparing Data...!!!"); // Start blocking
  this.getCostCentres(0);

  this.interval = setTimeout(() => {
      //alert("Alert activated")
      
      if (this.IsFilterDataArrive) {
          
          if (this.FilterCostCentresList.length > 0) {
              //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

              this.exportColumns = this.costCentresListCols.map((col) => ({
                  title: col.header,
                  dataKey: col.field,
              }));
              debugger;
              //Remove Action Column
              this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
              const doc = new jsPDF('p', 'pt');
              doc['autoTable'](this.SelexportColumns, this.FilterCostCentresList);
              // doc.autoTable(this.exportColumns, this.products);

              this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
              this.FileNo=Math.ceil(Math.random() * 10);
              this.FileName="CostCenterList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
  //this.showLeftPanelLoadingIcon = false;
  this.blockUI.start("Done Data...!!!"); // Start blocking
  this.blockUI.stop();
}
//*********************************************************************************************************************/
//Export Code Ends Here
//*********************************************************************************************************************/
//************************************************************************************************************/
//Sorting Functions
//************************************************************************************************************/
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
//************************************************************************************************************/

//************************************************************************************************************/
//Grid Functions
//************************************************************************************************************/

onRowUnselect(event) {
  let i = 0;
  this.SelectedItemCostCenter = "";
  //debugger;
  for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedItemCostCenter == "") {
          this.SelectedItemCostCenter = this.selectedItems[i].ItemCategoryID;
      }
      else {
          this.SelectedItemCostCenter = this.SelectedItemCostCenter + "," + this.selectedItems[i].ItemCategoryID;
      }
  }
  this.TotalSelectedItemCostCenter = this.selectedItems.length;
  if (this.TotalSelectedItemCostCenter == 0) {
      this.SelectedItemCostCenter = "";
  }
  //alert("Un Selected Leads : " + this.SelectedItemCostCenter + "\n Total Un Selected Leads : " + this.TotalSelectedItemCostCenter);
}

onRowSelect(event) {
  let i = 0;
  this.SelectedItemCostCenter = "";
  //debugger;
  for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedItemCostCenter == "") {
          this.SelectedItemCostCenter = this.selectedItems[i].ItemCategoryID;
      }
      else {
          this.SelectedItemCostCenter = this.SelectedItemCostCenter + "," + this.selectedItems[i].ItemCategoryID;
      }
  }
  this.TotalSelectedItemCostCenter = this.selectedItems.length;
  //alert("Selected Leads : " + this.SelectedItemCostCenter + "\n Total Selected Leads : " + this.TotalSelectedItemCostCenter);
}
//************************************************************************************************************/    


  //New Code Ends Here



}
