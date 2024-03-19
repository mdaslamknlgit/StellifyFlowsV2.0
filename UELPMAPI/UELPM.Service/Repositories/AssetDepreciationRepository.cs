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
    public class AssetDepreciationRepository: IAssetDepreciationRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = null;
        SharedRepository sharedRepositoryObj = null;

        public int CreateAssetDepreciationRequest(AssetDepreciation assetDepreciation)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetDepreciationId = this.m_dbconnection.Query<int>("AssetDepreciation_CRUD",
                        new
                        {
                            Action = "INSERT",
                            CreatedBy = assetDepreciation.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = assetDepreciation.WorkFlowStatusId,
                            LocationId = assetDepreciation.LocationId
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                        //looping through the list of selected assets id
                        foreach (var assetId in assetDepreciation.SelectedAssets)
                        {
                            var assetsObj = new DynamicParameters();
                            assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            assetsObj.Add("@AssetDepreciationId", assetDepreciationId, DbType.Int32, ParameterDirection.Input);
                            assetsObj.Add("@AssetDetailsId", assetId, DbType.Int32, ParameterDirection.Input);
                            assetsAdded.Add(assetsObj);
                        }
                        var assetResult = this.m_dbconnection.Execute("AssetDepreciation_CRUD", assetsAdded, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        #region
                        if (assetDepreciation.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            assetDepreciation.AssetDepreciationId = assetDepreciationId;

                            sharedRepositoryObj = new SharedRepository();

                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation),
                                CompanyId = assetDepreciation.CompanyId,
                                DocumentId = assetDepreciation.AssetDepreciationId,
                                CreatedBy = assetDepreciation.CreatedBy,
                                WorkFlowStatusId = assetDepreciation.WorkFlowStatusId,
                                LocationId = assetDepreciation.LocationId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        return assetDepreciationId;
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

        public int DeleteAssetDepreciationRequest(AssetDepreciation assetDepreciation)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetDepreciation_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = assetDepreciation.CreatedBy,
                        CreatedDate = DateTime.Now,
                        AssetDepreciationId = assetDepreciation.AssetDepreciationId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDeprectionReqDisplayResult GetAssetDepreciationRequest(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDeprectionReqDisplayResult assetDepReqDisplayResult = new AssetDeprectionReqDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDepreciation_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    assetDepReqDisplayResult.AssetDepreciation = result.Read<AssetDepreciation>().ToList();
                    assetDepReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetDepReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetDepreciation GetAssetDepreciationRequestDetails(int assetDepreciationReqId, int loggedInUserId = 0)
        {
            try
            {
                AssetDepreciation assetDepObj = new AssetDepreciation();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDepreciation_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetDepreciationId = assetDepreciationReqId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation)
                }, commandType: CommandType.StoredProcedure))
                {
                    assetDepObj = result.ReadFirstOrDefault<AssetDepreciation>();
                    assetDepObj.AssetDetails = result.Read<AssetDetails, AssetMaster, Locations,AssetDetails>((AD, AM, LC) =>
                    {
                        AD.Location = LC;
                        AD.Asset = AM;
                        return AD;
                    }, splitOn: "AssetId,LocationID").ToList();

                    if (assetDepObj.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                    {
                        UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                        if (userProfile != null)
                        {
                            assetDepObj.CurrentApproverUserId = userProfile.UserID;
                            assetDepObj.CurrentApproverUserName = userProfile.UserName;
                        }
                    }
                }
                if (assetDepObj!=null && assetDepObj.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    assetDepObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = assetDepObj.AssetDepreciationId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation),
                        UserId = loggedInUserId,
                        DocumentUserId = assetDepObj.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                return assetDepObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDeprectionReqDisplayResult SearchAssets(AssetDepreciationSearch assetDepSearch)
        {
            try
            {
                AssetDeprectionReqDisplayResult assetDepReqDisplayResult = new AssetDeprectionReqDisplayResult();

                string whereCondition = @" from
		                                    dbo.AssetDepreciation AS AD
		                                    join dbo.UserProfile as UP
		                                    on
		                                    AD.CreatedBy = UP.UserID
		                                    join
		                                    dbo.WorkFlowStatus as WF
		                                    on
		                                    AD.WorkFlowStatusId  = WF.WorkFlowStatusid";

                if (assetDepSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and AD.AssetDepreciationId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }

                if (assetDepSearch.AssetDepreciationId > 0)
                {
                    whereCondition = $"{ whereCondition } and AD.AssetDepreciationId = @AssetDepreciationId ";
                }
                else if (assetDepSearch.Search != "" && assetDepSearch.Search != null && assetDepSearch.Search!="null")
                {
                     whereCondition = $"{ whereCondition } and ( AD.AssetDepreciationId = cast(@SearchKey as int) ) ";
                }

                if (assetDepSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and AD.CreatedBy = @RequestFromUserId ";
                }
                if (assetDepSearch.FromLocationId > 0)
                {
                    whereCondition = $"{ whereCondition } and AD.locationId = @FromLocationId ";
                }
                string assetsDepQuery = @"	select 
		                                    AssetDepreciationId,
		                                    DateOfPosting,
		                                    AD.WorkFlowStatusId,
                                            UP.FirstName as RequestedByUserName,
		                                    WF.Statustext as WorkFlowStatus,
		                                    CreatedBy,
		                                    AD.CreatedDate ";
                assetsDepQuery = $"{ assetsDepQuery } { whereCondition } order by UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                assetsDepQuery = $"{ assetsDepQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(assetsDepQuery, new
                {
                    Action = "SELECT",
                    Skip = assetDepSearch.Skip,
                    Take = assetDepSearch.Take,
                    UserId = assetDepSearch.UserId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation),
                    AssetDepreciationId = assetDepSearch.AssetDepreciationId,
                    FromLocationId = assetDepSearch.FromLocationId,
                    RequestFromUserId = assetDepSearch.RequestFromUserId,
                    SearchKey = assetDepSearch.Search
                }, commandType: CommandType.Text))
                {
                    assetDepReqDisplayResult.AssetDepreciation = result.Read<AssetDepreciation>().ToList();
                    assetDepReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetDepReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateAssetDepreciationRequest(AssetDepreciation assetDepreciation)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetTransferResult = this.m_dbconnection.Query<int>("AssetDepreciation_CRUD",
                                                new
                                                {
                                                    Action = "UPDATE",
                                                    AssetDepreciationId = assetDepreciation.AssetDepreciationId,
                                                    CreatedBy = assetDepreciation.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    WorkFlowStatusId = assetDepreciation.WorkFlowStatusId,
                                                  //  LocationId = assetDepreciation.LocationId
                                                }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (assetDepreciation.DeletedAssets != null && assetDepreciation.DeletedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsDeleted = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetDepreciation.DeletedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetDepreciationId", assetDepreciation.AssetDepreciationId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailsId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsDeleted.Add(assetsObj);
                            }
                            var assetDeleteResult = this.m_dbconnection.Execute("AssetDepreciation_CRUD", assetsDeleted, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        if (assetDepreciation.SelectedAssets != null && assetDepreciation.SelectedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetDepreciation.SelectedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetDepreciationId", assetDepreciation.AssetDepreciationId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailsId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsAdded.Add(assetsObj);
                            }
                            var assetResult = this.m_dbconnection.Execute("AssetDepreciation_CRUD", assetsAdded, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        #region
                        if (assetDepreciation.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            sharedRepositoryObj = new SharedRepository();
                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation),
                                CompanyId = assetDepreciation.CompanyId,
                                DocumentId = assetDepreciation.AssetDepreciationId,
                                CreatedBy = assetDepreciation.CreatedBy,
                                WorkFlowStatusId = assetDepreciation.WorkFlowStatusId,
                                LocationId = assetDepreciation.LocationId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        return assetTransferResult;
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

        public AssetDeprectionReqDisplayResult GetAssetDepReqForApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDeprectionReqDisplayResult assetDepreciationReqDisplayResult = new AssetDeprectionReqDisplayResult();

                //using (var result = this.m_dbconnection.QueryMultiple("AssetDepreciation_CRUD", new
                //{
                //    Action = "SELECTAPPROVALS",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take,
                //    UserId = gridDisplayInput.UserId,
                //    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation)
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    assetDepreciationReqDisplayResult.AssetDepreciation = result.Read<AssetDepreciation>().ToList();
                //    assetDepreciationReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}
                return assetDepreciationReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

    }
}
