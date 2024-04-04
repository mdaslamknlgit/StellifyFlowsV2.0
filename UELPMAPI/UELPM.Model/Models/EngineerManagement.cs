using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class EngineerManagement
    {
        public int EngineerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EngineerCode { get; set; }
        public string JobCategoryName { get; set; }
        public string FacilityName { get; set; }
        public bool IsActive { get; set; }
        public string Contact { get; set; }
        public string AltContact { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CompanyId { get; set; }
        public List<SupplierService> JobCategory { get; set; }
        public List<Facilities> Facility{ get; set; }

    }

    public class EngineerManagementDisplayResult
    {
        public List<EngineerManagementList> EngineerManagementList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class EngineerManagementList
    {
        public int EngineerId { get; set; }
        public string Name{ get; set; }
        public string EngineerCode { get; set; }
        public string JobCategoryName { get; set; }
        public string FacilityName { get; set; }
    }

    public class EngineerManagementFilterDisplayInput : GridDisplayInput
    {
        public string NameFilter { get; set; }
        public string JobCategoryFilter { get; set; }
        public string FacilityFilter { get; set; }
        public string EngineerCodeFilter { get; set; }
    }

    public class EngineerManagementDelete
    {
        public int ModifiedBy { get; set; }
        public int EngineerId { get; set; }
    }


}
