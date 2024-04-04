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
    public class TaxGroupRepository : ITaxGroupRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public TaxGroupManagementDisplayResult GetTaxGroup(GridDisplayInput gridDisplayInput)
        {
            try
            {
                TaxGroupManagementDisplayResult taxGroupManagementDisplayResult = new TaxGroupManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("TaxGroupManagement_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    taxGroupManagementDisplayResult.TaxGroupList = result.Read<TaxGroupManagement>().AsList();
                    taxGroupManagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return taxGroupManagementDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public TaxGroupManagement GetTaxGroupDetails(int taxGroupId)
        {
            TaxGroupManagement taxGroupManagementObj = new TaxGroupManagement();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("TaxGroupManagement_CRUD", new
                {

                    Action = "SELECTBYID",
                    TaxGroupId = taxGroupId
                }, commandType: CommandType.StoredProcedure))
                {
                    taxGroupManagementObj = result.Read<TaxGroupManagement>().FirstOrDefault();
                }
                return taxGroupManagementObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public string ValidateTaxGroup(TaxGroupManagement taxGroupManagement)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("TaxGroupManagement_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            TaxGroupName = taxGroupManagement.TaxGroupName.Trim(),
                                            TaxGroupId = taxGroupManagement.TaxGroupId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate TaxGroup Name";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string CreateTaxGroup(TaxGroupManagement m_taxGroupManagement)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("TaxGroupManagement_CRUD", new
                    {
                        Action = "INSERT",
                        TaxGroupName = m_taxGroupManagement.TaxGroupName.Trim(),
                        Description = m_taxGroupManagement.Description.Trim(),
                        CreatedBy = m_taxGroupManagement.CreatedBy,
                        CreatedDate = DateTime.Now,
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    if (validateNameStatus == 0)
                    {
                        status = m_taxGroupManagement.TaxGroupId.ToString();
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public string UpdateTaxGroup(TaxGroupManagement m_taxGroupManagement)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("TaxGroupManagement_CRUD", new
                    {
                        Action = "UPDATE",
                        TaxGroupName = m_taxGroupManagement.TaxGroupName.Trim(),                        
                        Description = m_taxGroupManagement.Description.Trim(),
                        TaxGroupId = m_taxGroupManagement.TaxGroupId,
                        CreatedBy = m_taxGroupManagement.CreatedBy,
                        CreatedDate = DateTime.Now                        
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

        public bool DeleteTaxGroup(int taxGroupId,int userId)
        {
            try
            {
                int result= this.m_dbconnection.Query<int>("TaxGroupManagement_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    TaxGroupId = taxGroupId,
                                                    CreatedBy= userId
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (result == 1)
                {
                    return false;
                }
                else
                    return true;

            }
            catch (Exception ex)
            { throw ex; }
        }

        

    }
}
