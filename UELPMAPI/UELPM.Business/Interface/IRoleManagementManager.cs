using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IRoleManagementManager
    {
        RoleGrid GetRoles(GridDisplayInput gridDisplayInput);
        RoleGrid GetAllSearchRoles(GridDisplayInput gridDisplayInput);
        RolePageModule GetPageModules();
        Roles GetRoleDetails(int roleID);      
        int CreateRole(Roles role);
        int UpdateRole(Roles role);
        bool DeleteRole(int roleID);     
    }
}
