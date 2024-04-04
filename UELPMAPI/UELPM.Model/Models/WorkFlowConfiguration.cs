using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class WorkFlowConfiguration
    {
        public int WorkFlowConfigurationId { get; set; }
        public int CompanyId { get; set; }
        public string WorkFlowName { get; set; }
        public int ProcessId { get; set; }      
        public int? LocationID { get; set; }
        public bool? IsDeleted { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public List<WorkFlowProcessLevel> WorkFlowProcess { get; set; }
        public bool IsFollowWorkflow { get; set; }
        public bool IsMandatoryFollowWorkflow { get; set; }
    }

    public class WorkFlowConfigurationDisplayResult
    {
        public List<WorkFlowConfigurationList> WorkFlowConfigurations { get; set; }
        public int TotalRecords { get; set; }
    }

    public class WorkFlowSearch : GridDisplayInput
    {      
        public int WorkFlowConfigurationId { get; set; }
        public int ProcessId { get; set; }
        public string WorkFlowName { get; set; }
        public string ProcessName { get; set; }   
        public string Department { get; set; }
        public string Filter { get; set; }
    }

    public class WorkFlowConfigurationList
    {       
        public int WorkFlowConfigurationId { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public int LocationID { get; set; }
        public string WorkFlowName { get; set; }
        public string ProcessName { get; set; }      
        public string Department { get; set; }
    }
}
