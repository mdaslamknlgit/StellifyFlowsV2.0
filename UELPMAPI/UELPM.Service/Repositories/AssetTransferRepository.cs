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
    public class AssetTransferRepository:IAssetTransferRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = null;
        SharedRepository sharedRepositoryObj = null;

        public int CreateAssetTransferRequest(AssetTransfer assetTransfer)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetTransferId = this.m_dbconnection.Query<int>("AssetTransfer_CRUD",
                            new
                            {
                                Action = "INSERT",
                                FromLocationId = assetTransfer.FromLocationId,
                                ToLocationId = assetTransfer.ToLocationId,
                                ReasonForTransfer = assetTransfer.ReasonForTransfer,
                                CreatedBy = assetTransfer.CreatedBy,
                                CreatedDate = DateTime.Now,
                                WorkFlowStatusId = assetTransfer.WorkFlowStatusId
                            },transaction:transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                        //looping through the list of selected assets id
                        foreach (var assetId in assetTransfer.SelectedAssets)
                        {
                            var assetsObj = new DynamicParameters();
                            assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            assetsObj.Add("@AssetTransferId", assetTransferId, DbType.Int32, ParameterDirection.Input);
                            assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                            assetsAdded.Add(assetsObj);
                        }
                        var assetResult = this.m_dbconnection.Execute("AssetTransfer_CRUD", assetsAdded, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);    
                   
                        #region
                        if (assetTransfer.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            assetTransfer.AssetTranferId = assetTransferId;

                            sharedRepositoryObj = new SharedRepository();

                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                 ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer),
                                 CompanyId = assetTransfer.CompanyId,
                                 DocumentId = assetTransfer.AssetTranferId,
                                 CreatedBy  = assetTransfer.CreatedBy,
                                 WorkFlowStatusId = assetTransfer.WorkFlowStatusId
                            },false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        return assetTransferId;
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

        public int DeleteAssetTransferRequest(AssetTransfer assets)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetTransfer_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = assets.CreatedBy,
                        CreatedDate = DateTime.Now,
                        AssetTransferId = assets.AssetTranferId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetTransferReqDisplayResult GetAssetTransferRequest(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetTransferReqDisplayResult assetTransferReqDisplayResult = new AssetTransferReqDisplayResult();

                //using (var result = this.m_dbconnection.QueryMultiple("AssetTransfer_CRUD", new
                //{
                //    Action = "SELECT",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    assetTransferReqDisplayResult.AssetTransferReq = result.Read<AssetTransfer>().ToList();
                //    assetTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();            
                //}
                return assetTransferReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetTransfer GetAssetTransferRequestDetails(int assetTransferReqId,int loggedInUserId=0)
        {
            try
            {
                AssetTransfer assetTransferObj = new AssetTransfer();
                using (var result = this.m_dbconnection.QueryMultiple("AssetTransfer_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetTransferId = assetTransferReqId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer)
                }, commandType: CommandType.StoredProcedure))
                {
                    assetTransferObj = result.ReadFirstOrDefault<AssetTransfer>();
                    assetTransferObj.SelectedAssetDetails = result.Read<AssetDetails, AssetMaster, Locations, UserProfile, Supplier, Invoices, AssetDetails>((AD, AM, LC, UP, SU, IV) =>
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
                        assetTransferObj.CurrentApproverUserId = userProfile.UserID;
                        assetTransferObj.CurrentApproverUserName = userProfile.UserName;
                    }
                }
                if (loggedInUserId != 0)
                {
                    assetTransferObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = assetTransferObj.AssetTranferId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer),
                        UserId = loggedInUserId,
                        DocumentUserId = assetTransferObj.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                return assetTransferObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetTransferReqDisplayResult SearchAssets(AssetTransferSearch assetTransferSearch)
        {
            try
            {
                AssetTransferReqDisplayResult assetTransferReqDisplayResult = new AssetTransferReqDisplayResult();

                string whereCondition = @"from
                                                dbo.AssetTranfer as AT
                                            join
                                                dbo.WorkFlowStatus as WFS
                                            on
                                             AT.WorkFlowStatusId = WFS.WorkFlowStatusid
		                                    join dbo.UserProfile as UP
		                                    on
		                                      AT.CreatedBy = UP.UserID
                                            where
                                            IsDeleted = 0";

                if(assetTransferSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and AT.AssetTranferId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }

                if (assetTransferSearch.AssetTransferId > 0)
                {
                    whereCondition = $"{ whereCondition } and AT.AssetTranferId = @AssetTranferId ";
                }
                if (assetTransferSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and CreatedBy = @RequestFromUserId ";
                }
                if (assetTransferSearch.FromLocationId > 0)
                {
                    whereCondition = $"{ whereCondition } and FromLocationId = @FromLocationId ";
                }
                if (assetTransferSearch.Search != null && assetTransferSearch.Search != "")
                {
                    whereCondition += " and  ( AT.AssetTranferId LIKE concat('%',@Search,'%') or WFS.Statustext LIKE concat('%',@Search,'%') ) ";
                }
                string assetsQuery = @"		select
		                                    AT.AssetTranferId,
		                                    FromLocationId,
		                                    ToLocationId,
		                                    ReasonForTransfer,
		                                    AT.WorkFlowStatusId,
                                            UP.FirstName as RequestedByUserName,
		                                    WFS.Statustext as WorkFlowStatus ";

                assetsQuery = $"{ assetsQuery } { whereCondition } order by UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                assetsQuery = $"{ assetsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(assetsQuery, new
                {
                    Action = "SELECT",
                    Skip = assetTransferSearch.Skip,
                    Take = assetTransferSearch.Take,
                    UserId = assetTransferSearch.UserId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer),
                    AssetTranferId = assetTransferSearch.AssetTransferId,
                    FromLocationId = assetTransferSearch.FromLocationId,
                    RequestFromUserId = assetTransferSearch.RequestFromUserId,
                    Search = assetTransferSearch.Search
                }, commandType: CommandType.Text))
                {
                    assetTransferReqDisplayResult.AssetTransferReq = result.Read<AssetTransfer>().ToList();
                    assetTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetTransferReqDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        public int UpdateAssetTransferRequest(AssetTransfer assetTransfer)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var assetTransferResult =  this.m_dbconnection.Query<int>("AssetTransfer_CRUD",
                                                new
                                                {
                                                    Action = "UPDATE",
                                                    AssetTransferId = assetTransfer.AssetTranferId,
                                                    FromLocationId = assetTransfer.FromLocationId,
                                                    ToLocationId = assetTransfer.ToLocationId,
                                                    ReasonForTransfer = assetTransfer.ReasonForTransfer,
                                                    CreatedBy = assetTransfer.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    WorkFlowStatusId = assetTransfer.WorkFlowStatusId
                                                }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if(assetTransfer.DeletedAssets!=null && assetTransfer.DeletedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsDeleted = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetTransfer.DeletedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetTransferId", assetTransfer.AssetTranferId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsDeleted.Add(assetsObj);
                            }
                            var assetDeleteResult = this.m_dbconnection.Execute("AssetTransfer_CRUD", assetsDeleted, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        if (assetTransfer.SelectedAssets != null && assetTransfer.SelectedAssets.Count > 0)
                        {

                            List<DynamicParameters> assetsAdded = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var assetId in assetTransfer.SelectedAssets)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@AssetTransferId", assetTransfer.AssetTranferId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@AssetDetailId", assetId, DbType.Int32, ParameterDirection.Input);
                                assetsAdded.Add(assetsObj);
                            }
                            var assetResult = this.m_dbconnection.Execute("AssetTransfer_CRUD", assetsAdded, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        #region
                        if (assetTransfer.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            sharedRepositoryObj = new SharedRepository();
                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer),
                                CompanyId = assetTransfer.CompanyId,
                                DocumentId = assetTransfer.AssetTranferId,
                                CreatedBy = assetTransfer.CreatedBy,
                                WorkFlowStatusId = assetTransfer.WorkFlowStatusId
                            },false,transactionObj,this.m_dbconnection);
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



        public AssetTransferReqDisplayResult GetAssetTransferForApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetTransferReqDisplayResult assetTransferReqDisplayResult = new AssetTransferReqDisplayResult();

                //using (var result = this.m_dbconnection.QueryMultiple("AssetTransfer_CRUD", new
                //{
                //    Action = "SELECTAPPROVALS",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take,
                //    UserId = gridDisplayInput.UserId,
                //    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer)
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    assetTransferReqDisplayResult.AssetTransferReq = result.Read<AssetTransfer>().ToList();
                //    assetTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}
                return assetTransferReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }
    }
}
