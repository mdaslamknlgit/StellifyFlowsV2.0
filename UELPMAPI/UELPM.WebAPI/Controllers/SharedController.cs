using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Helpers;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class SharedController : ApiController
    {
        private readonly ISharedManager m_sharedManager;
        public SharedController() { }

        public SharedController(ISharedManager sharedManager)
        {
            m_sharedManager = sharedManager;
        }

        /// <summary>
        /// This method is used to get the list of item masters...
        /// </summary>
        /// <param name="searchKey">searchKey</param>
        /// <returns></returns>

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemMasters")]
        public IHttpActionResult GetItemMasters(int? locationID, int companyId, string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemMasters(locationID, companyId, searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetGlcodes")]
        public IHttpActionResult GetGlcodes(int? InvoiceTypeId, int companyId, string searchKey, int PotypeId, int TypeId, string AccountCodeName, int AccountType, int AccountCodeCategoryId)
        {
            try
            {
                var result = m_sharedManager.GetGlcodes(InvoiceTypeId, companyId, searchKey, PotypeId, TypeId, AccountCodeName, AccountType, AccountCodeCategoryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemMastersbasedLocationID")]
        public IHttpActionResult GetItemMastersbasedLocationID(int? locationId, string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemMastersbasedLocationID(locationId, searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /// <summary>
        /// This method is used to get the list of locations....
        /// </summary>
        /// <param name="searchKey">searchKey</param>
        /// <returns></returns>

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetLocations")]
        public IHttpActionResult GetLocations(string searchKey, int? companyId)
        {
            try
            {
                var result = m_sharedManager.GetLocations(searchKey, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetSupplierCategory")]
        public IHttpActionResult GetSupplierCategory()
        {
            try
            {
                var result = m_sharedManager.GetSupplierCategory();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /// <summary>
        /// This method is used to get the list of suppliers.....
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allsuppliers")]
        public IHttpActionResult GetAllSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAllSuppliers(searchKey, supplierTypeId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getActiveSuppliers")]
        public IHttpActionResult getActiveSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            try
            {
                var result = m_sharedManager.getActiveSuppliers(searchKey, supplierTypeId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                ErrorLog.Log("SharedController", "getActiveSuppliers", "getActiveSuppliers", e.ToString());
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allCountries")]
        public IHttpActionResult GetAllCountries(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetAllCountries(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /// <summary>
        /// This method is used to get the list of suppliers.....
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/otherEntitySuppliers")]
        public IHttpActionResult GetOtherEntitySuppliers(string searchKey, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetOtherEntitySuppliers(searchKey, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetTicketSupplier")]
        public IHttpActionResult GetSuppliersByKey(string searchKey, int CategoryId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetSuppliersByKey(searchKey, CategoryId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetEngineerList/{ticketId}")]
        public IHttpActionResult GetEngineerList(int ticketId)
        {
            try
            {
                var result = m_sharedManager.GetEngineerList(ticketId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allPORequest")]
        public IHttpActionResult GetAllPORequest(string searchKey, int CompanyId)
        {
            try
            {
                var result = m_sharedManager.GetAllPORequest(searchKey, CompanyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allPORequestforQuotation")]
        public IHttpActionResult GetAllPORequestForQuotation(string searchKey, int CompanyId)
        {
            try
            {
                var result = m_sharedManager.GetAllPORequestForQuotation(searchKey, CompanyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allINVRequest")]
        public IHttpActionResult GetAllINVRequest([FromUri] GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = m_sharedManager.GetAllINVRequest(gridDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /// <summary>
        /// this method is used to get the list of currencies...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currencies")]
        public IHttpActionResult GetCurrencies()
        {
            try
            {
                var result = m_sharedManager.GetCurrencies();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemsfortransfer")]
        public IHttpActionResult GetItemsfortransfer(int? locationId, string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemsfortransfer(locationId, searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /// <summary>
        /// This method is used for getting Payment terms
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/paymentTermsList/{CompanyId}")]
        public IHttpActionResult GetPaymentTerms(int CompanyId)
        {
            var result = m_sharedManager.GetPaymentTerms(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetUOMList")]
        public IHttpActionResult GetUOMList()
        {
            var result = m_sharedManager.GetUOMList();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetPriorityList")]
        public IHttpActionResult GetPriorityList()
        {
            var result = m_sharedManager.GetPriorityList();
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetFacilities")]
        public IHttpActionResult GetFacilities(string searchKey, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetFacilities(searchKey, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetCompanies")]
        public IHttpActionResult GetCompanies(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetCompanies(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetCompaniesByUserId")]
        public IHttpActionResult GetCompaniesByUserId(int userId)
        {
            try
            {
                var result = m_sharedManager.GetCompaniesByUserId(userId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getTaxes/{taxClass}")]
        public IHttpActionResult GetTaxes(int taxClass)
        {
            try
            {
                var result = m_sharedManager.GetTaxes(taxClass);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetEngineers")]
        public IHttpActionResult GetEngineers(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetEngineers(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetAllDepartments")]
        public IHttpActionResult GetAllDepartments()
        {
            try
            {
                var result = m_sharedManager.GetAllDepartments();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetAllUniqueDepartments")]
        public IHttpActionResult GetAllUniqueDepartments()
        {
            try
            {
                var result = m_sharedManager.GetAllUniqueDepartments();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getDepartments/{companyId}")]
        public IHttpActionResult GetDepartmentsByCompany(int companyId)
        {
            try
            {
                var result = m_sharedManager.GetDepartmentsByCompany(companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getDepartmentsWorkFlow/{companyId}/{processId}")]
        public IHttpActionResult getDepartmentsWorkFlow(int companyId, int processId)
        {
            try
            {
                var result = m_sharedManager.getDepartmentsWorkFlow(companyId, processId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getUserDepartments/{companyId}/{processId}/{userId}")]
        public IHttpActionResult getUserDepartments(int companyId, int processId,int userId)
        {
            try
            {
                var result = m_sharedManager.getUserDepartments(companyId, processId,userId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to get the user company departments
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetUserCompanyDepartments/{companyId}/{userId}")]
        public IHttpActionResult GetUserCompanyDepartments(int companyId, int userId)
        {
            try
            {
                var result = m_sharedManager.GetUserCompanyDepartments(companyId, userId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to get the list of customers.....
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allSearchDepartments")]
        public IHttpActionResult GetAllSearchDepartments(string searchKey, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAllSearchDepartments(searchKey, companyId);

                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allDeliveryTerms/{companyId}")]
        public IHttpActionResult GetAllDeliveryTerms(int CompanyId)
        {
            try
            {
                var result = m_sharedManager.GetAllDeliveryTerms(CompanyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [Route("api/allAssets")]
        public IHttpActionResult GetAssets(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetAssets(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to get the list of PaymentType....
        /// </summary>
        /// <param name="searchKey">searchKey</param>
        /// <returns></returns>

        [HttpGet]
        [Route("api/GetPaymentType")]
        public IHttpActionResult GetPaymentType()
        {
            try
            {
                var result = m_sharedManager.GetAllPaymentType();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [Route("api/profileImage/{userId}")]
        public IHttpActionResult GetUserProfileImage(int userId)
        {
            try
            {
                var result = m_sharedManager.GetUserProfileImage(userId);

                if (result == null || result.Length == 0)
                {
                    return Ok();
                }
                return Ok(Convert.ToBase64String(result));
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to get the list of customers.....
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/allSearchCustomers")]
        public IHttpActionResult GetAllSearchCustomers(string searchKey, int customerCategoryId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAllSearchCustomers(searchKey, customerCategoryId, companyId);

                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/companyUsers/{userName}/{companyId}")]
        public IHttpActionResult GetUsersByCompany(string userName, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetUsersByCompany(userName, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/workFlowApproval")]
        public IHttpActionResult WorkFlowRequestStatusUpdate(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                var result = m_sharedManager.WorkFlowRequestStatusUpdate(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("SharedController", "WorkFlowRequestStatusUpdate", "", "WorkFlowRequestStatusUpdate", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/workFlowClarificationReply")]
        public IHttpActionResult WorkFlowClarificationReply(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                var result = m_sharedManager.WorkFlowClarificationReply(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("SharedController", "WorkFlowClarificationReply", "", "WorkFlowClarificationReply", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/sendForWorkFlowApproval")]
        public IHttpActionResult SendForApproval([FromBody] WorkFlowParameter workFlowParameter)
        {
            try
            {
                m_sharedManager.UpdateReadNotifications(workFlowParameter.ProcessId, workFlowParameter.DocumentId,workFlowParameter.CompanyId);
                m_sharedManager.SendForApproval(workFlowParameter, true);

                return Ok();
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("SharedController", "sendForWorkFlowApproval", "", "sendForWorkFlowApproval", e.Message);
                throw e;
            }
        }

        [HttpGet]
        [Route("api/expenseTypes")]
        public IHttpActionResult GetExpenseTypes()
        {
            try
            {
                var result = m_sharedManager.GetExpenseTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/Roles")]
        public IHttpActionResult GetUserRoles()
        {
            try
            {
                var result = m_sharedManager.GetUserRoles();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/AllJobCategory")]
        public IHttpActionResult GetJobCategory(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetJobCategory(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/GetItemCategorys")]
        public IHttpActionResult GetItemCategorys(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemCategorys(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetItemMasterName")]
        public IHttpActionResult GetItemMasterName(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemMasterName(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/GetItemTypes")]
        public IHttpActionResult GetItemTypes(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetItemTypes(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/workFlowStatus")]
        public IHttpActionResult GetWorkFlowStatus(int? WorkFlowPrcoessId = null)
        {
            try
            {
                var result = m_sharedManager.GetWorkFlowStatus(WorkFlowPrcoessId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/accountCodes/services")]
        public IHttpActionResult GetAllSearchServices(string searchKey, int companyId, int categoryId)
        {
            try
            {
                var result = m_sharedManager.GetAllSearchServices(searchKey, companyId, categoryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/accountCodes/byCategory")]
        public IHttpActionResult GetAccountCodesByCategory(int categoryId, int companyId, string searchkey)
        {
            try
            {
                var result = m_sharedManager.GetAccountCodesByCategory(categoryId, companyId, searchkey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/accountCodes/bySubCategory")]
        public IHttpActionResult GetAccountCodesBySubCategory(int categoryId, int accountTypeId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAccountCodesBySubCategory(categoryId, accountTypeId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/accountCodes/byType/{companyId}")]
        public IHttpActionResult GetAccountCodesByAccountType(int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAccountCodesByAccountType(companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        [HttpGet]
        [Route("api/GetGRNS")]
        public IHttpActionResult GetGRNS(string searchKey, int? companyId, int? statusId)
        {
            try
            {
                var result = m_sharedManager.GetGRNS(searchKey, companyId, statusId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetTaxGroups")]
        public IHttpActionResult GetTaxGroups()
        {
            var result = m_sharedManager.GetTaxGroups();
            return Ok(result);
        }

        [HttpGet]
        [Route("api/GetOrganizations")]
        public IHttpActionResult GetOrganizations()
        {
            try
            {
                var result = m_sharedManager.getOrganizations();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetAllUsers")]
        public IHttpActionResult GetAllUsers()
        {
            try
            {
                var result = m_sharedManager.GetAllUsers();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetDashboardCount")]
        public IHttpActionResult GetDashboardCount(int CompanyId)
        {
            try
            {
                var result = m_sharedManager.GetDashboardCount(CompanyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/getTaxClasses/{taxGroupId}")]
        public IHttpActionResult GetTaxClassesByTaxGroup(int taxGroupId)
        {
            try
            {
                var result = m_sharedManager.GetTaxClassesByTaxGroup(taxGroupId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetBillingFrequencies")]
        public IHttpActionResult GetBillingFrequencies()
        {
            try
            {
                var result = m_sharedManager.GetBillingFrequencies();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetCostCentres")]
        public IHttpActionResult GetCostCentres()
        {
            try
            {
                var result = m_sharedManager.GetCostCentres();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetAllServiceTypes")]
        public IHttpActionResult GetAllServiceTypes()
        {
            try
            {
                var result = m_sharedManager.GetAllServiceTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/subCodes")]
        public IHttpActionResult GetSupplierSubCodes([FromUri] SupplierSubCode subCode)
        {
            try
            {
                var result = m_sharedManager.GetSupplierSubCodes(subCode);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/getCompany/{companyId}")]
        public IHttpActionResult GetCompanyDetails(int companyId)
        {
            try
            {
                var result = m_sharedManager.GetCompanyDetails(companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/SupplierContact/{supplierId}/{companyId}/{purchaseOrderId}/{poTYpeId}")]
        public IHttpActionResult GetSupplierContact(int supplierId, int companyId, int purchaseOrderId, int poTYpeId)
        {
            try
            {
                var result = m_sharedManager.GetSupplierContact(supplierId, companyId, purchaseOrderId, poTYpeId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/accountTypes")]
        public IHttpActionResult GetAccountType()
        {
            try
            {
                var result = m_sharedManager.GetAccountType();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/supplierVerificationApproval")]
        public IHttpActionResult SupplierVerificationApproval([FromBody] WorkFlowParameter workFlowParameter)
        {
            try
            {
                var result = m_sharedManager.SupplierVerificationApproval(workFlowParameter);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [Route("api/JVACode")]
        public IHttpActionResult GetJVACode()
        {
            try
            {
                var result = m_sharedManager.getJVACode();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpPost]
        [Route("api/setJVACode/{JVANumber}")]
        public IHttpActionResult setJVACode(int JVANumber)
        {
            try
            {

                m_sharedManager.setJVACode(JVANumber);
                return Ok();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/checkIsSupplierVerifier/{userId}/{companyId}")]
        public IHttpActionResult CheckIsSupplierVerifier(int userId, int companyId)
        {
            try
            {
                var result = m_sharedManager.CheckIsSupplierVerifier(userId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetuserManagementRole")]
        public IHttpActionResult GetuserManagementRole(string searchKey)
        {
            try
            {
                var result = m_sharedManager.GetuserManagementRole(searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/billingTypes")]
        public IHttpActionResult GetBillingTypes()
        {
            try
            {
                var result = m_sharedManager.GetBillingTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [Route("api/AssetSubcategories/searchKey")]
        public IHttpActionResult GetAssetSubCategories(string searchKey, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetAssetSubCategories(companyId, searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetRoleAccessLevel/{roleIds}")]
        public IHttpActionResult GetRoleAccessLevel(string roleIds)
        {
            try
            {
                var result = m_sharedManager.GetRoleAccessLevel(roleIds);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/getSupplierVerifiers")]
        public IHttpActionResult GetSupplierVerifiers()
        {
            try
            {
                var result = m_sharedManager.GetSupplierVerifiers();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/getUsersByCompany")]
        public IHttpActionResult GetUsersByCompany(string searchKey, int roleId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetUsersByCompany(searchKey, roleId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/getUserRolesByCompany/{userId}/{companyId}")]
        public IHttpActionResult GetUserRolesByCompany(int userId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetUserRolesByCompany(userId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [Route("api/accountCodes/Expense")]
        public IHttpActionResult GetExpenseBykey(string searchKey, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetExpenseBykey(searchKey, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetDocumentAddress/{processId}/{documentId}/{companyId}")]
        public IHttpActionResult GetDocumentAddress(int processId, int documentId, int companyId)
        {
            try
            {
                var result = m_sharedManager.GetDocumentAddress(processId,documentId,companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetTransactionTypes")]
        public IHttpActionResult GetTransactionTypes()
        {
            try
            {
                var result = m_sharedManager.GetTransactionTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetNationalities")]
        public IHttpActionResult GetNationalities()
        {
            try
            {
                var result = m_sharedManager.GetNationalities();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetAddressTypes")]
        public IHttpActionResult GetAddressTypes()
        {
            try
            {
                var result = m_sharedManager.GetAddressTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
