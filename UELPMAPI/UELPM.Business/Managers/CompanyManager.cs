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
    public class CompanyManager : ManagerBase, ICompanyManager
    {
        private readonly ICompanyRepository m_companyRepository;

        public CompanyGrid GetCompanies(GridDisplayInput gridDisplayInput)
        {
            return m_companyRepository.GetCompanies(gridDisplayInput);
        }

        public Company GetCompany(int companyId)
        {
            return m_companyRepository.GetCompany(companyId);
        }

        public CompanyManager(ICompanyRepository companyRepository)
        {
            m_companyRepository = companyRepository;
        }

        public int CreateCompany(Company company)
        {
            return m_companyRepository.CreateCompany(company);
        }

        public bool DeleteCompany(int companyId)
        {
            return m_companyRepository.DeleteCompany(companyId);
        }

        public int UpdateCompany(Company company)
        {
            return m_companyRepository.UpdateCompany(company);
        }

        public CompanyGrid GetAllSearchCompanies(GridDisplayInput gridDisplayInput)
        {
            return m_companyRepository.GetAllSearchCompanies(gridDisplayInput);
        }

        public CompanyGrid GetAllSearchCompaniesFilter(CompanySearch companySearch)
        {
            return m_companyRepository.GetAllSearchCompaniesFilter(companySearch);
        }
    }
}
