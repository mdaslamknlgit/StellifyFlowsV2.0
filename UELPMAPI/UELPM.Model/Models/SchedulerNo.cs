using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class SchedulerNo
    {
        public int SchedulerNoId { get; set; }
        public int ScheduleCategoryId { get; set; }
        public int ScheduleTypeId { get; set; }
        public string ScheduleCategoryName { get; set; }
        public string ScheduleTypeName { get; set; }
        public string SchedulerNumber { get; set; }
        public string SchedulerDescription { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsActive { get; set; }
    }
    public class SchedulerNoDisplayResult
    {
        public List<SchedulerNo> SchedulerNos { get; set; }
        public int TotalRecords { get; set; }
    }
    public class ScheduleType
    {
        public int ScheduleTypeId { get; set; }
        public string ScheduleTypeName { get; set; }
        public bool IsActive { get; set; }
    }
    public class ScheduleCategory
    {
        public int ScheduleCategoryId { get; set; }
        public string ScheduleCategoryName { get; set; }
        public bool IsActive { get; set; }
    }
}
