import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SchedulerNoService } from '../../services/scheduler-no.service';
import { Messages, MessageTypes, UserDetails } from '../../../shared/models/shared.model';
import { ScheduleCategory, SchedulerNo, ScheduleType } from '../../models/scheduler-no.model';
import { ConfirmationService, DataGrid } from 'primeng/primeng';
import { timeStamp } from 'console';
import { PageAccessLevel, Roles } from '../../../administration/models/role';

@Component({
  selector: 'app-scheduler-master',
  templateUrl: './scheduler-master.component.html',
  styleUrls: ['./scheduler-master.component.css']
})
export class SchedulerMasterComponent implements OnInit {
  EditPermission: boolean = false;
  AddPermission: boolean = false;
  userRoles = [];
  rolesAccessList = [];
  scrollbarOptions: any;
  AddNew: boolean = false;
  SchedulerForm: FormGroup;
  SchedulerColumns: Array<{ field: string, header: string, width: string }> = [];
  public Value: any[];
  companyId: any;
  userDetails: any;
  schedulerNoDetails: any[] = [];
  SchedulerId: number;
  Check_Scheduler: any;
  HasSchedulerValue: boolean = false
  PreviousValue: number;
  scheduleTypes: ScheduleType[] = [];
  scheduleCategories: ScheduleCategory[] = [];
  public screenWidth: any;
  constructor(private formBuilderObj: FormBuilder, private SchedulerMasterServiceObj: SchedulerNoService,
    private sharedServiceObj: SharedService,
    private sessionServiceObj: SessionStorageService,
    private confirmationServiceObj: ConfirmationService) {
    this.companyId = this.sessionServiceObj.getCompanyId();
    this.userDetails = <UserDetails>this.sessionServiceObj.getUser();
  }

  ngOnInit() {

    this.AddNew = false;
    this.GetScheduleCategories();
    this.GetScheduleTypes();
    this.SchedulerForm = this.formBuilderObj.group({
      ScheduleCategoryId: [1, Validators.required],
      ScheduleTypeId: [0, Validators.required],
      SchedulerDescription: ['', Validators.required],
      SchedulerNumber: ['', Validators.required],
      CompanyId: [''],
      SchedulerNoId: ['']
    });

    this.schedulerDetails();
    this.getRoles();
    this.SchedulerColumns = [
      { field: 'S.No.', header: 'S.No.', width: '40px' },
      { field: 'ScheduleCategory', header: 'Schedule Category', width: '140px' },
      { field: 'ScheduleType', header: 'Schedule Type', width: '140px' },
      { field: 'SchedulerNo', header: 'Schedule No', width: '140px' },
      { field: 'Description', header: 'Description', width: '140px' },
      { field: 'IsActive', header: 'Active', width: '60px' },
      { field: 'Option', header: 'Option', width: '60px' },
    ];
    this.Value = [];
    
      
    this.screenWidth = window.innerWidth-180;
     

  }
  GetScheduleTypes() {
    this.SchedulerMasterServiceObj.GetScheduleTypes().subscribe((result: ScheduleType[]) => {
      if (result != null) {
        this.scheduleTypes = result;
      }
    })
  }
  GetScheduleCategories() {
    this.SchedulerMasterServiceObj.GetScheduleCategories().subscribe((result: ScheduleCategory[]) => {
      if (result != null) {
        this.scheduleCategories = result;
      }
    })
  }

