import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { CustomerTypeMaster, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { CustomerTypesColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-customer-type',
  templateUrl: './customer-type.component.html',
  styleUrls: ['./customer-type.component.css']
})
export class CustomerTypeComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  CustomerTypeForm: FormGroup;
  CustomerColumns: PTableColumn[] = [];
  customerTypeGrid: CustomerTypeMaster[] = [];
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
  get f(){
    return this.CustomerTypeForm.controls;
  }

  ngOnInit() {
    this.showDetailsScreen = false;
    this.CustomerTypeForm = this.fb.group({
      CustomerTypeId: 0,
      Description: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CustomerTypeName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.CustomerColumns = CustomerTypesColumns.filter(x => x);
    this.GetCustomerTypes();
    this.CustomerTypeForm.valueChanges.subscribe((form: CustomerTypeMaster) => {
      this.IsFormValueChanges = false;
      for (var key in this.ExistingVal) {
        var formcontrol = form[key];
        if (formcontrol != null && (this.ExistingVal[key].toString().trim() != formcontrol.toString().trim())) {
          this.IsFormValueChanges = true;
          break;
        }
      }
    });
    this.getRoles();
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
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "customertype")[0];
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
      this.GetCustomerTypes();
    }
  }

  GetCustomerTypes() {
    this.adhocMasterService.GetCustomerTypes().subscribe((result: CustomerTypeMaster[]) => {
      if (result != null) {
        this.customerTypeGrid = result;
      }
    })
  }
  

  ChangeStatus(value: CustomerTypeMaster, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      Status: value.IsActive,
      DocumentId: value.CustomerTypeId,
      ProcessId: MasterProcessTypes.CustomerType,
      UserId: this.userDetails.UserID
    };
    this.confirmationService.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.adhocMasterService.ChangeMasterProcessStatus(masterProcess).subscribe((data: boolean) => {
          if (data) {
            this.sharedService.showMessage({
              ShowMessage: true,
              Message: `Customer Type ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetCustomerTypes();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.customerTypeGrid.forEach((element: CustomerTypeMaster) => {
          debugger
          if (element.CustomerTypeId == value.CustomerTypeId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }

  PostCustomerTypeMaster() {
    if (this.CustomerTypeForm.valid) {
      let CustomerTypeDetail: CustomerTypeMaster = this.CustomerTypeForm.value;
      CustomerTypeDetail.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostCustomerTypeMaster(CustomerTypeDetail).subscribe((result: number) => {
        if (result == -1) {
          this.CustomerTypeForm.get('CustomerTypeName').setErrors({ 'CustomerTypeNameerror': true });
        }
        else {
          this.GetCustomerTypes();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.CustomerTypeForm);
    }
  }

  EditCustomerTypeDetails(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetCustomerTypeById(index).subscribe((data: CustomerTypeMaster) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: CustomerTypeMaster) {
    this.CustomerTypeForm.reset();
    if (data == null) {
      data = {
        CustomerTypeId: 0,
        CustomerTypeName: '',
        Description: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    this.ExistingVal = data;
    this.CustomerTypeForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}