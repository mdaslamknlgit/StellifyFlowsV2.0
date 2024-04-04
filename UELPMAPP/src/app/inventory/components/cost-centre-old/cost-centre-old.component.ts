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

@Component({
  selector: 'app-cost-centre-old',
  templateUrl: './cost-centre-old.component.html',
  styleUrls: ['./cost-centre-old.component.css'],
  providers:[CostCentreService]
})
export class CostCentreOldComponent implements OnInit {

  @ViewChild('rightPanel') rightPanelRef;
  costCentrePagerConfig:PagerConfig;
  selectedRecordDetails:CostCentre;
  hideText: boolean=true;
  hideInput: boolean=false;
  leftSection:boolean=false;
  rightSection:boolean=false;
  scrollbarOptions:any;
  costCentresList:Array<CostCentre>=[];
  costCentreForm:FormGroup;
  showLeftPanelLoadingIcon:boolean=false;
  showRightPanelLoadingIcon:boolean=false;
  errorMessage: string = Messages.NoRecordsToDisplay;
  searchKey:string = "";
  currentPage:number =1;

  constructor(private costCentreObj:CostCentreService,
              private formBuilderObj:FormBuilder,
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
  ngOnInit() {

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
        this.costCentrePagerConfig.TotalRecords = data.TotalRecords;
        if(this.costCentresList.length > 0)
        {
          if(costCentreId > 0)
          {
            this.onRecordSelection(costCentreId);
          }
          else
          {
            this.onRecordSelection(this.costCentresList[0].CostCenterId);
          }
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
}
