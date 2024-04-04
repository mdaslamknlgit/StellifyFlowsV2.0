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
    public class SupplierServiceManager : ManagerBase, ISupplierServicesManager
    {
        private readonly ISupplierServiceRepository m_SupplierServiceRepository;

        public SupplierServiceManager(ISupplierServiceRepository supplierCategoryRepository)
        {
            m_SupplierServiceRepository = supplierCategoryRepository;
        }
        public SupplierServiceDisplayResult GetSupplierServices(GridDisplayInput displayInput)
        {
            return m_SupplierServiceRepository.GetSupplierServices(displayInput);
        }
        public SupplierService GetSupplierServiceDetails(int supplierServiceId)
        {
            return m_SupplierServiceRepository.GetSupplierServiceDetails(supplierServiceId);
        }
        public int CreateSupplierService(SupplierService supplierService)
        {
            return m_SupplierServiceRepository.CreateSupplierService(supplierService);
        }
        public int UpdateSupplierService(SupplierService supplierService)
        {
            return m_SupplierServiceRepository.UpdateSupplierService(supplierService);
        }
        public bool DeleteSupplierService(SupplierService supplierService)
        {
            return m_SupplierServiceRepository.DeleteSupplierService(supplierService);
        }

        public SupplierServiceDisplayResult GetAllSupplierServices(GridDisplayInput displayInput)
        {
            return m_SupplierServiceRepository.GetAllSupplierServices(displayInput);
        }
        public int ValidateServiceName(SupplierService supplierService)
        {
            return m_SupplierServiceRepository.ValidateServiceName(supplierService);
        }
        public List<ServiceCategory> GetServiceCategories()
        {
            return m_SupplierServiceRepository.GetServiceCategories();
        }

       
    }
}
