using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IRoleManagementRepository
    {
        RoleGrid GetRoles(GridDisplayInput gridDisplayInput);
        RoleGrid GetAllSearchRoles(GridDisplayInput gridDisplayInput);
        RolePageModule GetPageModules();
        Roles GetRoleDetails(int roleId);
        int CreateRole(Roles role);
        int UpdateRole(Roles role);
        bool DeleteRole(int roleId);
    }
}
