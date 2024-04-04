import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
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
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-cost-center',
  templateUrl: './cost-center.component.html',
  styleUrls: ['./cost-center.component.css'],
  providers:[CostCentreService]
})
export class CostCenterComponent implements OnInit {
  CostCenterFilterForm: FormGroup;
  @ViewChild('rightPanel') rightPanelRef;
  costCentrePagerConfig:PagerConfig;
  selectedRecordDetails:CostCentre;
  hideText: boolean=true;
  hideInput: boolean=false;
  leftSection:boolean=false;
  rightSection:boolean=false;
  scrollbarOptions:any;
  costCentresList:Array<CostCentre>=[];
  costCentresListCols:any[];
  costCentreForm:FormGroup;
  showLeftPanelLoadingIcon:boolean=false;
  showRightPanelLoadingIcon:boolean=false;
  errorMessage: string = Messages.NoRecordsToDisplay;
  searchKey:string = "";
  currentPage:number =1;
  TotalRecords:number=0;
  userDetails: UserDetails = null;
  UserId:number;
  FormMode:string;
  CostCenterId:number;
  constructor(
              public activatedRoute: ActivatedRoute,
              private costCentreObj:CostCentreService,
              private exportService: ExportService,
              private router: Router,
              private formBuilderObj:FormBuilder,
              private fb: FormBuilder,
              private sharedServiceObj:SharedService,
              public sessionService: SessionStorageService,
              private confirmationServiceObj:ConfirmationService) { 

                this.userDetails = <UserDetails>this.sessionService.getUser();

  }
  IntializeForm()
  {
  this.costCentreForm = this.formBuilderObj.group({
    'CostCenterName':["", [Validators.required]],
    'Description':[""],
    'CostCenterId':[0]
  });
  }

  ngOnInit() {
    this.UserId=this.userDetails.UserID;
    this.IntializeForm();

    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
        if (param.get('mode') != undefined) {
          this.FormMode = param.get('mode');
        }
        if (param.get('Id') != undefined) {
          this.CostCenterId = parseInt(param.get('Id'));
        }
      });


    this.selectedRecordDetails = new CostCentre();
    if(this.FormMode=="NEW")
    {
      this.addRecord();
    }
    else
    {
      this.onRecordSelection(this.CostCenterId);

    }
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

          debugger;
            this.sharedServiceObj.showMessage({
                ShowMessage:true,
                Message:Messages.SavedSuccessFully,
                MessageType:MessageTypes.Success
            });
            this.router.navigate([`inventory/costcenter`]);

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
          debugger;
          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.UpdatedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.router.navigate([`inventory/costcenter`]);

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
                this.router.navigate([`inventory/costcenter`]);
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


  //New Code Starts Here
  ClickNewCostCenter(e)
  {
    this.router.navigate([`inventory/costcentre/${'NEW'}/${0}`]);
  }
  ClickEditCostCenter(costCentreId:number)
  {
    this.router.navigate([`inventory/costcentre/${'EDIT'}/${costCentreId}`]);
  }
  ClickBack(e)
  {
    this.router.navigate([`inventory/costcenter`]);
  }

  //New Code Ends Here



}
