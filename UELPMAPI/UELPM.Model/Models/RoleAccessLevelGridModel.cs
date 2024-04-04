using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{  
    public class RolePageModule
    {
        public List<PageTreeNode> PageTreeNodes { get; set; }
        public List<PageData> RoleAccessLevels { get; set; }
    }
    public class PageTreeNode
    {
        public RoleAccessLevel data { get; set; }      
        public List<PageTreeNode> children { get; set; }
        public bool? expanded { get; set; }

}
  
    public class Data
    {
        public int AccessLevelId { get; set; }
        public int RoleID { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public bool IsPageModule { get; set; }
        public int? ParentId { get; set; }      
        public bool? IsAdd { get; set; }
        public bool? IsView { get; set; }
        public bool? IsEdit { get; set; }
        public bool? IsDelete { get; set; }
        public bool? IsEmail { get; set; }
        public bool? IsPrint { get; set; }
        public bool? IsVerify { get; set; }
        public bool? IsApprove { get; set; }
        public bool? IsVoid { get; set; }
        public bool? IsImport { get; set; }        
        public bool? IsExport { get; set; }
        public bool? IsGeneratePOC { get; set; }
        public bool? IsGenerateReport { get; set; }
        public bool IsAddEnable { get; set; }
        public bool IsEditEnable { get; set; }        
        public bool IsDeleteEnable { get; set; }
        public bool IsEmailEnable { get; set; }
        public bool IsPrintEnable { get; set; }
        public bool IsVerifyEnable { get; set; }
        public bool IsApproveEnable { get; set; }
        public bool IsVoidEnable { get; set; }
        public bool IsImportEnable { get; set; }        
        public bool IsExportEnable { get; set; }
        public bool IsGeneratePOCEnable { get; set; }
        public bool IsGenerateReportEnable { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class PageData
    {
        public int AccessLevelId { get; set; }
        public int PageId { get; set; }
        public string PageName { get; set; }
        public int? ParentId { get; set; }
        public bool IsPageModule { get; set; }
        public int RoleID { get; set; }
        public bool? IsAdd { get; set; }
        public bool? IsView { get; set; }
        public bool? IsEdit { get; set; }
        public bool? IsDelete { get; set; }
        public bool? IsEmail { get; set; }
        public bool? IsPrint { get; set; }
        public bool? IsVerify { get; set; }
        public bool? IsApprove { get; set; }
        public bool? IsVoid { get; set; }
        public bool? IsImport { get; set; }        
        public bool? IsExport { get; set; }
        public bool? IsGeneratePOC { get; set; }
        public bool? IsGenerateReport { get; set; }
        public bool IsAddEnable { get; set; }
        public bool IsEditEnable { get; set; }
        public bool IsDeleteEnable { get; set; }
        public bool IsEmailEnable { get; set; }
        public bool IsPrintEnable { get; set; }
        public bool IsVerifyEnable { get; set; }
        public bool IsApproveEnable { get; set; }
        public bool IsVoidEnable { get; set; }
        public bool IsImportEnable { get; set; }        
        public bool IsExportEnable { get; set; }
        public bool IsGeneratePOCEnable { get; set; }
        public bool IsGenerateReportEnable { get; set; }

        public PageData(int accessLevelId, string pageName, int pageId, int? parentId, bool isPageModule, bool? isAdd, bool? isView, bool? isEdit, bool? isDelete, bool? isEmail, bool? isPrint, bool? isVerify, bool? isApprove, bool? isVoid, bool? isImport, bool? isExport,bool? isGeneratePOC, bool? isGenerateReport, bool isAddEnable, bool isEditEnable, bool isDeleteEnable, bool isEmailEnable, bool isPrintEnable, bool isVerifyEnable, bool isApproveEnable, bool isVoidEnable, bool isImportEnable, bool isExportEnable,bool isGeneratePOCEnable,bool isGenerateReportEnable)
        {
            AccessLevelId = accessLevelId;
            PageName = pageName;
            PageId = pageId;
            ParentId = parentId;
            IsPageModule = isPageModule;
            IsAdd = isAdd;
            IsView = isView;
            IsEdit = isEdit;
            IsDelete = isDelete;
            IsEmail = isEmail;
            IsPrint = isPrint;
            IsVerify = isVerify;
            IsApprove = isApprove;
            IsVoid = isVoid;
            IsImport = isImport;
            IsExport = isExport;
            IsGeneratePOC = isGeneratePOC;
            IsGenerateReport = isGenerateReport;
            IsAddEnable = isAddEnable;
            IsEditEnable = isEditEnable;
            IsDeleteEnable = isDeleteEnable;
            IsEmailEnable = isEmailEnable;
            IsPrintEnable = isPrintEnable;
            IsVerifyEnable = isVerifyEnable;
            IsApproveEnable = isApproveEnable;
            IsVoidEnable = isVoidEnable;
            IsImportEnable = isImportEnable;
            IsExportEnable = isExportEnable;
            IsGeneratePOCEnable = isGeneratePOCEnable;
            IsGenerateReportEnable = isGenerateReportEnable;
        }
    }   
}


