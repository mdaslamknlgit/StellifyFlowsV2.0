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
    public class DepartmentManager : IDepartmentManager
    {
        private readonly IDepartmentRepository m_departmentRepository;

        public DepartmentManager(IDepartmentRepository departmentRepository)
        {
            m_departmentRepository = departmentRepository;
        }

        public string CreateDepartment(DepartmentManagement m_department)
        {
            return m_departmentRepository.CreateDepartment(m_department);
        }

        public bool DeleteDepartment(int locationId, int userId)
        {
            return m_departmentRepository.DeleteDepartment(locationId,userId);
        }

        public DepartmentManagementDisplayResult GetDepartment(GridDisplayInput gridDisplayInput)
        {
            return m_departmentRepository.GetDepartment(gridDisplayInput);
        }

        public DepartmentManagement GetDepartmentDetails(int locationId)
        {
            return m_departmentRepository.GetDepartmentDetails(locationId);
        }

        public string UpdateDepartment(DepartmentManagement m_department)
        {
            return m_departmentRepository.UpdateDepartment(m_department);
        }

        public string ValidateDepartment(DepartmentManagement m_validatedepartment)
        {
            return m_departmentRepository.ValidateDepartment(m_validatedepartment);
        }
    }
}
