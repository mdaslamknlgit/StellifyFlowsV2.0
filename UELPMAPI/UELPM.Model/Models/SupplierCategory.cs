using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class SupplierCategory
    {
        public int SupplierCategoryID { get; set; }
        public string CategoryText { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
    }
    public class SupplierCategoryDisplayResult
    {
        public List<SupplierCategory> SupplierCategory { get; set; }
        public int TotalRecords { get; set; }
    }
}
