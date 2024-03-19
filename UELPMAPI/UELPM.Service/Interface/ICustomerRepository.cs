using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ICustomerRepository
    {
        IEnumerable<SalesCustomerGrid> GetCustomers(SalesCustomerSearch search);
        SalesCustomer GetCustomer(int customerId);
        int PostCustomer(SalesCustomer salesCustomer);
        List<CustomerExcel> UploadCustomers(string filePath, int companyId);
        bool PostCustomers(string filePath, int userId, int companyId);
    }
}
