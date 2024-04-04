using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class CustomerManager : ICustomerManager
    {
        private readonly ICustomerRepository m_customerRepository;

        public CustomerManager(ICustomerRepository customerRepository)
        {
            m_customerRepository = customerRepository;
        }

        public IEnumerable<SalesCustomerGrid> GetCustomers(SalesCustomerSearch search)
        {
            return m_customerRepository.GetCustomers(search);
        }     

        public SalesCustomer GetCustomer(int customerId)
        {
            return m_customerRepository.GetCustomer(customerId);
        }

        public int PostCustomer(SalesCustomer salesCustomer)
        {
            return m_customerRepository.PostCustomer(salesCustomer);
        }

        public List<CustomerExcel> UploadCustomers(string filePath,int companyId)
        {
            return m_customerRepository.UploadCustomers(filePath, companyId);
        }

        public bool PostCustomers(string filePath, int userId, int companyId)
        {
            return m_customerRepository.PostCustomers(filePath, userId, companyId);
        }
    }
}
