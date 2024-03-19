using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class SupplierService
    {
        public int SupplierServiceID { get; set; }
        public string ServiceName { get; set; }
        public int CompanyId { get; set; }
        public string ServiceDescription { get; set; }
        public string ServiceCategoryName { get; set; }
        public int? ServiceType { get; set; }
        public int ServiceCategory { get; set; }
        public bool? Isdeleted { get; set; }  
        public int CreatedBy { get; set; }
    }

    public class SupplierServiceDisplayResult
    {
        public List<SupplierService> SupplierServices { get; set; }
        public int TotalRecords { get; set; }
    }
}
