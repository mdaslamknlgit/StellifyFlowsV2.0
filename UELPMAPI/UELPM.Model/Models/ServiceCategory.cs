using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class ServiceCategory
    {
        public int ServiceCategoryId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; }
        public bool? isDeleted { get; set; }  
        public int CreatedBy { get; set; }
    }

    public class ServiceCategoryDisplayResult
    {
        public List<ServiceCategory> ServiceCategories { get; set; }
        public int TotalRecords { get; set; }
    }
}
