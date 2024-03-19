using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Service.Interface;
using UELPM.Model.Models;

namespace UELPM.Business.Managers
{
    public class SupplierCategoryManager : ManagerBase, ISupplierCategoryManager
    {
        private readonly ISupplierCategoryRepository m_SupplierCategoryRepository;

        public SupplierCategoryManager(ISupplierCategoryRepository supplierCategoryRepository)
        {
            m_SupplierCategoryRepository = supplierCategoryRepository;
        }
        public SupplierCategory GetSupplierCategoryDetails(int supplierCategoryId)
        {
            return m_SupplierCategoryRepository.GetSupplierCategoryDetails(supplierCategoryId);
        }
        public SupplierCategoryDisplayResult GetSupplierCategories(GridDisplayInput displayInput)
        {
            return m_SupplierCategoryRepository.GetSupplierCategories(displayInput);
        }
        public int CreateSupplierCategory(SupplierCategory supplierCategory)
        {
            return m_SupplierCategoryRepository.CreateSupplierCategory(supplierCategory);
        }
        public int UpdateSupplierCategory(SupplierCategory supplierCategory)
        {
            return m_SupplierCategoryRepository.UpdateSupplierCategory(supplierCategory);
        }
        public bool DeleteSupplierCategory(SupplierCategory supplierCategory)
        {
            return m_SupplierCategoryRepository.DeleteSupplierCategory(supplierCategory);
        }

        public SupplierCategoryDisplayResult GetAllSupplierCategories(GridDisplayInput displayInput)
        {
            return m_SupplierCategoryRepository.GetAllSupplierCategories(displayInput);
        }
        public int ValidateSupplierCategory(SupplierCategory supplierCategory)
        {
            return m_SupplierCategoryRepository.ValidateSupplierCategory(supplierCategory);
        }
    }
}
