import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators,FormBuilder } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { SharedService } from "../../../shared/services/shared.service";
import { Messages } from '../../../shared/models/shared.model';

@Component({
  selector: 'app-budget-profile',
  templateUrl: './budget-profile.component.html',
  styleUrls: ['./budget-profile.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class BudgetProfileComponent implements OnInit {
  hidetext: boolean=true;
  hideinput: boolean=false;
  savedsucess: boolean=false;
  leftsection:boolean=false;
  rightsection:boolean=false;
  scrollbarOptions:any;
  purchaseOrderForm: FormGroup;
  //this array will hold the list of columns to display in the grid..
  gridColumns:Array<{field:string,header:string}>= [];
  budgetedItems:Array<{ Type:string, Item:string,LandAndBuilding:number,PlantAndMach:number,MotorVehicles:number,
                        ComputerAndPeripherals:number,Others:number,Total:number }>;
  nonBudgetedItems:Array<{ Item:string,LandAndBuilding:number,PlantAndMach:number,MotorVehicles:number,
                          ComputerAndPeripherals:number,Others:number,Total:number }>;
  totalBudget:Array<{ Item:string,LandAndBuilding:number,PlantAndMach:number,MotorVehicles:number,
  ComputerAndPeripherals:number,Others:number,Total:number }>;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;

  constructor(private formBuilderObj:FormBuilder,
              private sharedServiceObj:SharedService) { 
    this.gridColumns = [
        { field: 'Item', header: '' },
        { field: 'LandAndBuilding', header: 'Land & Building' },
        { field: 'PlantAndMach', header: 'Plant & Machinery' },
        { field: 'MotorVehicles', header: 'Motor Vehicles' },
        { field: 'ComputerAndPeripherals', header: 'Computer & Peripherals' },
        { field: 'Others', header: 'Others' },
        { field: 'Total', header: 'Total' }
    ];
    
    this.purchaseOrderForm = this.formBuilderObj.group({
      'Year': [new Date(),{ validators: [Validators.required]}],
      'Company':["", [Validators.required]]
    });

    this.budgetedItems =[{
        Item:"Approved Capex Budget For the Year",
        LandAndBuilding:0,PlantAndMach:900000,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:900000,Type:'Header'
      },
      {
        Item:"Approval for amount utilized to-date",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0,Type:'Header'
      },
      {
        Item:"IT Expenses",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0,Type:'SubHeader'
      },
      {
        Item:"HBU Only",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0,Type:'SubHeader'
      },
      {
        Item:"HBU,DH & CFO",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0,Type:'SubHeader'
      },
      {
        Item:"HBU,DH,CFO & CEO",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0,Type:'SubHeader'
      },
      {
        Item:"HBU,DH,CFO,CEO & Chariman",
        LandAndBuilding:0,PlantAndMach:850000,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:850000,Type:'SubHeader'
      },
      {
        Item:"Balance of Capex Budget",
        LandAndBuilding:0,PlantAndMach:50000,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:50000,Type:'Header'
      },
    ];

    this.nonBudgetedItems =[{
        Item:"Capex not budgeted for incurred to-date",
        LandAndBuilding:0,PlantAndMach:0,MotorVehicles:0,
        ComputerAndPeripherals:0,Others:0,Total:0
      }     
    ];

    this.totalBudget =[{
      Item:"Total Capex incurred to-date",
      LandAndBuilding:0,PlantAndMach:850000,MotorVehicles:0,
      ComputerAndPeripherals:0,Others:0,Total:850000
    }     
    ];
  }
  companyInputFormater = (x: any) => x.CompanyName;

  companySearch = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(term =>
              this.sharedServiceObj.getCompaniesbykey(term).pipe(
                  catchError(() => {
                      return of([]);
                  }))
          )
    );

  ngOnInit() {
  
  }
  editdata(){
  this.hidetext=false;
  this.hideinput=true;
  this.savedsucess=false;
  }
  savedata(){
  this.savedsucess=true;
  this.hidetext=true;
  this.hideinput=false;
  }
  splite(){ 
  this.leftsection= !this.leftsection;
  this.rightsection= !this.rightsection;
  }
  canledata(){ 
  this.hidetext=true;
  this.hideinput=false;
  }
  //this method will be called on date picker focus event..
  onDatePickerFocus(element:NgbInputDatepicker)
 {
    if(!element.isOpen())
    {
        element.open();
    }
  }
  saveRecord()
  {

    
  }

}
