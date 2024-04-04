using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class ServiceType
    {
        public int ServiceTypeId { get; set; }
        public int ServiceCategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }       
        public DateTime UpdatedDate { get; set; }
        public string ServiceCategoryName { get; set; }
    }

    public class ServiceTypeDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
    }

    public class ServiceTypeDisplayResult
    {
        public List<ServiceType> ServiceTypes { get; set; }
        public int TotalRecords { get; set; }
    }  
}
