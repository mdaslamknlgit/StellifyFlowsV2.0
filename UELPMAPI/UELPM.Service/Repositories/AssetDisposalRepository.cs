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
    public class AssetDisposalRepository :IAssetDisposalRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = null;
        SharedRepository sharedRepositoryObj = null;

        public int CreateAssetDisposalRequest(AssetDisposal assetDisposal)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetDisposalId = this.m_dbconnection.Query<int>("AssetDisposal_CRUD",
                            new
                            {
                                Action = "INSERT",
                                Remarks = assetDisposal.Remarks,
                                CreatedBy = assetDisposal.CreatedBy,
                                CreatedDate = DateTime.Now,
                                WorkFlowStatusId = assetDisposal.WorkFlowStatusId,
                                LocationId = assetDisposal.Location.LocationID
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                        //looping through the list of selected assets id
                        foreach (var assetId in assetDisposal.SelectedAssets)
                        {
                            var assetsObj = new DynamicParameters();
                            assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            assetsObj.Add("@AssetDisposalId", assetDisposalId, DbType.Int32, ParameterDirection.Input);
                            assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                            assetsAdded.Add(assetsObj);
                        }
                        var assetResult = this.m_dbconnection.Execute("AssetDisposal_CRUD", assetsAdded, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        #region
                        if (assetDisposal.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            assetDisposal.AssetDisposalId = assetDisposalId;

                            sharedRepositoryObj = new SharedRepository();

                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal),
                                CompanyId = assetDisposal.CompanyId,
                                DocumentId = assetDisposal.AssetDisposalId,
                                CreatedBy = assetDisposal.CreatedBy,
                                WorkFlowStatusId = assetDisposal.WorkFlowStatusId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        return assetDisposalId;
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

        public int DeleteAssetDisposalRequest(AssetDisposal assetDisposal)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetDisposal_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = assetDisposal.CreatedBy,
                        CreatedDate = DateTime.Now,
                        AssetDisposalId = assetDisposal.AssetDisposalId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDisposalReqDisplayResult GetAssetDisposalRequest(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDisposalReqDisplayResult assetDisposalReqDisplayResult = new AssetDisposalReqDisplayResult();

                //using (var result = this.m_dbconnection.QueryMultiple("AssetDisposal_CRUD", new
                //{
                //    Action = "SELECT",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    assetDisposalReqDisplayResult.AssetDisposalReq = result.Read<AssetDisposal>().ToList();
                //    assetDisposalReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}
                return assetDisposalReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetDisposal GetAssetDisposalRequestDetails(int assetDisposalReqId, int loggedInUserId=0)
        {
            try
            {
                AssetDisposal assetDisposalObj = new AssetDisposal();
                using (var result = this.m_dbconnection.QueryMultiple("AssetDisposal_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetDisposalId = assetDisposalReqId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal)
                }, commandType: CommandType.StoredProcedure))
                {
                    assetDisposalObj = result.Read<AssetDisposal,Locations,AssetDisposal>((AD, LC) =>
                    {
                        AD.Location = LC;
                        return AD;
                    }, splitOn: "LocationID").FirstOrDefault();

                    assetDisposalObj.SelectedAssetDetails = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, Supplier, Invoices, AssetDetails>((AD, AM, LC, UP, SU, IV) =>
                    {
                        AD.Location = LC;
                        AD.Asset = AM;
                        AD.UsedBy = UP;
                        AD.Supplier = SU;
                        AD.Invoice = IV;
                        return AD;
                    }, splitOn: "AssetId,LocationID,UserID,SupplierId,InvoiceId").ToList();

                    UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                    if (userProfile != null)
                    {
                        assetDisposalObj.CurrentApproverUserId = userProfile.UserID;
                        assetDisposalObj.CurrentApproverUserName = userProfile.UserName;
                    }
                }
                if (loggedInUserId != 0)
                {
                    assetDisposalObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = assetDisposalObj.AssetDisposalId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal),
                        UserId = loggedInUserId,
                        DocumentUserId = assetDisposalObj.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                return assetDisposalObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetDisposalReqDisplayResult SearchAssets(AssetDisposalSearch assetDisposalSearch)
       {
            try
            {
                AssetDisposalReqDisplayResult assetDisposalReqDisplayResult = new AssetDisposalReqDisplayResult();

                string whereCondition = @"from
			                                dbo.AssetDisposal as  AT
		                                join
			                                dbo.WorkFlowStatus as WFS
		                                on
		                                 AT.WorkFlowStatusId = WFS.WorkFlowStatusid
		                                join dbo.UserProfile as UP
		                                on
		                                  AT.CreatedBy = UP.UserID
                                        join dbo.Location as LC
		                                ON 
		                                AT.LocationId = LC.LocationID
		                                where
		                                IsDeleted = 0";

                if (assetDisposalSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and AssetDisposalId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }

                if (assetDisposalSearch.AssetDisposalId > 0)
                {
                    whereCondition = $"{ whereCondition } and AssetDisposalId = @AssetDisposalId ";
                }
                else if (assetDisposalSearch.Search!="" && assetDisposalSearch.Search!=null)
                {
                    whereCondition = $"{ whereCondition } and (AssetDisposalId = @SearchKey or LC.Name LIKE concat('%',@SearchKey,'%') or WFS.Statustext LIKE concat('%',@SearchKey,'%') ) ";
                }
                if (assetDisposalSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and CreatedBy = @RequestFromUserId ";
                }
                if (assetDisposalSearch.FromLocationId > 0)
                {
                    whereCondition = $"{ whereCondition } and  LC.LocationID = @FromLocationId ";
                }
                string assetsQuery = @"	select
		                                   AssetDisposalId,
		                                   Remarks,
		                                   AT.WorkFlowStatusId,
		                                   UP.FirstName as RequestedByUserName,
		                                   WFS.Statustext as WorkFlowStatus,
                                           LC.LocationID,
			                               LC.Name";

                assetsQuery = $"{ assetsQuery } { whereCondition } order by UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                assetsQuery = $"{ assetsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(assetsQuery, new
                {
                    Action = "SELECT",
                    Skip = assetDisposalSearch.Skip,
                    Take = assetDisposalSearch.Take,
                    UserId = assetDisposalSearch.UserId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal),
                    AssetDisposalId = assetDisposalSearch.AssetDisposalId,
                    FromLocationId = assetDisposalSearch.FromLocationId,
                    RequestFromUserId = assetDisposalSearch.RequestFromUserId,
                    SearchKey=assetDisposalSearch.Search
                }, commandType: CommandType.Text))
                {
                    assetDisposalReqDisplayResult.AssetDisposalReq = result.Read<AssetDisposal>().ToList();
                    assetDisposalReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetDisposalReqDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        public int UpdateAssetDisposalRequest(AssetDisposal assetDisposal)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetTransferResult = this.m_dbconnection.Query<int>("AssetDisposal_CRUD",
                                                new
                                                {
                                                    Action = "UPDATE",
                                                    AssetDisposalId = assetDisposal.AssetDisposalId,
                                                    Remarks = assetDisposal.Remarks,
                                                    CreatedBy = assetDisposal.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    WorkFlowStatusId = assetDisposal.WorkFlowStatusId
                                                }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (assetDisposal.DeletedAssets != null && assetDisposal.DeletedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsDeleted = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetDisposal.DeletedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetDisposalId", assetDisposal.AssetDisposalId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsDeleted.Add(assetsObj);
                            }
                            var assetDeleteResult = this.m_dbconnection.Execute("AssetDisposal_CRUD", assetsDeleted, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        if (assetDisposal.SelectedAssets != null && assetDisposal.SelectedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetDisposal.SelectedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetDisposalId", assetDisposal.AssetDisposalId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsAdded.Add(assetsObj);
                            }
                            var assetResult = this.m_dbconnection.Execute("AssetDisposal_CRUD", assetsAdded, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        #region
                        if (assetDisposal.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            sharedRepositoryObj = new SharedRepository();
                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal),
                                CompanyId = assetDisposal.CompanyId,
                                DocumentId = assetDisposal.AssetDisposalId,
                                CreatedBy = assetDisposal.CreatedBy,
                                WorkFlowStatusId = assetDisposal.WorkFlowStatusId
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

        public AssetDisposalReqDisplayResult GetAssetDisposalForApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetDisposalReqDisplayResult assetDisposalReqDisplayResult = new AssetDisposalReqDisplayResult();

                //using (var result = this.m_dbconnection.QueryMultiple("AssetDisposal_CRUD", new
                //{
                //    Action = "SELECTAPPROVALS",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take,
                //    UserId = gridDisplayInput.UserId,
                //    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal)
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    assetDisposalReqDisplayResult.AssetDisposalReq = result.Read<AssetDisposal>().ToList();
                //    assetDisposalReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}
                return assetDisposalReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

    }
}
