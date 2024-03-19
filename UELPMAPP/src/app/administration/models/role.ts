export class Roles {
    RoleID: number;
    RoleName: string;
    Description: string;
    CompanyName: string;
    SNo: number;
    IsActive: boolean;
    TotalRecords: number;
    CreatedBy: number;
    UpdatedBy: number;
    RoleAccessLevels: RoleAccessLevel[];
    //PageTreeNodes: PageTreeNode[] = [];
    RolePageModule: RolePageModule;
}

export class RoleAccessLevel {
    AccessLevelId: number;
    RoleID: number;
    PageId: number;
    PageName: string;
    ParentId?: number;
    IsPageModule: boolean;
    CompanyId?: number;
    IsAdd?: boolean;
    IsView?: boolean;
    IsEdit?: boolean;
    IsDelete?: boolean;
    IsEmail?: boolean;
    IsPrint?: boolean;
    IsVerify?: boolean;
    IsApprove?: boolean;
    IsVoid?: boolean;
    IsImport?: boolean;
    IsExport?: boolean;
    IsGeneratePOC?: boolean;
    IsGenerateReport?: boolean;
    IsDeleteEnable: boolean;
    IsEmailEnable: boolean;
    IsPrintEnable: boolean;
    IsVerifyEnable: boolean;
    IsApproveEnable: boolean;
    IsVoidEnable: boolean;
    IsAddEnable: boolean;
    IsEditEnable: boolean;
    IsImportEnable: boolean;
    IsExportEnable: boolean;
    IsGeneratePOCEnable: boolean;
    IsGenerateReportEnable: boolean;
    //IsModified: boolean;
}

export class PageAccessLevel {
    AccessLevelId: number;
    RoleID: number;
    PageId: number;
    PageName: string;
    PageCompareName: string;
    IsAdd?: boolean;
    IsView?: boolean;
    IsEdit?: boolean;
    IsDelete?: boolean;
    IsEmail?: boolean;
    IsPrint?: boolean;
    IsVerify?: boolean;
    IsApprove?: boolean;
    IsVoid?: boolean;
    IsImport?: boolean;
    IsExport?: boolean;
}

export class RolePageModule {
    PageTreeNodes: PageTreeNode[];
    RoleAccessLevels: RoleAccessLevel[];
}

export class RoleGrid {
    Roles: Roles[];
    TotalRecords: number;
}

export interface PageTreeNode {
    data?: RoleAccessLevel;
    children?: PageTreeNode[];
    leaf?: boolean;
    expanded?: boolean;
}
