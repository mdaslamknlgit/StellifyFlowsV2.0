using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class ActivityManager : IActivityManager
    {

        public ActivityResults SearchActivities(UserInfo MyUserInfo, ActivitySearch activitySearch)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.SearchActivities(MyUserInfo, activitySearch);
        }

        public ActivityResults SearchActivities(int ModuleId, int FormId, int ViewId, ActivitySearch activitySearch, UserInfo MyUserInfo)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.SearchActivities(ModuleId, FormId, ViewId, activitySearch, MyUserInfo);
        }

        public ActivityInfo GetActivityById(int ActivityId,UserInfo MyUserInfo)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.GetActivityById(ActivityId,MyUserInfo);
        }
        public ActivityResults GetActivitiesByType(UserInfo MyUserInfo, int ActivityTypeId)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.GetActivitiesByType(MyUserInfo, ActivityTypeId);
        }

        public ActivityResults GetActivitiesByUser(UserInfo MyUserInfo)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.GetActivitiesByUser(MyUserInfo);
        }

        public ResultReponse CreateActivity(UserInfo MyUserInfo, ActivityInput activityDTO)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.CreateActivity(MyUserInfo, activityDTO);
        }

        public ResultReponse UpdateActivity(UserInfo MyUserInfo, ActivityInput activityDTO)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.UpdateActivity(MyUserInfo, activityDTO);
        }


        public IEnumerable<ActivityStatusDomainItem> GetActivityStatusDomainItem(UserInfo MyUserInfo)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.GetActivityStatusDomainItem(MyUserInfo);
        }

        public IEnumerable<ContactDomainItems> GetContactDomainItems(UserInfo MyUserInfo)
        {
            ActivityRepository m_ActivityRepository = new ActivityRepository(MyUserInfo);
            return m_ActivityRepository.GetContactDomainItems(MyUserInfo);
        }
    }
}
