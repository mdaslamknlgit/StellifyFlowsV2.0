using System;
using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class SharedManager : ManagerBase, ISharedManager
    {
        private readonly ISharedRepository m_sharedRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="SharedManager"></param>
        public SharedManager(ISharedRepository sharedRepository)
        {
            m_sharedRepository = sharedRepository;
        }

        public IEnumerable<GetItemMasters> GetItemMasters(int? locationId, int companyId, string searchKey)
        {
            return m_sharedRepository.GetItemMasters(locationId, companyId, searchKey);
        }

        public IEnumerable<GetItemMasters> GetItemMastersbasedLocationID(int? locationId, string searchKey)
        {
            return m_sharedRepository.GetItemMastersbasedLocationID(locationId, searchKey);
        }

        public IEnumerable<GetItemMasters> GetItemsfortransfer(int? locationId, string searchKey)
        {
            return m_sharedRepository.GetItemsfortransfer(locationId, searchKey);
        }

        public IEnumerable<Locations> GetLocations(string searchKey, int? companyId)
        {
            return m_sharedRepository.GetLocations(searchKey, companyId);
        }

        public IEnumerable<Suppliers> GetAllSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            return m_sharedRepository.GetAllSuppliers(searchKey, supplierTypeId, companyId);
        }

        public IEnumerable<Suppliers> getActiveSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            return m_sharedRepository.getActiveSuppliers(searchKey, supplierTypeId, companyId);
        }

        public IEnumerable<Suppliers> GetOtherEntitySuppliers(string searchKey, int companyId)
        {
            return m_sharedRepository.GetOtherEntitySuppliers(searchKey, companyId);
        }

        public IEnumerable<Currency> GetCurrencies()
        {
            return m_sharedRepository.GetCurrencies();
        }

        public IEnumerable<Facilities> GetFacilities(string searchKey, int companyId)
        {
            return m_sharedRepository.GetFacilities(searchKey, companyId);
        }

        public IEnumerable<PaymentTerm> GetPaymentTerms(int CompanyId)
        {
            return m_sharedRepository.GetPaymentTerms(CompanyId);
        }

        public IEnumerable<UOM> GetUOMList()
        {
            return m_sharedRepository.GetUOMList();
        }

        public IEnumerable<Companies> GetCompanies(string searchKey)
        {
            return m_sharedRepository.GetCompanies(searchKey);
        }

        public IEnumerable<Taxes> GetTaxes(int taxClass)
        {
            return m_sharedRepository.GetTaxes(taxClass);
        }

        public IEnumerable<Engineer> GetEngineers(string searchKey)
        {
            return m_sharedRepository.GetEngineers(searchKey);
        }

        public IEnumerable<Locations> GetAllDepartments()
        {
            return m_sharedRepository.GetAllDepartments();
        }

        public IEnumerable<Locations> GetAllUniqueDepartments()
        {
            return m_sharedRepository.GetAllUniqueDepartments();
        }

        public IEnumerable<DeliveryTerms> GetAllDeliveryTerms(int CompanyId)
        {
            return m_sharedRepository.GetAllDeliveryTerms(CompanyId);
        }

        public IEnumerable<GetAssets> GetAssets(string searchKey)
        {
            return m_sharedRepository.GetAssets(searchKey);
        }

        public IEnumerable<PurchaseOrderRequests> GetAllPORequest(string searchKey, int CompanyId)
        {
            return m_sharedRepository.GetAllPORequest(searchKey, CompanyId);
        }
        public IEnumerable<PurchaseOrderRequests> GetAllPORequestForQuotation(string searchKey, int CompanyId)
        {
            return m_sharedRepository.GetAllPORequestForQuotation(searchKey, CompanyId);
        }
        public IEnumerable<PaymentType> GetAllPaymentType()
        {
            return m_sharedRepository.GetAllPaymentType();
        }

        public byte[] GetUserProfileImage(int userId)
        {
            return m_sharedRepository.GetUserProfileImage(userId);
        }

        public IEnumerable<Invoices> GetAllINVRequest(GridDisplayInput gridDisplayInput)
        {
            return m_sharedRepository.GetAllINVRequest(gridDisplayInput);
        }


        public IEnumerable<Customer> GetAllSearchCustomers(string searchKey, int customerCategoryId, int companyId)
        {
            return m_sharedRepository.GetAllSearchCustomers(searchKey, customerCategoryId, companyId);
        }

        public IEnumerable<SupplierCategorys> GetSupplierCategory()
        {
            return m_sharedRepository.GetSupplierCategory();
        }

        public IEnumerable<Suppliers> GetSuppliersByKey(string searchKey, int CategoryId, int companyId)
        {
            return m_sharedRepository.GetSuppliersByKey(searchKey, CategoryId, companyId);
        }

        public IEnumerable<Priority> GetPriorityList()
        {
            return m_sharedRepository.GetPriorityList();
        }

        public IEnumerable<UserProfile> GetUsersByCompany(string userName, int companyId)
        {
            return m_sharedRepository.GetUsersByCompany(userName, companyId);
        }

        public IEnumerable<EngineerList> GetEngineerList(int ticketId)
        {
            return m_sharedRepository.GetEngineerList(ticketId);
        }

        public int WorkFlowRequestStatusUpdate(WorkFlowApproval workFlowApprovals)
        {
            return m_sharedRepository.WorkFlowRequestStatusUpdate(workFlowApprovals);
        }

        public int WorkFlowClarificationReply(WorkFlowApproval requestApproval)
        {
            return m_sharedRepository.WorkFlowClarificationReply(requestApproval);
        }

        public void SendForApproval(WorkFlowParameter workFlowApproval, bool isFromUi)
        {
            m_sharedRepository.SendForApproval(workFlowApproval, isFromUi);
        }

        public IEnumerable<ExpenseTypes> GetExpenseTypes()
        {
            return m_sharedRepository.GetExpenseTypes();
        }

        public IEnumerable<UserRoles> GetUserRoles()
        {
            return m_sharedRepository.GetUserRoles();
        }

        public IEnumerable<SupplierService> GetJobCategory(string searchKey)
        {
            return m_sharedRepository.GetJobCategory(searchKey);
        }

        public IEnumerable<WorkFlowStatuses> GetWorkFlowStatus(int? WorkFlowPrcoessId)
        {
            return m_sharedRepository.GetWorkFlowStatus(WorkFlowPrcoessId);
        }

        public IEnumerable<Locations> GetDepartmentsByCompany(int companyId)
        {
            return m_sharedRepository.GetDepartmentsByCompany(companyId);
        }

        public IEnumerable<Locations> getDepartmentsWorkFlow(int companyId, int processId)
        {
            return m_sharedRepository.getDepartmentsWorkFlow(companyId, processId);
        }

        public IEnumerable<Locations> getUserDepartments(int companyId, int processId, int userId)
        {
            return m_sharedRepository.getUserDepartments(companyId, processId, userId);
        }

        public IEnumerable<Locations> GetUserCompanyDepartments(int companyId, int userId)
        {
            return m_sharedRepository.GetUserCompanyDepartments(companyId, userId);
        }

        public IEnumerable<Locations> GetAllSearchDepartments(string searchKey, int companyId)
        {
            return m_sharedRepository.GetAllSearchDepartments(searchKey, companyId);
        }

        public IEnumerable<ItemCategory> GetItemCategorys(string searchKey)
        {
            return m_sharedRepository.GetItemCategorys(searchKey);
        }

        public IEnumerable<ItemType> GetItemTypes(string searchKey)
        {
            return m_sharedRepository.GetItemTypes(searchKey);
        }

        public IEnumerable<ItemMasters> GetItemMasterName(string searchKey)
        {
            return m_sharedRepository.GetItemMasterName(searchKey);
        }

        public IEnumerable<AccountCode> GetAllSearchServices(string searchKey, int companyId, int categoryId)
        {
            return m_sharedRepository.GetAllSearchServices(searchKey, companyId, categoryId);
        }

        public IEnumerable<AccountCode> GetAccountCodesByCategory(int categoryId, int companyId, string searchkey)
        {
            return m_sharedRepository.GetAccountCodesByCategory(categoryId, companyId, searchkey);
        }
        public IEnumerable<AccountCode> GetAccountCodesBySubCategory(int categoryId, int accountTypeId, int companyId)
        {
            return m_sharedRepository.GetAccountCodesBySubCategory(categoryId, accountTypeId, companyId);
        }

        public IEnumerable<GRNS> GetGRNS(string searchKey, int? companyId, int? statusId)
        {
            return m_sharedRepository.GetGRNS(searchKey, companyId, statusId);
        }

        public IEnumerable<Organization> getOrganizations()
        {
            return m_sharedRepository.getOrganizations();
        }

        public IEnumerable<TaxGroup> GetTaxGroups()
        {
            return m_sharedRepository.GetTaxGroups();
        }

        public IEnumerable<UserProfile> GetAllUsers()
        {
            return m_sharedRepository.GetAllUsers();
        }

        public DashboardCount GetDashboardCount(int CompanyId)
        {
            return m_sharedRepository.GetDashboardCount(CompanyId);
        }

        public IEnumerable<Taxes> GetTaxClassesByTaxGroup(int taxGroupId)
        {
            return m_sharedRepository.GetTaxClassesByTaxGroup(taxGroupId);
        }

        public IEnumerable<BillingFrequency> GetBillingFrequencies()
        {
            return m_sharedRepository.GetBillingFrequencies();
        }

        public IEnumerable<CostCentre> GetCostCentres()
        {
            return m_sharedRepository.GetCostCentres();
        }

        public IEnumerable<ServiceType> GetAllServiceTypes()
        {
            return m_sharedRepository.GetAllServiceTypes();
        }

        public IEnumerable<SupplierSubCode> GetSupplierSubCodes(SupplierSubCode subCode)
        {
            return m_sharedRepository.GetSupplierSubCodes(subCode);
        }

        public CompanyDetails GetCompanyDetails(int companyId)
        {
            return m_sharedRepository.GetCompanyDetails(companyId);

        }

        public List<SupplierContactPerson> GetSupplierContact(int supplierId, int companyId, int purchaseOrderId, int poTYpeId)
        {
            return m_sharedRepository.GetSupplierContact(supplierId, companyId, purchaseOrderId, poTYpeId);
        }

        public IEnumerable<COAAccountType> GetAccountType()
        {
            return m_sharedRepository.GetAccountType();
        }

        public string SupplierVerificationApproval(WorkFlowParameter workFlowApproval)
        {
            return m_sharedRepository.SupplierVerificationApproval(workFlowApproval);
        }
        public IEnumerable<JVACode> getJVACode()
        {
            return m_sharedRepository.getJVACode();
        }
        public void setJVACode(int JVANumber)
        {
            m_sharedRepository.setJVACode(JVANumber);
        }

        public bool CheckIsSupplierVerifier(int userId, int companyId)
        {
            return m_sharedRepository.CheckIsSupplierVerifier(userId, companyId);
        }

        public IEnumerable<UserRoles> GetuserManagementRole(string searchKey)
        {
            return m_sharedRepository.GetuserManagementRole(searchKey);
        }

        public IEnumerable<BillingType> GetBillingTypes()
        {
            return m_sharedRepository.GetBillingTypes();
        }

        public IEnumerable<Companies> GetCompaniesByUserId(int userId)
        {
            return m_sharedRepository.GetCompaniesByUserId(userId);
        }

        public IEnumerable<AccountCode> GetAccountCodesByAccountType(int companyId)
        {
            return m_sharedRepository.GetAccountCodesByAccountType(companyId);
        }

        public IEnumerable<PageAccessLevel> GetRoleAccessLevel(string roleIds)
        {
            return m_sharedRepository.GetRoleAccessLevel(roleIds);
        }
        public IEnumerable<AssetSubCategory> GetAssetSubCategories(int companyId, string searchKey)
        {
            return m_sharedRepository.GetAssetSubCategories(companyId, searchKey);
        }

        public IEnumerable<UserProfile> GetSupplierVerifiers()
        {
            return m_sharedRepository.GetSupplierVerifiers();
        }

        public IEnumerable<UserProfile> GetUsersByCompany(string searchKey, int roleId, int companyId)
        {
            return m_sharedRepository.GetUsersByCompany(searchKey, roleId, companyId);
        }
        public IEnumerable<ItemGLCode> GetGlcodes(int? InvoiceTypeId, int companyId, string searchKey, int PoTypeId, int TypeId, string AccountCodeName, int AccountType, int AccountCodeCategoryId)
        {
            return m_sharedRepository.GetGlcodes(InvoiceTypeId, companyId, searchKey, PoTypeId, TypeId, AccountCodeName, AccountType, AccountCodeCategoryId);
        }

        public IEnumerable<Roles> GetUserRolesByCompany(int userId, int companyId)
        {
            return m_sharedRepository.GetUserRolesByCompany(userId, companyId);
        }
        public IEnumerable<AccountCode> GetExpenseBykey(string serachkey, int companyId)
        {
            return m_sharedRepository.GetExpenseBykey(serachkey, companyId);
        }
        public IEnumerable<Country> GetAllCountries(string searchKey)
        {
            return m_sharedRepository.GetAllCountries(searchKey);
        }
        public void UpdateReadNotifications(int processId, int documentId, int companyId)
        {
            m_sharedRepository.UpdateReadNotifications(processId, documentId, companyId);
        }

        public DocumentAddress GetDocumentAddress(int processId, int documentId, int companyId)
        {
            return m_sharedRepository.GetDocumentAddress(processId, documentId, companyId);
        }
        public IEnumerable<TransactionType> GetTransactionTypes()
        {
            return m_sharedRepository.GetTransactionTypes();
        }

        public IEnumerable<Nationality> GetNationalities()
        {
            return m_sharedRepository.GetNationalities();
        }

        public IEnumerable<AddressType> GetAddressTypes()
        {
            return m_sharedRepository.GetAddressTypes();
        }
    }
}