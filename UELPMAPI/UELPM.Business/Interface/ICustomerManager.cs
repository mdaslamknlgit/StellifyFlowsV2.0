using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ICustomerManager
    {
        IEnumerable<SalesCustomerGrid> GetCustomers(SalesCustomerSearch search);     
        SalesCustomer GetCustomer(int customerId);
        int PostCustomer(SalesCustomer salesCustomer);
        List<CustomerExcel> UploadCustomers(string filePath, int companyId);
        bool PostCustomers(string filePath, int userId, int companyId);
    }
}
