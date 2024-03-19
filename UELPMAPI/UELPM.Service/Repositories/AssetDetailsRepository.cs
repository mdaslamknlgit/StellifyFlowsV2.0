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
    public class AssetDetailsRepository : IAssetDetailsRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;
        public int CreateAssetDetails(AssetDetails assets)
        {
            try
            {

                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int assetDetailId = this.SaveAssetDetails(new List<AssetDetails>() { assets },this.m_dbconnection,transactionObj,"INSERT");

                        transactionObj.Commit();

                        return assetDetailId;
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

        //Note: we are calling this method even in the "GRN" 
        public int SaveAssetDetails(List<AssetDetails> Assets,IDbConnection connection,IDbTransaction transactionObj,string action)
        {
            try
            {
                List<DynamicParameters> assetDetailsToAdd = new List<DynamicParameters>();
                foreach(var details in Assets)
                {
                    var assetObj = new DynamicParameters();

                    assetObj.Add("@Action", action, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@AssetDetailsId", details.AssetDetailsId, DbType.Int32, ParameterDirection.Input);
                    assetObj.Add("@AssetId", details.Asset.AssetId, DbType.Int32, ParameterDirection.Input);
                    assetObj.Add("@AccountCode", details.AccountCode, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@SerialNumber", details.SerialNumber, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@BarCode", details.BarCode, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@PurchasedValue", details.PurchasedValue, DbType.Decimal, ParameterDirection.Input);
                    assetObj.Add("@PurchasedDate", details.PurchasedDate, DbType.DateTime, ParameterDirection.Input);
                    assetObj.Add("@CompanyId",details.CompanyId,DbType.Int32,ParameterDirection.Input);
                    //if (details.DepreciationId>0)
                    //{
                    assetObj.Add("@DepreciationId",1, DbType.Int32, ParameterDirection.Input);
                    //}            
                    assetObj.Add("@SalvageValue", details.SalvageValue, DbType.Decimal, ParameterDirection.Input);
                    assetObj.Add("@LocationId", details.Location.LocationID, DbType.Int32, ParameterDirection.Input);
                    assetObj.Add("@CurrentValue", details.CurrentValue, DbType.Decimal, ParameterDirection.Input);
                    if (details.Supplier != null)
                    {
                        assetObj.Add("@SupplierId", details.Supplier.SupplierId,DbType.Int32,ParameterDirection.Input);
                    }
                    if(details.Invoice!=null)
                    {
                        assetObj.Add("@InvoiceId", details.Invoice.InvoiceId, DbType.Int32, ParameterDirection.Input);
                    }
                    assetObj.Add("@ExpiryDate", details.ExpiryDate, DbType.DateTime, ParameterDirection.Input);
                    assetObj.Add("@DepreciationYears", details.DepreciationYears, DbType.Int32, ParameterDirection.Input);
                    if (details.UsedBy!=null && details.UsedBy.UserID > 0)
                    {
                        assetObj.Add("@UsedBy", details.UsedBy.UserID, DbType.Int32, ParameterDirection.Input);
                    }
                    assetObj.Add("@GoodsReceivedNoteId", details.GoodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                    assetObj.Add("@ManufacturedBy", details.ManufacturedBy, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@ManufacturedDate", details.ManufacturedDate, DbType.DateTime, ParameterDirection.Input);
                    assetObj.Add("@Warranty", details.Warranty, DbType.String, ParameterDirection.Input);
                    assetObj.Add("@CreatedBy", details.CreatedBy, DbType.Int32, ParameterDirection.Input);
                    assetObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                    assetObj.Add("@ReturnedAssetDetailId", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
                    assetObj.Add("@GLCode", details.GLCode, DbType.String, ParameterDirection.Input);

                    assetDetailsToAdd.Add(assetObj);
                }
                var assetsSaveResult = connection.Execute("AssetDetails_CRUD", assetDetailsToAdd, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                int maxAssetDetailId = assetDetailsToAdd.Max(x => x.Get<int>("@ReturnedAssetDetailId"));  

                return maxAssetDetailId;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int DeleteAssetDetails(AssetDetails assets)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetDetails_CRUD",
                    new
                    {
                        Action = "DELETE",
                        AssetDetailsId = assets.AssetDetailsId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDetailsDisplayResult GetAssets(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDetailsDisplayResult assetDetailsDisplayResult = new AssetDetailsDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDetails_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    assetDetailsDisplayResult.Assets = result.Read<AssetDetails, AssetMaster, AssetDetails>((AD, AM) =>
                    {
                        AD.Asset = AM;
                        return AD;
                    }, splitOn: "AssetId").ToList();
                    assetDetailsDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetDetailsDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetDetails GetAssetDetails(int assetDetailId)
        {
            try
            {
                AssetDetails assets = new AssetDetails();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDetails_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetDetailsId = assetDetailId
                }, commandType: CommandType.StoredProcedure))
                {
                    assets = result.Read<AssetDetails,AssetMaster, Locations,UserProfile, Supplier, Invoices, AssetDetails>((AD,AM, LC,UP,SU,IV) =>
                    {
                        AD.Location = LC;
                        AD.Asset = AM;
                        AD.UsedBy = UP;
                        AD.Supplier = SU;
                        AD.Invoice = IV;
                        return AD;
                    }, splitOn: "AssetId,LocationID,UserID,SupplierId,InvoiceId").FirstOrDefault();

                    if (assets != null)
                    {
                        assets.PreferredSuppliers = result.Read<PreferredSupplier, Supplier, PreferredSupplier>((PS, Su) => {

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

        //public AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch)
        //{
        //    try
        //    {
        //        AssetDetailsDisplayResult assetCategoryDisplayResult = new AssetDetailsDisplayResult();

        //        string assetCategoryQuery = "";
        //        string whereCondition = @" from 
						  //                  dbo.AssetDetails as	AD
					   //                 join
						  //                  dbo.Asset as AT
						  //                  on
						  //                  AD.AssetId = AT.AssetId
					   //                 left join
						  //                  dbo.Depreciation as DP
						  //                  ON 
						  //                  AD.DepreciationId = DP.DepreciationId
					   //                 left join
						  //                  dbo.AssetCategory as AC
						  //                  ON
						  //                  AT.AssetCategoryId = AC.AssetCategoryId
					   //                 left join
						  //                  dbo.AssetType as ATP
						  //                  ON
						  //                  AC.AssetTypeId = ATP.AssetTypeId
					   //                 left join
						  //                  dbo.Location as LC
						  //                  ON
						  //                  AD.LocationId = LC.LocationID
					   //                 left join
						  //                  dbo.UserProfile as UP
						  //                  ON
						  //                  AD.UsedBy = UP.UserID
					   //                 where
						  //                  AD.IsDeleted = 0 and AD.CompanyId = @CompanyId";
        //        string selectQuery = "";

        //        if (assetMasterSearch.LocationId > 0)
        //        {
        //            whereCondition = $" { whereCondition } and  ( AD.LocationId = @LocationId )";
        //        }
        //        if (assetMasterSearch.AssetName != null && assetMasterSearch.AssetName != "")
        //        {
        //            whereCondition = $" { whereCondition } and  ( AT.AssetName LIKE concat('%',@AssetName,'%') )";
        //        }
        //        if (assetMasterSearch.SerialNumber != null && assetMasterSearch.SerialNumber != "")
        //        {
        //            whereCondition = $" { whereCondition }  and  ( AD.SerialNumber LIKE concat('%',@Search,'%') )";
        //        }
        //        if (assetMasterSearch.Search != null && assetMasterSearch.Search != "")
        //        {
        //            whereCondition = $" { whereCondition } and  ( AT.AssetName LIKE concat('%',@Search,'%') or AD.SerialNumber LIKE concat('%',@Search,'%') ) ";
        //        }
        //        assetCategoryQuery = @" select 
        //                                AssetDetailsId,
        //                                SerialNumber,
						  //              AD.BarCode,
						  //              PurchasedValue,
						  //              PurchasedDate,
						  //              AD.ManufacturedBy,
						  //              AD.ManufacturedDate,
						  //              AD.Warranty,
						  //              SalvageValue,
						  //              CurrentValue,
						  //              DP.DepreciationId,
						  //              DP.Name as DepreciationMethod,
						  //              AC.AssetTypeId,
						  //              AD.AssetId,
						  //              AT.AssetName,
						  //              ATP.AssetType,
						  //              LC.LocationID,
						  //              LC.Name,
						  //              UP.UserID,
						  //              UP.FirstName ";
        //        assetCategoryQuery = $" { assetCategoryQuery} { whereCondition } order by   AT.UpdatedDate desc ";
                                        
        //        if (assetMasterSearch.Take > 0)
        //        {
        //            assetCategoryQuery = $" { assetCategoryQuery } OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ; select  count(*)  { whereCondition } ";

        //        }
        //        using (var result = this.m_dbconnection.QueryMultiple(assetCategoryQuery, new
        //        {
        //            Action = "SELECT",
        //            Skip = assetMasterSearch.Skip,
        //            Take = assetMasterSearch.Take,
        //            Search = assetMasterSearch.Search,
        //            AssetName = assetMasterSearch.AssetName,
        //            SerialNumber = assetMasterSearch.SerialNumber,
        //            LocationId = assetMasterSearch.LocationId,
        //            CompanyId = assetMasterSearch.CompanyId
        //        }, commandType: CommandType.Text))
        //        {
        //            assetCategoryDisplayResult.Assets = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, AssetDetails>((AD, AM, LC, UP) =>
        //            {
        //                AD.Location = LC;
        //                AD.Asset = AM;
        //                AD.UsedBy = UP;
        //                return AD;
        //            }, splitOn: "AssetId,LocationID,UserID").ToList();
        //            assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
        //        }
        //        return assetCategoryDisplayResult;
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}

        public int UpdateAssetMaster(AssetDetails assets)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    int assetDetailId = this.SaveAssetDetails(new List<AssetDetails>() { assets }, this.m_dbconnection, transactionObj,"UPDATE");
                    transactionObj.Commit();
                    return assetDetailId;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        
        public UploadResult UploadAssetDetails(string filePath, int userId)
        {
            try
            {
                UploadResult uploadResult = null;
                int count = 0;
                int Fcount = 0;
                int result = 0;
                string companies = string.Empty;
                List<AssetSubCategory> assetcategoryList = new List<AssetSubCategory>();
                List<DynamicParameters>  assetcategoryupdate = new List<DynamicParameters>();
                this.m_dbconnection.Open();
                DataTable dtAccountCodes = ExcelUpload.ExcelUpload.ReadAsDataTable(filePath);
                var assetSubcatDetails = from table in dtAccountCodes.AsEnumerable()
                              select new
                              {
                                 
                                  CompanyName = table["Entity"],
                                  AssetSubcategory = table["Sub Category"],
                                  AccountCode = table["Account Code"],
                                  AssetType  =table["Type"],
                                  Description = table["Description"]
                              };


                uploadResult = new UploadResult();
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                      
                        foreach (var columnValue in assetSubcatDetails)
                        {
                             DynamicParameters itemObj = new DynamicParameters();
                                itemObj.Add("@CompanyName", Convert.ToString(columnValue.CompanyName).Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Type", Convert.ToString(columnValue.AssetType).Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AssetSubcategory", Convert.ToString(columnValue.AssetSubcategory).Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Description", Convert.ToString(columnValue.Description).Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AccountCode", Convert.ToString(columnValue.AccountCode).Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", userId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@result", dbType: DbType.Int32, direction: ParameterDirection.Output);
                                assetcategoryupdate.Add(itemObj);
                          
                        }
                    
                        
                            var sqlresult = this.m_dbconnection.Execute("IPS_TAssetSubcategory_CRUD", assetcategoryupdate,
                                    transaction: objTransaction,
                                    commandType: CommandType.StoredProcedure);
                        
                        assetcategoryupdate.ForEach(data => {
                            result = data.Get<int>("@result");
                            if (result == 1)
                                count++;
                            else
                                Fcount++;

                        });
                        objTransaction.Commit();
                        uploadResult.UploadedRecords = count;
                        uploadResult.FailedRecords = Fcount;
                       
                         return uploadResult;
                    }
                    catch (Exception e)
                    {
                        objTransaction.Rollback();
                        string s = e.Message;
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                string s = e.Message;
                throw e;
            }
        }

        private CompanyDetails GetCompanyDetails(string companyName)
        {
            sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyName);
        }
        public IEnumerable<AssetSubCategory> GetImportAssetDetails(int CompanyId)
        {
            try
            {

                var result = this.m_dbconnection.Query<AssetSubCategory>("[IPS_Sp_ReadAssetDetails]",
                                                                         new
                                                                         {
                                                                             CompanyId= CompanyId
                                                                         },
                                                                                commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}
