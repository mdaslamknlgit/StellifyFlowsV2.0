using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class EngineerManagementRepository : IEngineerManagementRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public EngineerManagementDisplayResult GetEngineerManagement(GridDisplayInput gridDisplayInput)
        {
            try
            {
                EngineerManagementDisplayResult engineerManagementDisplayResult = new EngineerManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("EngineerManagement_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //engineerManagementDisplayResult.EngineerManagementList = result.Read<EngineerManagementList>().AsList();
                    engineerManagementDisplayResult.EngineerManagementList = result.Read<EngineerManagementList>().GroupBy(i => i.EngineerId).Select(j => new EngineerManagementList
                    {
                        EngineerId = j.Select(i => i.EngineerId).FirstOrDefault(),
                        Name = j.Select(i => i.Name).FirstOrDefault(),
                        EngineerCode = j.Select(i => i.EngineerCode).FirstOrDefault(),
                        JobCategoryName = String.Join(",", j.GroupBy(i=>i.EngineerId).SelectMany(k=>k.Select(l=>l.JobCategoryName).Distinct()).ToList()),
                        FacilityName = String.Join(",", j.GroupBy(i => i.EngineerId).SelectMany(k => k.Select(l => l.FacilityName).Distinct()).ToList())
                    }).ToList();

                    engineerManagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return engineerManagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public EngineerManagementDisplayResult GetFilterEngineerManagement(EngineerManagementFilterDisplayInput engineerManagementFilterDisplayInput)
        {
            try
            {
                EngineerManagementDisplayResult engineerManagementDisplayResult = new EngineerManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("EngineerManagement_CRUD", new
                {
                    Action = "FILTER",
                    NameFilter = engineerManagementFilterDisplayInput.NameFilter,
                    JobCategoryFilter = engineerManagementFilterDisplayInput.JobCategoryFilter,
                    FacilityFilter = engineerManagementFilterDisplayInput.FacilityFilter,
                    EngineerCodeFilter=engineerManagementFilterDisplayInput.EngineerCodeFilter,
                    Skip = engineerManagementFilterDisplayInput.Skip,
                    Take = engineerManagementFilterDisplayInput.Take,
                    CompanyId= engineerManagementFilterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    engineerManagementDisplayResult.EngineerManagementList = result.Read<EngineerManagementList>().GroupBy(i => i.EngineerId).Select(j => new EngineerManagementList
                    {
                        EngineerId = j.Select(i => i.EngineerId).FirstOrDefault(),
                        Name = j.Select(i => i.Name).FirstOrDefault(),
                        EngineerCode = j.Select(i => i.EngineerCode).FirstOrDefault(),
                        JobCategoryName = String.Join(",", j.GroupBy(i => i.EngineerId).SelectMany(k => k.Select(l => l.JobCategoryName).Distinct()).ToList()),
                        FacilityName = String.Join(",", j.GroupBy(i => i.EngineerId).SelectMany(k => k.Select(l => l.FacilityName).Distinct()).ToList())
                    }).ToList();
                    engineerManagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return engineerManagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public int CreateEngineerManagement(EngineerManagement engineerManagement)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        string EngineerCode = this.m_dbconnection.QueryFirstOrDefault<string>("EngineerManagement_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = engineerManagement.CompanyId
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);
                        int engineerId = this.m_dbconnection.QueryFirstOrDefault<int>("EngineerManagement_CRUD", new
                        {
                            Action = "INSERT",
                            FirstName= engineerManagement.FirstName,
                            LastName = engineerManagement.LastName,
                            EngineerCode="ENG-" + EngineerCode,
                            CompanyId =engineerManagement.CompanyId,
                            IsActive = engineerManagement.IsActive,
                            Contact = engineerManagement.Contact,
                            AltContact = engineerManagement.AltContact,
                            Email = engineerManagement.Email,
                            Address = engineerManagement.Address,
                            CreatedBy = engineerManagement.CreatedBy,
                            CreatedDate = DateTime.Now,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (engineerManagement.JobCategory.Count>0)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in engineerManagement.JobCategory)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTJOBCATEGORY", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EngineerId", engineerId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", engineerManagement.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var jobCategorySaveResult = this.m_dbconnection.Execute("EngineerManagement_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        if (engineerManagement.Facility.Count>0)
                        {
                            List<DynamicParameters> facilityToAdd = new List<DynamicParameters>();
                            foreach (var record in engineerManagement.Facility)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTFACILITY", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EngineerId", engineerId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FacilityId", record.FacilityId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", engineerManagement.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                facilityToAdd.Add(itemObj);
                            }
                            var facilitySaveResult = this.m_dbconnection.Execute("EngineerManagement_CRUD", facilityToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        transactionObj.Commit();

                        return engineerId;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateEngineerManagement(EngineerManagement engineerManagement)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int engineerManagementId = this.m_dbconnection.QueryFirstOrDefault<int>("EngineerManagement_CRUD", new
                        {
                            Action = "UPDATE",
                            EngineerId=engineerManagement.EngineerId,
                            FirstName = engineerManagement.FirstName,
                            LastName = engineerManagement.LastName,
                            IsActive = engineerManagement.IsActive,
                            Contact = engineerManagement.Contact,
                            AltContact = engineerManagement.AltContact,
                            Email = engineerManagement.Email,
                            Address = engineerManagement.Address,
                            CreatedBy = engineerManagement.CreatedBy,
                            CreatedDate = DateTime.Now,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        try
                        {
                            var jobCategoryDeleteResult = this.m_dbconnection.Execute("EngineerManagement_CRUD",
                                                 new
                                                 {
                                                     Action = "DELETEJOBCATEGORY",
                                                     EngineerId = engineerManagement.EngineerId
                                                 },
                                                 transaction: transactionObj,
                                                 commandType: CommandType.StoredProcedure);
                        }
                        catch { }

                        try
                        {
                            var facilityDeleteResult = this.m_dbconnection.Execute("EngineerManagement_CRUD",
                                                 new
                                                 {
                                                     Action = "DELETEFACILITY",
                                                     EngineerId = engineerManagement.EngineerId
                                                 },
                                                 transaction: transactionObj,
                                                 commandType: CommandType.StoredProcedure);
                        }
                        catch { }

                        if (engineerManagement.JobCategory.Count > 0)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in engineerManagement.JobCategory)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTJOBCATEGORY", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EngineerId", engineerManagement.EngineerId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", engineerManagement.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var jobCategorySaveResult = this.m_dbconnection.Execute("EngineerManagement_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        if (engineerManagement.Facility.Count > 0)
                        {
                            List<DynamicParameters> facilityToAdd = new List<DynamicParameters>();
                            foreach (var record in engineerManagement.Facility)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTFACILITY", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EngineerId", engineerManagement.EngineerId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FacilityId", record.FacilityId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", engineerManagement.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                facilityToAdd.Add(itemObj);
                            }
                            var facilitySaveResult = this.m_dbconnection.Execute("EngineerManagement_CRUD", facilityToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }


                        transactionObj.Commit();

                        return engineerManagementId;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteEngineerManagement(EngineerManagementDelete engineerManagementDelete)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var engineerManagementDeleteResult = this.m_dbconnection.Execute("EngineerManagement_CRUD",
                                                               new
                                                               {
                                                                   Action = "DELETE",
                                                                   EngineerId = engineerManagementDelete.EngineerId,
                                                                   CreatedBy = engineerManagementDelete.ModifiedBy,
                                                                   CreatedDate = DateTime.Now
                                                               },
                                                               transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);

                        transactionObj.Commit();
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
            catch (Exception e)
            {
                throw e;
            }
        }

        public EngineerManagement GetEngineerManagementDetails(int engineerId)
        {
            EngineerManagement engineerManagementObj = new EngineerManagement();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("EngineerManagement_CRUD", new
                {
                    Action = "SELECTBYID",
                    EngineerId = engineerId
                }, commandType: CommandType.StoredProcedure))
                {
                    engineerManagementObj = result.Read<EngineerManagement>().FirstOrDefault();
                    if (engineerManagementObj != null)
                    {
                        engineerManagementObj.JobCategory = result.Read<SupplierService>().AsList();
                        engineerManagementObj.Facility = result.Read<Facilities>().AsList();
                        if (engineerManagementObj.JobCategory.Count > 0)
                        {
                            foreach (var record in engineerManagementObj.JobCategory)
                            {
                                engineerManagementObj.JobCategoryName += record.ServiceName + ", ";
                            }
                            engineerManagementObj.JobCategoryName = engineerManagementObj.JobCategoryName.Remove(engineerManagementObj.JobCategoryName.Length - 2);
                        }
                        if (engineerManagementObj.Facility.Count > 0)
                        {
                            foreach (var record in engineerManagementObj.Facility)
                            {
                                engineerManagementObj.FacilityName += record.UnitNumber + ", ";
                            }
                            engineerManagementObj.FacilityName = engineerManagementObj.FacilityName.Remove(engineerManagementObj.FacilityName.Length - 2);
                        }

                    }
                }
                return engineerManagementObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


    }
}
