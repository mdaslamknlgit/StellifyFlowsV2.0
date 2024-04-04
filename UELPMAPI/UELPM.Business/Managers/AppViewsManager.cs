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
    public class AppViewsManager : IAppViewsManager
    {

        public AppViewsResult SearchAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo)
        {
            AppViewsRepository appViewsRepository  = new AppViewsRepository(MyUserInfo);
            return appViewsRepository.SearchAppViews(appViewsSearch, MyUserInfo);
        }
        public AppViewsResult GetAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo)
        {
            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);
            return appViewsRepository.GetAppViews(appViewsSearch, MyUserInfo);
        }

        public AppViewsDTO GetAppViewsByModuleId(int ModuleId, int FormId,int ViewId, UserInfo MyUserInfo)
        {
            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);
            return appViewsRepository.GetAppViewsByModuleId(ModuleId,FormId,ViewId, MyUserInfo);
        }


    }
}
