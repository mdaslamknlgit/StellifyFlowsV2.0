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
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class AssetRegisterRepository:IAssetRegisterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public AssetDetailsDisplayResult GetAllAssetsDetails(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDetailsDisplayResult assetDetailsDisplayResult = new AssetDetailsDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDetails_CRUD", new
                {
                    Action = "SELECTALLDETAILS",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId,
                    SortExpression = gridDisplayInput.SortExpression,
                    SortDirection = gridDisplayInput.SortDirection
                }, commandType: CommandType.StoredProcedure))

                {
                    //Supplier, Invoices, , SU, IV
                    assetDetailsDisplayResult.Assets = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, Supplier, Invoices, AssetDetails>((AD, AM, LC, UP, SU, IV) =>
                    {
                        AD.Location = LC;
                        AD.Asset = AM;
                        AD.UsedBy = UP;
                        AD.Supplier = SU;
                        AD.Invoice = IV;
                        return AD;
                    }, splitOn: "AssetId,LocationID,UserID,SupplierId,InvoiceId").ToList();

                    assetDetailsDisplayResult.TotalRecords = result.Read<int>().FirstOrDefault();
                }
                return assetDetailsDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch)
        {
            try
            {
                AssetDetailsDisplayResult assetDetailsDisplayResult = new AssetDetailsDisplayResult();
                string assetRegisterQuery = "";
                string whereCondition =
                                             @" from
                                                dbo.AssetDetails as	AD
	                                            join
		                                            dbo.Asset as AT
		                                            on
		                                            AD.AssetId = AT.AssetId
	                                            left join
	                                                dbo.Depreciation as DP
		                                            ON 
		                                            AD.DepreciationId = DP.DepreciationId
	                                            left join
		                                            dbo.AssetCategory as AC
		                                            ON
		                                            AT.AssetCategoryId = AC.AssetCategoryId
	                                            left join
		                                            dbo.AssetType as ATP
		                                            ON
		                                            AC.AssetTypeId = ATP.AssetTypeId
	                                            left join
	                                                dbo.Location as LC
		                                            ON
		                                            AD.LocationId = LC.LocationID
	                                            left join
	                                                dbo.UserProfile as UP
		                                            ON
		                                            AD.UsedBy = UP.UserID";
                if (assetMasterSearch.IsRegister == true)//this will be false for asset register search...
                {
                    whereCondition += @"  left join 
	                                                dbo.Invoice as IC
		                                            on
		                                            AD.InvoiceId = IC.InvoiceId
	                                            left join
	                                                dbo.Supplier as SU
		                                            on
		                                            AD.SupplierId = SU.SupplierId";
                }
                whereCondition += @" where  AD.IsDeleted = 0 ";
                if (assetMasterSearch.CompanyId > 0)
                {
                    whereCondition += " and  ( AD.CompanyId = @CompanyId )";
                }
                if (assetMasterSearch.LocationId > 0)
                {
                    whereCondition += " and  ( AD.LocationId = @LocationId )";
                }
                if (assetMasterSearch.AssetName != null && assetMasterSearch.AssetName != "")
                {
                    whereCondition += " and  ( AT.AssetName LIKE concat('%',@AssetName,'%') )";
                }
                if (assetMasterSearch.SerialNumber != null && assetMasterSearch.SerialNumber != "")
                {
                    whereCondition += " and  ( AD.SerialNumber LIKE concat('%',@SerialNumber,'%') )";
                }
                if (assetMasterSearch.BarCode != null && assetMasterSearch.BarCode != "")
                {
                    whereCondition += " and  ( AD.BarCode LIKE concat('%',@BarCode,'%') )";
                }
                if (assetMasterSearch.PurchasedDate != null)
                {
                    whereCondition += " and  ( CONVERT(date,AD.PurchasedDate) = @PurchasedDate )";
                }
                if (assetMasterSearch.Search != null && assetMasterSearch.Search != "")
                {
                    whereCondition += " and  ( AT.AssetName LIKE concat('%',@Search,'%') or AD.SerialNumber LIKE concat('%',@Search,'%') ) ";
                }
                assetRegisterQuery = @" select 
                                        AssetDetailsId, 
                                        SerialNumber, 
                                        AD.BarCode, 
                                        PurchasedValue, 
                                        PurchasedDate, 
                                        SalvageValue,
                                        CurrentValue, 
                                        DP.DepreciationId, 
                                        DP.Name as DepreciationMethod,
                                        AC.AssetTypeId, 
                                        AD.AssetId, 
                                        AT.AssetName, 
                                        ATP.AssetType, 
                                        LC.LocationID, 
                                        LC.Name, 
                                        UP.UserID, 
                                        UP.FirstName";
                if (assetMasterSearch.IsRegister == true)//this will be false for asset register search...
                {
                    assetRegisterQuery += @",SU.SupplierId,
		                                     SU.SupplierName,
		                                     AD.InvoiceId,
		                                     IC.InvoiceCode ";
                }
                assetRegisterQuery += whereCondition;

                assetRegisterQuery += " order by ";

                if (assetMasterSearch.SortExpression == "Sno")
                {
                    assetRegisterQuery += " AD.SerialNumber ";
                }
                else if (assetMasterSearch.SortExpression == "Asset")
                {
                    assetRegisterQuery += " AT.AssetName ";
                }
                else if (assetMasterSearch.SortExpression == "PurchasedDate")
                {
                    assetRegisterQuery += " AD.PurchasedDate ";
                }
                else
                {
                    assetRegisterQuery += " AT.UpdatedDate ";
                }

                if (assetMasterSearch.SortDirection == "1")//ascending
                {
                    assetRegisterQuery += " asc ";
                }
                else if (( assetMasterSearch.SortDirection == "-1"))//descending
                {
                    assetRegisterQuery += " desc ";
                }
                if (assetMasterSearch.Take > 0)
                {
                    assetRegisterQuery += "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";
                    assetRegisterQuery += " select count(*) ";
                    assetRegisterQuery += whereCondition;
                }
                using (var result = this.m_dbconnection.QueryMultiple(assetRegisterQuery, new
                {
                    Action = "SELECT",
                    Skip = assetMasterSearch.Skip,
                    Take = assetMasterSearch.Take,
                    Search = assetMasterSearch.Search,
                    AssetName = assetMasterSearch.AssetName,
                    SerialNumber = assetMasterSearch.SerialNumber,
                    LocationId = assetMasterSearch.LocationId,
                    PurchasedDate = assetMasterSearch.PurchasedDate,
                    BarCode = assetMasterSearch.BarCode,
                    CompanyId = assetMasterSearch.CompanyId
                }, commandType: CommandType.Text))
                {
                    if (assetMasterSearch.IsRegister == true)
                    {
                        assetDetailsDisplayResult.Assets = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, Supplier, Invoices, AssetDetails>((AD, AM, LC, UP, SU, IV) =>
                        {
                            AD.Location = LC;
                            AD.Asset = AM;
                            AD.UsedBy = UP;
                            AD.Supplier = SU;
                            AD.Invoice = IV;
                            return AD;
                        }, splitOn: "AssetId,LocationID,UserID,SupplierId,InvoiceId").ToList();
                    }
                    else
                    {
                        assetDetailsDisplayResult.Assets = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, AssetDetails>((AD, AM, LC, UP) =>
                        {
                            AD.Location = LC;
                            AD.Asset = AM;
                            AD.UsedBy = UP;
                            return AD;
                        }, splitOn: "AssetId,LocationID,UserID").ToList();
                    }

                    if (assetMasterSearch.Take > 0)
                    {
                        assetDetailsDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return assetDetailsDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetAssetRegisterPDFTemplate(AssetDetailsSearch displayInput)
        {
            try
            {
                PdfGenerator pdfGeneratorObj =  new PdfGenerator();
                AssetDetailsDisplayResult assetDetailResult  = SearchAssets(displayInput);
                var companyDetails = new SharedRepository().GetCompanyDetails(displayInput.CompanyId);           
                var result = pdfGeneratorObj.GetAssetRegisterPDFTemplate(assetDetailResult.Assets, companyDetails);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<AssetDetails> PostedAssetDetails(int assetDetailId)
        {
            try
            {
                List<AssetDetails> postedAssetDetails = new List<AssetDetails>();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDepreciation_CRUD", new
                {
                    Action = "POSTEDASSETDETAILS",
                    AssetDetailsId = assetDetailId
                }, commandType: CommandType.StoredProcedure))
                {
                    var assetDetails = result.ReadFirstOrDefault<AssetDetails>();
                    var assetPostedDetails = result.Read<AssetDetails>().ToList();
                    if (assetDetails != null)
                    {
                        var beginningValue = assetDetails.PurchasedValue;
                        decimal accumulatedDepreciation = 0;
                        for (int depCalYears = 0; depCalYears < assetDetails.DepreciationYears; depCalYears++)
                        {
                            decimal depAmount = (beginningValue - assetDetails.SalvageValue) / (Convert.ToInt32(assetDetails.DepreciationYears) - depCalYears);
                            accumulatedDepreciation = (depCalYears + 1) * depAmount;
                            decimal endingValue = (beginningValue - depAmount);

                            AssetDetails assetObj = new AssetDetails();
                            assetObj = new AssetDetails
                            {
                                BeginningValue = beginningValue,
                                SalvageValue = assetDetails.SalvageValue,
                                DepreciationAmount = depAmount,
                                AccDepreciationAmount = accumulatedDepreciation,
                                EndingValue = endingValue,
                            };
                            if(assetPostedDetails.Where(j=>j.BeginningValue==beginningValue).Count() >0)
                            {
                                assetObj.IsPosted = true;
                                assetObj.DateOfPosting = assetPostedDetails.Where(j => j.BeginningValue == beginningValue).Select(k => k.DateOfPosting).FirstOrDefault();
                            }
                            postedAssetDetails.Add(assetObj);
                            beginningValue = endingValue;
                        }
                    }
                };
                return postedAssetDetails;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
