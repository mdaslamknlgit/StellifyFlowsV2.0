import { Component, OnInit, AfterViewChecked, AfterViewInit, ViewChild, ElementRef, Renderer2, } from "@angular/core";
import { RequestOptions, Headers, Http } from "@angular/http";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ErrorStateMatcher, MatSnackBar } from "@angular/material";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from "@angular/forms";
import { ValidateFileType, FullScreen, restrictMinus, HideFullScreen } from "../../../shared/shared";
import { ActivatedRoute, Router } from "@angular/router";
//import * as  from "ts-xlsx";
import { CSVRecord } from "../../models/CSVRecord";
import { MarketingList } from "../../models/crm.models";
import { ListserviceService } from "../../services/listservice.service";
import { UserDetails } from "../../../shared/models/shared.model";

import { environment } from '../../../../environments/environment';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';

import * as XLSX from 'xlsx';
import { MyDomainItems } from "../../models/DomainItems";
import { CRMService } from "../../services/crm.service";


@Component({
  selector: "app-entity-import",
  templateUrl: "./entity-import.component.html",
  styleUrls: ["./entity-import.component.css"],
})
export class EntityImportComponent implements OnInit {
  //Auto map csv variables
  @ViewChild("ListName", { read: ElementRef }) MyListNameRef: ElementRef;
  @ViewChild("fileImportInput", { read: ElementRef })
  fileImportInputREf: ElementRef;
  @ViewChild("fileUpload") fileUploadVar: any;
  //@ViewChild('fileImportInput')
  // Decorator wires up blockUI instance
  @BlockUI() blockUI: NgBlockUI;
  uploadedFiles: Array<File> = [];
  SelectedListName:string="";
  fileImportInput: any;
  //listsControl = new FormControl('', [Validators.required]);
  arrayBuffer: any;
  ExcelFile: File;
  ListId:any;
  EntityItemsList:MyDomainItems[];

  listname: string;
  listsControl = new FormControl("");
  SelectedList: number=0;
  SelectedEntityName:string;

  EntityId:number=0;
  EntityName:string;

  lists = [
    { value: "1", viewValue: "Default" },
    { value: "2", viewValue: "Programmers" },
    { value: "3", viewValue: "Test" },
  ];
  invalid: boolean = false;
  IsMapped: boolean = false;
  OnlySelectedList: boolean = false;
  Listss: Array<any> = [];
  MyLists: MarketingList[] = [];
  searchTerm: FormControl = new FormControl();
  file: any;
  FileType: any;
  IsCSV:boolean=false;
  IsExcel:boolean=false;
  DisplayWarning: boolean = false;
  gridData: any;
  EntityFieldsList: any;
  settings: any;
  userDetails: UserDetails = null;
  UserId: any;
  CompanyId: number;
  temp: any;
  cols: any[] = [];
  objectKeys = Object.keys;
  objList: any[] = [];
  FileMapped: boolean = true;
  myobjlist: CSVRecord[] = [];
  itemsEndpoint: string = `${environment.apiEndpoint}`;
  ListNameFormControl = new FormControl("", [Validators.required]);
  ImportCSVForm: FormGroup;

  //matcher = new MyErrorStateMatcher();
  name = 'This is XLSX TO JSON CONVERTER';
  willDownload = false;
  constructor(
    private renderer: Renderer2,
    public httpClient: HttpClient,
    public snackBar: MatSnackBar,
    private CRMService: CRMService,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
    private fb: FormBuilder,
  ) {

    //   this.searchTerm.valueChanges
    //   .debounceTime(400)
    //   .subscribe(data => {
    //      if (data.length > 3) {
    //        this.accountService.SearchContacts(data).subscribe(response => {
    //          console.log(response);
    //          //
    //          this.searchResult = response
    //        })
    //      }
    //   })
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.CompanyId = this.sessionService.getCompanyId();

    this.FileType = "CSV";
  }
  // ngAfterViewInit() {
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
  //   this.getList();
  // }

