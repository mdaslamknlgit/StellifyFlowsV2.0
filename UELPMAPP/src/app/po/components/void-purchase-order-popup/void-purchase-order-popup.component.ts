import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SharedService } from "../../../shared/services/shared.service";
import { Messages, MessageTypes, UserDetails, PurchaseOrderType, WorkFlowStatus } from "../../../shared/models/shared.model";
import { SessionStorageService } from "../../../shared/services/sessionstorage.service";
import { getProcessId } from "../../../shared/shared";
import { ContractMasterService } from "../../services/contract-master.service";
import { ContractPurchaseOrder, ContractPoDisplayResult } from "../../models/contract-purchase-order.model";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ContractPurchaseOrderService } from "../../services/contract-purchase-order.service";
import { debug } from "util";

@Component({
  selector: "void-purchase-order-popup",
  templateUrl: "./void-purchase-order-popup.component.html",
  providers: [ContractMasterService]
})
export class VoidPurchaseOrderPopUpComponent implements OnInit, OnChanges {
  @Input() showVoidPopUp: boolean = false;
  @Input() purchaseOrderId: number = 0;
  @Input() purchaseOrderTypeId: number = 0;
  @Output() onStatusUpdate: EventEmitter<number> = new EventEmitter<number>();
  @Output() hideVoidPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() reject: EventEmitter<string> = new EventEmitter<string>();
  @Output() voidApproval: EventEmitter<string> = new EventEmitter<string>();
  @Input() isVoid: boolean = true;
  @Input() purchaseOrderCode: string = "";
  @Input() selectedPODetails: ContractPurchaseOrder;
  purchaseOrderVoidForm: FormGroup;
  voidPopUpTabId: number = 1;
  purchaseOrderTypes: any;
  pocList: Array<ContractPurchaseOrder> = [];
  TotalRecords: number;
  constructor(private formBuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private sessionService: SessionStorageService,
    private contractMasterServiceObj: ContractMasterService,

    private reqDateFormatPipe: RequestDateFormatPipe) {
    this.purchaseOrderTypes = PurchaseOrderType;
    this.createPoVoidForm();

  }
  ngOnInit() {


  }
  ngOnChanges(simpleChange: SimpleChanges) {
    console.log(this.purchaseOrderTypeId, PurchaseOrderType.ContractPoFixed, PurchaseOrderType.ContractPoVariable, this.selectedPODetails.IsMasterPO, this.isVoid);
  }
  createPoVoidForm() {

    if (this.purchaseOrderVoidForm == undefined) {
      this.purchaseOrderVoidForm = this.formBuilderObj.group({
        Reasons: ["", [Validators.required]],
        TerminationDate: [new Date()]
      });
    }

    if (this.purchaseOrderTypeId == this.purchaseOrderTypes.ContractPoFixed || this.purchaseOrderTypeId == this.purchaseOrderTypes.ContractPoVariable) {
      this.purchaseOrderVoidForm.controls["TerminationDate"].setValidators(Validators.required);
      this.getPocList();
    }
    else {
      this.purchaseOrderVoidForm.controls["TerminationDate"].setValidators(null);
    }
  }
  voidRecord() {
    let reasonData = this.purchaseOrderVoidForm.value;
    if (this.purchaseOrderVoidForm.status != "INVALID") {
      if (this.purchaseOrderVoidForm.get('Reasons').value.trim() == "" || this.purchaseOrderVoidForm.get('Reasons').value.trim() == null) {
        this.purchaseOrderVoidForm.get('Reasons').setErrors({
          'required': true
        });
        return;
      }
      let userDetails = <UserDetails>this.sessionService.getUser();
      let poObj;
      if ((this.purchaseOrderTypeId == PurchaseOrderType.ContractPoFixed || this.purchaseOrderTypeId == PurchaseOrderType.ContractPoVariable) && this.selectedPODetails.IsMasterPO == true) {
        poObj = {
          TotalAmount: this.selectedPODetails.TotalAmount,
          TotalContractSum: this.selectedPODetails.TotalContractSum,
          PurchaseOrderId: this.selectedPODetails.CPOID,
          CreatedBy: userDetails.UserID,
          CPONumber: this.selectedPODetails.CPONumber,
          WorkFlowStatusId: WorkFlowStatus.PendingForTerminationApproval,
          POTypeId: this.selectedPODetails.POTypeId,
          CompanyId: this.selectedPODetails.CompanyId,
          LocationID: this.selectedPODetails.LocationID,
          TerminationDate: reasonData.TerminationDate,
          Reasons: reasonData.Reasons,
          IsMasterCPO: true
        };
      }
      else {
        poObj = {
          PurchaseOrderId: this.purchaseOrderId,
          ProcessId: getProcessId(this.purchaseOrderTypeId),
          UserId: userDetails.UserID,
          //CPONumber:this.selectedPODetails.CPONumber,
          Reasons: reasonData.Reasons,
          PoTypeId: this.purchaseOrderTypeId,
          IsMasterCPO: false,
          PurchaseOrderCode: this.purchaseOrderCode
        };
      }
      this.sharedServiceObj.voidPurchaseOrder(poObj).subscribe((count: number) => {
        if (count == 0) {
          this.onStatusUpdate.emit(this.purchaseOrderId);
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: poObj.IsMasterCPO ? Messages.MasterCPOVoidRecord : Messages.VoidRecord,
            MessageType: MessageTypes.Success
          });
        }
        else {
          this.voidPopUpTabId = 3;
        }
      }, (data: HttpErrorResponse) => {

      });
    }
    else {
      this.purchaseOrderVoidForm.controls["Reasons"].markAsTouched();
    }
  }
  rejectRecord() {
    let reasonData = this.purchaseOrderVoidForm.value;
    if (this.purchaseOrderVoidForm.status != "INVALID") {
      this.reject.emit(reasonData.Reasons);
      this.onStatusUpdate.emit(this.purchaseOrderId);
    }
  }
  onPopUpShow() {
    if (this.isVoid == false) {
      this.voidPopUpTabId = 2;
    }
    else {
      this.voidPopUpTabId = 1;
    }

    this.createPoVoidForm();

    //console.log(this.purchaseOrderTypeId,PurchaseOrderType.ContractPoFixed,PurchaseOrderType.ContractPoVariable,this.selectedPODetails.IsMasterPO,this.isVoid);
  }
  onPopUpHide() {
    this.hideVoidPopUp.emit(true);
  }
  getPocList() {
    let pocObj = {
      CPOID: this.purchaseOrderId,
      TerminationDate: this.reqDateFormatPipe.transform(this.purchaseOrderVoidForm.get('TerminationDate').value)
    };
    this.contractMasterServiceObj.getPocList(pocObj)
      // .subscribe((data:Array<ContractPurchaseOrder>)=>{
      .subscribe((data: ContractPoDisplayResult) => {
        this.pocList = data.PurchaseOrders;
        this.TotalRecords = data.TotalRecords;
        this.pocList = this.pocList.filter(x => x.WorkFlowStatusId != WorkFlowStatus.Invoiced);
      });

  }
}
