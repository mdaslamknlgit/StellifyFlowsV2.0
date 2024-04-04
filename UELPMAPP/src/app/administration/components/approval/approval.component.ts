import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkFlowApiService } from '../../services/workflow-api.service';
import { WorkFlowSharedService } from '../../services/workflow-shared.service';
import { WorkFlowLevel } from '../../models/workflowlevel';
import { WorkFlowComponent } from '../work-flow/work-flow.component';
export interface myinterface {
  remove(index: number);
}

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.css']
})
export class ApprovalComponent {
  toggleApprovel: boolean = false;
  public index: number;
  public selfRef: ApprovalComponent;
  public compInteraction: myinterface;
  isApproverSelected: boolean = false;
  companyName: string = "";
  IsCondition: boolean = false;
  departmentName: string = "";
  selectedApprover: number = 0;
  workFlowLevelId: number = 0;
  parentId: number = 0;
  workFlow: WorkFlowComponent;
  users = [];
  IsSubLevelExists: boolean = false;
  workFlowConfigurationId: number = 0;
  parentWorkLevelId: number = 0;
  workFlowLevel: WorkFlowLevel;
  approverUserId: number = 0;
  alternateApproverUserid: number = 0;
  constructor(private workFlowApiService: WorkFlowApiService,
    private workFlowShared: WorkFlowSharedService) {
    this.workFlowLevel = new WorkFlowLevel();
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(): void {
    let usersResult = <Observable<Array<any>>>this.workFlowApiService.getUsers();
    usersResult.subscribe((data) => {
      this.users = data;
      this.showDefaultApprover();
    });
  }

  removeMe(index) {
    this.compInteraction.remove(index)
  }

  showDefaultApprover() {
    let userId = 1; //default
    let selectedUser = this.users.filter(x => x.UserID == userId)[0];
   //this.selectedApprover = 1;
    this.companyName = "Sparsh" // selectedUser.CompanyName;
    this.departmentName = "Inventory" // selectedUser.DepartmentName;  
    this.isApproverSelected = true;
    this.approverUserId = this.selectedApprover;
  }

  ShowApprovalgrid() {
    if (this.toggleApprovel) {
      return "none";
    } else {
      return "";
    }
  }

  onChange(value, levelId) {
    let selectedUser = this.users.filter(x => x.UserID == Number(value))[0];
    this.companyName = "Sparsh" // selectedUser.CompanyName;
    this.departmentName = "Inventory" // selectedUser.DepartmentName;  
    this.isApproverSelected = true;

    this.workFlowLevel.LevelId = levelId;    
    this.workFlowLevel.Name = "";
    this.workFlowLevel.ApproverId = selectedUser.UserID;
    this.approverUserId = selectedUser.UserID;
    this.workFlowShared.sendSelectedApprover(this.workFlowLevel);
  }

  onCreateComponent = function (value) {
    this.isLevelCreated = true;
    //this.workFlowShared.sendConditionComponent(value);
  }

  onCreateApprover = function (value) {
    this.isLevelCreated = true;
    //this.workFlowShared.sendApproverComponent(value);
  }
  onremoveComponent = function (value) {

  }
}