  getRoles() {
    let userDetails = <UserDetails>this.sessionServiceObj.getUser();
    if (this.companyId > 0) {
      this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionServiceObj.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionServiceObj.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionServiceObj.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "scheduleno")[0];
              this.EditPermission = (role.IsEdit);
              this.AddPermission = (role.IsAdd);
            }
          });
        }
      });
    }
  }
  schedulerDetails() {
    this.SchedulerMasterServiceObj.GetSchedulerNo().subscribe((result) => {
      if (result != null) {
        this.schedulerNoDetails = result['SchedulerNos']
        // this.PreviousValue = 

      }
    })
  }

  addRecord() {
    this.AddNew = true
    this.SchedulerId = 0
    this.SchedulerForm.reset();
    this.SchedulerForm.get('ScheduleCategoryId').setValue(1);
  }

  InsertRecords() {
    debugger

    let SchedulerNoDetails: SchedulerNo = this.SchedulerForm.value;
    if (this.SchedulerId) {
      SchedulerNoDetails.SchedulerNoId = this.SchedulerId
      SchedulerNoDetails.UpdatedBy = this.userDetails.UserID

      if (!this.SchedulerForm.invalid) {
        this.SchedulerForm.controls['SchedulerNumber'].setErrors({ 'Schedulererror': null })

        if (this.HasSchedulerValue) {
          this.SchedulerForm.controls['SchedulerNumber'].setErrors({ 'Schedulererror': true })

        } else {
          this.SchedulerMasterServiceObj.PostSchedulerNo(SchedulerNoDetails).subscribe((SchedulerNoId: number) => {
            //debugger
            this.AddNew = false
            this.SchedulerForm.controls['SchedulerNumber'].reset()
            this.schedulerDetails()

          })
        }

      } else {
        this.SchedulerForm.controls['SchedulerNumber'].markAsTouched()
        this.SchedulerForm.controls['SchedulerDescription'].markAsTouched()
      }
    }
    else {
      SchedulerNoDetails.SchedulerNoId = 0
      SchedulerNoDetails.CreatedBy = this.userDetails.UserID

      if (!this.SchedulerForm.invalid) {

        var SchedulerNumber = SchedulerNoDetails.SchedulerNumber
        this.SchedulerMasterServiceObj.CheckSchedulerNo(SchedulerNoDetails).subscribe((data) => {
          debugger
          this.Check_Scheduler = data
          if (this.Check_Scheduler.SchedulerNos.length > 0) {
            this.SchedulerForm.controls['SchedulerNumber'].setErrors({ 'Schedulererror': true })

          } else {
            this.SchedulerMasterServiceObj.PostSchedulerNo(SchedulerNoDetails).subscribe((SchedulerNoId: number) => {
              //debugger
              this.AddNew = false
              this.SchedulerForm.controls['SchedulerNumber'].reset()
              this.schedulerDetails()

            })
          }
        })

      } else {
        this.SchedulerForm.controls['SchedulerNumber'].markAsTouched();
        this.SchedulerForm.controls['SchedulerDescription'].markAsTouched();
        this.SchedulerForm.controls['ScheduleCategoryId'].markAsTouched();
        this.SchedulerForm.controls['ScheduleTypeId'].markAsTouched();
      }
    }



  }
  cancelRecord() {
    this.AddNew = false
    this.SchedulerForm.controls['SchedulerNumber'].reset()
    this.schedulerDetails()

  }
  EditSchedulerDetails(SchedulerNoId) {
    //debugger
    this.SchedulerId = SchedulerNoId
    this.SchedulerMasterServiceObj.GetSchedulerNoById(SchedulerNoId).subscribe((data: SchedulerNo) => {
      debugger
      this.AddNew = true
      this.SchedulerForm.patchValue(data)
      this.PreviousValue = this.SchedulerForm.controls['SchedulerNumber'].value

    })
  }

  DeleteScheduler(SchedulerNoId) {
    //debugger

    this.confirmationServiceObj.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        var UpdatedBy = this.userDetails.UserID
        this.SchedulerMasterServiceObj.DeleteSchedulerNo(SchedulerNoId, UpdatedBy).subscribe((data: number) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: data == 0 ? Messages.DeleteSchedulerExisted : Messages.DeletedSuccessFully,
            MessageType: data == 0 ? MessageTypes.NoChange : MessageTypes.Success
          });
          this.schedulerDetails()
        })
      },
      rejectVisible: true,
      acceptLabel: "Yes"
    });
    return false;

  }

  CheckSchedulerno() {
    debugger
    var No = this.SchedulerForm.controls['SchedulerNumber'].value
    if (No != this.PreviousValue) {
      this.SchedulerMasterServiceObj.CheckSchedulerNo(No).subscribe((data) => {
        debugger
        this.Check_Scheduler = data
        if (this.Check_Scheduler.SchedulerNos.length > 0) {
          this.HasSchedulerValue = true
        }
      })
    } else {
      this.HasSchedulerValue = false
    }
  }
  ChangeStatus(value: SchedulerNo, status) {
    debugger
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    this.confirmationServiceObj.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.SchedulerMasterServiceObj.ChangeStatus(value).subscribe((data: number) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: value.IsActive ? Messages.ActiveOK : Messages.InActiveOK,
            MessageType: MessageTypes.Success
          });
          this.schedulerDetails();
        })
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.schedulerNoDetails.forEach(element => {
          debugger
          if (element.SchedulerNoId == value.SchedulerNoId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }
}
