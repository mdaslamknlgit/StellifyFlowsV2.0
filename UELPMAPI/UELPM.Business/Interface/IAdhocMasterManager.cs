using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAdhocMasterManager
    {
        #region Customer Type
        IEnumerable<CustomerType> GetCustomerTypes();
        CustomerType GetCustomerTypeById(int id);
        int PostCustomerType(CustomerType customerType);
        #endregion

        #region Bank Master
        IEnumerable<BankMaster> GetBanks(int CompanyId);
        BankMaster GetBankById(int id);
        BankMaster GetDefaultBank(int companyId);
        int PostBank(BankMaster bank);
        #endregion

        #region Email Configuration
        IEnumerable<EmailConfiguration> GetEmailConfigurations(int companyId);
        EmailConfiguration GetEmailConfigurationById(int CompanyId,int id);
        int PostEmailConfiguration(EmailConfiguration emailConfiguration);
        IEnumerable<EmailConfigProcess> GetEmailConfigProcesses();
        IEnumerable<UserEmail> GetUsers(int CompanyId, int DepartmentId);
        #endregion

        #region Tenant Type
        IEnumerable<TenantType> GetTenantTypes();
        TenantType GetTenantsById(int id);
        int PostTenantType(TenantType tenantType);
        #endregion

        #region Credit Term
        IEnumerable<CreditTerm> GetCreditTerms(int CompanyId);
        CreditTerm GetCreditTermById(int id);
        int PostCreditTerm(CreditTerm creditTerm);
        #endregion

        #region Location
        IEnumerable<Location> GetLocations(int CompanyId);
        Location GetLocationById(int id);
        int PostLocation(Location location);
        #endregion

        #region Tax Group
        IEnumerable<SalesTaxGroup> GetTaxGroups(int companyId);
        IEnumerable<SalesTaxGroup> GetAssignedTaxGroups(int companyId);     
        SalesTaxGroup GetTaxGroupById(int id);
        int PostTaxGroup(SalesTaxGroup taxGroup);
        #endregion

        #region Tax Master
        IEnumerable<TaxMaster> GetTaxMasters(int companyId);
        TaxMaster GetTaxMasterById(int CompanyId,int id);
        int PostTaxMaster(TaxMaster taxMaster);
        #endregion

        #region Tax Type
        IEnumerable<TaxType> GetTaxTypes(int companyId);
        TaxType GetTaxTypeById(int CompanyId, int id);
        int PostTaxType(TaxType taxType);
        #endregion

        bool ChangeMasterProcessStatus(MasterProcess masterProcess);
        bool ChangeDefault(MasterProcess masterProcess);
    }
}
