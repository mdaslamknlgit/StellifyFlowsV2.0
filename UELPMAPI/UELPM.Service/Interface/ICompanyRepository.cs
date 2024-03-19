using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ICompanyRepository
    {
        CompanyGrid GetCompanies(GridDisplayInput gridDisplayInput);
        CompanyGrid GetAllSearchCompanies(GridDisplayInput gridDisplayInput);
        CompanyGrid GetAllSearchCompaniesFilter(CompanySearch companySearch);
        Company GetCompany(int companyId);
        IEnumerable<Company> GetAllCompanies(); 
        int CreateCompany(Company company);
        int UpdateCompany(Company company);
        bool DeleteCompany(int companyId);
    }
}
