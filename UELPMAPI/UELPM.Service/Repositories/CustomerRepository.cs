using Dapper;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        static string SP_Name_Customer = "sp_CUSTOMER_CRUD";
        AuditLogRepository auditLogRepository = null;
        SharedRepository sharedRepository = null;
        GenericRepository genericRepository = null;
        AdhocMasterRepository adhocMasterRepository = null;
        public CustomerRepository()
        {
            auditLogRepository = new AuditLogRepository();
            genericRepository = new GenericRepository();
            sharedRepository = new SharedRepository();
            adhocMasterRepository = new AdhocMasterRepository();
        }
        public IEnumerable<SalesCustomerGrid> GetCustomers(SalesCustomerSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesCustomerGrid>(SP_Name_Customer, new
                {
                    Action = "SELECT_ALL",
                    IsApprovalPage = search.IsApprovalPage,
                    UserId = search.UserId,
                    CompanyId = search.CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
                if (search.FetchFilterData && result.Count > 0)
                {
                    if (search.FetchApproved)
                    {
                        result = result.Where(x => x.Status.ToLower() == "approved").ToList();
                    }
                    if (search.CustomerTypeId > 0)
                    {
                        result = result.Where(x => x.CustomerTypeId == search.CustomerTypeId).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(search.SearchTerm))
                    {
                        result = result.Where(x => x.CustomerName.ToLower().IndexOf(search.SearchTerm.ToLower()) >= 0).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(search.CustomerName))
                    {
                        result = result.Where(x => x.CustomerName.ToLower().IndexOf(search.CustomerName.ToLower()) > -1).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(search.CustomerId))
                    {
                        result = result.Where(x => x.CustomerId.ToLower().IndexOf(search.CustomerId.ToLower()) > -1).ToList();
                    }
                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public SalesCustomer GetCustomer(int customerId)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesCustomer>();
                var lookupSCA = new Dictionary<int, SalesCustomerAddress>();
                var lookupSCC = new Dictionary<int, SalesCustomerContact>();
                this.m_dbconnection.Query<SalesCustomer>(SP_Name_Customer, new[]
                {
                    typeof(SalesCustomer),
                    typeof(SalesCustomerAddress),
                    typeof(AddressType),
                    typeof(Country),
                    typeof(SalesCustomerContact),
                    typeof(Nationality),
                    typeof(CreditTerm),
                    typeof(Currency),
                    typeof(CustomerType),
                    typeof(Locations),
                    typeof(TenantType),
                    typeof(SalesTaxGroup),
                    typeof(TaxType),
                    typeof(WorkFlowStatuses),
                    typeof(User),
                    typeof(User),
                    typeof(TaxMaster)
                }
                , obj =>
                {
                    var sc = (SalesCustomer)obj[0];
                    var sca = (SalesCustomerAddress)obj[1];
                    var at = (AddressType)obj[2];
                    var c = (Country)obj[3];
                    var scc = (SalesCustomerContact)obj[4];
                    var n = (Nationality)obj[5];
                    var ct = (CreditTerm)obj[6];
                    var cu = (Currency)obj[7];
                    var cut = (CustomerType)obj[8];
                    var l = (Locations)obj[9];
                    var t = (TenantType)obj[10];
                    var tg = (SalesTaxGroup)obj[11];
                    var ttt = (TaxType)obj[12];
                    var w = (WorkFlowStatuses)obj[13];
                    var u = (User)obj[14];
                    var u2 = (User)obj[15];
                    var tm = (TaxMaster)obj[16];
                    SalesCustomer customer;
                    SalesCustomerAddress customerAddress;
                    SalesCustomerContact customerContact;
                    if (!lookupSC.TryGetValue(sc.CustomerIPSId, out customer))
                    {
                        lookupSC.Add(sc.CustomerIPSId, customer = sc);
                        customer.CreditTerm = ct;
                        customer.Currency = cu;
                        customer.CustomerType = cut;
                        customer.Department = l;
                        customer.TenantType = t;
                        customer.TaxGroup = tg;
                        customer.TaxType = ttt;
                        customer.WorkflowStatus = w;
                        customer.CreatedBy = u;
                        customer.CurrentApprover = u2;
                        customer.TaxMaster = tm;
                    }
                    if (!lookupSCA.TryGetValue(sca.CustomerAddressId, out customerAddress))
                    {
                        lookupSCA.Add(sca.CustomerAddressId, customerAddress = sca);
                        sca.Country = c;
                        sca.AddressType = at;
                        customer.CustomerAddresses.Add(sca);
                    }
                    if (scc != null && !lookupSCC.TryGetValue(scc.CustomerContactId, out customerContact))
                    {
                        lookupSCC.Add(scc.CustomerContactId, customerContact = scc);
                        scc.Nationality = n;
                        customer.CustomerContacts.Add(scc);
                    }
                    return customer;
                }, new
                {
                    Action = "SELECT_BY_ID",
                    CustomerIPSId = customerId
                }, commandType: CommandType.StoredProcedure,
                splitOn: "CustomerIPSId,AddressTypeId,Id,CustomerContactId,NationalityId,CreditTermId,Id,CustomerTypeId,LocationID,TenantTypeId,TaxGroupId,TaxTypeId,WorkFlowStatusid,UserID,UserID,TaxMasterId").AsQueryable();
                var response = lookupSC.Values.FirstOrDefault();
                response.ButtonPreferences = Util.ButtonPreference.ButtonStatus.SetStatus(response.WorkflowStatus.WorkFlowStatusid);
                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = response.CustomerIPSId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.CustomerMaster)
                }, commandType: CommandType.StoredProcedure);
                response.Attachments = attachments.ToList();
                if (customerId > 0 && response != null)
                {
                    response.WorkFlowComments = new List<WorkflowAuditTrail>();
                    response.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = response.CustomerIPSId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.CustomerMaster),
                        DocumentUserId = response.CreatedBy.UserID,
                        UserId = Convert.ToInt32(response.CreatedBy.UserID)
                    }).ToList();
                    if (response.WorkFlowComments != null)
                    {
                        if (response.WorkflowStatus.WorkFlowStatusid == Convert.ToInt32(WorkFlowStatus.CancelDraft))
                        {
                            response.Reason = response.WorkFlowComments.FirstOrDefault().Remarks;
                        }
                        else if (response.WorkflowStatus.WorkFlowStatusid == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            response.Reason = response.WorkFlowComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                    }
                }
                return response;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostCustomer(SalesCustomer salesCustomer)
        {
            int _customerIPSID = salesCustomer.CustomerIPSId == 0 ? salesCustomer.MasterCustomerIPSId : salesCustomer.CustomerIPSId;
            SalesCustomer _old = _customerIPSID == 0 ? new SalesCustomer() : this.GetCustomer(_customerIPSID);
            if (salesCustomer.MasterCustomerIPSId > 0 || !this.CheckDuplicate(salesCustomer))
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (salesCustomer.CustomerIPSId == 0 && salesCustomer.MasterCustomerIPSId == 0)
                        {
                            var _documentData = new ProjectDocument
                            {
                                CompanyId = salesCustomer.CompanyId,
                                DocumentCode = "10000",
                                DocumentTypeId = (int)WorkFlowProcessTypes.CustomerMaster
                            };
                            salesCustomer.SystemNo = genericRepository.GenerateDocumentCode(_documentData, transactionObj, m_dbconnection);
                        }
                        else if (salesCustomer.CustomerIPSId == 0 && salesCustomer.MasterCustomerIPSId > 0)
                        {
                            salesCustomer.CustomerIPSId = this.ReverifyCustomer(salesCustomer, transactionObj);
                        }
                        salesCustomer.CustomerIPSId = this.PostCustomerMaster(salesCustomer, transactionObj);
                        PostCustomerAddress(salesCustomer, transactionObj);
                        PostCustomerContact(salesCustomer, transactionObj);
                        SaveFiles(salesCustomer, transactionObj);
                        if (_customerIPSID == 0 && salesCustomer.MasterCustomerIPSId == 0)
                        {
                            genericRepository.InsertDocumentWFStatus(new WorkFlowParameter
                            {
                                DocumentId = salesCustomer.CustomerIPSId,
                                ProcessId = (int)WorkFlowProcessTypes.CustomerMaster,
                                WorkFlowStatusId = salesCustomer.WorkflowStatus.WorkFlowStatusid
                            }, m_dbconnection, transactionObj);
                            auditLogRepository.LogSaveDocument(new AuditLogData
                            {
                                DocumentId = salesCustomer.CustomerIPSId,
                                PageName = WorkFlowProcessTypes.CustomerMaster.ToString(),
                                Logger = salesCustomer.CreatedBy.UserID,
                                Action = "SAVE",
                                CompanyId = salesCustomer.CompanyId,
                            }, transactionObj, m_dbconnection);
                        }
                        WorkFlowParameter workFlowParameter = new WorkFlowParameter
                        {
                            CompanyId = salesCustomer.CompanyId,
                            DocumentCode = salesCustomer.DocumentCode,
                            DocumentId = salesCustomer.CustomerIPSId,
                            ProcessId = (int)WorkFlowProcessTypes.CustomerMaster,
                            Value = salesCustomer.CreditLimit.ToString(),
                            LocationId = salesCustomer.Department.LocationID,
                            UserID = salesCustomer.CreatedBy.UserID,
                            WorkFlowStatusId = (int)WorkFlowStatus.ApprovalInProgress
                        };
                        if (salesCustomer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.SendForApproval)
                        {
                            genericRepository.SendDocument(workFlowParameter, transactionObj, m_dbconnection);
                        }
                        if (salesCustomer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.ApprovalInProgress)
                        {
                            genericRepository.ModifyWorkflow(workFlowParameter, transactionObj, m_dbconnection);
                        }
                        if (salesCustomer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved)
                        {
                            auditLogRepository.LogVerifyDocument(_old, salesCustomer, new WorkFlowApproval
                            {
                                DocumentId = salesCustomer.CustomerIPSId,
                                ProcessId = (int)WorkFlowProcessTypes.CustomerMaster,
                                UserId = salesCustomer.UpdatedBy.UserID,
                                CompanyId = salesCustomer.CompanyId
                            }, transactionObj, m_dbconnection);
                        }
                        transactionObj.Commit();
                        return salesCustomer.CustomerIPSId;
                    }
                    catch (Exception e)
                    {
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            return -1;
        }
        private int ReverifyCustomer(SalesCustomer salesCustomer, IDbTransaction transactionObj)
        {
            return this.m_dbconnection.Query<int>(SP_Name_Customer, new
            {
                Action = "REVERIFY_CUSTOMER",
                CompanyId = salesCustomer.CompanyId,
                MasterCustomerIPSId = salesCustomer.MasterCustomerIPSId
            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
        }
        private void SaveFiles(SalesCustomer salesCustomer, IDbTransaction transactionObj)
        {
            FileSave fileSave = new FileSave
            {
                CompanyName = "UEL",
                ModuleName = AttachmentFolderNames.CustomerMaster,
                Files = salesCustomer.files,
                UniqueId = Convert.ToString(salesCustomer.CustomerIPSId),
                UploadUser = salesCustomer.CreatedBy
            };
            this.sharedRepository.UploadAttachments(fileSave, this.m_dbconnection, transactionObj);
        }
        private int PostCustomerMaster(SalesCustomer salesCustomer, IDbTransaction transactionObj)
        {
            return this.m_dbconnection.Query<int>(SP_Name_Customer, new
            {
                Action = salesCustomer.CustomerIPSId == 0 ? "INSERT_CUSTOMER" : "UPDATE_CUSTOMER",
                CustomerIPSId = salesCustomer.CustomerIPSId,
                CompanyId = salesCustomer.CompanyId,
                CustomerTypeId = salesCustomer.CustomerType.CustomerTypeId,
                CustomerName = salesCustomer.CustomerName,
                ShortName = salesCustomer.ShortName,
                CustomerId = salesCustomer.CustomerId,
                SystemNo = salesCustomer.SystemNo,
                TenantTypeId = salesCustomer.TenantType != null ? salesCustomer.TenantType.TenantTypeId : (int?)null,
                DepartmentId = salesCustomer.Department.LocationID,
                CreditTermId = salesCustomer.CreditTerm.CreditTermId,
                CurrencyId = salesCustomer.Currency.Id,
                Remarks = salesCustomer.Remarks,
                TypeOfBusiness = salesCustomer.TypeOfBusiness,
                URL = salesCustomer.URL,
                ROC = salesCustomer.ROC,
                RateType = salesCustomer.RateType,
                AccountSetId = salesCustomer.AccountSetId,
                TaxGroupId = salesCustomer.TaxGroup != null ? salesCustomer.TaxGroup.TaxGroupId : (int?)null,
                TaxTypeId = salesCustomer.TaxType != null ? salesCustomer.TaxType.TaxTypeId : (int?)null,
                CreditLimit = salesCustomer.CreditLimit,
                BankCode = salesCustomer.BankCode,
                GLAccount = salesCustomer.GLAccount,
                MasterCustomerIPSId = salesCustomer.MasterCustomerIPSId,
                WorkFlowStatusId = salesCustomer.WorkflowStatus.WorkFlowStatusid,
                UserId = salesCustomer.CustomerIPSId == 0 ? salesCustomer.CreatedBy.UserID : salesCustomer.UpdatedBy.UserID,
                UpdatedDate = salesCustomer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved ? DateTime.Now : (DateTime?)null
            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
        }
        private void PostCustomerAddress(SalesCustomer salesCustomer, IDbTransaction transactionObj)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var item in salesCustomer.CustomerAddresses)
            {
                var param = new DynamicParameters();
                param.Add("@Action", item.CustomerAddressId == 0 ? "INSERT_CUSTOMER_ADDRESS" : "UPDATE_CUSTOMER_ADDRESS", DbType.String, ParameterDirection.Input);
                param.Add("@CustomerIPSId", salesCustomer.CustomerIPSId, DbType.Int32, ParameterDirection.Input);
                param.Add("@CustomerAddressId", item.CustomerAddressId, DbType.Int32, ParameterDirection.Input);
                param.Add("@AddressTypeId", item.AddressType.AddressTypeId, DbType.Int32, ParameterDirection.Input);
                param.Add("@AddressLine1", item.AddressLine1, DbType.String, ParameterDirection.Input);
                param.Add("@AddressLine2", item.AddressLine2, DbType.String, ParameterDirection.Input);
                param.Add("@AddressLine3", item.AddressLine3, DbType.String, ParameterDirection.Input);
                param.Add("@Telephone", item.Telephone, DbType.String, ParameterDirection.Input);
                param.Add("@Fax", item.Fax, DbType.String, ParameterDirection.Input);
                param.Add("@CountryId", item.Country.Id, DbType.Int32, ParameterDirection.Input);
                param.Add("@City", item.City, DbType.String, ParameterDirection.Input);
                param.Add("@PostalCode", item.PostalCode, DbType.String, ParameterDirection.Input);
                param.Add("@Email", item.Email, DbType.String, ParameterDirection.Input);
                param.Add("@Attention", item.Attention, DbType.String, ParameterDirection.Input);
                itemToAdd.Add(param);
            }
            this.m_dbconnection.Execute(SP_Name_Customer, itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }
        private void PostCustomerContact(SalesCustomer salesCustomer, IDbTransaction transactionObj)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var item in salesCustomer.CustomerContacts)
            {
                var param = new DynamicParameters();
                param.Add("@Action", item.CustomerContactId == 0 ? "INSERT_CUSTOMER_CONTACT" : "UPDATE_CUSTOMER_CONTACT", DbType.String, ParameterDirection.Input);
                param.Add("@CustomerIPSId", salesCustomer.CustomerIPSId, DbType.Int32, ParameterDirection.Input);
                param.Add("@CustomerContactId", item.CustomerContactId, DbType.Int32, ParameterDirection.Input);
                param.Add("@Name", item.Name, DbType.String, ParameterDirection.Input);
                param.Add("@NationalityId", item.Nationality != null ? item.Nationality.NationalityId : (int?)null, DbType.Int32, ParameterDirection.Input);
                param.Add("@ContactNo", item.ContactNo, DbType.String, ParameterDirection.Input);
                param.Add("@Purpose", item.Purpose, DbType.String, ParameterDirection.Input);
                param.Add("@Designation", item.Designation, DbType.String, ParameterDirection.Input);
                param.Add("@NRICPassportNo", item.NRICPassportNo, DbType.String, ParameterDirection.Input);
                param.Add("@Email", item.Email, DbType.String, ParameterDirection.Input);
                param.Add("@IsDefault", item.IsDefault, DbType.Boolean, ParameterDirection.Input);
                itemToAdd.Add(param);
            }
            this.m_dbconnection.Execute(SP_Name_Customer, itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }
        private bool CheckDuplicate(SalesCustomer salesCustomer)
        {
            bool count = false;
            if (salesCustomer.CustomerId != "")
                count = this.m_dbconnection.ExecuteScalar<bool>(SP_Name_Customer, new
                {
                    Action = "CHECK_DUPLICATE",
                    CustomerIPSId = salesCustomer.CustomerIPSId,
                    CompanyId = salesCustomer.CompanyId,
                    CustomerId = salesCustomer.CustomerId,
                    MasterCustomerIPSId = salesCustomer.MasterCustomerIPSId
                }, commandType: CommandType.StoredProcedure);
            return count;
        }
        public SalesCustomer GetCustomerEmailData(int documentId, IDbConnection connection, IDbTransaction transaction)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesCustomer>();
                connection.Query<SalesCustomer>(SP_Name_Customer, new[]
                {
                    typeof(SalesCustomer),
                    typeof(WorkFlowStatuses),
                    typeof(CustomerType)
                }
                , obj =>
                {
                    var sc = (SalesCustomer)obj[0];
                    var w = (WorkFlowStatuses)obj[1];
                    var ct = (CustomerType)obj[2];
                    SalesCustomer customer;
                    if (!lookupSC.TryGetValue(sc.CustomerIPSId, out customer))
                    {
                        lookupSC.Add(sc.CustomerIPSId, customer = sc);
                        customer.WorkflowStatus = w;
                        customer.CustomerType = ct;
                    }
                    return customer;
                }, new
                {
                    Action = "GET_EMAIL_DATA",
                    CustomerIPSId = documentId
                }, transaction: transaction, commandType: CommandType.StoredProcedure,
                splitOn: "CustomerIPSId,WorkflowStatusId,CustomerTypeId").AsQueryable();
                return lookupSC.Values.FirstOrDefault();
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        public List<CustomerExcel> UploadCustomers(string filePath, int companyId)
        {
            List<CustomerExcel> customers = new List<CustomerExcel>();
            try
            {
                FileStream fs;
                fs = File.Open(filePath, FileMode.Open, FileAccess.Read);
                var excelReader = new ExcelReader(fs);
                IEnumerable<DataRow> customerMaster = excelReader.GetData("Customer Master");
                IEnumerable<DataRow> customerAddress = excelReader.GetData("Customer Address");
                IEnumerable<DataRow> customerContact = excelReader.GetData("Customer Contact");

                foreach (var row in customerMaster)
                {
                    CustomerExcel customer = new CustomerExcel
                    {
                        CustomerType = row["CustomerType"].ToString(),
                        CustomerName = row["CustomerName"].ToString(),
                        ShortName = row["ShortName"].ToString(),
                        CustomerId = row["CustomerId"].ToString(),
                        TypeOfTenant = row["TypeOfTenant"].ToString(),
                        Department = row["Department"].ToString(),
                        CreditTerm = row["CreditTerm"].ToString(),
                        CurrencyCode = row["CurrencyCode"].ToString(),
                        Remarks = row["Remarks"].ToString(),
                        TypeOfBusiness = row["TypeOfBusiness"].ToString(),
                        URL = row["URL"].ToString(),
                        ROC = row["ROC"].ToString(),
                        RateType = row["RateType"].ToString(),
                        AccountSetId = row["AccountSetId"].ToString(),
                        TaxGroup = row["TaxGroup"].ToString(),
                        TaxClass = row["TaxClass"].ToString(),
                        CreditLimit = row["CreditLimit"].ToString(),
                        BankCode = row["BankCode"].ToString(),
                        GLAccount = row["GLAccount"].ToString()
                    };
                    var addresses = customerAddress.Where(x => x["CustomerId"].ToString() == customer.CustomerId).ToList();
                    var contacts = customerContact.Where(x => x["CustomerId"].ToString() == customer.CustomerId).ToList();
                    foreach (var address in addresses)
                    {
                        customer.CustomerAddresses.Add(new CustomerAddressExcel
                        {
                            AddressType = address["AddressType"].ToString(),
                            AddressLine1 = address["AddressLine1"].ToString(),
                            AddressLine2 = address["AddressLine2"].ToString(),
                            AddressLine3 = address["AddressLine3"].ToString(),
                            City = address["City"].ToString(),
                            Country = address["Country"].ToString(),
                            Fax = address["Fax"].ToString(),
                            Attention = address["Attention"].ToString(),
                            Email = address["Email"].ToString(),
                            PostalCode = address["PostalCode"].ToString(),
                            Telephone = address["Telephone"].ToString()
                        });
                    }
                    foreach (var contact in contacts)
                    {
                        customer.CustomerContacts.Add(new CustomerContactExcel
                        {
                            Name = contact["Name"].ToString(),
                            ContactNo = contact["ContactNo"].ToString(),
                            Designation = contact["Designation"].ToString(),
                            Email = contact["Email"].ToString(),
                            IsDefault = string.IsNullOrEmpty(contact["IsDefault"].ToString()) ? "" : contact["IsDefault"].ToString().ToLower() == "yes" ? "YES" : "NO",
                            Nationality = contact["Nationality"].ToString(),
                            NRICPassportNo = contact["NRICPassportNo"].ToString(),
                            Purpose = contact["Purpose"].ToString()
                        });
                    }
                    customers.Add(customer);
                }
                return ValidateCustomer(customers, "validate", companyId);
            }
            catch (Exception ex)
            {
                return new List<CustomerExcel>();
            }
        }

        private List<CustomerExcel> ValidateCustomer(List<CustomerExcel> customers, string type, int companyId)
        {
            IEnumerable<CustomerType> customerTypes = this.adhocMasterRepository.GetCustomerTypes();
            IEnumerable<CreditTerm> creditTerms = this.adhocMasterRepository.GetCreditTerms(companyId);
            IEnumerable<SalesTaxGroup> taxGroups = this.adhocMasterRepository.GetTaxGroups(companyId);
            IEnumerable<Currency> currencies = this.sharedRepository.GetCurrencies();
            IEnumerable<TenantType> tenantTypes = this.adhocMasterRepository.GetTenantTypes();
            IEnumerable<Locations> depts = this.sharedRepository.GetDepartmentsByCompany(companyId);
            IEnumerable<AddressType> addressTypes = this.sharedRepository.GetAddressTypes();
            IEnumerable<Country> countries = this.sharedRepository.GetAllCountries(string.Empty);
            IEnumerable<Nationality> nationalities = this.sharedRepository.GetNationalities();

            foreach (CustomerExcel item in customers)
            {
                #region Master validation
                SalesTaxGroup tg = taxGroups.FirstOrDefault(x => x.TaxGroupName == item.TaxGroup);
                IEnumerable<TaxType> tt = this.adhocMasterRepository.GetTaxTypes(companyId);
                item.Errors = new List<string>();
                if (string.IsNullOrEmpty(item.CustomerType))
                    item.Errors.Add("Customer type is required");
                else
                    if (customerTypes.FirstOrDefault(x => x.CustomerTypeName.ToLower() == item.CustomerType.ToLower()) == null)
                    item.Errors.Add("Invalid Customer type");

                if (string.IsNullOrEmpty(item.CustomerName))
                    item.Errors.Add("Customer Name is required");

                if (string.IsNullOrEmpty(item.CustomerId))
                    item.Errors.Add("Customer Id is required");
                else
                    if (CheckDuplicate(new SalesCustomer { CustomerId = item.CustomerId, CompanyId = companyId }))
                    item.Errors.Add("Duplicate Customer Id");

                if (string.IsNullOrEmpty(item.Department))
                    item.Errors.Add("Department is required");
                else
                    if (depts.FirstOrDefault(x => x.Name.ToLower() == item.Department.ToLower()) == null)
                    item.Errors.Add("Invalid Department");

                if (string.IsNullOrEmpty(item.CreditTerm))
                    item.Errors.Add("Credit Term is required");
                else
                    if (creditTerms.FirstOrDefault(x => x.NoOfDays == Convert.ToInt32(item.CreditTerm)) == null)
                    item.Errors.Add("Invalid Credit Term");

                if (string.IsNullOrEmpty(item.CurrencyCode))
                    item.Errors.Add("Currency Code is required");
                else
                    if (currencies.FirstOrDefault(x => x.Code.ToLower() == item.CurrencyCode.ToLower()) == null)
                    item.Errors.Add("Invalid Currency Code");

                if (string.IsNullOrEmpty(item.TaxGroup))
                    item.Errors.Add("Tax Group is required");
                else
                    if (tg == null)
                    item.Errors.Add("Invalid Tax Group");

                if (string.IsNullOrEmpty(item.TaxClass))
                    item.Errors.Add("Tax Class is required");
                else
                    if (tt.FirstOrDefault(x => x.TaxClass == Convert.ToInt32(item.TaxClass)) == null)
                    item.Errors.Add("Invalid Tax Class");

                if (string.IsNullOrEmpty(item.RateType))
                    item.Errors.Add("Rate Type is required");

                if (string.IsNullOrEmpty(item.AccountSetId))
                    item.Errors.Add("Account Set Id is required");

                if (string.IsNullOrEmpty(item.BankCode))
                    item.Errors.Add("BankCode is required");

                if (string.IsNullOrEmpty(item.GLAccount))
                    item.Errors.Add("GLAccount is required");
                #endregion
                #region Address Validation
                if (item.CustomerAddresses.Count == 0)
                    item.Errors.Add("Provide the Address Details");
                else
                    foreach (var addr in item.CustomerAddresses)
                    {
                        if (string.IsNullOrEmpty(addr.AddressType))
                            item.Errors.Add("Address type is required");
                        else if (addressTypes.FirstOrDefault(x => x.AddressTypeName.ToLower() == addr.AddressType.ToLower()) == null)
                            item.Errors.Add("Invalid Address type");

                        if (string.IsNullOrEmpty(addr.AddressLine1))
                            item.Errors.Add("Address Line 1 is required");
                        if (string.IsNullOrEmpty(addr.AddressLine2))
                            item.Errors.Add("Address Line 2 is required");
                        if (string.IsNullOrEmpty(addr.Telephone))
                            item.Errors.Add("Telephone is required");
                        if (string.IsNullOrEmpty(addr.Country))
                            item.Errors.Add("Country is required");
                        else if (countries.FirstOrDefault(x => x.Name.ToLower() == addr.Country.ToLower()) == null)
                            item.Errors.Add("Invalid Country");
                        if (string.IsNullOrEmpty(addr.PostalCode))
                            item.Errors.Add("Postal Code is required");
                    }
                #endregion
                #region Contact validation
                foreach (var contact in item.CustomerContacts)
                {
                    if (string.IsNullOrEmpty(contact.Name))
                        item.Errors.Add("Contact Name is Required");
                    if (string.IsNullOrEmpty(contact.Email))
                        item.Errors.Add("Contact Email is Required");
                    if (string.IsNullOrEmpty(contact.IsDefault))
                        item.Errors.Add("Default Contact is Required");
                }
                int count = item.CustomerContacts.Where(x => x.IsDefault.ToLower() == "yes" || x.IsDefault.ToLower() == "true").Count();
                if (item.CustomerContacts.Count > 0 && count == 0)
                    item.Errors.Add("Atlease one Default Contact is required");
                if (count > 1)
                    item.Errors.Add("More than one Default Contact is not allowed");
                #endregion
            }
            return customers;
        }

        public bool PostCustomers(string filePath, int userId, int companyId)
        {
            bool IsImported = false;
            List<CustomerExcel> customers = new List<CustomerExcel>();
            IEnumerable<CustomerType> customerTypes = this.adhocMasterRepository.GetCustomerTypes();
            IEnumerable<CreditTerm> creditTerms = this.adhocMasterRepository.GetCreditTerms(companyId);
            IEnumerable<SalesTaxGroup> taxGroups = this.adhocMasterRepository.GetTaxGroups(companyId);
            IEnumerable<Currency> currencies = this.sharedRepository.GetCurrencies();
            IEnumerable<TenantType> tenantTypes = this.adhocMasterRepository.GetTenantTypes();
            IEnumerable<Locations> depts = this.sharedRepository.GetDepartmentsByCompany(companyId);
            IEnumerable<AddressType> addressTypes = this.sharedRepository.GetAddressTypes();
            IEnumerable<Country> countries = this.sharedRepository.GetAllCountries(string.Empty);
            IEnumerable<Nationality> nationalities = this.sharedRepository.GetNationalities();
            string json = File.ReadAllText(filePath);
            customers = JsonConvert.DeserializeObject<List<CustomerExcel>>(json);
            this.m_dbconnection.Open();
            using (var transaction = this.m_dbconnection.BeginTransaction())
            {
                try
                {

                    foreach (var item in customers)
                    {
                        List<SalesCustomerAddress> addresses = new List<SalesCustomerAddress>();
                        List<SalesCustomerContact> contacts = new List<SalesCustomerContact>();
                        SalesTaxGroup tg = taxGroups.FirstOrDefault(x => x.TaxGroupName == item.TaxGroup);
                        IEnumerable<TaxType> tt = this.adhocMasterRepository.GetTaxTypes(companyId);
                        SalesCustomer customer = new SalesCustomer
                        {
                            CustomerId = item.CustomerId,
                            CustomerName = item.CustomerName,
                            CustomerType = customerTypes.FirstOrDefault(x => x.CustomerTypeName == item.CustomerType),
                            Currency = currencies.FirstOrDefault(x => x.Code == item.CurrencyCode),
                            AccountSetId = item.AccountSetId,
                            URL = item.URL,
                            TypeOfBusiness = item.TypeOfBusiness,
                            CreditLimit = string.IsNullOrEmpty(item.CreditLimit) ? 0 : Convert.ToInt32(item.CreditLimit),
                            BankCode = item.BankCode,
                            CreditTerm = creditTerms.FirstOrDefault(x => x.NoOfDays.ToString() == item.CreditTerm),
                            GLAccount = item.GLAccount,
                            RateType = item.RateType,
                            TaxGroup = tg,
                            TaxType = tt.FirstOrDefault(x => x.TaxClass == Convert.ToInt32(item.TaxClass)),
                            CompanyId = companyId,
                            ROC = item.ROC,
                            ShortName = item.ShortName,
                            Department = depts.FirstOrDefault(x => x.Name == item.Department),
                            TenantType = string.IsNullOrEmpty(item.TypeOfTenant) ? null : tenantTypes.FirstOrDefault(x => x.TenantTypeName == item.TypeOfTenant),
                            CustomerAddresses = addresses,
                            CustomerContacts = contacts,
                            Remarks = item.Remarks,
                            WorkflowStatus = new WorkFlowStatuses
                            {
                                WorkFlowStatusid = (int)WorkFlowStatus.Approved
                            },
                            SystemNo = genericRepository.GenerateDocumentCode(new ProjectDocument
                            {
                                CompanyId = companyId,
                                DocumentCode = "10000",
                                DocumentTypeId = (int)WorkFlowProcessTypes.CustomerMaster
                            }, transaction, m_dbconnection),
                            CreatedBy = new User
                            {
                                UserID = userId
                            }
                        };
                        foreach (var addr in item.CustomerAddresses)
                        {
                            addresses.Add(new SalesCustomerAddress
                            {
                                AddressLine1 = addr.AddressLine1,
                                AddressLine2 = addr.AddressLine2,
                                AddressLine3 = addr.AddressLine3,
                                AddressType = addressTypes.FirstOrDefault(x => x.AddressTypeName.ToLower() == addr.AddressType.ToLower()),
                                Attention = addr.Attention,
                                City = addr.City,
                                CustomerIPSId = customer.CustomerIPSId,
                                Email = addr.Email,
                                Fax = addr.Fax,
                                PostalCode = addr.PostalCode,
                                Telephone = addr.Telephone,
                                Country = countries.FirstOrDefault(x => x.Name.ToLower() == addr.Country.ToLower()),
                                CustomerAddressId = 0
                            });
                        }
                        foreach (var contact in item.CustomerContacts)
                        {
                            contacts.Add(new SalesCustomerContact
                            {
                                ContactNo = contact.ContactNo,
                                CustomerContactId = 0,
                                CustomerIPSId = 0,
                                Designation = contact.Designation,
                                Email = contact.Email,
                                IsDefault = contact.IsDefault.ToLower() == "yes" ? true : false,
                                Name = contact.Name,
                                NRICPassportNo = contact.NRICPassportNo,
                                Purpose = contact.Purpose,
                                Nationality = nationalities.FirstOrDefault(x => x.NationalityName.ToLower() == contact.Nationality.ToLower())
                            });
                        }
                        customer.CustomerIPSId = this.PostCustomerMaster(customer, transaction);
                        this.PostCustomerAddress(customer, transaction);
                        this.PostCustomerContact(customer, transaction);
                        genericRepository.InsertDocumentWFStatus(new WorkFlowParameter
                        {
                            DocumentId = customer.CustomerIPSId,
                            ProcessId = (int)WorkFlowProcessTypes.CustomerMaster,
                            WorkFlowStatusId = customer.WorkflowStatus.WorkFlowStatusid
                        }, m_dbconnection, transaction);
                        auditLogRepository.LogImportDocument(new AuditLogData
                        {
                            DocumentId = customer.CustomerIPSId,
                            PageName = WorkFlowProcessTypes.CustomerMaster.ToString(),
                            Logger = customer.CreatedBy.UserID,
                            Action = "SAVE",
                            CompanyId = customer.CompanyId,
                        }, transaction, m_dbconnection);
                    }
                    transaction.Commit();
                    IsImported = true;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                }

            }
            return IsImported;
        }
    }
}
