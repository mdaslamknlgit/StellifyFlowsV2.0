using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISchedulerNoManager
    {
        SchedulerNoDisplayResult GetSchedulerNo();
        SchedulerNoDisplayResult CheckSchedulerNo(SchedulerNo schedulerNo);
        SchedulerNo GetSchedulerNoById(int Id);
        List<SchedulerNo> GetSchedulerByType(string Type);
        int PostSchedulerNo(SchedulerNo AdhocSchedulerObj);
        int DeleteSchedulerNo(int SchedulerNoId, int? UpdatedBy);
        bool ChangeStatus(SchedulerNo schedulerObj);
        IEnumerable<ScheduleCategory> GetScheduleCategories();
        IEnumerable<ScheduleType> GetScheduleTypes();
    }
}
