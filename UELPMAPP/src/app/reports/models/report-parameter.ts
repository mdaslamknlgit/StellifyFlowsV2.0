export class ReportParameter {
    ReportType: REPORTTYPE;
    Entities: any;
    Title: string;
    FilterOptions: ReportParamData;
    WorkflowStatusId: number;
    TypeId: number;
    UserId: number;
    CreatedDateFrom: Date;
    CreatedDateTo: Date;
}
export class ReportColumn {
    field: string;
    header: string;
    dataType: DATATYPE;
    width: number;
    alignment: ALIGNMENT;
    hasFooter?: boolean;
}
export class ReportParamConfig {
    Entity: boolean;
    Department: boolean;
    Status: boolean;
    SupplierType: boolean;
    Requester: boolean;
    constructor(entity: boolean, dept: boolean, status: boolean, supplierTypes: boolean, requester: boolean) {
        this.Entity = entity;
        this.Department = dept;
        this.Status = status;
        this.SupplierType = supplierTypes;
        this.Requester = requester;
    }
}
export class ReportParam {
    Id: number;
    Name: string;
}
export class ReportParamData {
    Entities: ReportParam[];
    Departments: ReportParam[];
    Statuses: ReportParam[];
    Requesters: ReportParam[];
}
export enum ALIGNMENT {
    Left,
    Right,
    Center
}
export enum DATATYPE {
    string,
    currency,
    date,
    number
}
export enum REPORTTYPE {
    SUPPLIER,
    PO,
    POITEMS,
    POCMASTER,
    POC,
    APINVOICE,
    APCREDITNOTE,
    COA,
    POPMASTER,
    POPINVOICE,
    ADMINWORKFLOW,
    CASHFLOW
}