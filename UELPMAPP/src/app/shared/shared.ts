import { IMG_FILE_TYPES, NOT_ALLOWED_FILE_TYPES } from "./constants/generic";

import { DOCUMENT } from '@angular/common';
import { InjectionToken, ElementRef } from "@angular/core";
import { PurchaseOrderType, WorkFlowProcess } from "./models/shared.model";
import { domainToUnicode } from "url";
import { saveAs } from 'file-saver';
import { WorkBook, utils, write, WorkSheet, ColInfo } from "xlsx";
import { FormArray, FormControl, FormGroup } from "@angular/forms";


//common method to show the component in full screen....
export function FullScreen(compentDetailRef: any) {
    if (compentDetailRef.requestFullscreen) {
        compentDetailRef.requestFullscreen();
    }
    else if (compentDetailRef.msRequestFullscreen) //ie
    {
        compentDetailRef.msRequestFullscreen();
    }
    else if (compentDetailRef.mozRequestFullScreen) //mozilla firefox
    {
        compentDetailRef.mozRequestFullScreen();
    }
    else if (compentDetailRef.webkitRequestFullscreen)//chrome
    {
        compentDetailRef.webkitRequestFullscreen();
    }
}
export function HideFullScreen(compentDetailRef: any) {
    // console.log("asdfasdfadsfasd");
    let docObj: any = document;
    if (docObj.ful) {
        docObj.exitFullscreen();
    }
    else if (docObj.webkitExitFullscreen) //chrome
    {
        docObj.webkitExitFullscreen();
    }
    else if (docObj.mozCancelFullScreen) //mozilla firefox
    {
        docObj.mozCancelFullScreen();
    }
    else if (docObj.msExitFullscreen)//ie
    {
        docObj.msExitFullscreen();
    }
}
export function ValidateFileType(fileName: string) {
    let fileExtensions = fileName.split(".");
    let fileExt = fileExtensions[fileExtensions.length - 1];
    //checking if the file extension is present in the not allowed file type
    if (NOT_ALLOWED_FILE_TYPES.findIndex(ext => ext == fileExt.toLocaleLowerCase()) == -1) {
        return true;
    }
    return false;
}
export function ValidateImage(fileName: string) {
    debugger
    let fileExtensions = fileName.split(".");
    let fileExt = fileExtensions[fileExtensions.length - 1];
    if (IMG_FILE_TYPES.findIndex(ext => ext == fileExt.toLocaleLowerCase()) == -1) {
        return false;
    }
    return true;
}
export function PrintScreen(printContents: string, windowObj?: any, url?: string, title?: string) {
    console.log(windowObj);
    let popupWin;
    popupWin = windowObj.open("", '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
          //........Customized style.......
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
}
export function restrictMinus(e: any) {
    let inputKeyCode = e.keyCode ? e.keyCode : e.which;
    if (inputKeyCode != null) {
        if (inputKeyCode == 189 || inputKeyCode == 109) e.preventDefault();
    }
}

export function getProcessId(poTypeId: number, isPoRequest: boolean = false) {
    if (poTypeId == null || poTypeId == 0) {
        return 0;
    }
    if (poTypeId == PurchaseOrderType.InventoryPo) {
        if (isPoRequest == true) {
            return WorkFlowProcess.InventoryPurchaseRequest;
        }
        else {
            return WorkFlowProcess.InventoryPO;
        }
    }
    else if (poTypeId == PurchaseOrderType.FixedAssetPo) {
        if (isPoRequest == true) {
            return WorkFlowProcess.AssetPurchaseRequest;
        }
        else {
            return WorkFlowProcess.FixedAssetPO;
        }
    }
    else if (poTypeId == PurchaseOrderType.ContractPoFixed) {
        return WorkFlowProcess.ContractPOFixed;
    }
    else if (poTypeId == PurchaseOrderType.ContractPoVariable) {
        return WorkFlowProcess.ContractPOVariable;
    }
    else if (poTypeId == PurchaseOrderType.ExpensePo) {
        if (isPoRequest == true) {
            return WorkFlowProcess.ExpensePurchaseRequest;
        }
        else {
            return WorkFlowProcess.ExpensePO;
        }
    }
    else if (poTypeId == PurchaseOrderType.ProjectPo) {
        return WorkFlowProcess.ProjectPo;
    }
    else {
        return 0;
    }
}

export function ExportToExcel(excelData: Array<any>, fileName: string, worksheetName: string, columns: Array<{ header: string, field: string }>, isMappingRequired: boolean) {

    const wb: WorkBook = { SheetNames: [], Sheets: {} };

    let workSheetData: Array<any>;

    if (isMappingRequired == true) {
        workSheetData = getWorkSheetData(excelData, columns);
    }
    else {
        workSheetData = excelData;
    }
    const ws: WorkSheet = utils.json_to_sheet(workSheetData, {
        header: columns.map(data => data.header)
    });

    wb.SheetNames.push(worksheetName);
    wb.Sheets[worksheetName] = ws;
    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `${fileName}.xlsx`);
}

function getWorkSheetData(excelData: Array<any>, columns: Array<{ header: string, field: string }>) {
    return excelData.map((data: Object, index: number) => {
        columns.forEach((col) => {

            if (col.field == "Sno") {
                data["S.no."] = index + 1;
            }
            else if (!data.hasOwnProperty(col.header)) {

                data[col.header] = data[col.field];
                delete data[col.field];
            }
        });
        return data;
    });
}

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
    };
    return buf;
}

export function markAllAsTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach((control: any) => {
        control.markAsTouched();
        if (control.controls) {
            <FormArray>control.controls.forEach((group: FormGroup) => {
                (<any>Object).values(group.controls).forEach((control: FormControl) => {
                    control.markAsTouched();
                })
            });
        }
    });
}

