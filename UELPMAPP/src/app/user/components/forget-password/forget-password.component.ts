import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EMAIL_PATTERN } from '../../../shared/constants/generic';
import { SharedService } from '../../../shared/services/shared.service';
import { Messages, MessageTypes, UserDetails } from '../../../shared/models/shared.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { UserManagementApiService } from '../../../administration/services/user-management-api.service';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
  providers: [UserManagementApiService, SharedService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ForgetPasswordComponent implements OnInit {

  signupForm: FormGroup;
  formSubmitAttempt: boolean = false;
  showResetTypeDialog: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  showMessage: number; 
  constructor(private formBuilderObj: FormBuilder,private router: Router,public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,private userManagementApiServiceObj: UserManagementApiService,
   private dataService: DataService) { }

  ngOnInit() {   
    this.signupForm = this.formBuilderObj.group({       
      'email': [null,{ validators: [Validators.required,Validators.pattern(EMAIL_PATTERN)]}],
    });

  }

  validateControl(control: any) {    
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));    
  }


  Reset(){ 
    this.showMessage=null;
    if(this.signupForm.status!="INVALID")
    {      
      let userName = this.dataService.userName;
      this.showLeftPanelLoadingIcon = true;
      let resetInput = {
        
        userName: userName,
        EmailId: this.signupForm.get("email").value,
      };
      this.userManagementApiServiceObj.resetpassword(resetInput)
        .subscribe((data: any) => {
          if (data === 1) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.EmailResponse,
              MessageType: MessageTypes.Success
            });
            this.showMessage = 1;
          }
          else if (data === -1) {           
              this.showMessage = data; 
          }
          else {
            this.showMessage = 0;
          }

          this.signupForm.get("email").setValue(null);
          this.signupForm.reset();
          this.showLeftPanelLoadingIcon = false;
          // this.showResetTypeDialog = true;
          this.formSubmitAttempt = false;

        }, (error) => {
        });
    }
    else{
      // this.signupForm.markAsUntouched();
      Object.keys(this.signupForm.controls).forEach((key: string) => {
        if (this.signupForm.controls[key].status == "INVALID" && this.signupForm.controls[key].touched == false) {
          this.signupForm.controls[key].markAsTouched();
        }
      });
    }
  }

  resetValidation() {      
    this.showMessage = null;
  }

  SelectionOk() {
    this.showResetTypeDialog = false;
    this.router.navigate(['/login']);
  }

}
