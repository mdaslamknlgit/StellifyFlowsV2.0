using System;

namespace UELPM.Model.Models
{
    public class SupplierSubCode
    {
        public int SubCodeId { get; set; }
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public string SubCodeDescription { get; set; }
        public string SubCode { get; set; }
        public string AccountSetId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public string SearchKey { get; set; }

    }
}
