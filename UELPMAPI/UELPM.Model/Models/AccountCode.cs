using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class AccountCode
    {
        public int AccountCodeId { get; set; }
        public int? AccountCodeCategoryId { get; set; }
        public int CompanyId { get; set; }
        public string Entity { get; set; }
        public string AccountType { get; set; }
        public string AccountCodeName { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string AccountCodeCategoryName { get; set; }
        public int AccountTypeId { get; set; }
    }

    public class SubCategory
    {
        public int AccountCodeCategoryId { get; set; }
        public int CompanyId { get; set; }       
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string AccountCodeCategoryName { get; set; }
        public int AccountTypeId { get; set; }
    }

    public class AccountType
    {
        public int AccountTypeId { get; set; }     
        public string AccountTypeName { get; set; }      
    }

    public class AccountCodeList
    {
        public string AccountType { get; set; }
        public string CompanyId { get; set; }
        public List<AccountCode> AccountCodes { get; set; }
    }

    public class AccountCodeDelete
    {
        public int AccountCatId { get; set; }
        public int CompanyId { get; set; }
        public int ModifiedBy { get; set; }
        public int AccountCodeId { get; set; }
    }

    public class UploadResult
    {
        public int UploadedRecords { get; set; }
        public int FailedRecords { get; set; }
        public string Message { get; set; }
        public List<string> FailLog { get; set; }
        public int TotalRecords { get; set; }
        public int SuccesRecords { get; set; }
    }

    public class AccountCodesSearch
    {
        public string AccountType { get; set; }
        public int CompanyId { get; set; }
        public string SearchKey { get; set; }
        public int AccountTypeId { get; set; }
    }

    public class SubCategorySearch
    {
        public int CompanyId { get; set; }
        public string SearchKey { get; set; }
        public int AccountTypeId { get; set; }
    }
}
