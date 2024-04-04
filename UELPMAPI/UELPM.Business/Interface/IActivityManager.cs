using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IActivityManager
    {
        ActivityResults SearchActivities(UserInfo MyUserInfo, ActivitySearch activitySearch);

        ActivityResults SearchActivities(int ModuleId, int FormId, int ViewId, ActivitySearch activitySearch, UserInfo MyUserInfo);

        ActivityInfo GetActivityById(int ActivityId, UserInfo MyUserInfo);
        ActivityResults GetActivitiesByType(UserInfo MyUserInfo, int ActivityTypeId);

        ActivityResults GetActivitiesByUser(UserInfo MyUserInfo);

        ResultReponse CreateActivity(UserInfo MyUserInfo, ActivityInput activityDTO);

        ResultReponse UpdateActivity(UserInfo MyUserInfo, ActivityInput activityDTO);

        IEnumerable<ActivityStatusDomainItem> GetActivityStatusDomainItem(UserInfo MyUserInfo);

        IEnumerable<ContactDomainItems> GetContactDomainItems(UserInfo MyUserInfo);
    }
}
