using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IAppModulesRepository
    {

        AppModulesResult GetAppModules(AppModulesSearchInput appModulesSearchInput,UserInfo MyUserInfo);

        AppModulesDTO GetAppModuleById(int ModulesID, UserInfo MyUserInfo);


    }
}
