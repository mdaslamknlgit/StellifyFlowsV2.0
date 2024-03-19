using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;

namespace UELPM.Service.Repositories
{
    public class AdhocMasterRepository : IAdhocMasterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        private AuditLogRepository logRepository = null;
        UserProfileRepository userProfileRepository = null;
        static string SP_Name_CustomerType = "Sp_CustomerType_CRUD";
        static string SP_Name_CreditTerm = "Sp_CreditTerm_CRUD";
        static string SP_Name_Location = "Sp_Location_CRUD";
        static string SP_Name_BankMaster = "Sp_BankMaster_CRUD";
        static string SP_Name_TenantTypeMaster = "Sp_TenantType_CRUD";
        static string SP_Name_TaxGroup = "Sp_TaxGroup_CRUD";
        static string SP_Name_TaxMaster = "Sp_TaxMaster_CRUD";
        static string SP_Name_TaxType = "Sp_TaxType_CRUD";
        static string SP_Name_EmailConfig = "Sp_EmailConfig_CRUD";
        static string SP_Name_CustomerMaster = "sp_CUSTOMER_CRUD";
        public AdhocMasterRepository()
        {
            logRepository = new AuditLogRepository();
            userProfileRepository = new UserProfileRepository();
        }
        #region Customer Type
        public IEnumerable<CustomerType> GetCustomerTypes()
        {
            try
            {
                return this.m_dbconnection.Query<CustomerType>(SP_Name_CustomerType, new
                {
                    Action = "SELECT_ALL"
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public CustomerType GetCustomerTypeById(int CustomerTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<CustomerType>(SP_Name_CustomerType, new
                {
                    Action = "SELECT_BY_ID",
                    CustomerTypeId = CustomerTypeId,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostCustomerType(CustomerType customerType)
        {
            if (!this.CheckDuplicate(customerType))
            {
                if (customerType.CustomerTypeId == 0)
                    return this.CreateCustomerType(customerType);

                else
                    return this.UpdateCustomerType(customerType);
            }
            return -1;
        }
        public int CreateCustomerType(CustomerType customerType)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        customerType.CustomerTypeId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_CustomerType, new
                        {
                            Action = "INSERT",
                            CustomerTypeName = customerType.CustomerTypeName,
                            Description = customerType.Description,
                            CreatedBy = customerType.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(customerType.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = customerType.CustomerTypeId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.CustomerType.ToString(),
                            Method = MasterProcessTypes.CustomerType.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return customerType.CustomerTypeId;
        }
        public int UpdateCustomerType(CustomerType customerType)
        {
            this.m_dbconnection.Open();
            CustomerType _old = this.GetCustomerTypeById(customerType.CustomerTypeId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_CustomerType, new
                    {
                        Action = "UPDATE",
                        CustomerTypeId = customerType.CustomerTypeId,
                        CustomerTypeName = customerType.CustomerTypeName,
                        Description = customerType.Description,
                        UpdatedBy = customerType.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, customerType, MasterProcessTypes.CustomerType);
                    var user = userProfileRepository.GetUserById(customerType.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = customerType.CustomerTypeId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.CustomerType.ToString(),
                        Method = MasterProcessTypes.CustomerType.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return customerType.CustomerTypeId;
            }
        }
        private bool CheckDuplicate(CustomerType customerType)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_CustomerType, new
            {
                Action = "CHECK_DUPLICATE",
                CustomerTypeId = customerType.CustomerTypeId,
                CustomerTypeName = customerType.CustomerTypeName,
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Bank Master
        public IEnumerable<BankMaster> GetBanks(int CompanyId)
        {
            try
            {
                return this.m_dbconnection.Query<BankMaster>(SP_Name_BankMaster, new
                {
                    Action = "SELECT_ALL",
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public BankMaster GetBankById(int id)
        {
            try
            {
                var bank = this.m_dbconnection.Query<BankMaster>(SP_Name_BankMaster, new
                {
                    Action = "SELECT_BY_ID",
                    BankMasterId = id,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                return bank;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public BankMaster GetDefaultBank(int CompanyId)
        {
            try
            {
                var bank = this.m_dbconnection.Query<BankMaster>(SP_Name_BankMaster, new
                {
                    Action = "SELECT_BY_DEFAULT",
                    CompanyId = CompanyId,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                return bank;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostBank(BankMaster bank)
        {
            if (!this.CheckDuplicate(bank))
            {
                if (bank.BankMasterId == 0)
                    return this.CreateBankMaster(bank);

                else
                    return this.UpdateBankMaster(bank);
            }
            return -1;
        }
        private int CreateBankMaster(BankMaster bank)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.SaveQRImage(bank);
                        bank.BankMasterId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_BankMaster, new
                        {
                            Action = "INSERT",
                            CompanyId = bank.CompanyId,
                            BankName = bank.BankName,
                            BankACNo = bank.BankACNo,
                            SwiftCode = bank.SwiftCode,
                            BankCode = bank.BankCode,
                            BranchCode = bank.BranchCode,
                            Misc1Information = bank.Misc1Information,
                            Misc2Information = bank.Misc2Information,
                            ImageSource = bank.ImageSource,
                            CreatedBy = bank.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(bank.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = bank.BankMasterId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.BankMaster.ToString(),
                            Method = MasterProcessTypes.BankMaster.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception ex)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return bank.BankMasterId;
        }

        private BankMaster SaveQRImage(BankMaster bank)
        {
            try
            {
                if (bank.QRImage.Count > 0)
                {
                    FileOperations fileOperationsObj = new FileOperations();
                    bank.ImageSource = fileOperationsObj.SaveBankQRCode(bank);
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return bank;
        }

        private int UpdateBankMaster(BankMaster bank)
        {
            this.m_dbconnection.Open();
            BankMaster _old = this.GetBankById(bank.BankMasterId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.SaveQRImage(bank);
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_BankMaster, new
                    {
                        Action = "UPDATE",
                        BankMasterId = bank.BankMasterId,
                        BankName = bank.BankName,
                        BankACNo = bank.BankACNo,
                        SwiftCode = bank.SwiftCode,
                        BankCode = bank.BankCode,
                        BranchCode = bank.BranchCode,
                        Misc1Information = bank.Misc1Information,
                        Misc2Information = bank.Misc2Information,
                        ImageSource = bank.ImageSource,
                        UpdatedBy = bank.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, bank, MasterProcessTypes.BankMaster);
                    var user = userProfileRepository.GetUserById(bank.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = bank.BankMasterId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.BankMaster.ToString(),
                        Method = MasterProcessTypes.BankMaster.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return bank.BankMasterId;
            }
        }
        private bool CheckDuplicate(BankMaster bank)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_BankMaster, new
            {
                Action = "CHECK_DUPLICATE",
                BankMasterId = bank.BankMasterId,
                BankCode = bank.BankCode,
                CompanyId = bank.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Email Configuration
        public EmailConfiguration GetEmailConfigurationById(int companyId, int id)
        {
            try
            {
                var configs = this.GetEmailConfigurations(companyId);
                var config = configs.Where(x => x.EmailConfigId == id).FirstOrDefault();
                return config;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostEmailConfiguration(EmailConfiguration emailConfiguration)
        {
            if (!this.CheckDuplicate(emailConfiguration))
            {
                if (emailConfiguration.EmailConfigId == 0)
                    return this.CreateEmailConfiguration(emailConfiguration);

                else
                    return this.UpdateEmailConfiguration(emailConfiguration);
            }
            return -1;
        }
        private int CreateEmailConfiguration(EmailConfiguration emailConfiguration)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        emailConfiguration.EmailConfigId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_EmailConfig, new
                        {
                            Action = "INSERT",
                            CompanyId = emailConfiguration.CompanyId,
                            ProcessId = emailConfiguration.ProcessType.ProcessId,
                            LocationID = emailConfiguration.Department.LocationID,
                            GroupEmail = emailConfiguration.GroupEmail,
                            CreatedBy = emailConfiguration.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                        this.InsertConfigUsers(emailConfiguration, transactionObj);

                        var user = userProfileRepository.GetUserById(emailConfiguration.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = emailConfiguration.EmailConfigId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.EmailConfiguration.ToString(),
                            Method = MasterProcessTypes.EmailConfiguration.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception ex)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return emailConfiguration.EmailConfigId;
        }
        private int InsertConfigUsers(EmailConfiguration emailConfiguration, IDbTransaction transactionObj)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var record in emailConfiguration.Users)
            {
                var itemObj = new DynamicParameters();
                itemObj.Add("@Action", "INSERT_USERS", DbType.String, ParameterDirection.Input);
                itemObj.Add("@EmailConfigId", emailConfiguration.EmailConfigId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@UserId", record.UserId, DbType.Int32, ParameterDirection.Input);
                itemToAdd.Add(itemObj);
            }
            return this.m_dbconnection.Execute(SP_Name_EmailConfig, itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }
        private int UpdateEmailConfiguration(EmailConfiguration emailConfiguration)
        {
            this.m_dbconnection.Open();
            EmailConfiguration _old = this.GetEmailConfigurationById(emailConfiguration.CompanyId, emailConfiguration.EmailConfigId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_EmailConfig, new
                    {
                        Action = "UPDATE",
                        EmailConfigId = emailConfiguration.EmailConfigId,
                        ProcessId = emailConfiguration.ProcessType.ProcessId,
                        LocationID = emailConfiguration.Department.LocationID,
                        GroupEmail = emailConfiguration.GroupEmail,
                        UpdatedBy = emailConfiguration.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    this.DeleteConfigUsers(emailConfiguration.EmailConfigId, transactionObj);
                    this.InsertConfigUsers(emailConfiguration, transactionObj);
                    var changes = logRepository.CheckMasterAuditTrail(_old, emailConfiguration, MasterProcessTypes.EmailConfiguration);
                    var user = userProfileRepository.GetUserById(emailConfiguration.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = emailConfiguration.EmailConfigId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.EmailConfiguration.ToString(),
                        Method = MasterProcessTypes.EmailConfiguration.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return emailConfiguration.EmailConfigId;
            }
        }

        private void DeleteConfigUsers(int emailConfigId, IDbTransaction transactionObj)
        {
            this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_EmailConfig, new
            {
                Action = "DELETE_USERS",
                EmailConfigId = emailConfigId
            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }

        public IEnumerable<EmailConfiguration> GetEmailConfigurations(int companyId)
        {
            try
            {
                var lookup = new Dictionary<int, EmailConfiguration>();
                this.m_dbconnection.Query<EmailConfiguration, EmailConfigProcess, Locations, UserEmail, EmailConfiguration>(SP_Name_EmailConfig, (c, p, l, e) =>
                  {
                      EmailConfiguration taxType;
                      if (!lookup.TryGetValue(c.EmailConfigId, out taxType))
                      {
                          lookup.Add(c.EmailConfigId, taxType = c);
                      }
                      taxType.ProcessType = p;
                      taxType.Department = l;
                      taxType.Users.Add(e);
                      return taxType;
                  }, new
                  {
                      Action = "SELECT_ALL",
                      CompanyId = companyId
                  }, commandType: CommandType.StoredProcedure, splitOn: "EmailConfigId,ProcessId,LocationID,UserId").AsQueryable();
                var resultList = lookup.Values;
                return resultList;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<EmailConfigProcess> GetEmailConfigProcesses()
        {
            try
            {
                return this.m_dbconnection.Query<EmailConfigProcess>(SP_Name_EmailConfig, new
                {
                    Action = "SELECT_PROCESS"
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<UserEmail> GetUsers(int CompanyId, int DepartmentId)
        {
            try
            {
                return this.m_dbconnection.Query<UserEmail>(SP_Name_EmailConfig, new
                {
                    Action = "SELECT_USERS",
                    CompanyId = CompanyId,
                    LocationId = DepartmentId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        private bool CheckDuplicate(EmailConfiguration emailConfiguration)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_EmailConfig, new
            {
                Action = "CHECK_DUPLICATE",
                EmailConfigId = emailConfiguration.EmailConfigId,
                LocationID = emailConfiguration.Department.LocationID,
                ProcessId = emailConfiguration.ProcessType.ProcessId,
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Tenant Type
        public IEnumerable<TenantType> GetTenantTypes()
        {
            try
            {
                return this.m_dbconnection.Query<TenantType>(SP_Name_TenantTypeMaster, new
                {
                    Action = "SELECT_ALL"
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public TenantType GetTenantsById(int id)
        {
            try
            {
                return this.m_dbconnection.Query<TenantType>(SP_Name_TenantTypeMaster, new
                {
                    Action = "SELECT_BY_ID",
                    TenantTypeId = id,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostTenantType(TenantType tenantType)
        {
            if (!this.CheckDuplicate(tenantType))
            {
                if (tenantType.TenantTypeId == 0)
                    return this.CreateTenantType(tenantType);

                else
                    return this.UpdateTenantType(tenantType);
            }
            return -1;
        }
        private int CreateTenantType(TenantType tenantType)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        tenantType.TenantTypeId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TenantTypeMaster, new
                        {
                            Action = "INSERT",
                            TenantTypeName = tenantType.TenantTypeName,
                            Description = tenantType.Description,
                            CreatedBy = tenantType.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(tenantType.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = tenantType.TenantTypeId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.TenantType.ToString(),
                            Method = MasterProcessTypes.TenantType.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception ex)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return tenantType.TenantTypeId;
        }
        private int UpdateTenantType(TenantType tenantType)
        {
            this.m_dbconnection.Open();
            TenantType _old = this.GetTenantsById(tenantType.TenantTypeId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TenantTypeMaster, new
                    {
                        Action = "UPDATE",
                        TenantTypeId = tenantType.TenantTypeId,
                        TenantTypeName = tenantType.TenantTypeName,
                        Description = tenantType.Description,
                        UpdatedBy = tenantType.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, tenantType, MasterProcessTypes.TenantType);
                    var user = userProfileRepository.GetUserById(tenantType.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = tenantType.TenantTypeId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.TenantType.ToString(),
                        Method = MasterProcessTypes.TenantType.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return tenantType.TenantTypeId;
            }
        }
        private bool CheckDuplicate(TenantType tenantType)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_TenantTypeMaster, new
            {
                Action = "CHECK_DUPLICATE",
                TenantTypeId = tenantType.TenantTypeId,
                TenantTypeName = tenantType.TenantTypeName,
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Credit Term
        public IEnumerable<CreditTerm> GetCreditTerms(int CompanyId)
        {
            try
            {
                return this.m_dbconnection.Query<CreditTerm>(SP_Name_CreditTerm, new
                {
                    Action = "SELECT_ALL",
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public CreditTerm GetCreditTermById(int CreditTermTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<CreditTerm>(SP_Name_CreditTerm, new
                {
                    Action = "SELECT_BY_ID",
                    CreditTermId = CreditTermTypeId,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostCreditTerm(CreditTerm creditTerm)
        {
            if (!this.CheckDuplicate(creditTerm))
            {
                if (creditTerm.CreditTermId == 0)
                    return this.CreateCreditTerm(creditTerm);

                else
                    return this.UpdateCreditTerm(creditTerm);
            }
            return -1;
        }
        public int CreateCreditTerm(CreditTerm creditTerm)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        creditTerm.CreditTermId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_CreditTerm, new
                        {
                            Action = "INSERT",
                            CompanyId = creditTerm.CompanyId,
                            CreditTermCode = creditTerm.CreditTermCode,
                            NoOfDays = creditTerm.NoOfDays,
                            Description = creditTerm.Description,
                            CreatedBy = creditTerm.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(creditTerm.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = creditTerm.CreditTermId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.CreditTerm.ToString(),
                            Method = MasterProcessTypes.CreditTerm.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return creditTerm.CreditTermId;
        }
        public int UpdateCreditTerm(CreditTerm creditTerm)
        {
            this.m_dbconnection.Open();
            CreditTerm _old = this.GetCreditTermById(creditTerm.CreditTermId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_CreditTerm, new
                    {
                        Action = "UPDATE",
                        CreditTermId = creditTerm.CreditTermId,
                        CreditTermCode = creditTerm.CreditTermCode,
                        NoOfDays = creditTerm.NoOfDays,
                        Description = creditTerm.Description,
                        UpdatedBy = creditTerm.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, creditTerm, MasterProcessTypes.CreditTerm);
                    var user = userProfileRepository.GetUserById(creditTerm.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = creditTerm.CreditTermId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.CreditTerm.ToString(),
                        Method = MasterProcessTypes.CreditTerm.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return creditTerm.CreditTermId;
            }
        }
        private bool CheckDuplicate(CreditTerm creditTerm)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_CreditTerm, new
            {
                Action = "CHECK_DUPLICATE",
                CreditTermId = creditTerm.CreditTermId,
                CreditTermCode = creditTerm.CreditTermCode,
                CompanyId = creditTerm.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Location
        public IEnumerable<Location> GetLocations(int CompanyId)
        {
            try
            {
                return this.m_dbconnection.Query<Location>(SP_Name_Location, new
                {
                    Action = "SELECT_ALL",
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public Location GetLocationById(int LocationId)
        {
            try
            {
                return this.m_dbconnection.Query<Location>(SP_Name_Location, new
                {
                    Action = "SELECT_BY_ID",
                    LocationId = LocationId,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostLocation(Location Location)
        {
            if (!this.CheckDuplicate(Location))
            {
                if (Location.LocationId == 0)
                    return this.CreateLocation(Location);

                else
                    return this.UpdateLocation(Location);
            }
            return -1;
        }
        public int CreateLocation(Location Location)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        Location.LocationId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_Location, new
                        {
                            Action = "INSERT",
                            CompanyId = Location.CompanyId,
                            LocationName = Location.LocationName,
                            Description = Location.Description,
                            CreatedBy = Location.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(Location.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = Location.LocationId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.Location.ToString(),
                            Method = MasterProcessTypes.Location.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return Location.LocationId;
        }
        public int UpdateLocation(Location location)
        {
            this.m_dbconnection.Open();
            Location _old = this.GetLocationById(location.LocationId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_Location, new
                    {
                        Action = "UPDATE",
                        LocationId = location.LocationId,
                        LocationName = location.LocationName,
                        Description = location.Description,
                        UpdatedBy = location.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, location, MasterProcessTypes.Location);
                    var user = userProfileRepository.GetUserById(location.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = location.LocationId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.Location.ToString(),
                        Method = MasterProcessTypes.Location.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return location.LocationId;
            }
        }
        private bool CheckDuplicate(Location Location)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_Location, new
            {
                Action = "CHECK_DUPLICATE",
                LocationId = Location.LocationId,
                LocationName = Location.LocationName,
                CompanyId = Location.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Tax Group
        public IEnumerable<SalesTaxGroup> GetTaxGroups(int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<SalesTaxGroup>(SP_Name_TaxGroup, new
                {
                    Action = "SELECT_ALL",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<SalesTaxGroup> GetAssignedTaxGroups(int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<SalesTaxGroup>(SP_Name_TaxGroup, new
                {
                    Action = "SELECT_ASSIGNED_ALL",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public SalesTaxGroup GetTaxGroupById(int TaxGroupId)
        {
            try
            {
                return this.m_dbconnection.Query<SalesTaxGroup>(SP_Name_TaxGroup, new
                {
                    Action = "SELECT_BY_ID",
                    TaxGroupId = TaxGroupId,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostTaxGroup(SalesTaxGroup taxGroup)
        {
            if (!this.CheckDuplicate(taxGroup))
            {
                if (taxGroup.TaxGroupId == 0)
                    return this.CreateTaxGroup(taxGroup);

                else
                    return this.UpdateTaxGroup(taxGroup);
            }
            return -1;
        }
        public int CreateTaxGroup(SalesTaxGroup taxGroup)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        taxGroup.TaxGroupId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxGroup, new
                        {
                            Action = "INSERT",
                            CompanyId = taxGroup.CompanyId,
                            TaxGroupName = taxGroup.TaxGroupName,
                            Description = taxGroup.Description,
                            CreatedBy = taxGroup.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(taxGroup.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = taxGroup.TaxGroupId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.TaxGroup.ToString(),
                            Method = MasterProcessTypes.TaxGroup.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return taxGroup.TaxGroupId;
        }
        public int UpdateTaxGroup(SalesTaxGroup taxGroup)
        {
            this.m_dbconnection.Open();
            SalesTaxGroup _old = this.GetTaxGroupById(taxGroup.TaxGroupId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxGroup, new
                    {
                        Action = "UPDATE",
                        TaxGroupId = taxGroup.TaxGroupId,
                        TaxGroupName = taxGroup.TaxGroupName,
                        Description = taxGroup.Description,
                        UpdatedBy = taxGroup.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, taxGroup, MasterProcessTypes.TaxGroup);
                    var user = userProfileRepository.GetUserById(taxGroup.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = taxGroup.TaxGroupId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.TaxGroup.ToString(),
                        Method = MasterProcessTypes.TaxGroup.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return taxGroup.TaxGroupId;
            }
        }
        private bool CheckDuplicate(SalesTaxGroup taxGroup)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_TaxGroup, new
            {
                Action = "CHECK_DUPLICATE",
                TaxGroupId = taxGroup.TaxGroupId,
                TaxGroupName = taxGroup.TaxGroupName,
                CompanyId = taxGroup.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Tax Master
        public IEnumerable<TaxMaster> GetTaxMasters(int companyId)
        {
            try
            {
                var lookup = new Dictionary<int, TaxMaster>();
                this.m_dbconnection.Query<TaxMaster, SalesTaxGroup, TransactionType, TaxMaster>(SP_Name_TaxMaster, (c, tg, tm) =>
                 {
                     TaxMaster taxMaster;
                     if (!lookup.TryGetValue(c.TaxMasterId, out taxMaster))
                     {
                         lookup.Add(c.TaxMasterId, taxMaster = c);
                     }
                     taxMaster.TransactionType = tm;
                     taxMaster.TaxGroup = tg;
                     return taxMaster;
                 }, new
                 {
                     Action = "SELECT_ALL",
                     CompanyId = companyId
                 }, commandType: CommandType.StoredProcedure, splitOn: "TaxMasterId,TaxGroupId,TransactionTypeId").AsQueryable();
                var resultList = lookup.Values;
                return resultList;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public TaxMaster GetTaxMasterById(int CompanyId, int taxMasterId)
        {
            try
            {
                var taxMasters = this.GetTaxMasters(CompanyId);
                var taxMaster = taxMasters.Where(x => x.TaxMasterId == taxMasterId).FirstOrDefault();
                return taxMaster;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostTaxMaster(TaxMaster taxMaster)
        {
            if (!this.CheckDuplicate(taxMaster))
            {
                if (taxMaster.TaxMasterId == 0)
                    return this.CreateTaxMaster(taxMaster);

                else
                    return this.UpdateTaxMaster(taxMaster);
            }
            return -1;
        }
        public int CreateTaxMaster(TaxMaster taxMaster)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        taxMaster.TaxMasterId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxMaster, new
                        {
                            Action = "INSERT",
                            TaxGroupId = taxMaster.TaxGroup.TaxGroupId,
                            TransactionTypeId = taxMaster.TransactionType.TransactionTypeId,
                            TaxName = taxMaster.TaxName,
                            CreatedBy = taxMaster.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(taxMaster.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = taxMaster.TaxMasterId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.TaxMaster.ToString(),
                            Method = MasterProcessTypes.TaxMaster.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return taxMaster.TaxMasterId;
        }
        public int UpdateTaxMaster(TaxMaster taxMaster)
        {
            this.m_dbconnection.Open();
            TaxMaster _old = this.GetTaxMasterById(taxMaster.TaxGroup.CompanyId, taxMaster.TaxMasterId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxMaster, new
                    {
                        Action = "UPDATE",
                        TaxMasterId = taxMaster.TaxMasterId,
                        TaxGroupId = taxMaster.TaxGroup.TaxGroupId,
                        TaxName = taxMaster.TaxName,
                        UpdatedBy = taxMaster.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, taxMaster, MasterProcessTypes.TaxMaster);
                    var user = userProfileRepository.GetUserById(taxMaster.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = taxMaster.TaxMasterId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.TaxMaster.ToString(),
                        Method = MasterProcessTypes.TaxMaster.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return taxMaster.TaxMasterId;
            }
        }
        private bool CheckDuplicate(TaxMaster taxMaster)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_TaxMaster, new
            {
                Action = "CHECK_DUPLICATE",
                TaxMasterId = taxMaster.TaxMasterId,
                TaxGroupId = taxMaster.TaxGroup.TaxGroupId,
                CompanyId = taxMaster.TaxGroup.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        #region Tax Type
        public IEnumerable<TaxType> GetTaxTypes(int companyId)
        {
            try
            {
                var lookup = new Dictionary<int, TaxType>();
                this.m_dbconnection.Query<TaxType, SalesTaxGroup, TaxType>(SP_Name_TaxType, (c, tg) =>
                {
                    TaxType taxType;
                    if (!lookup.TryGetValue(c.TaxTypeId, out taxType))
                    {
                        lookup.Add(c.TaxTypeId, taxType = c);
                    }
                    taxType.TaxGroup = tg;
                    return taxType;
                }, new
                {
                    Action = "SELECT_ALL",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, splitOn: "TaxTypeId,TaxGroupId").AsQueryable();
                var resultList = lookup.Values;
                return resultList;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public TaxType GetTaxTypeById(int CompanyId, int taxTypeId)
        {
            try
            {
                var taxTypes = this.GetTaxTypes(CompanyId);
                var taxType = taxTypes.Where(x => x.TaxTypeId == taxTypeId).FirstOrDefault();
                return taxType;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostTaxType(TaxType taxType)
        {
            if (!this.CheckDuplicate(taxType))
            {
                if (taxType.TaxTypeId == 0)
                    return this.CreateTaxType(taxType);

                else
                    return this.UpdateTaxType(taxType);
            }
            return -1;
        }
        public int CreateTaxType(TaxType taxType)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        taxType.TaxTypeId = this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxType, new
                        {
                            Action = "INSERT",
                            TaxTypeName = taxType.TaxTypeName,
                            TaxPercentage = taxType.TaxPercentage,
                            TaxGroupId = taxType.TaxGroup.TaxGroupId,
                            TaxClass = taxType.TaxClass,
                            CreatedBy = taxType.CreatedBy
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        var user = userProfileRepository.GetUserById(taxType.CreatedBy);
                        this.logRepository.PostAuditLog(new AuditLogData
                        {
                            Action = "INSERT",
                            DocumentId = taxType.TaxTypeId,
                            Message = string.Format("Created by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                            PageName = MasterProcessTypes.TaxType.ToString(),
                            Method = MasterProcessTypes.TaxType.ToString()
                        }, transactionObj, m_dbconnection);
                        transactionObj.Commit();
                    }
                    catch (Exception e)
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return taxType.TaxTypeId;
        }
        public int UpdateTaxType(TaxType taxType)
        {
            this.m_dbconnection.Open();
            TaxType _old = this.GetTaxTypeById(taxType.TaxGroup.CompanyId, taxType.TaxTypeId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.QueryFirstOrDefault<int>(SP_Name_TaxType, new
                    {
                        Action = "UPDATE",
                        TaxTypeId = taxType.TaxTypeId,
                        TaxTypeName = taxType.TaxTypeName,
                        TaxPercentage = taxType.TaxPercentage,
                        TaxGroupId = taxType.TaxGroup.TaxGroupId,
                        TaxClass = taxType.TaxClass,
                        UpdatedBy = taxType.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    var changes = logRepository.CheckMasterAuditTrail(_old, taxType, MasterProcessTypes.TaxType);
                    var user = userProfileRepository.GetUserById(taxType.UpdatedBy);
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "UPDATE",
                        DocumentId = taxType.TaxTypeId,
                        Message = string.Format("Updated by {0} {1} on {2}", user.FirstName, user.LastName, DateTime.Now),
                        PageName = MasterProcessTypes.TaxType.ToString(),
                        Method = MasterProcessTypes.TaxType.ToString(),
                        Changes = changes
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return taxType.TaxTypeId;
            }
        }
        private bool CheckDuplicate(TaxType TaxType)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_TaxType, new
            {
                Action = "CHECK_DUPLICATE",
                TaxTypeId = TaxType.TaxTypeId,
                TaxGroupId = TaxType.TaxGroup.TaxGroupId,
                TaxClass = TaxType.TaxClass,
                CompanyId = TaxType.TaxGroup.CompanyId
            }, commandType: CommandType.StoredProcedure);
            return count;
        }
        #endregion

        public bool ChangeMasterProcessStatus(MasterProcess masterProcess)
        {
            bool IsChanged = false;
            this.m_dbconnection.Open();
            string SP_NAME = getProcessSPName(masterProcess.ProcessId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    DynamicParameters dynamicParameters = new DynamicParameters();
                    dynamicParameters.AddDynamicParams(new { Action = "CHANGE_STATUS" });
                    dynamicParameters.AddDynamicParams(new { IsActive = masterProcess.Status });
                    dynamicParameters.AddDynamicParams(new { DocumentId = masterProcess.DocumentId });
                    if (masterProcess.IsDefault)
                        dynamicParameters.AddDynamicParams(new { IsDefault = masterProcess.IsDefault });
                    this.m_dbconnection.Execute(SP_NAME, dynamicParameters, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    if (userProfileRepository == null)
                        userProfileRepository = new UserProfileRepository();
                    var user = userProfileRepository.GetUserById(masterProcess.UserId);
                    if (logRepository == null)
                        logRepository = new AuditLogRepository();
                    string status = masterProcess.Status ? "Activated" : "Deactivated";
                    status = string.Format("{0} {1}", status, masterProcess.IsDefault ? " and removed default " : "");
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "Status_Change",
                        DocumentId = masterProcess.DocumentId,
                        Message = string.Format("{0} by {1} {2} on {3}{4}", status, user.FirstName, user.LastName, DateTime.Now, string.IsNullOrEmpty(masterProcess.Remarks) ? "" : " Remarks : " + masterProcess.Remarks),
                        PageName = Enum.GetName(typeof(MasterProcessTypes), masterProcess.ProcessId),
                        Method = Enum.GetName(typeof(MasterProcessTypes), masterProcess.ProcessId)
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                    IsChanged = true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return IsChanged;
            }
        }

        private string getProcessSPName(int processId)
        {
            string returnValue = string.Empty;
            switch (processId)
            {
                case (int)MasterProcessTypes.CustomerType:
                    returnValue = SP_Name_CustomerType;
                    break;
                case (int)MasterProcessTypes.BankMaster:
                    returnValue = SP_Name_BankMaster;
                    break;
                case (int)MasterProcessTypes.Location:
                    returnValue = SP_Name_Location;
                    break;
                case (int)MasterProcessTypes.CreditTerm:
                    returnValue = SP_Name_CreditTerm;
                    break;
                case (int)MasterProcessTypes.TaxGroup:
                    returnValue = SP_Name_TaxGroup;
                    break;
                case (int)MasterProcessTypes.TaxMaster:
                    returnValue = SP_Name_TaxMaster;
                    break;
                case (int)MasterProcessTypes.TaxType:
                    returnValue = SP_Name_TaxType;
                    break;
                case (int)MasterProcessTypes.TenantType:
                    returnValue = SP_Name_TenantTypeMaster;
                    break;
                case (int)MasterProcessTypes.CustomerMaster:
                    returnValue = SP_Name_CustomerMaster;
                    break;
                default:
                    break;
            }
            return returnValue;
        }

        public bool ChangeDefault(MasterProcess masterProcess)
        {
            bool IsChanged = false;
            string SP_NAME = getProcessSPName(masterProcess.ProcessId);
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.Execute(SP_NAME, new
                    {
                        Action = "CHANGE_DEFAULT",
                        IsDefault = masterProcess.IsDefault,
                        DocumentId = masterProcess.DocumentId
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    if (userProfileRepository == null)
                        userProfileRepository = new UserProfileRepository();
                    var user = userProfileRepository.GetUserById(masterProcess.UserId);
                    if (logRepository == null)
                        logRepository = new AuditLogRepository();
                    this.logRepository.PostAuditLog(new AuditLogData
                    {
                        Action = "Default_Change",
                        DocumentId = masterProcess.DocumentId,
                        Message = string.Format("{0} by {1} {2} on {3}", masterProcess.IsDefault ? "Set to Default" : "Default removed", user.FirstName, user.LastName, DateTime.Now),
                        PageName = Enum.GetName(typeof(MasterProcessTypes), masterProcess.ProcessId),
                        Method = Enum.GetName(typeof(MasterProcessTypes), masterProcess.ProcessId)
                    }, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                    IsChanged = true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                }
                return IsChanged;
            }
        }
    }
}