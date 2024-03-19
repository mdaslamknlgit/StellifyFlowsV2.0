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
    public class DepartmentRepository : IDepartmentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public DepartmentManagementDisplayResult GetDepartment(GridDisplayInput gridDisplayInput)
        {
            try
            {
                DepartmentManagementDisplayResult departmentDisplayResult = new DepartmentManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("Department_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId=gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    departmentDisplayResult.DepartmentList = result.Read<DepartmentManagement>().AsList();
                    departmentDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return departmentDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DepartmentManagement GetDepartmentDetails(int locationId)
        {
            DepartmentManagement departmentObj = new DepartmentManagement();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Department_CRUD", new
                {

                    Action = "SELECTBYID",
                    LocationId = locationId
                }, commandType: CommandType.StoredProcedure))
                {
                    departmentObj = result.Read<DepartmentManagement>().FirstOrDefault();
                }
                return departmentObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ValidateDepartment(DepartmentManagement m_validatedepartment)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("Department_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            Name = m_validatedepartment.Name.Trim(),
                                            CompanyId=m_validatedepartment.CompanyId,
                                            LocationID=m_validatedepartment.LocationId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate Department Name";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string CreateDepartment(DepartmentManagement m_department)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("Department_CRUD", new
                    {
                        Action = "INSERT",
                        Name = m_department.Name.Trim(),
                        Code = m_department.Code.Trim(),
                        Description = m_department.Description,
                        IsDeleted = m_department.IsDeleted,
                        CreatedBy = m_department.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CompanyId = m_department.CompanyId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    if (validateNameStatus == 0)
                    {
                        status = m_department.LocationId.ToString();
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public string UpdateDepartment(DepartmentManagement m_department)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("Department_CRUD", new
                    {
                        Action = "UPDATE",
                        Name = m_department.Name.Trim(),
                        Code = m_department.Code.Trim(),
                        Description = m_department.Description,
                        IsDeleted = m_department.IsDeleted,
                        LocationId = m_department.LocationId,
                        CreatedBy = m_department.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CompanyId = m_department.CompanyId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    //if (validateNameStatus == 0)
                    //{
                    //    status = "Duplicate";
                    //}
                    //else {
                    status = validateNameStatus.ToString();
                    //}
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }

        }

        public bool DeleteDepartment(int locationId, int userId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("Department_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    LocationId = locationId,
                                                    CreatedBy=userId,
                                                    CreatedDate=DateTime.Now
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();



                //if (result == 1)
                //{
                //    return false;
                //}
                //else
                //    return true;
            }
            catch (Exception ex)
            { throw ex; }
        }
        


    }
}
