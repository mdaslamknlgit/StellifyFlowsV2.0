using System;
using Dapper;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using System.Web;

namespace UELPM.Service.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        public CompanyGrid GetCompanies(GridDisplayInput gridDisplayInput)
        {
            CompanyGrid companyGridData = new CompanyGrid();
            using (var result = this.m_dbconnection.QueryMultiple("CompanyMaster_CRUD", new
            {
                Action = "SELECT",
                Search = "",
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take,
                Companyid = 0
            }, commandType: CommandType.StoredProcedure))
            {
                companyGridData.Companies = result.Read<Company>().AsList();
                companyGridData.TotalRecords = result.ReadFirstOrDefault<int>();
            }
            return companyGridData;
        }

        public Company GetCompany(int companyId)
        {
            Company company = new Company();
            //var companyDetails = this.m_dbconnection.Query<Company>("CompanyMaster_CRUD",
            //                       new
            //                       {
            //                           Action = "SELECTBYID",
            //                           CompanyId = companyId
            //                       }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            //return companyDetails;
            //var companyDetails = this.m_dbconnection.Query<Company>("CompanyMaster_CRUD",
            //                       new
            //                       {
            //                           Action = "SELECTBYID",
            //                           CompanyId = companyId
            //                       }, commandType: CommandType.StoredProcedure);

            //return companyDetails;
            using (var result = this.m_dbconnection.QueryMultiple("CompanyMaster_CRUD", new
            {

                Action = "SELECTBYID",
                CompanyId = companyId

            }, commandType: CommandType.StoredProcedure))
            {
                company = result.Read<Company>().FirstOrDefault();
            }
            company.Countries = this.m_dbconnection.Query<Country>("usp_GetCountries",
                                     new
                                     {
                                         CountryId = company.Country
                                     }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            if (company != null)
            {
                company.GLCodeUsersList = this.m_dbconnection.Query<UserProfile>("GLCodeUser_CRUD", new
                {
                    Action = "SELECT",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
                company.Currency = this.m_dbconnection.Query<Currency>("CompanyMaster_CRUD", new
                {
                    Action = "SELECT_CURRENCY",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            if (company.GLCodeUsersList.Count > 0)
            {
                foreach (var record in company.GLCodeUsersList)
                {
                    company.UserNames += record.UserName + ", ";
                }

                company.UserNames = company.UserNames.Remove(company.UserNames.Length - 2);
            }
            if (company != null)
            {
                company.DepartmentList = this.m_dbconnection.Query<Locations>("CompanyDepartment_CRUD", new
                {
                    Action = "SELECT",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            if (company.DepartmentList.Count > 0)
            {
                foreach (var record in company.DepartmentList)
                {
                    company.DepartmentNames += record.Name + ", ";
                }
                company.DepartmentNames = company.DepartmentNames.Remove(company.DepartmentNames.Length - 2);
            }

            if (company != null)
            {
                company.ContactPersons = this.m_dbconnection.Query<CompanyContactPerson>("CompanyContactPerson_CRUD", new
                {
                    Action = "SELECTBYID",
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            if (company.SupplierVerifier != null)
            {
                company.SupplierVerifierName = this.m_dbconnection.Query<UserProfile>("usp_GetUsers", new
                {
                    Action = "SELECTBYID",
                    UserId = company.SupplierVerifier
                }, commandType: CommandType.StoredProcedure).First().UserName;
            }

            return company;
        }
        public int CreateCompany(Company company)
        {
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (company.OrganizationId == 0)
                    {
                        company.OrganizationId = 1;
                    }

                    //int companyCount = this.m_dbconnection.QueryFirstOrDefault<int>("CompanyMaster_CRUD", new
                    //{
                    //    Action = "COUNT",
                    //    //CompanyId = customer.CompanyId
                    //},
                    //transaction: transactionObj,
                    //commandType: CommandType.StoredProcedure);

                    //if (companyCount == 0)
                    //{
                    //    companyCount = 1;
                    //}
                    //else
                    //{
                    //    companyCount += 1;
                    //}
                    //companyCode = ModuleCodes.Company;
                    //companyCode = companyCode + '-' + companyCount.ToString();
                    this.SaveCompanyLogo(company);
                    var companyId = this.m_dbconnection.Query<int>("CompanyMaster_CRUD",
                    new
                    {
                        Action = "INSERT",

                        OrganizationId = company.OrganizationId,
                        CompanyCode = company.CompanyCode,
                        CompanyName = company.CompanyName,
                        CompanyDescription = company.CompanyDescription,
                        Address1 = company.Address1,
                        Address2 = company.Address2,
                        Address3 = company.Address3,
                        Address4 = company.Address4,
                        City = company.City,
                        Country = company.Country,
                        ZipCode = company.ZipCode,
                        Email = company.Email,
                        Telephone = company.Telephone,
                        Mobilenumber = company.Mobilenumber,
                        Fax = company.Fax,
                        ImageSource = company.ImageSource,
                        CreatedBy = company.CreatedBy,
                        CreatedDate = DateTime.Now,
                        LocationPrefix = company.LocationPrefix,
                        CompanyShortName = company.CompanyShortName,
                        CompanyRegistrationNumber = company.CompanyRegistrationNumber,
                        GST = company.GST,
                        GSTRegistrationNumber = company.GSTRegistrationNumber,
                        Website = company.Website,
                        MCSTOffice = company.MCSTOffice,
                        InvoiceLimit = company.InvoiceLimit,
                        CurrencyId = company.Currency.Id
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    #region inserting the contact persons

                    if (companyId > 0)
                    {
                        if (company.ContactPersons != null && company.ContactPersons.Count > 0)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of contact persons...
                            foreach (var record in company.ContactPersons)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var contactPersonSaveResult = this.m_dbconnection.Execute("CompanyContactPerson_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                    }
                    #endregion

                    #region inserting the Users list for GLCode notifications
                    if (companyId > 0)
                    {
                        if (company.GLCodeUsersList != null && company.GLCodeUsersList.Count > 0)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in company.GLCodeUsersList)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@UserId", record.UserID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var glcodeUsersSaveResult = this.m_dbconnection.Execute("GLCodeUser_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }
                    }
                    #endregion

                    #region inserting the departments list for companies
                    if (companyId > 0)
                    {

                        if (company.DepartmentList != null && company.DepartmentList.Count > 0)
                        {
                            IDepartmentRepository dep = new DepartmentRepository();

                            foreach (var record in company.DepartmentList)
                            {
                                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                DepartmentManagement m_department = new DepartmentManagement();
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DepartmentId", record.LocationID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DepartmentName", record.Name, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                                var companyDepartmentSave = this.m_dbconnection.Execute("CompanyDepartment_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                                var deptObj = new DynamicParameters();
                                deptObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                deptObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                                deptObj.Add("@Code", record.Name, DbType.String, ParameterDirection.Input);
                                deptObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                                deptObj.Add("@IsDeleted", 0, DbType.Int16, ParameterDirection.Input);
                                deptObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                deptObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemToAdd.Add(deptObj);

                                var deptResult = this.m_dbconnection.Execute("Department_CRUD", deptObj, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                            }

                        }
                    }
                    #endregion
                    //commiting the transaction...
                    transactionObj.Commit();
                    return companyId;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }
        public bool DeleteCompany(int companyId)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {

                try
                {
                    int companyDetail = this.m_dbconnection.Query<int>("CompanyMaster_CRUD",
                                         new
                                         {
                                             Action = "DELETE",
                                             CompanyId = companyId
                                         },
                                         transaction: transactionObj,
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();

                    #region deleting supplier ...

                    var supplierContactPersonRecords = this.m_dbconnection.Execute("CompanyContactPerson_CRUD", new
                    {

                        Action = "DELETEALL",
                        CompanyId = companyId,
                        CreatedDate = DateTime.Now
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    #endregion
                    transactionObj.Commit();
                    if (companyDetail == 1)
                    {
                        return false;
                    }
                    else
                        return true;


                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        private Company SaveCompanyLogo(Company company)
        {
            try
            {
                if (company.Image.Count > 0)
                {
                    FileOperations fileOperationsObj = new FileOperations();
                    company.ImageSource = fileOperationsObj.SaveCompanyLogo(company);
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return company;
        }

        public int UpdateCompany(Company company)
        {
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.SaveCompanyLogo(company);
                    var companyResult = this.m_dbconnection.Query<int>("CompanyMaster_CRUD", new
                    {
                        Action = "UPDATE",
                        CompanyId = company.CompanyId,
                        OrganizationId = company.OrganizationId,
                        CompanyCode = company.CompanyCode,
                        CompanyName = company.CompanyName,
                        CompanyDescription = company.CompanyDescription,
                        Address1 = company.Address1,
                        Address2 = company.Address2,
                        Address3 = company.Address3,
                        Address4 = company.Address4,
                        City = company.City,
                        Country = company.Country,
                        ZipCode = company.ZipCode,
                        SupplierVerifier = company.SupplierVerifier,
                        InvoiceLimit = company.InvoiceLimit,
                        Email = company.Email,
                        Telephone = company.Telephone,
                        Mobilenumber = company.Mobilenumber,
                        Fax = company.Fax,
                        ImageSource = company.ImageSource,
                        UpdatedBy = company.UpdatedBy,
                        UpdatedDate = DateTime.Now,
                        LocationPrefix = company.LocationPrefix,
                        CompanyShortName = company.CompanyShortName,
                        CompanyRegistrationNumber = company.CompanyRegistrationNumber,
                        GST = company.GST,
                        GSTRegistrationNumber = company.GSTRegistrationNumber,
                        Website = company.Website,
                        MCSTOffice = company.MCSTOffice,
                        CurrencyId = company.Currency.Id
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                    #region we are saving contact persons details...
                    if (companyResult > 0)
                    {
                        if (company.ContactPersons != null)
                        {
                            List<DynamicParameters> personsToAdd = new List<DynamicParameters>();
                            //looping through the list of contact persons...
                            foreach (var record in company.ContactPersons.Where(i => i.ContactPersonId == 0).Select(i => i))
                            {
                                var personObj = new DynamicParameters();

                                personObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                personObj.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                personObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                                personObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                                personObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                                personObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                personObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                                personObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                                //personObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                                personsToAdd.Add(personObj);
                            }
                            var contactPersonSaveResult = this.m_dbconnection.Execute("CompanyContactPerson_CRUD", personsToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                    }

                    #endregion

                    #region updating contact persons details...
                    if (companyResult > 0)
                    {

                        List<DynamicParameters> contactPersonsToUpdate = new List<DynamicParameters>();

                        //looping through the list of contact persons
                        foreach (var record in company.ContactPersons.Where(i => i.ContactPersonId > 0).Select(i => i))
                        {
                            var personObj = new DynamicParameters();

                            personObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                            personObj.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@ContactPersonId", record.ContactPersonId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                            personObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                            personObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                            personObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            personObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                            personObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                            //personObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                            contactPersonsToUpdate.Add(personObj);
                        }



                        var supplierContactPersonseUpdateResult = this.m_dbconnection.Execute("CompanyContactPerson_CRUD", contactPersonsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                    }
                    #endregion

                    #region deleting contact persons details...
                    if (companyResult > 0)
                    {
                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (company.ContactPersonsToDelete != null)
                        {
                            foreach (var contactPersonId in company.ContactPersonsToDelete)
                            {
                                var personObj = new DynamicParameters();

                                personObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                personObj.Add("@ContactPersonId", contactPersonId, DbType.Int32, ParameterDirection.Input);
                                personObj.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                personObj.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);


                                itemsToDelete.Add(personObj);
                            }
                        }

                        var supplierContactPersonseDeleteResult = this.m_dbconnection.Execute("CompanyContactPerson_CRUD", itemsToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                    }
                    #endregion

                    #region deleting GLCode users notification list
                    if (companyResult > 0)
                    {
                        var glDeletedUsers = this.m_dbconnection.Query<bool>("GLCodeUser_CRUD",
                                            new
                                            {
                                                Action = "DELETE",
                                                CompanyId = company.CompanyId
                                            },
                                            transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure).FirstOrDefault();
                    }
                    #endregion

                    #region inserting GLCode users notifications list
                    if (companyResult > 0)
                    {
                        if (company.GLCodeUsersList != null && company.GLCodeUsersList.Count > 0)
                        {
                            List<DynamicParameters> usersToAdd = new List<DynamicParameters>();
                            foreach (var user in company.GLCodeUsersList)
                            {
                                var userObj = new DynamicParameters();
                                userObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                userObj.Add("@UserId", user.UserID, DbType.Int32, ParameterDirection.Input);
                                userObj.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                userObj.Add("@CreatedBy", company.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                                userObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                usersToAdd.Add(userObj);
                            }
                            var glCodeuserSaveResult = this.m_dbconnection.Execute("GLCodeUser_CRUD", usersToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                    }

                    #endregion

                    #region deleting departments for companies
                    if (companyResult > 0)
                    {
                        var deleteDepartmentCompanies = this.m_dbconnection.Query<bool>("CompanyDepartment_CRUD",
                        new
                        {
                            Action = "DELETE",
                            CompanyId = company.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();
                    }
                    #endregion

                    #region inserting departments for companies
                    if (companyResult > 0)
                    {
                        if (company.DepartmentList != null && company.DepartmentList.Count > 0)
                        {

                            foreach (var department in company.DepartmentList)
                            {
                                List<DynamicParameters> departmentsToAdd = new List<DynamicParameters>();
                                var deptObj = new DynamicParameters();
                                deptObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                deptObj.Add("@DepartmentId", department.LocationID, DbType.Int32, ParameterDirection.Input);
                                deptObj.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                deptObj.Add("@DepartmentName", department.Name, DbType.String, ParameterDirection.Input);
                                deptObj.Add("@CreatedBy", company.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                                deptObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                departmentsToAdd.Add(deptObj);

                                var departmentCompanySave = this.m_dbconnection.Execute("CompanyDepartment_CRUD", departmentsToAdd, transaction: transactionObj,
                               commandType: CommandType.StoredProcedure);



                                var deptObj1 = new DynamicParameters();
                                deptObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                deptObj1.Add("@CompanyId", company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                deptObj1.Add("@Code", department.Name, DbType.String, ParameterDirection.Input);
                                deptObj1.Add("@Name", department.Name, DbType.String, ParameterDirection.Input);
                                deptObj1.Add("@IsDeleted", 0, DbType.Int16, ParameterDirection.Input);
                                deptObj1.Add("@CreatedBy", company.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                deptObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                departmentsToAdd.Add(deptObj1);

                                var deptResult = this.m_dbconnection.Execute("Department_CRUD", deptObj1, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                            }

                        }
                    }

                    #endregion

                    transactionObj.Commit();
                    return companyResult;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public CompanyGrid GetAllSearchCompanies(GridDisplayInput gridDisplayInput)
        {
            CompanyGrid companyGridData = new CompanyGrid();
            using (var result = this.m_dbconnection.QueryMultiple("CompanyMaster_CRUD", new
            {

                Action = "SELECT",
                Search = gridDisplayInput.Search,
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take,
                Companyid = gridDisplayInput.CompanyId

            }, commandType: CommandType.StoredProcedure))
            {
                companyGridData.Companies = result.Read<Company>().AsList();
                companyGridData.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return companyGridData;
        }

        public CompanyGrid GetAllSearchCompaniesFilter(CompanySearch companySearch)
        {
            CompanyGrid companyGridData = new CompanyGrid();
            using (var result = this.m_dbconnection.QueryMultiple("CompanyMaster_CRUD", new
            {
                Action = "FILTER",
                Skip = companySearch.Skip,
                Take = companySearch.Take,
                Search = companySearch.Search,
                CompanyCode = companySearch.CompanyCode,
                CompanyName = companySearch.CompanyName,
                Country = companySearch.Country
            }, commandType: CommandType.StoredProcedure))
            {
                companyGridData.Companies = result.Read<Company>().AsList();
                companyGridData.TotalRecords = companyGridData.Companies.Count;
            }
            return companyGridData;
        }

        public IEnumerable<Company> GetAllCompanies()
        {
            return this.m_dbconnection.Query<Company>("CompanyMaster_CRUD", new
            {
                Action = "SELECTALL"
            }, commandType: CommandType.StoredProcedure).ToList();

        }
    }
}
