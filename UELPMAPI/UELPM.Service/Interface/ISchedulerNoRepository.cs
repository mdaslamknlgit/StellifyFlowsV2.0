using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ISchedulerNoRepository
    {
        SchedulerNoDisplayResult GetSchedulerNo();
        SchedulerNoDisplayResult CheckSchedulerNo(SchedulerNo schedulerNo);
        SchedulerNo GetSchedulerNoById(int Id);
        int PostSchedulerNo(SchedulerNo AdhocSchedulerObj);
        int DeleteSchedulerNo(int SchedulerNoId, int? UpdatedBy);
        bool ChangeStatus(SchedulerNo schedulerObj);
        IEnumerable<ScheduleCategory> GetScheduleCategories();
        IEnumerable<ScheduleType> GetScheduleTypes();
        List<SchedulerNo> GetSchedulerByType(string type);
    }
}
