using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class SchedulerNoManager: ISchedulerNoManager
    {
        private readonly ISchedulerNoRepository m_schedulerNoRepository;

        public SchedulerNoManager(ISchedulerNoRepository schedulerNoRepository)
        {
            m_schedulerNoRepository = schedulerNoRepository;
        }
        public SchedulerNoDisplayResult GetSchedulerNo()
        {
            return m_schedulerNoRepository.GetSchedulerNo();
        }
        public List<SchedulerNo> GetSchedulerByType(string Type)
        {
            return m_schedulerNoRepository.GetSchedulerByType(Type);
        }
        public SchedulerNoDisplayResult CheckSchedulerNo(SchedulerNo schedulerNo)
        {
            return m_schedulerNoRepository.CheckSchedulerNo(schedulerNo);
        }
        public SchedulerNo GetSchedulerNoById(int Id)
        {
            return m_schedulerNoRepository.GetSchedulerNoById(Id);
        }
        public int PostSchedulerNo(SchedulerNo adhocSchedulerObj)
        {
            return m_schedulerNoRepository.PostSchedulerNo(adhocSchedulerObj);
        }
        public int DeleteSchedulerNo(int SchedulerNoId, int? UpdatedBy)
        {
            return m_schedulerNoRepository.DeleteSchedulerNo(SchedulerNoId, UpdatedBy);
        }

        public bool ChangeStatus(SchedulerNo schedulerObj)
        {
            return m_schedulerNoRepository.ChangeStatus(schedulerObj);
        }
        public IEnumerable<ScheduleCategory> GetScheduleCategories()
        {
            return m_schedulerNoRepository.GetScheduleCategories();
        }
        public IEnumerable<ScheduleType> GetScheduleTypes()
        {
            return m_schedulerNoRepository.GetScheduleTypes();
        }
    }
}
