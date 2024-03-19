import { Component, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ChildNodeComponent } from '../child-node/child-node.component';
import { WorkFlowSharedService } from '../../services/workflow-shared.service';
import { WorkFlowLevel } from '../../models/workflowlevel';
export interface myinterface {
  remove(index: number);
}

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css']
})
export class ChildComponent {

  toggleStyle: boolean = false;
  showchildtable: boolean = false;
  //public index: number;
  public selfRef: ChildComponent;
  @ViewChild('viewContainerRef', { read: ViewContainerRef }) VCR: ViewContainerRef;
  index: number = 0;
  componentsReferences = [];
  //interface for Parent-Child interaction
  public compInteraction: myinterface;
  isCondition: boolean = false;
  isSubLevelExists: boolean = false;
  @Output()
  createComponentClick: EventEmitter<String> = new EventEmitter<String>(); //creating an output event
  leftWorkFlowLevelId: number = 0;
  rightWorkFlowLevelId: number = 0;
  parentId: number = 0;
  firstCondtion: string = "";
  secondCondition: string = "";
  workFlowConfigurationId: number = 0;
  parentWorkLevelId: number = 0;
  leftleveldirection: number = 1;
  leftlevelId: number = 0;
  leftParentWorkLevelId: number = 0;
  rightleveldirection: number = 2;
  rightlevelId: number = 0;
  rightParentWorkLevelId: number = 0;
  workFlowLevel: WorkFlowLevel;
  firstDirection: number = 1//
  secondDirection: number = 2//
  itemTypes =
    [
      {
        Id: 1,
        Name: 'Furniture'
      },
      {
        Id: 2,
        Name: 'Electronics'
      },
      {
        Id: 3,
        Name: 'Computers'
      },
      {
        Id: 4,
        Name: 'Air Conditionrs'
      },
    ]

  constructor(private CFR: ComponentFactoryResolver, private workFlowShared: WorkFlowSharedService) {
    this.firstCondtion = "";
    this.secondCondition = "";
    this.workFlowLevel = new WorkFlowLevel();
  }
 
  remove(index: number) {
    if (this.VCR.length < 1)
      return;

    let componentRef = this.componentsReferences.filter(x => x.instance.index == index)[0];
    let component: ChildComponent = <ChildComponent>componentRef.instance;

    let vcrIndex: number = this.VCR.indexOf(componentRef)

    // removing component from container
    this.VCR.remove(vcrIndex);

    this.componentsReferences = this.componentsReferences.filter(x => x.instance.index !== index);
  }

  createComponent() {   
    this.index = this.index + 2;
    this.showchildtable = true;
    this.createComponentClick.emit('Hello'); //emmiting the event.   
  }

  createchildNode(){
    
  }

  addBranch(event) {
    // $(event.target).parents(".sortable").next().children().find(".cloneline").clone().appendTo(".lines")
    // $(event.target).parents(".sortable").next().children().find(".branchtd").clone().appendTo(".branchtr")
  }

  updateStyle() {
    if (this.toggleStyle) {
      return "none";
    } else {
      return "";
    }
  }

  removeMe(index) {
    this.compInteraction.remove(index)
  }

  onCreateComponent = function (value) {   
    this.isLevelCreated = true;
    //this.workFlowShared.sendConditionComponent(value);
  }

  onCreateApprover = function (value) {  
    this.isLevelCreated = true;
    //this.workFlowShared.sendApproverComponent(value);
  }

  onChange(value, levelId) {       
    this.workFlowLevel.LevelId = levelId;
    this.workFlowLevel.Name = value;
    this.workFlowLevel.ApproverId = 0;
    this.workFlowShared.sendSelectedCondition(this.workFlowLevel);
  }

  onremoveComponent = function (value) {

  }
}