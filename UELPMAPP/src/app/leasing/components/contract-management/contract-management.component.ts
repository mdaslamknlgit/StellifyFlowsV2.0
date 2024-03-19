import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContractDetails } from "../../models/contract-management.model";
import { FullScreen } from "../../../shared/shared";
import { Messages } from '../../../shared/models/shared.model';

@Component({
  selector: 'app-contract-management',
  templateUrl: './contract-management.component.html',
  styleUrls: ['./contract-management.component.css']
})
export class ContractManagementComponent implements OnInit {

  contractManagementForm: FormGroup;
  contractsList:Array<any>;
  selectedContractDetails:ContractDetails;
  hidetext?: boolean=null;
  hideinput?: boolean=null;
  unitGridColumns:Array<{field:string,header:string}>= [];
  billingGridColumns:Array<{field:string,header:string}>= [];
  leftsection:boolean=false;
  rightsection:boolean=false;
  slideactive:boolean=false;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  @ViewChild('rightPanel') rightPanelRef;
  
  constructor(private formBuilderObj:FormBuilder) {

    this.contractManagementForm = this.formBuilderObj.group({
        ContractCode:[""],
        ContractName:["",Validators.required],
        StartDate:[new Date(),Validators.required],
        EndDate:[new Date(),Validators.required],
        ContractTypeId:[0,Validators.required],
        PaymentTermId:[0,Validators.required],
        CustomerName:["",Validators.required],
        BillingAddress:["",Validators.required],
        ShippingAddress:["",Validators.required],
        SigningDate:[new Date(),Validators.required],
        ContractAmount:[0,Validators.required],
        UnitDetails:this.formBuilderObj.array([]),
        BillingDetails:this.formBuilderObj.array([])
        
    });
    this.selectedContractDetails = {
        ContractCode:"Maudlin2007",
        ContractName:"Maudlin Stainless",
        StartDate:new Date(),
        EndDate:new Date(),
        ContractType:"Sole Source",
        PaymentTermId:1,
        PaymentTerms:"Net 30",
        CustomerName:"Nancy",
        BillingAddress:"Building No.24,25th Road,26th Street",
        ShippingAddress:"Building No.24,25th Road,26th Street",
        SigningDate:new Date(),
        ContractAmount:2000,
        UnitDetails:[{
          UnitNumber:"#15214545455",
          OwnerName:"Owner1",
          OwnerPhNo:"+60-5545445554",
          TenantName:"Tenant1",
          TenantPhNo:"+60-45456456490"
        },{
          UnitNumber:"#15214545467",
          OwnerName:"Owner2",
          OwnerPhNo:"+63-5545445554",
          TenantName:"Tenant2",
          TenantPhNo:"+60-67456456466"
        },
        {
          UnitNumber:"#15214545490",
          OwnerName:"Owner3",
          OwnerPhNo:"+86-5545445554",
          TenantName:"Tenant3",
          TenantPhNo:"+60-90456456466"
        }],
        BillingDetails:[{
          Description:"Plumbing Work",
          Amount:3000
        },{
          Description:"Machinery Repairs",
          Amount:4000,
        },
        {
          Description:"Description",
          Amount:5000,
        }]
    };
    this.unitGridColumns = [
      { field: 'Sno', header: 'S.no.' },
      { field: 'UnitNumber', header: 'Unit Number' },
      { field: 'OwnerName', header: 'Owner Name' },
      { field: 'OwnerPhNo', header: 'Owner Phone Number' },
      { field: 'TenantName', header: 'Tenant Name' },
      { field: 'TenantPhNo', header: 'Tenant Phone Number' }
    ];  
    this.billingGridColumns = [
      { field: 'Sno', header: 'S.no.' },
      { field: 'BillDescription', header: 'Bill Description' },
      { field: 'Amount', header: 'Amount' },
    ];  
  }
  ngOnInit() {

    this.hidetext = true;
    this.hideinput = false;
  }
  /**
   * to hide the category details and show in add mode..
   */
  addRecord()
  {
      this.hidetext=false;
      this.hideinput=true;
      this.selectedContractDetails = new ContractDetails();
      //resetting the contract managmentform..
      this.contractManagementForm.reset();
      this.contractManagementForm.setErrors(null);
  }
  cancelRecord()
  {
    this.hidetext=true;
    this.hideinput=false;
  }
  showFullScreen()
  {
      FullScreen(this.rightPanelRef.nativeElement);
  }
  splite(){ 
    this.leftsection= !this.leftsection;
    this.rightsection= !this.rightsection;
  }
}
