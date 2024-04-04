import { ChildComponent } from '../components/child/child.component';
import { ApprovalComponent } from '../components/approval/approval.component';
import { MenuControlsComponent } from '../components/menu-controls/menu-controls.component';
import { ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef, Component } from "@angular/core";


export class WorkFlowChildComponent {
    Component: MenuControlsComponent
    CFR: ComponentFactoryResolver
    VCR: ViewContainerRef
}

export class WorkFlowApproverComponent {
    Component: MenuControlsComponent
    CFR: ComponentFactoryResolver
    VCR: ViewContainerRef
}

export class WorkFlowRemoveComponent {
    Index: number
    VCR: ViewContainerRef
}

export class WorkFlowParameter {
    ProcessId: number;
    FieldName: string;
    Value: number;
    DocumentId: number;
    CreatedBy?: number;
    DocumentCode?: string;
    CompanyId: number;
    LocationId: number;
    WorkFlowStatusId: number;
    PurchaseOrderStatusId?: number;
    CurrentWorkFlowStatusId?: number;
    RemarksQuotation?: string;
    UserId?: number;
}

export class SupplierWorkFlowParameter {
    ProcessId: number;
    FieldName: string;
    Value: number;
    DocumentId: number;
    UserID: number;
    RoleID: number;
    ParentDocumentId: number;
    CreatedBy?: number;
    DocumentCode?: string;
    CompanyId: number;
    LocationId: number;
    CoSupplierCode: string;
    WorkFlowStatusId: number;
    IsCreditLimitChanged: boolean;
}