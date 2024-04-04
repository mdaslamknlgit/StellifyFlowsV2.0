using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class AccountCodeCategory
    {
        public int AccountCodeCategoryId { get; set; }
        public string AccountCodeName { get; set; }
        public int CompanyId { get; set; }
        public int IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string Description { get; set; }
    }

    public class AccountCodeCategoryDisplayResult
    {
        public List<AccountCodeCategory> AccountCodeCategoryList { get; set; }
        public int TotalRecords { get; set; }
    }




}
