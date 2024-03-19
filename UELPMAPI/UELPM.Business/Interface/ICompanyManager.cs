using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ICompanyManager
    {
        CompanyGrid GetCompanies(GridDisplayInput gridDisplayInput);
        CompanyGrid GetAllSearchCompanies(GridDisplayInput gridDisplayInput);
        CompanyGrid GetAllSearchCompaniesFilter(CompanySearch companySearch);
        Company GetCompany(int companyId);
        int CreateCompany(Company company);
        int UpdateCompany(Company company);
        bool DeleteCompany(int companyId);

    }
}
