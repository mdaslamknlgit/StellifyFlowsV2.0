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
    public class AssetMasterRepository: IAssetMasterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateAssetMaster(AssetMaster assets)
        {
            try
            {

                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        var assetMasterId =  this.m_dbconnection.Query<int>("AssetMaster_CRUD",
                                                new
                                                {
                                                    Action = "INSERT",
                                                    AssetName = assets.AssetName,
                                                    AssetCode = ModuleCodes.AssetMaster,
                                                    Warranty = assets.Warranty,
                                                    AssetCategoryId = assets.AssetCategoryId,
                                                    BarCode = assets.BarCode,
                                                    CreatedBy = assets.CreatedBy,
                                                    CreatedDate = DateTime.Now
                                                }, commandType: CommandType.StoredProcedure,transaction: transactionObj).FirstOrDefault();




                        #region  we are adding preferred suppliers...
                        if (assets.PreferredSuppliers != null)
                        {
                            List<DynamicParameters> suppliers= new List<DynamicParameters>();

                            foreach (var record in assets.PreferredSuppliers)
                            {
                                var supplier = new DynamicParameters();

                                supplier.Add("@Action", "SUPPLIERINSERT", DbType.String, ParameterDirection.Input);
                                supplier.Add("@AssetId", assetMasterId, DbType.Int32, ParameterDirection.Input);
                                supplier.Add("@SupplierId", record.Supplier.SupplierId, DbType.Int32, ParameterDirection.Input);

                                suppliers.Add(supplier);
                            }
                            var suppliersSaveResults = this.m_dbconnection.Execute("AssetMaster_CRUD", suppliers, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion


                        transactionObj.Commit();

                        return assetMasterId;
                    }
                    catch(Exception e)
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

        public int DeleteAssetMaster(AssetMaster assets)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetMaster_CRUD",
                    new
                    {
                        Action = "DELETE",
                        AssetId = assets.AssetId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetMasterDisplayResult GetAssets(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetMasterDisplayResult assetCategoryDisplayResult = new AssetMasterDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetMaster_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    assetCategoryDisplayResult.Assets = result.Read<AssetMaster>().ToList();
                    assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetMaster GetAssetDetails(int assetId)
        {
            try
            {
                AssetMaster assets = new AssetMaster();
                using (var result = this.m_dbconnection.QueryMultiple("AssetMaster_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetId = assetId
                }, commandType: CommandType.StoredProcedure))
                {
                    assets = result.Read<AssetMaster>().FirstOrDefault();
                    if (assets != null)
                    {
                        assets.PreferredSuppliers = result.Read<PreferredSupplier, Supplier, PreferredSupplier>((PS,Su)=> {

                            PS.Supplier = Su;
                            return PS;
                        }, splitOn: "SupplierId").AsList();
                    }
                }
                return assets;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetMasterDisplayResult SearchAssets(AssetMasterSearch assetMasterSearch)
     {
            try
            {
                AssetMasterDisplayResult assetCategoryDisplayResult = new AssetMasterDisplayResult();

                string assetCategoryQuery = "";
                string whereCondition = "";

                if (assetMasterSearch.AssetCategoryId != null && assetMasterSearch.AssetCategoryId > 0)
                {
                    whereCondition += " and  ( AT.AssetCategoryId = @AssetCategoryId )";
                }
                if (assetMasterSearch.AssetName != null && assetMasterSearch.AssetName != "")
                {
                    whereCondition += " and  ( AT.AssetName LIKE concat('%',@AssetName,'%') )";
                }
                if (assetMasterSearch.Search != null && assetMasterSearch.Search != "")
                {
                    whereCondition = " and  ( AT.AssetName LIKE concat('%',@Search,'%') or AT.AssetCode LIKE concat('%',@Search,'%') ) ";
                }
                assetCategoryQuery = @" select 
                                         AT.AssetId, 
                                         AT.AssetName, 
                                         AT.AssetCode, 
                                         ATP.AssetType
                                        from  
                                            dbo.Asset as AT 
                                        join
                                           dbo.AssetCategory as AC on 
                                           At.AssetCategoryId = AC.AssetCategoryId 
                                        left join 
                                           dbo.AssetType as ATP 
                                        ON 
                                        AC.AssetTypeId = ATP.AssetTypeId 
                                        where  
                                        AT.IsDeleted = 0 ";

                assetCategoryQuery += whereCondition;

                assetCategoryQuery += " order by " +
                                  "  AT.UpdatedDate desc ";

                if (assetMasterSearch.Take > 0)
                {
                    assetCategoryQuery += "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                    assetCategoryQuery += @" select 
                                             count(*) 
                                           from 
                                              dbo.Asset as AT  
                                            join 
                                               dbo.AssetCategory as AC on 
                                               At.AssetCategoryId = AC.AssetCategoryId 
                                            left join 
                                               dbo.AssetType as ATP 
                                            ON 
                                            AC.AssetTypeId = ATP.AssetTypeId 
                                           where 
                                             AT.IsDeleted = 0 ";
                    assetCategoryQuery += whereCondition;
                }
                using (var result = this.m_dbconnection.QueryMultiple(assetCategoryQuery, new
                {
                    Action = "SELECT",
                    Skip = assetMasterSearch.Skip,
                    Take = assetMasterSearch.Take,
                    Search = assetMasterSearch.Search,
                    AssetCategoryId = assetMasterSearch.AssetCategoryId,
                    AssetName = assetMasterSearch.AssetName
                    // AssetTypeId = assetMasterSearch.AssetTypeId,
                    //  AssetCategory = assetMasterSearch.AssetCategory
                }, commandType: CommandType.Text))
                {
                    assetCategoryDisplayResult.Assets = result.Read<AssetMaster>().ToList();

                    if (assetMasterSearch.Take > 0)
                    {
                        assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }              
                }
                return assetCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateAssetMaster(AssetMaster assets)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    var result = this.m_dbconnection.Query<int>("AssetMaster_CRUD",
                                        new
                                        {
                                            Action = "UPDATE",
                                            AssetId = assets.AssetId,
                                            AssetName = assets.AssetName,
                                            AssetCode = assets.AssetCode,
                                            Warranty = assets.Warranty,
                                            AssetCategoryId = assets.AssetCategoryId,
                                            BarCode = assets.BarCode,
                                            CreatedBy = assets.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        }, commandType: CommandType.StoredProcedure,transaction: transactionObj).FirstOrDefault();

                    #region  we are adding preferred suppliers...
                    if (assets.PreferredSuppliers != null)
                    {
                        List<DynamicParameters> suppliersToAdd = new List<DynamicParameters>();

                        foreach (var record in assets.PreferredSuppliers.Where(j=>j.AssetPreferredSupplierId==0))
                        {
                            var supplier = new DynamicParameters();

                            supplier.Add("@Action", "SUPPLIERINSERT", DbType.String, ParameterDirection.Input);
                            supplier.Add("@AssetId", assets.AssetId, DbType.Int32, ParameterDirection.Input);
                            supplier.Add("@SupplierId", record.Supplier.SupplierId, DbType.Int32, ParameterDirection.Input);

                            suppliersToAdd.Add(supplier);
                        }
                        var suppliersSaveResults = this.m_dbconnection.Execute("AssetMaster_CRUD", suppliersToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        List<DynamicParameters> suppliersToDelete = new List<DynamicParameters>();
                        foreach (var record in assets.PreferredSuppliers.Where(j => j.AssetPreferredSupplierId >0 && j.IsDeleted==true))
                        {
                            var supplier = new DynamicParameters();

                            supplier.Add("@Action", "DELETESUPPLIER", DbType.String, ParameterDirection.Input);
                            supplier.Add("@AssetPreferredSupplierId", record.AssetPreferredSupplierId, DbType.Int32, ParameterDirection.Input);
                            suppliersToDelete.Add(supplier);
                        }
                        var suppliersDeleteResults = this.m_dbconnection.Execute("AssetMaster_CRUD", suppliersToDelete, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }
                    #endregion

                    transactionObj.Commit();

                    return result;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateAssetName(AssetMaster assets)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetMaster_CRUD",
                    new
                    {
                        Action = "VALIDATE",
                        AssetId = assets.AssetId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
