using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISupplierServicesManager
    {
        SupplierServiceDisplayResult GetSupplierServices(GridDisplayInput displayInput);
        SupplierService GetSupplierServiceDetails(int supplierServiceId);
        int CreateSupplierService(SupplierService supplierService);
        int UpdateSupplierService(SupplierService supplierService);
        bool DeleteSupplierService(SupplierService supplierService);
        SupplierServiceDisplayResult GetAllSupplierServices(GridDisplayInput displayInput);
        int ValidateServiceName(SupplierService supplierService);
        List<ServiceCategory> GetServiceCategories();

    }
}
