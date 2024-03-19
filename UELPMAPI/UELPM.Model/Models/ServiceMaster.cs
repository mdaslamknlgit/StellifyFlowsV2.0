using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class ServiceMaster
    {
        public int ServiceMasterId { get; set; }
        public string ServiceMasterCode { get; set; }
        public int ServiceTypeId { get; set; }
        public int CompanyId { get; set; }
        public string ServiceName { get; set; }
        public string ServiceDescription { get; set; }
        public decimal Price { get; set; }     
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }     
        public DateTime UpdatedDate { get; set; }     
    }

    public class ServiceMasterDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
        public int CompanyId { get; set; }
    }

    public class ServiceMasterDisplayResult
    {
        public List<ServiceMaster> Services { get; set; }
        public int TotalRecords { get; set; }
    }
}
