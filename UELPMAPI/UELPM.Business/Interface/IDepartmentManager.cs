using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IDepartmentManager
    {
        DepartmentManagementDisplayResult GetDepartment(GridDisplayInput gridDisplayInput);
        DepartmentManagement GetDepartmentDetails(int locationId);
        string ValidateDepartment(DepartmentManagement m_validatedepartment);
        string CreateDepartment(DepartmentManagement m_department);
        string UpdateDepartment(DepartmentManagement m_department);
        bool DeleteDepartment(int locationId, int userId);
    }
}