  InitializeImportCSVForm() {
    this.ImportCSVForm = this.fb.group({
      EntityId: [0, [Validators.required]],
      EntityName: [null, [Validators.required]],
    });
  }
  OnEntityChange(e)
  {
    debugger;
    this.SelectedList = e.currentTarget.value;

    this.EntityId=e.currentTarget.value;

    if (this.SelectedList > 0) 
    {
      let EntityName=this.EntityItemsList.filter(x=>x.Id==this.SelectedList)[0].Name;
      this.SelectedEntityName=EntityName;

      this.ImportCSVForm.controls["EntityName"].setValue(EntityName);

      this.EntityName=EntityName;

    } else {
      this.SelectedEntityName="";
      this.EntityId=0;
      this.EntityName="";
    }
  }

  onListChange(event) {
    //debugger;
    this.SelectedList = event.value;

    if (this.SelectedList > 0) {
      this.OnlySelectedList = true;
    } else {
      this.OnlySelectedList = false;
    }
    //this.listname=this.Listss.filter(x=>x.ListId==this.SelectedList)[0].ListName;
  }
  ngOnInit() {

    // Create instances of MyClass and add items
    const item1 = new MyDomainItems(2, 'Accounts');
    const item2 = new MyDomainItems(5, 'Contact');
    const item3 = new MyDomainItems(8, 'Lead');

    // Create an array to hold the items
    const itemList: MyDomainItems[] = [item1, item2,item3];
    this.EntityItemsList = itemList;
 
        
    this.InitializeImportCSVForm();
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.CompanyId = this.sessionService.getCompanyId();
    this.UserId = this.userDetails.UserID;

    let csvinfo = new CSVRecord();
    csvinfo.Id = 1;
    csvinfo.Name = "First Name";

    this.myobjlist.push({
      Id: 1,
      Name: "First Name",
      Text: "",
    });

    this.myobjlist.push({
      Id: 1,
      Name: "Last Name",
      Text: "",
    });

    this.myobjlist.push({
      Id: 1,
      Name: "First Name",
      Text: "",
    });

    this.EntityFieldsList = [
      {
        name: "select",
        value: "0",
      },
      {
        name: "FirstName",
        value: "1",
      },
      {
        name: "LastName",
        value: "2",
      },
      {
        name: "Title",
        value: "3",
      },
      {
        name: "Department",
        value: "4",
      },
      {
        name: "EmailId",
        value: "5",
      },
      {
        name: "Mobile",
        value: "6",
      },
      {
        name: "CreatedDate",
        value: "7",
      },
      {
        name: "Source",
        value: "8",
      },

      {
        name: "AccountName",
        value: "9",
      },
      {
        name: "Website",
        value: "10",
      },
      {
        name: "AnnualRevenue",
        value: "11",
      },
      {
        name: "Industry",
        value: "12",
      },

      {
        name: "LinkedinURL",
        value: "13",
      },
      {
        name: "MainPhone",
        value: "14",
      },
      {
        name: "Fax",
        value: "15",
      },
      {
        name: "Street",
        value: "16",
      },
      {
        name: "City",
        value: "17",
      },
      {
        name: "State",
        value: "18",
      },
      {
        name: "PostalCode",
        value: "19",
      },
      {
        name: "Country",
        value: "20",
      },
      {
        name: "Response",
        value: "21",
      },
      {
        name: "Status",
        value: "22",
      },
      {
        name: "Rating",
        value: "23",
      },
    ];

    //this.myobjlist=this.fieldsList;
  }
  //**************************************************************************************************************************/
  //Auto mapping CSV code starts here
  //**************************************************************************************************************************/
  MapCSVFields(e) 
  {
    const self = this;
    console.log("mapFields ");
    // if (this.ListNameFormControl.value == "" && this.OnlySelectedList == false) {
    //   this.MyListNameRef.nativeElement.focus();
    //   return false;
    // }
    if (this.file == null) {
      self.snackBar.open("Please Choose File", null, {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: "stellify-snackbar",
      });
      return false;
    }
    this.FileMapped = false;
    //Read CSV
    //debugger;
    if (this.FileType == "CSV") {
      var reader = new FileReader();
      reader.onload = () => {
        console.log(reader.result);
        //debugger;
        this.gridData = this.CSV2JSON(reader.result);

        var obj = { a: this.gridData };
        this.gridData = JSON.parse(obj.a);
        this.temp = this.gridData[0];
      };
      reader.readAsText(this.file);
    }
    //Read Excel
    else if (this.FileType == "EXCEL") {
      //alert("Excel");
    }
    this.IsMapped = true;
  }

