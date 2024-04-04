using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class FacilityManagementRepository : IFacilityManagementRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public string CreateFacilityManagement(FacilityManagement m_facilityManagement)
        {
            int validateNameStatus = 0;
            string status = "";
            int ownerId = m_facilityManagement.OwnerId;
            int tenantId = m_facilityManagement.TenantId;
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (ownerId == 0)
                    {
                        string customerCode = string.Empty;
                        int customerCount = this.m_dbconnection.QueryFirstOrDefault<int>("Customer_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId= m_facilityManagement.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (customerCount == 0)
                        {
                            customerCount = 1;
                        }
                        else
                        {
                            customerCount += 1;
                        }
                        customerCode = ModuleCodes.Customer;
                        customerCode = customerCode + '-' + customerCount.ToString();
                        ownerId = this.m_dbconnection.Query<int>("Customer_CRUD", new
                        {
                            Action = "INSERT",
                            CustomerId = 0,
                            CompanyId = m_facilityManagement.CompanyId,
                            CustomerName = m_facilityManagement.OwnerName,
                            CustomerShortName = "",
                            CustomerCategoryId = 1,
                            CustomerEmail = m_facilityManagement.OwnerEmail,
                            CustomerCode = customerCode,
                            PaymentTermsId = 3,

                            BillingAddress = m_facilityManagement.OwnerBillingAddress,
                            BillingCity = m_facilityManagement.OwnerCity,
                            BillingCountryId = m_facilityManagement.OwnerBillingCountryId,
                            BillingZipcode = "",
                            BillingTelephone = m_facilityManagement.OwnerContactNo,
                            BillingFax = "",

                            ShippingAddress = "",
                            ShippingCity = "",
                            ShippingCountryId = m_facilityManagement.OwnerBillingCountryId,
                            ShippingZipcode = "",
                            ShippingTelephone = "",
                            ShippingFax = "",
                            TaxId = 47,
                            IsDeleted = 0,
                            Status = 1,
                            Remarks = "",
                            CreatedBy = m_facilityManagement.CreatedBy,
                            CreatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    if (tenantId == 0)
                    {
                        string customerCode = string.Empty;
                        int customerCount = this.m_dbconnection.QueryFirstOrDefault<int>("Customer_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = m_facilityManagement.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (customerCount == 0)
                        {
                            customerCount = 1;
                        }
                        else
                        {
                            customerCount += 1;
                        }
                        customerCode = ModuleCodes.Customer;
                        customerCode = customerCode + '-' + customerCount.ToString();
                        tenantId = this.m_dbconnection.Query<int>("Customer_CRUD", new
                        {
                            Action = "INSERT",
                            CustomerId = 0,
                            CompanyId = m_facilityManagement.CompanyId,
                            CustomerName = m_facilityManagement.TenantName,
                            CustomerShortName = "",
                            CustomerCategoryId = 2,
                            CustomerEmail = m_facilityManagement.TenantEmail,
                            CustomerCode = customerCode,
                            PaymentTermsId = 3,

                            BillingAddress = m_facilityManagement.TenantBillingAddress,
                            BillingCity = m_facilityManagement.TenantCity,
                            BillingCountryId = m_facilityManagement.TenantBillingCountryId,
                            BillingZipcode = "",
                            BillingTelephone = m_facilityManagement.TenantContactNo,
                            BillingFax = "",

                            ShippingAddress = "",
                            ShippingCity = "",
                            ShippingCountryId = m_facilityManagement.TenantBillingCountryId,
                            ShippingZipcode = "",
                            ShippingTelephone = "",
                            ShippingFax = "",
                            TaxId = 47,
                            IsDeleted = 0,
                            Status = 1,
                            Remarks = "",
                            CreatedBy = m_facilityManagement.CreatedBy,
                            CreatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    if (ownerId != 0 && tenantId != 0)
                    {
                        validateNameStatus = this.m_dbconnection.Query<int>("FacilityManagement_CRUD", new
                        {
                            Action = "INSERT",
                            UnitNumber =m_facilityManagement.UnitNumber,
                            CompanyId=m_facilityManagement.CompanyId,
                            OwnerId=ownerId,
                            TenantId=tenantId,
                            IsActive=0,
                            CreatedBy=m_facilityManagement.CreatedBy,
                            CreatedDate=DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public FacilityManagement GetFacilityDetails(int facilityId)
        {
            FacilityManagement facilityManagementObj = new FacilityManagement();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("FacilityManagement_CRUD", new
                {

                    Action = "SELECTBYID",
                    FacilityId = facilityId
                }, commandType: CommandType.StoredProcedure))
                {
                    facilityManagementObj = result.Read<FacilityManagement>().FirstOrDefault();
                    if(facilityManagementObj!=null)
                    {
                        facilityManagementObj.OwnerDetails= result.Read<OwnerCustomer>().FirstOrDefault();
                        facilityManagementObj.TenantDetails = result.Read<TenantCustomer>().FirstOrDefault();
                    }
                    
                }
                return facilityManagementObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<OwnerCustomer> GetOwnerForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            try
            {
                return this.m_dbconnection.Query<OwnerCustomer>("usp_GetCustomerForFacility", new
                {
                    SearchKey = searchKey,
                    CompanyId = CompanyId,
                    CustomerCategoryId = customerCategoryId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<TenantCustomer> GetTenantForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            try
            {
                return this.m_dbconnection.Query<TenantCustomer>("usp_GetCustomerForFacility", new
                {
                    SearchKey = searchKey,
                    CompanyId = CompanyId,
                    CustomerCategoryId = customerCategoryId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string UpdateFacilityManagement(FacilityManagement m_facilityManagement)
        {
            int validateNameStatus = 0;
            string status = "";
            int ownerId = m_facilityManagement.OwnerId;
            int tenantId = m_facilityManagement.TenantId;
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (ownerId == 0)
                    {
                        string customerCode = string.Empty;
                        int customerCount = this.m_dbconnection.QueryFirstOrDefault<int>("Customer_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = m_facilityManagement.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (customerCount == 0)
                        {
                            customerCount = 1;
                        }
                        else
                        {
                            customerCount += 1;
                        }
                        customerCode = ModuleCodes.Customer;
                        customerCode = customerCode + '-' + customerCount.ToString();
                        ownerId = this.m_dbconnection.Query<int>("Customer_CRUD", new
                        {
                            Action = "INSERT",
                            CustomerId = 0,
                            CompanyId = m_facilityManagement.CompanyId,
                            CustomerName = m_facilityManagement.OwnerName,
                            CustomerShortName = "",
                            CustomerCategoryId = 1,
                            CustomerEmail = m_facilityManagement.OwnerEmail,
                            CustomerCode = customerCode,
                            PaymentTermsId = 3,

                            BillingAddress = m_facilityManagement.OwnerBillingAddress,
                            BillingCity = m_facilityManagement.OwnerCity,
                            BillingCountryId = m_facilityManagement.OwnerBillingCountryId,
                            BillingZipcode = "",
                            BillingTelephone = m_facilityManagement.OwnerContactNo,
                            BillingFax = "",

                            ShippingAddress = "",
                            ShippingCity = "",
                            ShippingCountryId = m_facilityManagement.OwnerBillingCountryId,
                            ShippingZipcode = "",
                            ShippingTelephone = "",
                            ShippingFax = "",
                            TaxId = 47,
                            IsDeleted = 0,
                            Status = 1,
                            Remarks = "",
                            CreatedBy = m_facilityManagement.CreatedBy,
                            CreatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    if (tenantId == 0)
                    {
                        string customerCode = string.Empty;
                        int customerCount = this.m_dbconnection.QueryFirstOrDefault<int>("Customer_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = m_facilityManagement.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (customerCount == 0)
                        {
                            customerCount = 1;
                        }
                        else
                        {
                            customerCount += 1;
                        }
                        customerCode = ModuleCodes.Customer;
                        customerCode = customerCode + '-' + customerCount.ToString();
                        tenantId = this.m_dbconnection.Query<int>("Customer_CRUD", new
                        {
                            Action = "INSERT",
                            CustomerId = 0,
                            CompanyId = m_facilityManagement.CompanyId,
                            CustomerName = m_facilityManagement.TenantName,
                            CustomerShortName = "",
                            CustomerCategoryId = 2,
                            CustomerEmail = m_facilityManagement.TenantEmail,
                            CustomerCode = customerCode,
                            PaymentTermsId = 3,

                            BillingAddress = m_facilityManagement.TenantBillingAddress,
                            BillingCity = m_facilityManagement.TenantCity,
                            BillingCountryId = m_facilityManagement.TenantBillingCountryId,
                            BillingZipcode = "",
                            BillingTelephone = m_facilityManagement.TenantContactNo,
                            BillingFax = "",

                            ShippingAddress = "",
                            ShippingCity = "",
                            ShippingCountryId = m_facilityManagement.TenantBillingCountryId,
                            ShippingZipcode = "",
                            ShippingTelephone = "",
                            ShippingFax = "",
                            TaxId = 47,
                            IsDeleted = 0,
                            Status = 1,
                            Remarks = "",
                            CreatedBy = m_facilityManagement.CreatedBy,
                            CreatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    if (ownerId != 0 && tenantId != 0)
                    {
                        validateNameStatus = this.m_dbconnection.Query<int>("FacilityManagement_CRUD", new
                        {
                            Action = "UPDATE",
                            UnitNumber = m_facilityManagement.UnitNumber,
                            FacilityId = m_facilityManagement.FacilityId,
                            OwnerId = ownerId,
                            TenantId = tenantId,
                            IsActive = 0,
                            CreatedBy = m_facilityManagement.CreatedBy,
                            CreatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
            
        }

        public bool DeleteFacilityManagement(int facilityId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("FacilityManagement_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    FacilityId = facilityId,
                                                    ModifiedDate = DateTime.Now
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }


        public FacilityManagementDisplayResult GetFacilityManagement(GridDisplayInput gridDisplayInput)
        {
            try
            {
                FacilityManagementDisplayResult facilitymanagementDisplayResult = new FacilityManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("FacilityManagement_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    facilitymanagementDisplayResult.FacilityManagementList = result.Read<FacilityManagementList>().AsList();
                    facilitymanagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return facilitymanagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public FacilityManagement GetFacilityManagementById(GridDisplayInput gridDisplayInput)
        {
            try
            {

                FacilityManagement facilitymanagementDisplayResult = this.m_dbconnection.Query<FacilityManagement>("FacilityManagement_CRUD", new
                {
                    Action = "SEARCHBYID",
                    FacilityId = gridDisplayInput.FacilityId,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                return facilitymanagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }


        public string ValidateFacilityManagement(ValidateFacilityManagement validateFacilityManagement)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("FacilityManagement_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            FacilityId = validateFacilityManagement.FacilityId,
                                            UnitNumber = validateFacilityManagement.UnitNumber
                                            //OwnerName = validateFacilityManagement.OwnerName
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateunitStatus = result.ReadFirstOrDefault<int>();
                    //int validateownerStatus = result.ReadFirstOrDefault<int>();
                    if (validateunitStatus > 0)
                    {
                        status = "Duplicate UnitNumber";
                    }
                    //else if (validateownerStatus > 0)
                    //{
                    //    status = "Duplicate OwnerName";
                    //}
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        public FacilityManagement GetOwnerDetails(int customerid)
        {
            try
            {
                FacilityManagement facilityManagementObj = new FacilityManagement();
                this.m_dbconnection.Open();
                //var OwnerDetails = this.m_dbconnection.Query<Customer>("FacilityManagement_CRUD", new
                //{
                //    Action = "OWNERDETAILS",
                //    CustomerId = customerid

                //}, commandType: CommandType.StoredProcedure);

                //facilityManagementObj.OwnerDetails = OwnerDetails.FirstOrDefault();

                return facilityManagementObj;

            }
            catch (Exception ex)
            { throw ex; }
        }


    }
}
