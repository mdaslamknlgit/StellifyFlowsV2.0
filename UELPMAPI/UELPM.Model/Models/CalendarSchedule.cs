using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class CalendarSchedule
    {
        public int ScheduleId { get; set; }
        public int FacilityId { get; set; }
        public string Facility { get; set; }
        public string MaintenanceFrequency { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Day { get; set; }
        public string JobDescription { get; set; }
    }

}
