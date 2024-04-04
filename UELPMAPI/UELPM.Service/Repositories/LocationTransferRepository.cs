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
    public class LocationTransferRepository : ILocationTransferRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepositoryObj = null;

        public int CreateLocationTransfer(LocationTransfer locationTransfer)
        {
            try
            {
                this.m_dbconnection.Open();
                int locationTransferId = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        string LocationTransferCode = this.m_dbconnection.QueryFirstOrDefault<string>("locationTransfer_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        locationTransferId = this.m_dbconnection.Query<int>("locationTransfer_CRUD",
                            new
                            {
                                Action = "INSERT",
                                FromLocationId = locationTransfer.FromLocationId,
                                ToLocationId = locationTransfer.ToLocationId,
                                LocationTransferCode= ModuleCodes.LocationTransfer+"-"+LocationTransferCode,
                                ReasonForTransfer = locationTransfer.ReasonForTransfer.Trim(),
                                CreatedBy = locationTransfer.CreatedBy,
                                CompanyId = locationTransfer.CompanyId,
                                CreatedDate = DateTime.Now,
                                WorkFlowStatusId = locationTransfer.WorkFlowStatusId
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        List<DynamicParameters> ltsAdded = new List<DynamicParameters>();
                        foreach (var record in locationTransfer.SelectedItemDetails)
                        {                            
                            var ltsObj = new DynamicParameters();
                            ltsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            ltsObj.Add("@LocationTransferId", locationTransferId, DbType.Int32, ParameterDirection.Input);
                            ltsObj.Add("@ItemMasterId", record.ItemMasterID, DbType.Int32, ParameterDirection.Input);
                            ltsObj.Add("@Quantity", record.Quantity, DbType.Int32, ParameterDirection.Input);
                            ltsAdded.Add(ltsObj);

                        }
                        var assetResult = this.m_dbconnection.Execute("locationTransfer_CRUD", ltsAdded, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        #region
                        if (locationTransfer.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            locationTransfer.LocationTransferId = locationTransferId;

                            sharedRepositoryObj = new SharedRepository();

                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer),
                                CompanyId = locationTransfer.CompanyId,
                                DocumentId = locationTransfer.LocationTransferId,
                                CreatedBy = locationTransfer.CreatedBy,
                                DocumentCode = LocationTransferCode,
                                WorkFlowStatusId = locationTransfer.WorkFlowStatusId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        return locationTransferId;
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

        public int DeleteLocationTransfer(LocationTransfer locationTransfer)
        {
            try
            {
                return this.m_dbconnection.Query<int>("locationTransfer_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = locationTransfer.CreatedBy,
                        CreatedDate = DateTime.Now,
                        LocationTransferId = locationTransfer.LocationTransferId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        
        public int UpdateLocationTransfer(LocationTransfer locationTransfer)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var locationTransferResult = this.m_dbconnection.Query<int>("locationTransfer_CRUD",
                                                new
                                                {
                                                    Action = "UPDATE",
                                                    LocationTransferId = locationTransfer.LocationTransferId,
                                                    FromLocationId = locationTransfer.FromLocationId,
                                                    ToLocationId = locationTransfer.ToLocationId,
                                                    ReasonForTransfer = locationTransfer.ReasonForTransfer.Trim(),
                                                    CreatedBy = locationTransfer.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    WorkFlowStatusId = locationTransfer.WorkFlowStatusId
                                                }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (locationTransfer.DeletedItems != null && locationTransfer.DeletedItems.Count > 0)
                        {

                            List<DynamicParameters> assetsDeleted = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var itemMasterId in locationTransfer.DeletedItems)
                            {
                                var assetsObj = new DynamicParameters();
                                assetsObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                assetsObj.Add("@LocationTransferId", locationTransfer.LocationTransferId, DbType.Int32, ParameterDirection.Input);
                                assetsObj.Add("@ItemMasterId", itemMasterId, DbType.Int32, ParameterDirection.Input);
                                assetsDeleted.Add(assetsObj);
                            }
                            var assetDeleteResult = this.m_dbconnection.Execute("locationTransfer_CRUD", assetsDeleted, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        if (locationTransfer.SelectedItemDetails != null && locationTransfer.SelectedItemDetails.Count > 0)
                        {

                            List<DynamicParameters> ltsAdded = new List<DynamicParameters>();
                            //looping through the list of selected assets id
                            foreach (var record in locationTransfer.SelectedItemDetails.Where(j => j.LocationTransferDetailId == 0).Select(j => j))
                            {
                                var ltsObj = new DynamicParameters();
                                ltsObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                ltsObj.Add("@LocationTransferId", locationTransfer.LocationTransferId, DbType.Int32, ParameterDirection.Input);
                                ltsObj.Add("@ItemMasterId", record.ItemMasterID, DbType.Int32, ParameterDirection.Input);
                                ltsObj.Add("@Quantity", record.Quantity, DbType.Int32, ParameterDirection.Input);
                                ltsAdded.Add(ltsObj);
                            }
                            var ltResult = this.m_dbconnection.Execute("locationTransfer_CRUD", ltsAdded, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            List<DynamicParameters> ltUpdates = new List<DynamicParameters>();

                            foreach (var record in locationTransfer.SelectedItemDetails.Where(j => j.LocationTransferDetailId > 0).Select(j => j))
                            {
                                var ltsObj = new DynamicParameters();
                                ltsObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                                ltsObj.Add("@LocationTransferDetailId", record.LocationTransferDetailId, DbType.Int32, ParameterDirection.Input);
                                ltsObj.Add("@LocationTransferId", locationTransfer.LocationTransferId, DbType.Int32, ParameterDirection.Input);
                                ltsObj.Add("@ItemMasterId", record.ItemMasterID, DbType.Int32, ParameterDirection.Input);
                                ltsObj.Add("@Quantity", record.Quantity, DbType.Int32, ParameterDirection.Input);
                                ltUpdates.Add(ltsObj);
                            }
                            var ltsResult = this.m_dbconnection.Execute("locationTransfer_CRUD", ltUpdates, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        #region
                        if (locationTransfer.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            sharedRepositoryObj = new SharedRepository();
                            sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                            {
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer),
                                CompanyId = locationTransfer.CompanyId,
                                DocumentId = locationTransfer.LocationTransferId,
                                CreatedBy = locationTransfer.CreatedBy,
                                DocumentCode = locationTransfer.LocationTransferCode,
                                WorkFlowStatusId = locationTransfer.WorkFlowStatusId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        return locationTransferResult;
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

        public LocationTransferReqDisplayResult GetLocationTransfer(GridDisplayInput gridDisplayInput)
        {
            try
            {
                LocationTransferReqDisplayResult locationTransferReqDisplayResult = new LocationTransferReqDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("locationTransfer_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId= gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    locationTransferReqDisplayResult.LocationTransferReq = result.Read<LocationTransfer>().ToList();
                    locationTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return locationTransferReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }
        

        public LocationTransfer GetLocationTransferDetails(int locationTransferReqId, int loggedInUserId = 0)
        {
            try
            {
                LocationTransfer locationTransferObj = new LocationTransfer();
                using (var result = this.m_dbconnection.QueryMultiple("locationTransfer_CRUD", new
                {
                    Action = "SELECTBYID",
                    LocationTransferId = locationTransferReqId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer)
                }, commandType: CommandType.StoredProcedure))
                {
                    locationTransferObj = result.ReadFirstOrDefault<LocationTransfer>();
                    locationTransferObj.SelectedItemDetails = result.Read<Items>().AsList();                    
                    UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                    if (userProfile != null)
                    {
                        locationTransferObj.CurrentApproverUserId = userProfile.UserID;
                        locationTransferObj.CurrentApproverUserName = userProfile.UserName;
                    }
                }
                if (loggedInUserId != 0)
                {
                    locationTransferObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = locationTransferObj.LocationTransferId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer),
                        UserId = loggedInUserId,
                        DocumentUserId = locationTransferObj.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                return locationTransferObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public LocationTransferReqDisplayResult GetLocationTransferForApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                LocationTransferReqDisplayResult locationTransferReqDisplayResult = new LocationTransferReqDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("locationTransfer_CRUD", new
                {
                    Action = "SELECTAPPROVALS",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    UserId = gridDisplayInput.UserId,
                    Companyid= gridDisplayInput.CompanyId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer)
                }, commandType: CommandType.StoredProcedure))
                {
                    locationTransferReqDisplayResult.LocationTransferReq = result.Read<LocationTransfer>().ToList();
                    locationTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return locationTransferReqDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }
        

        public LocationTransferReqDisplayResult SearchLocationTransfer(LocationTransferSearch locationTransferSearch)
        {
            try
            {
                LocationTransferReqDisplayResult locationTransferReqDisplayResult = new LocationTransferReqDisplayResult();

                string whereCondition = @"from
                                                dbo.LocationTransfer as LT
                                            join
                                                dbo.WorkFlowStatus as WFS
                                            on
                                             LT.WorkFlowStatusId = WFS.WorkFlowStatusid
		                                    join dbo.UserProfile as UP
		                                    on
		                                      LT.CreatedBy = UP.UserID
                                            where
                                            IsDeleted = 0 and LT.CompanyId=@CompanyId";

                if (locationTransferSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and LT.LocationTransferId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }
                
                if (locationTransferSearch.LocationTransferId > 0)
                {
                    whereCondition = $"{ whereCondition } and LT.LocationTransferId = @LocationTransferId ";
                }
                if (locationTransferSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and CreatedBy = @RequestFromUserId ";
                }
                if (locationTransferSearch.FromLocationId > 0)
                {
                    whereCondition = $"{ whereCondition } and FromLocationId = @FromLocationId ";
                }

                if (locationTransferSearch.Search != null && locationTransferSearch.Search != "null")
                {
                    whereCondition = $"{ whereCondition } and (LT.LocationTransferCode LIKE CONCAT('%',@Search,'%') OR LT.LocationTransferID LIKE CONCAT('%',@Search,'%') OR WFS.Statustext LIKE CONCAT('%',@Search,'%') OR UP.FirstName LIKE CONCAT('%',@Search,'%'))";
                }
                string itemsQuery = @"		select
		                                    LT.LocationTransferId,
                                            LT.LocationTransferCode,
                                            LT.CreatedBy,
			                                LT.CreatedDate,
		                                    FromLocationId,
		                                    ToLocationId,                                            
		                                    ReasonForTransfer,
		                                    LT.WorkFlowStatusId,
                                            UP.FirstName as RequestedByUserName,
		                                    WFS.Statustext as WorkFlowStatus ";

                itemsQuery = $"{ itemsQuery } { whereCondition } order by UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                itemsQuery = $"{ itemsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(itemsQuery, new
                {
                    Action = "SELECT",
                    Skip = locationTransferSearch.Skip,
                    Take = locationTransferSearch.Take,
                    UserId = locationTransferSearch.UserId,
                    Search= locationTransferSearch.Search,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer),
                    LocationTransferId = locationTransferSearch.LocationTransferId,
                    FromLocationId = locationTransferSearch.FromLocationId,
                    RequestFromUserId = locationTransferSearch.RequestFromUserId,
                    CompanyId= locationTransferSearch.CompanyId
                }, commandType: CommandType.Text))
                {
                    locationTransferReqDisplayResult.LocationTransferReq = result.Read<LocationTransfer>().ToList();
                    locationTransferReqDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return locationTransferReqDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        public LocationTransfer GetItems(GridDisplayInput gridDisplayInput)
        {
            try
            {
                LocationTransfer locationTransfer = new LocationTransfer();
                using (var result = this.m_dbconnection.QueryMultiple("locationTransfer_CRUD", new
                {
                    Action = "GETITEMS",
                    Search = gridDisplayInput.Search,
                    CompanyId = gridDisplayInput.CompanyId,
                    LocationId = gridDisplayInput.LocationId
                }, commandType: CommandType.StoredProcedure))
                {
                    locationTransfer.SelectedItemDetails = result.Read<Items>().AsList();
                }
                return locationTransfer;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public int CreateItemMasterThrowLocationTransfer(LocationTransfer locationTransfer, UserProfile userProfile)
        {
            this.m_dbconnection.Open();
            try
            {
                foreach (var record in locationTransfer.SelectedItemDetails)
                {
                    int itemMasterId = 0;
                    try
                    {
                        itemMasterId = this.m_dbconnection.Query<int>("locationTransfer_CRUD",
                        new
                        {
                            Action = "CHECK",
                            ItemName = record.Name,
                            ItemTypeID = record.ItemTypeID,
                            LocationId = locationTransfer.ToLocationId,
                            CompanyId = locationTransfer.ToCompanyId
                        }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (itemMasterId == 0)
                        {
                            int Id = this.m_dbconnection.Query<int>("ItemMaster_CRUD",
                                new
                                {
                                    Action = "INSERTITEM",
                                    ItemMasterCode = record.ItemMasterCode,
                                    ItemTypeID = record.ItemTypeID,
                                    MeasurementUnitID = record.MeasurementUnitID,
                                    Name = record.Name,
                                    Price = record.Price,
                                    AverageCost = 0.0,
                                    Status = 1,
                                    ExpiryDate = record.ExpiryDate,
                                    Manufacturer = record.Manufacturer,
                                    Brand = record.Brand,
                                    OpeningStockValue = record.Quantity,
                                    Description = "",
                                    ReOrderLevel = record.ReOrderLevel,
                                    LowAlertQuantity = record.LowAlertQuantity,
                                    GST = Convert.ToInt32(ConfigurationManager.AppSettings["GSTValue"]),
                                    IsDeleted = 0,
                                    CreatedBy = locationTransfer.CreatedBy,
                                    ModifiedBy = locationTransfer.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    ModifiedDate = DateTime.Now,
                                    LocationId = locationTransfer.ToLocationId,
                                    CompanyId = locationTransfer.ToCompanyId
                                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                            itemMasterId = Id;
                        }
                        else
                        {
                            // From Quantity Record saving record in stockdetail
                            int ToStockDetailId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                            {
                                Action = "INSERT",
                                DocumentId = locationTransfer.LocationTransferId,
                                RecordId = record.LocationTransferDetailId,
                                ItemMasterId = itemMasterId,
                                StockIn = record.Quantity,
                                StockOut = 0,
                                CreatedBy = userProfile.UserID,
                                CreatedDate = DateTime.Now,
                                UpdatedBy = userProfile.UserID,
                                UpdatedDate = DateTime.Now,
                            }, commandType: CommandType.StoredProcedure);
                        }

                        // From Quantity Record saving record in stockdetail
                        int FromStockDetailId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = locationTransfer.LocationTransferId,
                            RecordId = record.LocationTransferDetailId,
                            ItemMasterId = record.ItemMasterID,
                            StockIn = 0,
                            StockOut = record.Quantity,
                            CreatedBy = userProfile.UserID,
                            CreatedDate = DateTime.Now,
                            UpdatedBy = userProfile.UserID,
                            UpdatedDate = DateTime.Now,
                        }, commandType: CommandType.StoredProcedure);


                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }

                }
                return 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public byte[] LocationTransferPrint(int locationTransferId, int companyId)
        {
            try
            {
                var result = GetLocationTransferPDFTemplate(locationTransferId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetLocationTransferPDFTemplate(int locationTransferId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                LocationTransfer locationTransferDetails = GetLocationTransferDetails(locationTransferId, 0);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetLocationTransferPDFTemplate(locationTransferDetails, companyDetails);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            sharedRepositoryObj = new SharedRepository();
            return sharedRepositoryObj.GetCompanyDetails(companyId);
        }

    }
}
