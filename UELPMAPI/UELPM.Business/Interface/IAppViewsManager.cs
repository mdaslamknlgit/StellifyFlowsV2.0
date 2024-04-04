using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IAppViewsManager
    {
        AppViewsResult SearchAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo);

        AppViewsResult GetAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo);

        AppViewsDTO GetAppViewsByModuleId(int ModuleId, int FormId, int ViewId, UserInfo MyUserInfo);
    }
}
