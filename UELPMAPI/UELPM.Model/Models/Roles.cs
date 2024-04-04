using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class Roles
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public int SNo { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsActive { get; set; }
        public bool IsSelected { get; set; }
        public int TotalRecords { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string RoleIds { get; set; }
        public IEnumerable<RoleAccessLevel> RoleAccessLevels { get; set; }        
        public RolePageModule RolePageModule { get; set; }       
    }

    public class RoleGrid
    {
        public List<Roles> Roles { get; set; }
        public int TotalRecords { get; set; }
    }

    public class Page
    {
        public int PageId { get; set; }
        public string PageName { get; set; }
        public int? ParentId { get; set; }
        public bool IsPageModule { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PageModule
    {
        public int PageId { get; set; }
        public int AccessLevelId { get; set; }
        public string PageName { get; set; }
        public int? ParentId { get; set; }
        public bool IsPageModule { get; set; }
        public int RoleID { get; set; }
        public int CompanyId { get; set; }
        public bool? IsView { get; set; }
        public bool? IsAdd { get; set; }
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
}
