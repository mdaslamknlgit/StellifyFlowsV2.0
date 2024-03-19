import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { Currency,  PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { MarketingList } from '../../models/crm.models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-crmconnections',
  templateUrl: './crmconnections.component.html',
  styleUrls: ['./crmconnections.component.css']
})
export class CrmconnectionsComponent implements OnInit,AfterViewInit {

  @ViewChild("ListName") ListNameField: ElementRef;
  private result;
  @BlockUI() blockUI: NgBlockUI;
  showLoadingIcon: boolean = false;
  ConnectionId:number;
  userDetails: UserDetails = null;
  FormMode:any;
  UserId: number;
  CompanyId:number;
  showLeftPanelLoadingIcon: boolean = false;
  ConnectionsLists:MarketingList[]=[];
  ListInfo:MarketingList;
  ListForm: FormGroup;
  ListName:string;
  formError: string;
  rightsection: boolean = false;

  constructor(
    private renderer: Renderer2,
    public snackBar: MatSnackBar,
    private router: Router,
    private CRMService: CRMService,
    public activatedRoute: ActivatedRoute,
    public sessionService: SessionStorageService,
    private formBuilderObj: FormBuilder,
  ) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.UserId = this.userDetails.UserID;
    this.CompanyId = this.sessionService.getCompanyId();

   }
  ngAfterViewInit(): void {
    this.ListNameField.nativeElement.focus();
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.ConnectionId =parseInt(param.get('Id'));
      }
      //alert("Record Mode : " + this.RecordMode + "\n Connection ID : " + this.ConnectionId);

    });

    
    this.IntialForm();
    debugger;
    if (this.FormMode == "EDIT") {
      if (this.ConnectionId > 0) {
        this.GetListDetails(this.ConnectionId);
      }
      else{
        this.ConnectionId=0;
      }
    }
  }

  ClickBack(e)
  {
    this.router.navigate([`/crm/crmconnectionslist`]);
  }
  
  IntialForm() {
    this.ListForm = this.formBuilderObj.group({
      'Id': [0],
      'ListName': ['',[Validators.required]],
      'ListDesc': [''],
      'CompanyId': [''],
      'IsActive': [true],
      'CreatedBy': [''],
      'UpdatedBy': ['']
    });

  }
  GetListDetails(listid:number)
  {
    //debugger;
    this.UserId = this.userDetails.UserID;
    this.CompanyId = this.sessionService.getCompanyId();

    const self = this;
    this.CRMService.GetListDetails(listid,this.CompanyId)
    .subscribe((data:any) => {
        debugger;
        
      this.ListInfo=data;
      //this.ListName=data.ListName;
      this.ListForm.controls["Id"].setValue(data.Id);
      this.ListForm.controls["ListName"].setValue(data.ListName);
      this.ListForm.controls["ListDesc"].setValue(data.ListDesc);

      // this.ListForm.controls["CreatedBy"].setValue(data.CreatedBy);
      // this.ListForm.controls["UpdatedBy"].setValue(data.UpdatedBy);

      this.ListForm.controls["IsActive"].setValue(data.IsActive);

    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        debugger;
    });
  }

  onSubmit(MyListForm: any, myPanel, e) {

    debugger;
    this.ListInfo = new MarketingList();
    this.ListInfo.Id = this.ConnectionId;
    this.ListInfo.ListId=this.ConnectionId;
    this.ListInfo.ListName = MyListForm.ListName;
    this.ListInfo.ListDesc = MyListForm.ListDesc;
    this.ListInfo.UserId = this.UserId;
    this.ListInfo.CreatedBy = this.UserId;
    this.ListInfo.UpdatedBy = this.UserId;
    this.ListInfo.CompanyId = this.CompanyId;
    this.ListInfo.IsActive=MyListForm.IsActive;

    if(this.ListForm.invalid)
    {
      if (MyListForm.ListName == null) {
        this.ListForm.controls["ListName"].setErrors({ required: true });
        this.ListForm.controls["ListName"].markAsTouched();
        this.renderer.selectRootElement('#ListName').focus();
        return;
      }
    }
    
    if (this.ListForm.valid) {

      debugger;
      if (this.FormMode == "NEW") {

        this.ListInfo.CreatedBy = this.userDetails.UserID;
        this.CreateList(this.ListInfo, e);
      }
      else {

        this.ListInfo.UpdatedBy = this.userDetails.UserID;
        this.UpdateList(this.ListInfo, e)
      }

    }
    else {
      myPanel.expanded = true;
    }
  }

CreateList(List: any, e)
{
    const self = this;
    this.blockUI.start('Creating List...'); // Start blocking 
    this.result = this.CRMService.CreateList(List).subscribe(
      (data: any) => {

        debugger;

        if (data.Status == "SUCCESS") {
          this.ConnectionId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("List Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


          //this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
          this.ClickBack(e);
        }
        else if (data.Status == "EXISTS") {
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open(data.Message, null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
        else if (data.Status == "ERROR") {

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open(data.Message, null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
        else {

          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open("Problem in Creating List please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
      },
      // Errors will call this callback instead:
      err => {
        ////
        if (err.error == "FAIL") {
          //this.formError = err.error.ExceptionMessage;

          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open("Problem in Creating List Please Try Again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


        }
        else {
          this.formError = err.statusText;
        }
      });
}


UpdateList(List: any, e)
{
  const self = this;
  this.blockUI.start('Updating List...'); // Start blocking 
  this.result = this.CRMService.UpdateList(List).subscribe(
    (data: any) => {

      debugger;

      if (data.Status == "SUCCESS") {
        this.ConnectionId = data.Data;
        setTimeout(() => {
          this.blockUI.stop(); // Stop blocking
        }, 300);

        self.snackBar.open("List Updated successfully", null, {
          duration: 5000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });


        //this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
        this.ClickBack(e);
      }
      else if (data.Status == "EXISTS") {
        setTimeout(() => {
          this.blockUI.stop(); // Stop blocking
        }, 500);

        self.snackBar.open(data.Message, null, {
          duration: 5000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });
      }
      else if (data.Status == "ERROR" || data.Status == "FAIL") {

        setTimeout(() => {
          this.blockUI.stop(); // Stop blocking
        }, 500);

        self.snackBar.open(data.Message, null, {
          duration: 5000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });
      }
      else {

        setTimeout(() => {
          //this.blockUI.stop(); // Stop blocking
        }, 500);

        self.snackBar.open("Problem in Updating List please try again", null, {
          duration: 5000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });
      }
    },
    // Errors will call this callback instead:
    err => {
      ////
      if (err.error == "FAIL") {
        //this.formError = err.error.ExceptionMessage;

        setTimeout(() => {
          //this.blockUI.stop(); // Stop blocking
        }, 500);

        self.snackBar.open("Problem in Updating List please try again", null, {
          duration: 5000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });


      }
      else {
        this.formError = err.statusText;
      }
    });
}







}
