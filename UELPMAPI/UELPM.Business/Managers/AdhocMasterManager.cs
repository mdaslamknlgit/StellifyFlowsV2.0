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
    public class AdhocMasterManager : IAdhocMasterManager
    {
        private readonly IAdhocMasterRepository m_adhocMasterRepository;
        public AdhocMasterManager(IAdhocMasterRepository adhocMasterRepository)
        {
            m_adhocMasterRepository = adhocMasterRepository;
        }

        #region Customer Type
        public IEnumerable<CustomerType> GetCustomerTypes()
        {
            return m_adhocMasterRepository.GetCustomerTypes();
        }
        public CustomerType GetCustomerTypeById(int id)
        {
            return m_adhocMasterRepository.GetCustomerTypeById(id);
        }
        public int PostCustomerType(CustomerType customerType)
        {
            return m_adhocMasterRepository.PostCustomerType(customerType);
        }
        #endregion

        #region Bank
        public IEnumerable<BankMaster> GetBanks(int CompanyId)
        {
            return m_adhocMasterRepository.GetBanks(CompanyId);
        }

        public BankMaster GetBankById(int id)
        {
            return m_adhocMasterRepository.GetBankById(id);
        }

        public BankMaster GetDefaultBank(int CompanyId)
        {
            return m_adhocMasterRepository.GetDefaultBank(CompanyId);
        }

        public int PostBank(BankMaster bank)
        {
            return m_adhocMasterRepository.PostBank(bank);
        }
        #endregion

        #region Email Configuration
        public IEnumerable<EmailConfiguration> GetEmailConfigurations(int companyId)
        {
            return m_adhocMasterRepository.GetEmailConfigurations(companyId);
        }

        public EmailConfiguration GetEmailConfigurationById(int CompanyId, int id)
        {
            return m_adhocMasterRepository.GetEmailConfigurationById(CompanyId, id);
        }

        public int PostEmailConfiguration(EmailConfiguration emailConfiguration)
        {
            return m_adhocMasterRepository.PostEmailConfiguration(emailConfiguration);
        }

        public IEnumerable<EmailConfigProcess> GetEmailConfigProcesses()
        {
            return m_adhocMasterRepository.GetEmailConfigProcesses();
        }
        public IEnumerable<UserEmail> GetUsers(int CompanyId,int DepartmentId)
        {
            return m_adhocMasterRepository.GetUsers( CompanyId,  DepartmentId);
        }
        #endregion

        #region Tenant Type
        public IEnumerable<TenantType> GetTenantTypes()
        {
            return m_adhocMasterRepository.GetTenantTypes();
        }

        public TenantType GetTenantsById(int id)
        {
            return m_adhocMasterRepository.GetTenantsById(id);
        }

        public int PostTenantType(TenantType tenantType)
        {
            return m_adhocMasterRepository.PostTenantType(tenantType);
        }
        #endregion

        #region Credit Term
        public IEnumerable<CreditTerm> GetCreditTerms(int CompanyId)
        {
            return m_adhocMasterRepository.GetCreditTerms(CompanyId);
        }

        public CreditTerm GetCreditTermById(int id)
        {
            return m_adhocMasterRepository.GetCreditTermById(id);
        }

        public int PostCreditTerm(CreditTerm creditTerm)
        {
            return m_adhocMasterRepository.PostCreditTerm(creditTerm);
        }
        #endregion

        #region Location
        public IEnumerable<Location> GetLocations(int CompanyId)
        {
            return m_adhocMasterRepository.GetLocations(CompanyId);
        }

        public Location GetLocationById(int id)
        {
            return m_adhocMasterRepository.GetLocationById(id);
        }

        public int PostLocation(Location location)
        {
            return m_adhocMasterRepository.PostLocation(location);
        }
        #endregion

        #region Tax Group
        public IEnumerable<SalesTaxGroup> GetTaxGroups(int companyId)
        {
            return m_adhocMasterRepository.GetTaxGroups(companyId);
        }
        public IEnumerable<SalesTaxGroup> GetAssignedTaxGroups(int companyId)
        {
            return m_adhocMasterRepository.GetAssignedTaxGroups(companyId);
        }
        public SalesTaxGroup GetTaxGroupById(int id)
        {
            return m_adhocMasterRepository.GetTaxGroupById(id);
        }
        public int PostTaxGroup(SalesTaxGroup taxGroup)
        {
            return m_adhocMasterRepository.PostTaxGroup(taxGroup);
        }
        #endregion

        #region Tax Master
        public IEnumerable<TaxMaster> GetTaxMasters(int companyId)
        {
            return m_adhocMasterRepository.GetTaxMasters(companyId);
        }

        public TaxMaster GetTaxMasterById(int CompanyId, int id)
        {
            return m_adhocMasterRepository.GetTaxMasterById(CompanyId, id);
        }

        public int PostTaxMaster(TaxMaster taxMaster)
        {
            return m_adhocMasterRepository.PostTaxMaster(taxMaster);
        }
        #endregion

        #region Tax Type
        public IEnumerable<TaxType> GetTaxTypes(int companyId)
        {
            return m_adhocMasterRepository.GetTaxTypes(companyId);
        }

        public TaxType GetTaxTypeById(int CompanyId, int id)
        {
            return m_adhocMasterRepository.GetTaxTypeById(CompanyId, id);
        }

        public int PostTaxType(TaxType taxType)
        {
            return m_adhocMasterRepository.PostTaxType(taxType);
        }
        #endregion

        public bool ChangeMasterProcessStatus(MasterProcess masterProcess)
        {
            return m_adhocMasterRepository.ChangeMasterProcessStatus(masterProcess);
        }

        public bool ChangeDefault(MasterProcess masterProcess)
        {
            return m_adhocMasterRepository.ChangeDefault(masterProcess);
        }
    }
}
