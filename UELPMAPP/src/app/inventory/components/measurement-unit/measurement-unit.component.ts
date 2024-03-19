import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MeasurementUnit,MeasurementUnitDisplayInput } from "../../models/uom.model";
import { UomService } from "../../services/uom.service";
import { ResponseStatusTypes,Messages,ResponseMessage, MessageTypes, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';


@Component({
  selector: 'app-measurement-unit',
  templateUrl: './measurement-unit.component.html',
  styleUrls: ['./measurement-unit.component.css'],
  providers:[ UomService ]
})
export class MeasurementUnitComponent implements OnInit {

    
    @ViewChild("Name") nameInput: ElementRef;
    @ViewChild('rightPanel') rightPanelRef;
    measurementUnits:Array<MeasurementUnit> = [];
    selectedRecord:MeasurementUnit;
    FormMode: string;
    MeasurementUnitID:number;
    ReturnLink:number;
    measurementUnitForm:FormGroup;
    isDisplayMode?:boolean = true;
    showMessage: boolean=false;
    message:string = "";
    leftsection:boolean=false;
    showfilters:boolean=true;
     showfilterstext:string="Hide List" ;
    rightsection:boolean=false;
    formSubmitAttempt: boolean = false;
    scrollbarOptions:any;
    isSearchApplied: boolean = false;
    filterMessage: string = "";
    initDone = false;
    isFilterApplied: boolean = false;
    uomFilterInfoForm: FormGroup;
    filteredUom: Array<MeasurementUnit> = [];
    errorMessage: string = Messages.NoRecordsToDisplay;
    uomPagerConfig:PagerConfig;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;

    constructor(private uomServiceObj:UomService,
        private router: Router,
        private formBuilderObj: FormBuilder,
        public activatedRoute: ActivatedRoute,
                private headerServiceObj:SharedService,
                private confirmationServiceObj:ConfirmationService,
                private renderer: Renderer,
                private fb: FormBuilder,
                public sessionService: SessionStorageService) {
      //setting the default value for record selection.
        this.selectedRecord = {
            Name:"",
            Code:"",
            Description:"",
            Abbreviation:"",
            MeasurementUnitID:0,
            CreatedBy:0,
            CreatedOn:new Date(),
            ModifiedBy:0
        };
        this.measurementUnitForm = new FormGroup({

            Name:new FormControl("",[Validators.required,Validators.maxLength(50)]),
            Code:new FormControl("",[Validators.required,Validators.maxLength(50)]),
            Abbreviation:new FormControl("",[Validators.required,Validators.maxLength(10)]),
            Description:new FormControl(""),
        });
        this.uomFilterInfoForm = this.fb.group({
            Name: [''],
            Code: ['']
        });
        this.initDone = true;
        this.uomPagerConfig = new PagerConfig();
        this.uomPagerConfig.RecordsToSkip = 0;
        this.uomPagerConfig.RecordsToFetch = 10;
       
    }

    ngOnInit() {
       // debugger;

        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('mode') != undefined) {
                this.FormMode = param.get('mode');
            }
            if (param.get('Id') != undefined) {
                this.MeasurementUnitID = parseInt(param.get('Id'));
            }
            if (param.get('ReturnEntity') != undefined) {
                this.ReturnLink = parseInt(param.get('ReturnEntity'));
            }

        });
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "uom")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }

        debugger;
        if(this.FormMode=="NEW")
        {
            this.addRecord();
        }
        else
        {
            //Get Unit Of Measurement Info
            this.GetUnitById(this.MeasurementUnitID);
        }

    }

    showFullScreen()
    {
          FullScreen(this.rightPanelRef.nativeElement);
    }

    ClickBack(e)
    {
        this.router.navigate([`/inventory/uom/`]);
    }

   
    openDialog() {
        this.initDone = true;       
        this.nameInput.nativeElement.focus();
        this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus');
    }    

   
    GetUnitById(MeasurementId: any) {
        //this.blockUI.start("Loading..."); // Start blocking
        let lead = <Observable<any>>this.uomServiceObj.getUnitById(MeasurementId);
        lead.subscribe((MeasurementUnitRes) => {
            debugger;
            if (MeasurementUnitRes != null) {
                this.selectedRecord = MeasurementUnitRes;
                this.measurementUnitForm.reset();

                //binding the selected record details to the form...
                this.measurementUnitForm.get('Name').setValue(this.selectedRecord.Name);
                this.measurementUnitForm.get('Code').setValue(this.selectedRecord.Code);
                this.measurementUnitForm.get('Abbreviation').setValue(this.selectedRecord.Abbreviation);
                this.measurementUnitForm.get('Description').setValue(this.selectedRecord.Description);
            }
            else
            {
                this.isDisplayMode = null;
                    this.selectedRecord = {
                      Name:"",
                      Code:"",
                      Description:"",
                      Abbreviation:"",
                      MeasurementUnitID:0,
                      CreatedBy:0,
                      CreatedOn:new Date(),
                      ModifiedBy:0
                    };
            }

            setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking

            }, 300);
        });

    }
   
    /**
     * to hide the category details and show in add mode..
     */
    addRecord()
    {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
        this.selectedRecord = {
              Name:"",
              Code:"",
              Description:"",
              Abbreviation:"",
              MeasurementUnitID:0,
              CreatedBy:0,
              CreatedOn:new Date(),
              ModifiedBy:0
        };
        //resetting the item category form..
        this.measurementUnitForm.reset();
        this.showfilters =false;
        this.showfilterstext="Show List" ;
    }

    /**
     * to hide the category details and show in edit mode...
     */ 
    editRecord()
    {
          //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        //resetting the item category form.
        this.measurementUnitForm.reset();

        //binding the selected record details to the form...
        this.measurementUnitForm.get('Name').setValue(this.selectedRecord.Name);
        this.measurementUnitForm.get('Code').setValue(this.selectedRecord.Code);
        this.measurementUnitForm.get('Abbreviation').setValue(this.selectedRecord.Abbreviation);
        this.measurementUnitForm.get('Description').setValue(this.selectedRecord.Description);
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    /**
     * to save the given item category details...
     */
    saveRecord()
    {
        debugger;
      this.formSubmitAttempt = true;
      //getting the status of the form
      let measurementUnitFormStatus = this.measurementUnitForm.status;
      if(measurementUnitFormStatus!="INVALID")
      {
          //getting the item category form details
          let measurementUnitDetails:MeasurementUnit = this.measurementUnitForm.value; 
          //if measurement id is 0 then we are inserting a new record..
          if(this.selectedRecord.MeasurementUnitID==0)
          {
              this.uomServiceObj.createUnit(measurementUnitDetails).subscribe((response)=>{

                    debugger;
                    this.MeasurementUnitID=response;
                    this.headerServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.SavedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.formSubmitAttempt = false;
                    this.showMessage =  true;
                    //after save we will show details in display mode..so setting this variable to true...
                    this.isDisplayMode = true;
                    //pushing the record details into the array...


                    this.router.navigate([`/inventory/uom/`]);

                    //this.router.navigate([`/inventory/uom/${'EDIT'}/${this.MeasurementUnitID}/${this.getRandomInt(10)}`]);


                    //this.GetUnitById(this.MeasurementUnitID);
                    // this.measurementUnits.unshift({
                    //     MeasurementUnitID:response,
                    //     Name:measurementUnitDetails.Name,
                    //     Code:measurementUnitDetails.Code,
                    //     Description:measurementUnitDetails.Description,
                    //     Abbreviation:measurementUnitDetails.Abbreviation,
                    //     CreatedBy:1,
                    //     ModifiedBy:1
                    // });
                    // this.selectedRecord = this.measurementUnits[0];
              },(data:HttpErrorResponse)=>{
                    let message:string = data.error.Message;
                    if(message.includes("duplicate"))
                    {
                        this.showDuplicateMessage(message);
                    }
                });
          }
          else//updating the record...
          {

            measurementUnitDetails.MeasurementUnitID = this.selectedRecord.MeasurementUnitID;

            this.uomServiceObj.updateUnit(measurementUnitDetails).subscribe((response)=>{

                this.headerServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.UpdatedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.formSubmitAttempt = false;
                this.showMessage =  true;
                this.isDisplayMode = true;

                this.router.navigate([`/inventory/uom/`]);

                //this.GetUnitById(this.MeasurementUnitID);
                // let measurementRecord = this.measurementUnits.find(data=>data.MeasurementUnitID==
                //                                                     this.selectedRecord.MeasurementUnitID);
                // measurementRecord.Name = measurementUnitDetails.Name;
                // measurementRecord.Code = measurementUnitDetails.Code;
                // measurementRecord.Abbreviation = measurementUnitDetails.Abbreviation;
                // measurementRecord.Description = measurementUnitDetails.Description;

                // this.measurementUnits = this.measurementUnits.filter(data=>data.MeasurementUnitID>0);
                // this.selectedRecord = measurementRecord;
            },(data:HttpErrorResponse)=>{
                let message:string = data.error.Message;
                if(message.includes("duplicate"))
                {
                    this.showDuplicateMessage(message);
                }
            });
          }
      }
      else{
        this.measurementUnitForm.markAsUntouched();
    }

    }

    showDuplicateMessage(message:string)
    {
        if(message == "duplicatename")
        {
            //setting the error for the "Name" control..so as to show the duplicate validation message..
            this.measurementUnitForm.get('Name').setErrors({

                'Duplicate':true
            });
        }
        else if(message == "duplicatecode")
        {
            //setting the error for the "Code" control..so as to show the duplicate validation message..
            this.measurementUnitForm.get('Code').setErrors({
                'Duplicate':true
            });
        }
    }
    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
        if(this.showfilters == false){ 
           // this.showfilterstext="Show List"
        }
      }
      
    split(){ 
this.showfilters=!this.showfilters;
if(this.showfilters == true){ 
    this.showfilterstext="Hide List" 
}
    else{
        this.showfilterstext="Show List" 
    }
 
    //  this.leftsection= !this.leftsection;
    //  this.rightsection= !this.rightsection;
    }

    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the category details on cancel button click event..
     */
    cancelRecord()
    { 
        this.formSubmitAttempt = false;
        if(this.selectedRecord.MeasurementUnitID > 0)
        {
            this.isDisplayMode = true;
        }
        else if(this.measurementUnits.length > 0)
        {
            this.selectedRecord = this.measurementUnits[0];
            this.isDisplayMode = true;
        }
        else
        {
            this.isDisplayMode =null;
        }
    }


    /**
     * to delete the selected record...
     */
    deleteRecord()
    {
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header:Messages.DeletePopupHeader,
            accept: () => {
            let recordId = this.selectedRecord.MeasurementUnitID;
            let userDetails = <UserDetails> this.sessionService.getUser();
            this.uomServiceObj.deleteUnit(recordId,userDetails.UserID).subscribe((data)=>{
                if(data==0){
                    this.headerServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.DeletedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    let recordIndex = this.measurementUnits.findIndex(i=>i.MeasurementUnitID==recordId);
                    this.measurementUnits.splice(recordIndex,1);
                }
                else{
                    this.headerServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.ExistingRecord,
                        MessageType:MessageTypes.NoChange
                    });
                }
                if(this.measurementUnits.length > 0)
                {
                    this.selectedRecord = this.measurementUnits[0];
                }
                else
                {
                    this.isDisplayMode = null;
                    this.selectedRecord = {
                        Name:"",
                        Code:"",
                        Abbreviation:"",
                        Description:"",
                        MeasurementUnitID:0,
                        CreatedBy:0,
                        CreatedOn:new Date(),
                        ModifiedBy:0
                    };
                }
            });
        }
    });
  }
}
