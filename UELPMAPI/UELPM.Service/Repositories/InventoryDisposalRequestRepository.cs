using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Service.Interface;
using UELPM.Model.Models;
using Dapper;

namespace UELPM.Service.Repositories
{
    public class InventoryDisposalRequestRepository : IInventoryDisposalRequestRepository
    {


        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);


        /*
            this method is used to get the list of inventory disposal requests....... 
        */
        public InventoryDisposalRequestDisplayResult GetInventoryDisposalRequest(InventoryDisposalRequestInput inventoryDisposalRequest)
        {

            try
            {

                InventoryDisposalRequestDisplayResult inventoryRequestDisplayResult = new InventoryDisposalRequestDisplayResult();

                //executing the stored procedure to get the list of inventory disposal requests....
                using (var result = this.m_dbconnection.QueryMultiple("InventoryDisposal_CRUD", new
                {

                    Action = "SELECT",
                    Skip = inventoryDisposalRequest.Skip,
                    Take = inventoryDisposalRequest.Take,
                    SortExpression = inventoryDisposalRequest.SortExpression,
                    SortDirection = inventoryDisposalRequest.SortDirection,
                    LocationId = inventoryDisposalRequest.LocationId

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of inventory disposal requests..
                    inventoryRequestDisplayResult.InventoryDisposalRequests = result.Read<InventoryDisposalRequestModel>().AsList();

                    //total number of inventory disposal requests.
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
            this method is used to update the inventory disposal request...
            ----this is batch request..records add/update/delete all will be done at a time..
        */
        public bool CreateInventoryDisposalRequest(InventoryDisposalRequest inventoryDisposalRequest)
        {

            try
            {

                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {


                        #region deleting the inventory requests list records by  marking the items records as deleted...

                            List<DynamicParameters> parameters = new List<DynamicParameters>();

                            //looping through the list of inventory disposal request to delete ....
                            foreach (var inventoryDisposalId in inventoryDisposalRequest.InventoryReqToDelete)
                            {

                                var paramaterObj = new DynamicParameters();

                                paramaterObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryDisposalId", inventoryDisposalId, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@CreatedBy", inventoryDisposalRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedDate",DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);

                                parameters.Add(paramaterObj);
                            }


                            var result = this.m_dbconnection.Execute("InventoryDisposal_CRUD", parameters, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);


                        #endregion



                        #region inventory request to update...

                            List<DynamicParameters> updateParamaters = new List<DynamicParameters>();

                            //looping through the list of inventory items to update to the request....
                            foreach (var record in inventoryDisposalRequest.InventoryReqToUpdate)
                            {

                                var paramaterObj = new DynamicParameters();

                                paramaterObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryDisposalId", record.InventoryDisposalId, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryDisposalQty", record.InventoryDisposalQty, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@ReasonForDisposal", record.ReasonForDisposal, dbType: DbType.String, direction: ParameterDirection.Input);

                                paramaterObj.Add("@ItemMasterId", record.ItemMasterId, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedBy", inventoryDisposalRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);

                                updateParamaters.Add(paramaterObj);
                            }


                            var updateResult = this.m_dbconnection.Execute("InventoryDisposal_CRUD", updateParamaters, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);

                        #endregion


                        #region inventory requests to add...

                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                            //looping through the list of inventory disposal requests....
                            foreach (var record in inventoryDisposalRequest.InventoryReqToAdd)
                            {

                                 var paramaterObj = new DynamicParameters();

                                paramaterObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@ItemMasterId", record.ItemMasterId, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@ExistingQty", record.ExistingQuantity, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@InventoryDisposalQty", record.InventoryDisposalQty, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@ReasonForDisposal", record.ReasonForDisposal, DbType.String, ParameterDirection.Input);

                                paramaterObj.Add("@WorkFlowStatusid",Convert.ToInt32(WorkFlowStatus.Initiated), DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@LocationId", inventoryDisposalRequest.LocationId, DbType.Int32, ParameterDirection.Input);

                                paramaterObj.Add("@CreatedBy", inventoryDisposalRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);

                                paramaterObj.Add("@CreatedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);

                                itemToAdd.Add(paramaterObj);
                            }


                            var saveResult = this.m_dbconnection.Execute("InventoryDisposal_CRUD", itemToAdd, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);


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
