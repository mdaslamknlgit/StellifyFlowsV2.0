import { Component, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ChildComponent } from '../child/child.component'
import { ApprovalComponent } from '../approval/approval.component';
import { WorkFlowSharedService } from '../../services/workflow-shared.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkFlowChildComponent, WorkFlowApproverComponent, WorkFlowRemoveComponent } from '../../models/workflowcomponent';
@Component({
  selector: 'app-menu-controls',
  templateUrl: './menu-controls.component.html',
  styleUrls: ['./menu-controls.component.css']
})
export class MenuControlsComponent {

  @ViewChild('viewContainerRef', { read: ViewContainerRef }) VCR: ViewContainerRef;
  public selfRef: MenuControlsComponent;

  //interface for Parent-Child interaction
  public compInteraction: myinterface;
  index: number = 0;
  sub: Subscription;
  componentsReferences = [];
  @Output()
  createComponentClick: EventEmitter<string> = new EventEmitter<string>(); //creating an output event

  @Output()
  createApproverClick: EventEmitter<string> = new EventEmitter<string>(); //creating an output event

  @Output()
  removeComponentClick: EventEmitter<number> = new EventEmitter<number>(); //creating an output event
  workFlowChildComponent: WorkFlowChildComponent
  workFlowApproverComponent: WorkFlowApproverComponent
  workFlowRemoveComponent: WorkFlowRemoveComponent
  leftParentId: number = 0;
  rightParentId: number = 0;
  constructor(private CFR: ComponentFactoryResolver, public route: ActivatedRoute, public router: Router,
    private workFlowShared: WorkFlowSharedService) {

    this.workFlowChildComponent = new WorkFlowChildComponent();
    this.workFlowApproverComponent = new WorkFlowApproverComponent();
    this.workFlowRemoveComponent = new WorkFlowRemoveComponent();
  }

  openOptions(event) {   
    $(event.target).parent().prev().toggleClass("InvertImage");
  }

  createComponent() {     
    // let componentFactory = this.CFR.resolveComponentFactory(ChildComponent);
    // let componentRef: ComponentRef<ChildComponent> = this.VCR.createComponent(componentFactory);
    // let currentComponent = componentRef.instance;

    // currentComponent.selfRef = currentComponent;
    // let index = this.componentsReferences.length;

    // this.index = this.index + (Number(index) + 1);
    // currentComponent.index = this.index;
    // currentComponent.isCondition = true;
    // currentComponent.leftWorkFlowLevelId = this.index;
    // currentComponent.rightWorkFlowLevelId = this.index + 1;
    // if ((Number(index) === 0)) {
    //   currentComponent.parentId = 0;
    // }
    // else {
    //   currentComponent.parentId = this.index;
    // }
    // // prividing parent Component reference to get access to parent class methods
    //currentComponent.compInteraction = this;

    // // add reference for newly created component
    // this.componentsReferences.push(currentComponent);

    this.createComponentClick.emit("child"); //emmiting the event.  
    this.workFlowChildComponent.Component = this;
    this.workFlowChildComponent.VCR = this.VCR;
    this.workFlowChildComponent.CFR = this.CFR;
    this.workFlowShared.sendConditionComponent(this.workFlowChildComponent);

  }

  createApproval() {
    // let componentFactory2 = this.CFR.resolveComponentFactory(ApprovalComponent);
    // let componentRef2: ComponentRef<ApprovalComponent> = this.VCR.createComponent(componentFactory2);
    // let currentComponent2 = componentRef2.instance;

    // currentComponent2.selfRef = currentComponent2;
    // // this.index = this.index + 2;
    // let index = this.componentsReferences.length;
    // this.index = this.index + (Number(index) + 1);
    // currentComponent2.index = this.index;
    // currentComponent2.workFlowLevelId = this.index;
    // if ((Number(index) === 0)) {
    //   currentComponent2.parentId = 0;
    // }
    // else {
    //   currentComponent2.parentId = this.index;
    // }

    // currentComponent2.IsCondition = false;
    // // prividing parent Component reference to get access to parent class methods
    // currentComponent2.compInteraction = this;
    // currentComponent2.IsCondition = true;
    // // add reference for newly created component
    // this.componentsReferences.push(currentComponent2);

    this.createApproverClick.emit("Approver"); //emmiting the event.     
    this.workFlowApproverComponent.Component = this;
    this.workFlowApproverComponent.VCR = this.VCR;
    this.workFlowApproverComponent.CFR = this.CFR;

    this.workFlowShared.sendApproverComponent(this.workFlowApproverComponent);
  }

  remove(index: number) {
    // if (this.VCR.length < 1)
    //   return;

    // let componentRef = this.componentsReferences.filter(x => x.index == index)[0];
    // let component: ChildComponent = <ChildComponent>componentRef.instance;

    // let vcrIndex: number = this.VCR.indexOf(componentRef)

    // // removing component from container
    // //this.VCR.remove(vcrIndex);
    // this.VCR.remove(index);
    // this.componentsReferences = this.componentsReferences.filter(x => x.index !== index);   

    this.workFlowRemoveComponent.Index = index;
    this.workFlowRemoveComponent.VCR = this.VCR;

    this.workFlowShared.sendRemoveComponent(this.workFlowRemoveComponent);

    this.removeComponentClick.emit(index); //emmiting the event.
  }
}

export interface myinterface {
  remove(index: number);
}
