using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    [RoutePrefix("api/adhoc")]
    public class AdhocMasterController : ApiController
    {
        private readonly IAdhocMasterManager m_adhocMasterManager;

        public AdhocMasterController(IAdhocMasterManager adhocMasterManager)
        {
            m_adhocMasterManager = adhocMasterManager;
        }
        #region Customer Type
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("CustomerType/GetCustomerTypes")]
        public IHttpActionResult GetCustomerTypes()
        {
            var result = m_adhocMasterManager.GetCustomerTypes();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("CustomerType/GetCustomerTypeById/{Id}")]
        public IHttpActionResult GetCustomerTypeById(int Id)
        {
            var result = m_adhocMasterManager.GetCustomerTypeById(Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("CustomerType/PostCustomerType")]
        public IHttpActionResult PostCustomerType(CustomerType customerType)
        {
            var result = m_adhocMasterManager.PostCustomerType(customerType);
            return Ok(result);
        }
        #endregion

        #region Bank Master
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("BankMaster/GetBanks/{CompanyId}")]
        public IHttpActionResult GetBanks(int CompanyId)
        {
            var result = m_adhocMasterManager.GetBanks(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("BankMaster/GetBankById/{Id}")]
        public IHttpActionResult GetBankById(int Id)
        {
            var result = m_adhocMasterManager.GetBankById(Id);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("BankMaster/GetDefaultBank/{CompanyId}")]
        public IHttpActionResult GetDefaultBank(int CompanyId)
        {
            var result = m_adhocMasterManager.GetDefaultBank(CompanyId);
            return Ok(result);
        }
        [HttpPost]
        [Route("BankMaster/PostBank")]
        public IHttpActionResult PostBank()
        {
            var httpRequest = HttpContext.Current.Request;
            BankMaster bank = JsonConvert.DeserializeObject<BankMaster>(httpRequest.Form["bank"]);
            bank.QRImage = httpRequest.Files;
            var result = m_adhocMasterManager.PostBank(bank);
            return Ok(result);
        }
        #endregion

        #region Email Configuration
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("EmailConfig/GetEmailConfigurations/{CompanyId}")]
        public IHttpActionResult GetEmailConfigurations(int CompanyId)
        {
            var result = m_adhocMasterManager.GetEmailConfigurations(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("EmailConfig/GetEmailConfigurationById/{CompanyId}/{Id}")]
        public IHttpActionResult GetEmailConfigurationById(int CompanyId, int Id)
        {
            var result = m_adhocMasterManager.GetEmailConfigurationById(CompanyId, Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("EmailConfig/PostEmailConfiguration")]
        public IHttpActionResult PostEmailConfiguration(EmailConfiguration emailConfiguration)
        {
            var result = m_adhocMasterManager.PostEmailConfiguration(emailConfiguration);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("EmailConfig/GetEmailConfigProcesses")]
        public IHttpActionResult GetEmailConfigProcesses()
        {
            var result = m_adhocMasterManager.GetEmailConfigProcesses();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("EmailConfig/GetUsers/{CompanyId}/{DepartmentId}")]
        public IHttpActionResult GetUsers(int CompanyId, int DepartmentId)
        {
            var result = m_adhocMasterManager.GetUsers(CompanyId,DepartmentId);
            return Ok(result);
        }
        #endregion

        #region Tenant Type
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TenantType/GetTenantTypes")]
        public IHttpActionResult GetTenantTypes()
        {
            var result = m_adhocMasterManager.GetTenantTypes();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TenantType/GetTenantsById/{Id}")]
        public IHttpActionResult GetTenantsById(int Id)
        {
            var result = m_adhocMasterManager.GetTenantsById(Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("TenantType/PostTenantType")]
        public IHttpActionResult PostTenantType(TenantType tenantType)
        {
            var result = m_adhocMasterManager.PostTenantType(tenantType);
            return Ok(result);
        }
        #endregion

        #region Credit Term
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("CreditTerm/GetCreditTerms/{CompanyId}")]
        public IHttpActionResult GetCreditTerms(int CompanyId)
        {
            var result = m_adhocMasterManager.GetCreditTerms(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("CreditTerm/GetCreditTermById/{Id}")]
        public IHttpActionResult GetCreditTermById(int Id)
        {
            var result = m_adhocMasterManager.GetCreditTermById(Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("CreditTerm/PostCreditTerm")]
        public IHttpActionResult PostCreditTerm(CreditTerm creditTerm)
        {
            var result = m_adhocMasterManager.PostCreditTerm(creditTerm);
            return Ok(result);
        }
        #endregion

        #region Location
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("LocationMaster/GetLocations/{CompanyId}")]
        public IHttpActionResult GetLocations(int CompanyId)
        {
            var result = m_adhocMasterManager.GetLocations(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("LocationMaster/GetLocationById/{Id}")]
        public IHttpActionResult GetLocationById(int Id)
        {
            var result = m_adhocMasterManager.GetLocationById(Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("LocationMaster/PostLocation")]
        public IHttpActionResult PostLocation(Location location)
        {
            var result = m_adhocMasterManager.PostLocation(location);
            return Ok(result);
        }
        #endregion

        #region Tax Group
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxGroup/GetTaxGroups/{CompanyId}")]
        public IHttpActionResult GetTaxGroups(int CompanyId)
        {
            var result = m_adhocMasterManager.GetTaxGroups(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxGroup/GetAssignedTaxGroups/{CompanyId}")]
        public IHttpActionResult GetAssignedTaxGroups(int CompanyId)
        {
            var result = m_adhocMasterManager.GetAssignedTaxGroups(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxGroup/GetTaxGroupById/{Id}")]
        public IHttpActionResult GetTaxGroupById(int Id)
        {
            var result = m_adhocMasterManager.GetTaxGroupById(Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("TaxGroup/PostTaxGroup")]
        public IHttpActionResult PostTaxGroup(SalesTaxGroup taxGroup)
        {
            var result = m_adhocMasterManager.PostTaxGroup(taxGroup);
            return Ok(result);
        }
        #endregion

        #region Tax Master
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxMaster/GetTaxMasters/{CompanyId}")]
        public IHttpActionResult GetTaxMasters(int CompanyId)
        {
            var result = m_adhocMasterManager.GetTaxMasters(CompanyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxMaster/GetTaxMasterById/{CompanyId}/{Id}")]
        public IHttpActionResult GetTaxMasterById(int CompanyId, int Id)
        {
            var result = m_adhocMasterManager.GetTaxMasterById(CompanyId, Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("TaxMaster/PostTaxMaster")]
        public IHttpActionResult PostTaxMaster(TaxMaster taxMaster)
        {
            var result = m_adhocMasterManager.PostTaxMaster(taxMaster);
            return Ok(result);
        }
        #endregion

        #region Tax Type
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxType/GetTaxTypes/{CompanyId}")]
        public IHttpActionResult GetTaxTypes(int CompanyId)
        {
            var result = m_adhocMasterManager.GetTaxTypes(CompanyId);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxType/GetTaxTypesByTaxGroupId/{CompanyId}/{taxGroupId}")]
        public IHttpActionResult GetTaxTypesByTaxGroupId(int CompanyId,int taxGroupId)
        {
            var result = m_adhocMasterManager.GetTaxTypes(CompanyId);
            if(result!=null)
            {
                var res = result.Where(x => x.TaxGroup.TaxGroupId == taxGroupId).ToList();
                return Ok(res);
            }
            return Ok();
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("TaxType/GetTaxTypeById/{CompanyId}/{Id}")]
        public IHttpActionResult GetTaxTypeById(int CompanyId, int Id)
        {
            var result = m_adhocMasterManager.GetTaxTypeById(CompanyId, Id);
            return Ok(result);
        }

        [HttpPost]
        [Route("TaxType/PostTaxType")]
        public IHttpActionResult PostTaxType(TaxType taxType)
        {
            var result = m_adhocMasterManager.PostTaxType(taxType);
            return Ok(result);
        }
        #endregion

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("ChangeMasterProcessStatus")]
        public IHttpActionResult ChangeMasterProcessStatus(MasterProcess masterProcess)
        {
            try
            {
                var result = m_adhocMasterManager.ChangeMasterProcessStatus(masterProcess);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("ChangeDefault")]
        public IHttpActionResult ChangeDefault(MasterProcess masterProcess)
        {
            try
            {
                var result = m_adhocMasterManager.ChangeDefault(masterProcess);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
