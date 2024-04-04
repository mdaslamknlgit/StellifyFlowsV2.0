import { Component, OnInit, Renderer } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserManagementApiService } from '../../services/user-management-api.service';
import { ConfirmationService } from 'primeng/primeng';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { UserManagement } from '../../models/usermanagement';
import { UserDetails, MessageTypes, Messages, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  providers: [UserManagementApiService]
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  companyId: number;
  filterMessage: string = "";
  rightSection: boolean = false;


  constructor(private formBuilderObj: FormBuilder,
    private userManagementApiServiceObj: UserManagementApiService, private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService, private modalService: NgbModal,
    public sessionService: SessionStorageService,
    private renderer: Renderer) {
    this.companyId = this.sessionService.getCompanyId();


  }

  ngOnInit() {
    this.changePasswordForm = this.formBuilderObj.group({
      'CurrentPassword':[null, { validators: [Validators.required] }],
      'NewPassword': [null, { validators: [Validators.required] }],
      'ConfirmPassword': [null, { validators: [Validators.required] }],
    });
  }


  saveRecord() {
    //debugger;
    this.filterMessage = "";
    let curretnpwd=this.changePasswordForm.get("CurrentPassword").value;
    let newpwd = this.changePasswordForm.get("NewPassword").value;
    let confirmpwd = this.changePasswordForm.get("ConfirmPassword").value;
    if (newpwd === confirmpwd) {
      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      let usermanagementFormStatus = this.changePasswordForm.status;
      if (usermanagementFormStatus != "INVALID") {
        
        let usermanagementDetails: UserManagement = this.changePasswordForm.value;

        usermanagementDetails.UserID = userDetails.UserID;
        this.userManagementApiServiceObj.changepassword(usermanagementDetails).subscribe((data: any) => {
          debugger;
          if(data==9999)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: "Current Password Not Match With The User Logged in Password",
              MessageType: MessageTypes.Success
            });
            return;
          }
          if (data > 0) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.NewPasswordMessage,
              MessageType: MessageTypes.Success
            });
          }
          else {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.ADNewPasswordMessage,
              MessageType: MessageTypes.NoChange
            });
          }
          this.changePasswordForm.get("NewPassword").setValue("");
          this.changePasswordForm.get("ConfirmPassword").setValue("");
          this.changePasswordForm.reset();


        });


      }
      else {
        Object.keys(this.changePasswordForm.controls).forEach((key: string) => {
          if (this.changePasswordForm.controls[key].status == "INVALID" && this.changePasswordForm.controls[key].touched == false) {
            this.changePasswordForm.controls[key].markAsTouched();
          }
        });
      }
    }
    else {
      this.sharedServiceObj.showMessage({
        ShowMessage: true,
        Message: Messages.ConfirmationPasswordMessage,
        MessageType: MessageTypes.NoChange
      });
    }
  }



}
