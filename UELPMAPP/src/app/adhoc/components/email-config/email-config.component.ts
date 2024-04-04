import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { EmailConfigProcess, EmailConfiguration, MasterProcess, MasterProcessTypes, UserEmail } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { EmailConfigurationColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { Locations } from './../../../inventory/models/item-master.model';

@Component({
  selector: 'app-email-config',
  templateUrl: './email-config.component.html',
  styleUrls: ['./email-config.component.css']
})
export class EmailConfigComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  processes: EmailConfigProcess[] = [];
  Users: UserEmail[] = [];
  departments: any = [];
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  EmailConfigForm: FormGroup;
  EmailConfigColumns: PTableColumn[] = [];
  EmailConfigurationGrid: EmailConfiguration[] = [];
  userDetails: UserDetails = null;
  showLogPopUp: boolean = false;
  companyId: number = 0;
  userRoles = [];
  rolesAccessList = [];
  constructor(private fb: FormBuilder,
    private sessionService: SessionStorageService,
    private adhocMasterService: AdhocMasterService,
    private sharedService: SharedService,
    private confirmationService: ConfirmationService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.companyId = this.sessionService.getCompanyId();
  }
  get f() {
    return this.EmailConfigForm.controls;
  }

  ngOnInit() {
    this.getDepartments();
    this.getEmailConfigProcesses();
    this.showDetailsScreen = false;
    this.EmailConfigForm = this.fb.group({
      EmailConfigId: 0,
      CompanyId: this.companyId,
      Department: new FormControl(new Locations(), [Validators.required]),
      ProcessType: new FormControl(new EmailConfigProcess(), [Validators.required]),
      Users: new FormControl(null, [Validators.required]),
      GroupEmail: '',
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.EmailConfigColumns = EmailConfigurationColumns.filter(x => x);
    this.GetEmailConfigurations();
    this.EmailConfigForm.valueChanges.subscribe((form: EmailConfiguration) => {
      this.IsFormValueChanges = false;
      for (var key in this.ExistingVal) {
        var formcontrol = form[key];
        if (formcontrol != null) {
          var JsonFC;
          var JsonEV;
          JsonFC = formcontrol.toString().trim();
          if (JsonFC == "[object Object]") {
            let newtg = JSON.stringify(formcontrol);
            let oldtg = JSON.stringify(this.ExistingVal[key]);
            if (newtg != oldtg) {
              this.IsFormValueChanges = true;
              break;
            };
          }
          else {
            JsonEV = this.ExistingVal[key].toString().trim();
            if (JsonFC.trim() != JsonEV.trim()) {
              this.IsFormValueChanges = true;
              break;
            }
          }
        }
      }
    });
    this.getRoles();
  }
  getEmailConfigProcesses() {
    this.adhocMasterService.getEmailConfigProcesses().subscribe((data: EmailConfigProcess[]) => {
      this.processes = data;
    });
  }
  getUsers() {
    let dept = this.f.Department.value;
    if (dept != null && dept != undefined) {
      this.adhocMasterService.GetUsers(this.companyId, dept.LocationID).subscribe((data: UserEmail[]) => {
        this.Users = data;
      });
    }
  }
  getDepartments() {
    this.sharedService.getUserDepartments(this.companyId, 0, this.userDetails.UserID).subscribe((data) => {
      this.departments = data;
    });
  }
  getRoles() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (this.companyId > 0) {
      this.sharedService.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedService.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              this.ClearPermissions();
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "emailconfiguration")[0];
              let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
              this.logPersmission = auditLogRole.IsView;
              this.addPersmission = role.IsAdd;
              this.editPersmission = role.IsEdit;
              this.deletePersmission = role.IsDelete;
            }
          });
        }
      });
    }
  }

  ClearPermissions() {
    this.logPersmission = false;
    this.addPersmission = false;
    this.editPersmission = false;
    this.deletePersmission = false;
  }
  addRecord(e) {
    this.showDetailsScreen = true;
    this.resetFormData(null);
  }
  cancelRecord() {
    let result: boolean = true;
    if (this.IsFormValueChanges) {
      result = confirm(Messages.DiscardWarning);
    }
    if (result) {
      this.showDetailsScreen = false;
      this.GetEmailConfigurations();
    }
  }

  GetEmailConfigurations() {
    this.adhocMasterService.GetEmailConfigurations(this.companyId).subscribe((result: EmailConfiguration[]) => {
      if (result != null) {
        this.EmailConfigurationGrid = result;
      }
    })
  }

  PostEmailConfiguration() {
    if (this.EmailConfigForm.valid) {
      let EmailConfigurationDetail: EmailConfiguration = this.EmailConfigForm.value;
      EmailConfigurationDetail.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostEmailConfiguration(EmailConfigurationDetail).subscribe((result: number) => {
        if (result == -1) {
          this.EmailConfigForm.get('Department').setErrors({ 'duplicate': true });
        }
        else {
          this.GetEmailConfigurations();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.EmailConfigForm);
    }
  }

  EditEmailConfigurationDetails(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetEmailConfigurationById(this.companyId, index).subscribe((data: EmailConfiguration) => {
      this.resetFormData(data);
      this.getUsers();
    });
  }

  resetFormData(data: EmailConfiguration) {
    this.EmailConfigForm.reset();
    if (data == null) {
      data = {
        EmailConfigId: 0,
        CompanyId: this.companyId,
        Department: {
          LocationID: 0,
          Name: '',
          HasWorkflow: false
        },
        Users: null,
        ProcessType: {
          ProcessId: 0,
          ProcessName: ''
        },
        GroupEmail: '',
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID,
        IsActive: true
      };
    }
    this.ExistingVal = data;
    this.EmailConfigForm.setValue(data);
    let selectedDept = this.departments.filter(x => x.LocationID == data.Department.LocationID);
    this.EmailConfigForm.get('Department').setValue(selectedDept[0]);
    let selectedprocess = this.processes.filter(x => x.ProcessId == data.ProcessType.ProcessId);
    this.EmailConfigForm.get('ProcessType').setValue(selectedprocess[0]);
  }
  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}