  MapExcelFields(e) 
  {
    const self = this;
    console.log("mapFields ");
    // if (this.ListNameFormControl.value == "" && this.OnlySelectedList == false) {
    //   this.MyListNameRef.nativeElement.focus();
    //   return false;
    // }
    if (this.file == null) {
      self.snackBar.open("Please Choose File", null, {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: "stellify-snackbar",
      });
      return false;
    }
    this.FileMapped = false;
    //Read ExcelFile
    //debugger;
    if (this.FileType == "EXCEL") {
      let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    //const file = e.target.files[0];
    const file = this.file;
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);

      //debugger;

      let a =dataString;
      let b= {a: a};
      let c=JSON.parse(b.a);
      let d= c.Sheet1[0];

      this.temp=null;
      this.temp=d;

      console.log(this.temp);
      //debugger;
      // this.gridData=dataString;
      // var obj = { a: this.gridData };
      // this.gridData = JSON.parse(obj.a);
      // this.temp = this.gridData[0];

      this.IsMapped = true;

      document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
      this.setDownload(dataString);



    }

    reader.readAsBinaryString(file);
    }
    //Read Excel
    else if (this.FileType == "EXCEL") {
      //alert("Excel");
    }
    this.IsMapped = true;
  }

  onChange(event, k: any) 
  {
    debugger;
    let myvalue = event.target.value;
    console.log(myvalue);
    console.log(k);
    if (myvalue == 1) {
      this.objList.push({
        id: 1,
        Text: "FirstName=" + k,
      });
    }
    if (myvalue == 2) {
      this.objList.push({
        id: 2,
        Text: "LastName=" + k,
      });
    }

    if (myvalue == 3) {
      this.objList.push({
        id: 3,
        Text: "Title=" + k,
      });
    }

    if (myvalue == 4) {
      this.objList.push({
        id: 4,
        Text: "Department=" + k,
      });
    }
    if (myvalue == 5) {
      this.objList.push({
        id: 5,
        Text: "EmailId=" + k,
      });
    }

    if (myvalue == 6) {
      this.objList.push({
        id: 6,
        Text: "Mobile=" + k,
      });
    }
    if (myvalue == 7) {
      this.objList.push({
        id: 7,
        Text: "CreatedDate=" + k,
      });
    }

    if (myvalue == 8) {
      this.objList.push({
        id: 8,
        Text: "Source=" + k,
      });
    }

    if (myvalue == 9) {
      this.objList.push({
        id: 9,
        Text: "AccountName=" + k,
      });
    }

    if (myvalue == 10) {
      this.objList.push({
        id: 10,
        Text: "Website=" + k,
      });
    }
    if (myvalue == 11) {
      this.objList.push({
        id: 11,
        Text: "AnnualRevenue=" + k,
      });
    }
    if (myvalue == 12) {
      this.objList.push({
        id: 12,
        Text: "Industry=" + k,
      });
    }
 
    if (myvalue == 13) {
      this.objList.push({
        id: 13,
        Text: "LinkedinURL=" + k,
      });
    }
    if (myvalue == 14) {
      this.objList.push({
        id: 14,
        Text: "MainPhone=" + k,
      });
    }

    if (myvalue == 15) {
      this.objList.push({
        id: 15,
        Text: "Fax=" + k,
      });
    }
   
    if (myvalue == 16) {
      this.objList.push({
        id: 16,
        Text: "Street=" + k,
      });
    }

    if (myvalue == 17) {
      this.objList.push({
        id: 17,
        Text: "City=" + k,
      });
    }

    if (myvalue == 18) {
      this.objList.push({
        id: 18,
        Text: "State=" + k,
      });
    }

    if (myvalue == 19) {
      this.objList.push({
        id: 19,
        Text: "PostalCode=" + k,
      });
    }

    if (myvalue == 20) {
      this.objList.push({
        id: 20,
        Text: "Country=" + k,
      });
    }


    if (myvalue == 21) {
      this.objList.push({
        id: 21,
        Text: "Response=" + k,
      });
    }

    if (myvalue == 22) {
      this.objList.push({
        id: 22,
        Text: "Status=" + k,
      });
    }

    if (myvalue == 23) {
      this.objList.push({
        id: 23,
        Text: "Rating=" + k,
      });
    }


    console.log(this.objList);
  }
  
  uploadDocument() {
    debugger;
    const self = this;
    if (this.SelectedList == 0) 
    {
      if(this.ImportCSVForm.controls["EntityName"].value==null)
      {
        //this.ImportCSVForm.controls["EntityName"].markAsTouched();
        //this.renderer.selectRootElement('#EntityName').focus();
        //alert("Please Select Entity ");
        self.snackBar.open("Please Select Entity", null, {
          duration: 3000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });

        return false;
      }
      else{
        this.SelectedListName=this.ImportCSVForm.controls["EntityName"].value;
      }
    }
 

    let file1 = this.file;

    if (this.IsMapped) 
    {
      //Filter by list name
      let ExistedList = this.Listss.filter(
        (x) => x.ListName == this.SelectedListName
      );
      if (ExistedList.length > 0) {
        self.snackBar.open("List already existed", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
        return false;
      }

      //Check file choosen
      if (this.file == undefined) {
        self.snackBar.open("Please Choose The File To Upload", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
        return false;
      }

      console.log(file1);
      if (this.objList.length == 0) {
        self.snackBar.open("Please Map Fields", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
        return false;
      }
      var b = JSON.stringify(this.objList);


      //this.blockUI.start("Accessing The CSV "); // Start blocking
      //debugger;

      let formData: FormData = new FormData();
      formData.append("uploadFile", file1, file1.name);
      formData.append("csdata", b);
      formData.append("EntityId", this.EntityId.toString());
      formData.append("EntityName", this.EntityName);
      formData.append("FileType", this.FileType);

      let fileUploadRoute = environment.apiEndpoint + "CSVAutomapUpload" + `/${0}/${this.UserId}`;
      //debugger;
      this.CRMService.UploadEntity(formData, this.uploadedFiles,this.EntityId,this.EntityName, this.UserId, this.CompanyId)
        .subscribe((data:any) => {
          debugger;
          //ErrorMessage

          this.blockUI.stop();
          if (data.Status == "SUCCESS") {
            this.ListId=data.Data;
            console.log("success"),
              self.snackBar.open("Uploaded Successfully", null, {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });
            this.blockUI.start("Uploaded Successfully..."); // Start blocking
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
              //crm/crmconnectionsdetails/VIEW/2014
             
              this.router.navigate([`/crm/contactslist/888`]);
              //this.router.navigate(["/email/view"]);
            }, 300);
            //Navigate to email/view  email/view
          } else data.Status == "ERROR";
          {
            self.snackBar.open(data.Message, null, {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });
          }
        },
          (error) => {
            this.blockUI.stop();
            console.log(error);
            self.snackBar.open("Error Occured", null, {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });
          }
        );

     
    } 
    else 
    {
      self.snackBar.open("Please map the field 1st before upload", null, {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: "stellify-snackbar",
      });
    }
  }

  // this.http.post(`${this.apiEndPoint}`, formData, options)
  // .map(res => res.json())
  // .catch(error => Observable.throw(error))
  // .subscribe(
  //     data => console.log('success'),
  //     error => console.log(error)
  // )

  myUploader(event: any) {
    console.log(event);
  }

  showFile(event: any) {
    console.log(event);
  }
  //***********************************************************************************************************************/
  //Excel File read
  //***********************************************************************************************************************/
  incomingfile(event) {
    this.ExcelFile = event.target.files[0];
  }

  // Upload() {
  //   let fileReader = new FileReader();
  //   fileReader.onload = (e) => {
  //     this.arrayBuffer = fileReader.result;
  //     var data = new Uint8Array(this.arrayBuffer);
  //     var arr = new Array();
  //     for (var i = 0; i != data.length; ++i)
  //       arr[i] = String.fromCharCode(data[i]);
  //     var bstr = arr.join("");
  //     var workbook = XLSX.read(bstr, { type: "binary" });
  //     var first_sheet_name = workbook.SheetNames[0];
  //     var worksheet = workbook.Sheets[first_sheet_name];
  //     console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
  //   };
  //   fileReader.readAsArrayBuffer(this.ExcelFile);
  // }

  //***********************************************************************************************************************/
  fileReset() {
    this.fileUploadVar.nativeElement.value = "";
    this.file = null;
  }
  onFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
      this.setDownload(dataString);
    }
    reader.readAsBinaryString(file);
  }
  setDownload(data) {
    this.willDownload = true;
    setTimeout(() => {
      const el = document.querySelector("#download");
      el.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
      el.setAttribute("download", 'xlsxtojson.json');
    }, 1000)
  }

  fileChanged(e: any) {
    const self = this;
    const elem = e.target;

    this.objList = [];
    this.file = e.target.files[0];

    let files: FileList = e.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateFileType(fileItem.name)) {
        this.uploadedFiles.push(fileItem);
      }
      else {
        e.preventDefault();
        break;
      }
    }


    //Check File Extension
    if (this.file.type == "application/vnd.ms-excel") {
      this.FileType = "CSV";
    } 
    else if (this.file.type =="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") 
    {
      this.FileType = "EXCEL";
      //this.fileReset();
    }

    //debugger;
    if(this.FileType=="EXCEL")
    {
      this.IsExcel=true;
      this.IsCSV=false;
    }
    else
    {
      this.IsCSV=true;
      this.IsExcel=false;

    }

    //**********************************************************************************************************/
    //Display Warning If File Attached is Not CSV
    //**********************************************************************************************************/
    // if (this.FileType != "CSV") 
    // {

    //  this.DisplayWarning = true;
    //   self.snackBar.open("Only CSV File Allowed", null, {
    //     duration: 3000,
    //     verticalPosition: "top",
    //     horizontalPosition: "right",
    //     panelClass: "stellify-snackbar",
    //   });

    //   setTimeout(() => {
    //     this.DisplayWarning = false;
    //   }, 500);
    //   return false;
    // }
    //**********************************************************************************************************/

  }
//**********************************************************************************************************/
//CSV 2 JSON Conversion
//**********************************************************************************************************/
  CSV2JSON(csv: any) {
    var array = this.CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length - 1; i++) {
      objArray[i - 1] = {};
      for (var k = 0; k < array[0].length && k < array[i].length; k++) {
        var key = array[0][k];
        objArray[i - 1][key] = array[i][k];
      }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return str;
  }
//**********************************************************************************************************/
//CSV to Array
//**********************************************************************************************************/
  CSVToArray(strData: any) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    let strDelimiter = ",";
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      // Delimiters.
      "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
      "gi"
    );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData: Array<any> = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[1];
      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);
      }
      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
      } else {
        // We found a non-quoted value.
        var strMatchedValue = arrMatches[3];
      }
      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return arrData;
  }
//**********************************************************************************************************/
//**************************************************************************************************************************/
//Auto mappint CSV code starts here
//**************************************************************************************************************************/
onSubmit(ImportCSVForm: any,  e) {
  console.log(ImportCSVForm);
}


}


// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     //
//     const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
//     const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

//     return (invalidCtrl || invalidParent);
//   }
// }
