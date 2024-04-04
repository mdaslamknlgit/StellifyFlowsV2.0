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
    public class TaxRepository : ITaxRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        private SharedRepository sharedRepositoryObj;

        public int CreateTax(Tax Tax)
        {
            {

                return this.m_dbconnection.Query<int>("Taxes_CRUD",
                new
                {
                    Action = "INSERT",
                    Taxname = Tax.TaxName,
                    TaxType = Tax.TaxType,
                    TaxAmount = Tax.TaxAmount,
                    TaxClass = Tax.TaxClass.Trim(),
                    //TaxAuthority = Tax.TaxAuthority,
                    TaxGroupId = Tax.TaxGroupId,
                    CreatedBy = Tax.CreatedBy,
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
        }

        public bool DeleteTax(TaxDelete TaxDelete)
        {
            try
            {

                int result= this.m_dbconnection.Query<int>("Taxes_CRUD",
                                         new
                                         {

                                             Action = "DELETE",
                                             TaxId = TaxDelete.TaxId,
                                             CreatedBy = TaxDelete.ModifiedBy,
                                             CreatedDate = DateTime.Now
                                         },
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();

                if (result == 1)
                {
                    return false;
                }
                else
                    return true;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public TaxDisplayResult GetTaxes(TaxisplayInput Tax)
        {
            try
            {

                TaxDisplayResult taxDisplayResult = new TaxDisplayResult();

                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("Taxes_CRUD", new
                {

                    Action = "SELECT",
                    Search=Tax.Search,
                    Skip = Tax.Skip,
                    Take = Tax.Take

                }, commandType: CommandType.StoredProcedure))
                {

                    taxDisplayResult.Taxes = result.Read<Tax>().ToList();

                    taxDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return taxDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public Tax GetTaxByTaxId(int TaxId)
        {
            try
            {

                TaxDisplayResult taxDisplayResult = new TaxDisplayResult();

                ////executing the stored procedure to get the list of item categories....
                //using (var result = this.m_dbconnection.QueryMultiple("Taxes_CRUD", new
                //{

                //    Action = "SELECTBYID",
                //    TaxId=TaxId

                //}, commandType: CommandType.StoredProcedure))
                //{

                //    taxDisplayResult.Taxes = result.Read<Tax>().ToList();

                //    taxDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}

                //return taxDisplayResult;

                const string sql = @" select  
                                T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,  
                                T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate  
                                from  
                                dbo.Taxes T  
                               join dbo.TaxGroup Tg  
                               on T.TaxGroupId = Tg.TaxGroupId     
                               where  
                               T.TaxId = @TaxId;";
                Tax TaxInfo = this.m_dbconnection.Query<Tax>(sql, new Dictionary<string, object> { { "TaxId", TaxId } }).FirstOrDefault();

                return TaxInfo;

            }
            catch (Exception e)
            {
                throw e;
            }
            return null;
        }
        public IEnumerable<Tax> GetTaxesByTaxGroup(int taxGroupId)
        {
            return this.m_dbconnection.Query<Tax>("Taxes_CRUD",
                                          new
                                          {
                                              Action = "TAXES",
                                              TaxGroupId = taxGroupId
                                          }, commandType: CommandType.StoredProcedure).ToList();
        }

        public TaxDisplayResult GetFilterTaxes(TaxFilterDisplayInput Tax)
        {
            try
            {

                TaxDisplayResult taxDisplayResult = new TaxDisplayResult();

                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("Taxes_CRUD", new
                {

                    Action = "FILTER",
                    TaxnameFilter = Tax.TaxnameFilter,
                    AuthorityFilter = Tax.AuthorityFilter,
                    TaxAmountFilter = Tax.TaxAmountFilter,
                    Skip = Tax.Skip,
                    Take = Tax.Take

                }, commandType: CommandType.StoredProcedure))
                {

                    taxDisplayResult.Taxes = result.Read<Tax>().AsList();

                    taxDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return taxDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }      

        public int UpdateTax(Tax Tax)
        {
            try
            {
                return this.m_dbconnection.Query<int>("Taxes_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       TaxId = Tax.TaxId,
                                                       Taxname = Tax.TaxName,
                                                       TaxType = Tax.TaxType,
                                                       TaxAmount = Tax.TaxAmount,
                                                       TaxGroupId = Tax.TaxGroupId,
                                                       TaxClass = Tax.TaxClass.Trim(),
                                                       //TaxAuthority = Tax.TaxAuthority,
                                                       CreatedBy = Tax.CreatedBy,
                                                       CreatedDate = DateTime.Now,

                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateTaxName(Tax tax)
        {
            try
            {

                var result=m_dbconnection.Query<int>("Taxes_CRUD",
                                         new
                                         {

                                             Action = "VALIDATE",
                                             TaxId = tax.TaxId,
                                             TaxGroupId =tax.TaxGroupId,
                                             TaxClass = tax.TaxClass.Trim()
                                             //Taxname = tax.TaxName
                                         },
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public UploadResult UploadTaxes(string filePath, int userId)
        {
            try
            {
                UploadResult uploadResult = null;
                string taxGroups = string.Empty;
                int count = 0;
                List<Tax> suppliers = new List<Tax>();
                List<DynamicParameters> taxGroupstoUpdate = new List<DynamicParameters>();
                this.m_dbconnection.Open();
                DataTable dtTaxGroups = ExcelUpload.ExcelUpload.ReadAsDataTable(filePath);
              
                var taxGroup = from table in dtTaxGroups.AsEnumerable()
                              group table by new { placeCol = table["Tax Authority"] } into groupby
                              select new
                              {
                                  Value = groupby.Key,
                                  ColumnValues = groupby
                              };

                uploadResult = new UploadResult();
                taxGroups = "<span >TaxGroups are not availble in db: </span> ";
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    foreach (var key in taxGroup)
                    {
                        TaxGroup objTaxGroup = GetTaxGroup(Convert.ToString(key.Value.placeCol));
                        
                        if (objTaxGroup != null)
                        {
                            foreach (var columnValue in key.ColumnValues)
                            {
                                
                                DynamicParameters itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                               
                                itemObj.Add("@Taxname", Convert.ToString(columnValue["Description"]), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@TaxGroupId", objTaxGroup.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TaxClass", Convert.ToString(columnValue["Tax Class"]), DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TaxAmount", Convert.ToString(columnValue["Tax %"]), DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", userId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@TotalRows", dbType: DbType.Int32, direction: ParameterDirection.Output);


                                taxGroupstoUpdate.Add(itemObj);
                            }
                        }
                        else
                        {
                            taxGroups += "<b>" + Convert.ToString(key.Value.placeCol) + "</b> , ";
                            uploadResult.FailedRecords += key.ColumnValues.Count();
                        }
                        var result = this.m_dbconnection.Execute("Taxes_CRUD", taxGroupstoUpdate,
                                       transaction: objTransaction,
                                       commandType: CommandType.StoredProcedure);

                        taxGroupstoUpdate.ForEach(data =>
                        {
                            count += data.Get<int>("@TotalRows");
                        });

                        objTransaction.Commit();

                        if (taxGroups.EndsWith(","))
                        {
                            taxGroups = taxGroups.Substring(0, taxGroups.Length - 1);
                        }

                        uploadResult.UploadedRecords = count;
                        uploadResult.Message = taxGroups;

                    }



                }
                return uploadResult;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private CompanyDetails GetCompanyDetails(string companyName)
        {
            sharedRepositoryObj = new SharedRepository();
            return sharedRepositoryObj.GetCompanyDetails(companyName);
        }
        private TaxGroup GetTaxGroup(string taxGroupName)
        {
            sharedRepositoryObj = new SharedRepository();
            return sharedRepositoryObj.GetTaxGroups(taxGroupName);
        }

        public int GetTaxClassCount(int taxGroupId, int taxClass)
        {
            try
            {
                int count = 0;
                using (var result = this.m_dbconnection.QueryMultiple("Taxes_CRUD", new
                {
                    Action = "COUNT",
                    TaxGroupId = taxGroupId,
                    TaxClass = taxClass
                }, commandType: CommandType.StoredProcedure))
                {
                    count = result.Read<int>().FirstOrDefault();
                }
                return count;
            }
            catch (Exception e)
            {
                throw e;
            }
        }





    }
}
