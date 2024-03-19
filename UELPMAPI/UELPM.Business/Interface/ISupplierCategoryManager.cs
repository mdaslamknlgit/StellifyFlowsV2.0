using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISupplierCategoryManager
    {
        SupplierCategoryDisplayResult GetSupplierCategories(GridDisplayInput displayInput);
        SupplierCategory GetSupplierCategoryDetails(int supplierCategoryId);
        int CreateSupplierCategory(SupplierCategory supplierCategory);
        int UpdateSupplierCategory(SupplierCategory supplierCategory);
        bool DeleteSupplierCategory(SupplierCategory supplierCategory);
        SupplierCategoryDisplayResult GetAllSupplierCategories(GridDisplayInput displayInput);
        int ValidateSupplierCategory(SupplierCategory supplierCategory);
    }
}
