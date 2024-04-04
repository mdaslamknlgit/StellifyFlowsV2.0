using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class RoleManagementManager  : ManagerBase, IRoleManagementManager
    {
        private readonly IRoleManagementRepository m_roleManagementRepository;

        public RoleManagementManager(IRoleManagementRepository roleManagementRepository)
        {
            m_roleManagementRepository = roleManagementRepository;
        }

        public RoleGrid GetRoles(GridDisplayInput gridDisplayInput)
        {
            return m_roleManagementRepository.GetRoles(gridDisplayInput);
        }

        public RoleGrid GetAllSearchRoles(GridDisplayInput gridDisplayInput)
        {
            return m_roleManagementRepository.GetAllSearchRoles(gridDisplayInput);
        }

        public RolePageModule GetPageModules()
        {
            return m_roleManagementRepository.GetPageModules();
        }

        public Roles GetRoleDetails(int roleID)
        {
            return m_roleManagementRepository.GetRoleDetails(roleID);
        }    

        public int CreateRole(Roles role)
        {
            return m_roleManagementRepository.CreateRole(role);
        }

        public int UpdateRole(Roles role)
        {
            return m_roleManagementRepository.UpdateRole(role);
        }

        public bool DeleteRole(int roleID)
        {
            return m_roleManagementRepository.DeleteRole(roleID);
        }      
    }
}
