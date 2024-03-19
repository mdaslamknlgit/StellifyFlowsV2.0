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
    public class InventoryRequestRepository : IInventoryRequestRepository
    {


        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);


        /*
            this method is used to get the list of inventory request....... 
             
        */
        public InventoryRequestDisplayResult GetInventoryRequest(InventoryRequestDisplayInput inventoryRequest)
        {

            try
            {

                InventoryRequestDisplayResult inventoryRequestDisplayResult = new InventoryRequestDisplayResult();

                //executing the stored procedure to get the list of inventory requests....
                using (var result = this.m_dbconnection.QueryMultiple("InventoryRequest_CRUD", new
                {

                    Action = "SELECT",
                    Skip = inventoryRequest.Skip,
                    Take = inventoryRequest.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of inventory request..
                    inventoryRequestDisplayResult.InventoryRequests = result.Read<InventoryRequest,Locations,InventoryRequest>((IR, LC) => {
                        IR.Location = LC;
                        return IR;
                    }, splitOn: "LocationID").AsList();

                    //total number of inventory requests.
                    inventoryRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return inventoryRequestDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
             this method is used to get the list of inventory items list....... 
        */
        public List<InventoryRequestItems> GetInventoryRequestDetails(InventoryRequestDetailInput inventoryRequest)
        {

            try
            {   //executing the stored procedure to get the inventory details ....
                var result = this.m_dbconnection.Query<InventoryRequestItems,GetItemMasters,InventoryRequestItems>("InventoryRequestDetail_CRUD",(IR,IM)=> {
                    IR.Item = IM;
                    return IR;
                },new
                {

                    Action = "SELECT",
                    InventoryRequestID = inventoryRequest.InventoryRequestId,
                    Skip = inventoryRequest.Skip,
                    Take = inventoryRequest.Take,
                    SortExpression = inventoryRequest.SortExpression,
                    SortDirection = inventoryRequest.SortDirection,

                }, commandType: CommandType.StoredProcedure,splitOn: "ItemName").ToList();

                return result;

            }
            catch (Exception e)
            {
                throw e;
            }
        }





        /*
            this method is used to create a new inventory request and return the last inventory
            request id..
        */
        public int CreateInventoryRequest(InventoryRequest inventoryRequest)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                    
                        int inventoryRequestId = this.m_dbconnection.Query<int>("InventoryRequest_CRUD",
                                                    new
                                                    {
                                                        Action = "INSERT",
                                                        Code = SharedRepository.GenerateCode("IR"),
                                                        LocationId = inventoryRequest.Location.LocationID,
                                                        Remarks = inventoryRequest.Remarks,
                                                        CreatedBy = inventoryRequest.CreatedBy,
                                                        WorkFlowStatusId = WorkFlowStatus.Initiated,
                                                    }, commandType: CommandType.StoredProcedure,transaction:transactionObj).FirstOrDefault();


                        List<DynamicParameters> parameters = new List<DynamicParameters>();

                        //looping through the list of inventory items to add to the request....
                        foreach (var record in inventoryRequest.ItemsList)
                        {

                            var paramaterObj = new DynamicParameters();

                            paramaterObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);

                            paramaterObj.Add("@InventoryRequestID", inventoryRequestId, DbType.Int32, ParameterDirection.Input);

                            paramaterObj.Add("@ItemMasterId", record.Item.ItemMasterId, dbType: DbType.Int32, direction: ParameterDirection.Input);

                            paramaterObj.Add("@QuantityRequired", record.QuantityRequired, dbType: DbType.Int32, direction: ParameterDirection.Input);

                            paramaterObj.Add("@CreatedBy", inventoryRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                            paramaterObj.Add("@Description", record.Item.Description, dbType: DbType.String, direction: ParameterDirection.Input);

                            parameters.Add(paramaterObj);
                        }


                        var result = this.m_dbconnection.Execute("InventoryRequestDetail_CRUD", parameters,transaction:transactionObj, 
                                                                    commandType: CommandType.StoredProcedure);

                        //commiting the transaction...
                        transactionObj.Commit();

                        return inventoryRequestId;


                    }
                    catch (Exception e)
                    {
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


        /*
            this method is used to update the inventory request...
        */
        public int UpdateInventoryRequest(InventoryRequest inventoryRequest)
        {

            try
            {

                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {

                        #region updating the inventory request record

                        var inventoryReqUpdateResult = this.m_dbconnection.Query<int>("InventoryRequest_CRUD",
                                                       new
                                                       {
                                                           Action = "UPDATE",
                                                           Remarks = inventoryRequest.Remarks,
                                                           ModifiedBy = inventoryRequest.CreatedBy,
                                                           InventoryRequestID = inventoryRequest.InventoryRequestID
                                                       }, 
                                                       transaction: transactionObj, 
                                                       commandType: CommandType.StoredProcedure).FirstOrDefault();
                        #endregion
                        #region deleting the item grid list records by  marking the items records as deleted...

                        List<DynamicParameters> parameters = new List<DynamicParameters>();
                        //looping through the list of inventory items to delete ....
                        foreach (var inventoryRequestDetailID in inventoryRequest.ItemsToDelete)
                        {

                            var paramaterObj = new DynamicParameters();

                            paramaterObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);

                            paramaterObj.Add("@InventoryRequestID", inventoryRequest.InventoryRequestID, DbType.Int32, ParameterDirection.Input);

                            paramaterObj.Add("@InventoryRequestDetailID", inventoryRequestDetailID, dbType: DbType.Int32, direction: ParameterDirection.Input);

                            parameters.Add(paramaterObj);
                        }
                        var result = this.m_dbconnection.Execute("InventoryRequestDetail_CRUD", parameters, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                        #endregion
                        #region grid list items update...

                            List<DynamicParameters> itemToUpdate = new List<DynamicParameters>();

                            //looping through the list of inventory items to update to the request....
                            foreach (var item in inventoryRequest.ItemsList.Where(i => i.InventoryRequestDetailID > 0).Select(i => i))
                            {

                                var paramaterObj = new DynamicParameters();

                                paramaterObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryRequestID", inventoryRequest.InventoryRequestID, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@ItemMasterId", item.Item.ItemMasterId, dbType: DbType.Int32, direction: ParameterDirection.Input);
             
                                paramaterObj.Add("@QuantityRequired", item.QuantityRequired, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@Description", item.Item.Description, dbType: DbType.String, direction: ParameterDirection.Input);

                                paramaterObj.Add("@ModifiedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);

                                paramaterObj.Add("@InventoryRequestDetailID",item.InventoryRequestDetailID, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedBy", inventoryRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                parameters.Add(paramaterObj);
                            }
                            var updateResult = this.m_dbconnection.Execute("InventoryRequestDetail_CRUD", parameters, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                        #endregion
                        #region grid list items add..

                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                            //looping through the list of inventory items to add to the request....
                            foreach (var item in inventoryRequest.ItemsList.Where(i => i.InventoryRequestDetailID == 0).Select(i => i))
                            {

                                var paramaterObj = new DynamicParameters();

                                paramaterObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryRequestID", inventoryRequest.InventoryRequestID, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@ItemMasterId", item.Item.ItemMasterId, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@QuantityRequired", item.QuantityRequired, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@Description", item.Item.Description, dbType: DbType.String, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedBy", inventoryRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                parameters.Add(paramaterObj);
                            }

                            var saveResult = this.m_dbconnection.Execute("InventoryRequestDetail_CRUD", parameters, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();

                        return 1;
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

        /*
         this method is used to delete the inventory request...
        */
        public bool DeleteInventoryRequest(InventoryRequestDelete inventoryRequestDelete)
        {

            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region marking the inventory request as delete

                            var inventoryReqDeleteResult = this.m_dbconnection.Query<bool>("InventoryRequest_CRUD",
                                                             new
                                                             {

                                                                 Action = "DELETE",
                                                                 InventoryRequestID = inventoryRequestDelete.InventoryRequestID,
                                                                 ModifiedBy = inventoryRequestDelete.ModifiedBy
                                                             },
                                                              transaction:transactionObj,commandType: CommandType.StoredProcedure).FirstOrDefault();


                        #endregion

                        #region deleting the inventory request items.

                            var inventoryReqItemsDeleteResult = this.m_dbconnection.Query<bool>("InventoryRequestDetail_CRUD",
                                                                 new
                                                                 {

                                                                     Action = "DELETEALL",
                                                                     InventoryRequestID = inventoryRequestDelete.InventoryRequestID
                                                                 },
                                                                 transaction:transactionObj,commandType: CommandType.StoredProcedure).FirstOrDefault();
                    
                        #endregion

                        //commiting the transaction...
                        transactionObj.Commit();

                        return true;

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
    }
}
