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
    public class InventoryCycleCountRepository : IInventoryCycleCountRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public InventoryCycleCountDisplayResult GetInventoryCycleCount(GridDisplayInput inventoryCycleCountDisplayInput)
        {
            try
            {
                InventoryCycleCountDisplayResult inventoryCycleCountDisplayResult = new InventoryCycleCountDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("InventoryCycleCount_CRUD", new
                {
                    Action = "SELECT",
                    Skip = inventoryCycleCountDisplayInput.Skip,
                    Take = inventoryCycleCountDisplayInput.Take,
                    SortExpression = inventoryCycleCountDisplayInput.SortExpression,
                    SortDirection = inventoryCycleCountDisplayInput.SortDirection,
                    LocationId = inventoryCycleCountDisplayInput.LocationId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    inventoryCycleCountDisplayResult.InventoryCycleCount = result.Read<InventoryCycleCount>().AsList();
                    //total number of item categories.
                    inventoryCycleCountDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return inventoryCycleCountDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool CreateInventoryCycleCountRequest(InventoryCycleCount itemcyclecountRequest)
        {
            try
            {
                m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region deleting the Item Listing

                        List<DynamicParameters> parameters = new List<DynamicParameters>();
                        //looping through the list of inventory disposal request to delete ....
                        foreach (var inventoryCycleCountId in itemcyclecountRequest.InventoryCycleCountToDelete)
                        {
                            var paramaterObj = new DynamicParameters();
                            paramaterObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            paramaterObj.Add("@InventoryCycleCountId", inventoryCycleCountId, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@ModifiedBy", itemcyclecountRequest.ModifiedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);
                            paramaterObj.Add("@ModifiedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);
                            parameters.Add(paramaterObj);
                        }
                        var result = this.m_dbconnection.Execute("InventoryCycleCount_CRUD", parameters, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region Update the Item Listing

                        List<DynamicParameters> updateParamaters = new List<DynamicParameters>();
                        //looping through the list of inventory items to update to the request....
                        foreach (var record in itemcyclecountRequest.InventoryCycleCountToUpdate)
                        {

                            var paramaterObj = new DynamicParameters();
                            paramaterObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                            paramaterObj.Add("@LocationItemID", record.LocationItemId, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@PhysicalQty", record.PhysicalQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@LostQty", record.LostQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@DamagedQty", record.DamagedQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@ExpiredQty", record.ExpiredQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@WorkFlowStatusid",Convert.ToInt32(WorkFlowStatus.Initiated), DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@Reasons", record.Reasons, DbType.String, ParameterDirection.Input);
                            paramaterObj.Add("@CreatedBy", itemcyclecountRequest.ModifiedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);
                            paramaterObj.Add("@ModifiedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);

                            updateParamaters.Add(paramaterObj);
                        }

                        var updateResult = this.m_dbconnection.Execute("InventoryCycleCount_CRUD", updateParamaters, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                        #endregion


                        #region inventory requests to add...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of inventory disposal requests....
                        foreach (var record in itemcyclecountRequest.InventoryCycleCountToAdd)
                        {

                            var paramaterObj = new DynamicParameters();
                            paramaterObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            paramaterObj.Add("@LocationItemId", record.LocationItemId, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@PhysicalQty", record.PhysicalQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@LostQty", record.LostQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@DamagedQty", record.DamagedQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@ExpiredQty", record.ExpiredQty, DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@WorkFlowStatusid",Convert.ToInt32(WorkFlowStatus.Initiated), DbType.Int32, ParameterDirection.Input);
                            paramaterObj.Add("@Reasons", record.Reasons, DbType.String, ParameterDirection.Input);
                            paramaterObj.Add("@CreatedBy", itemcyclecountRequest.CreatedBy, dbType: DbType.Int32, direction: ParameterDirection.Input);
                            paramaterObj.Add("@CreatedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);
                            paramaterObj.Add("@ModifiedDate", DateTime.Now, dbType: DbType.DateTime, direction: ParameterDirection.Input);
                            itemToAdd.Add(paramaterObj);
                        }


                        var saveResult = this.m_dbconnection.Execute("InventoryCycleCount_CRUD", itemToAdd, transaction: transactionObj,
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

        public IEnumerable<Shared> GetExistingInventoryCycleCount(Shared shared)
        {
            try
            {
                return this.m_dbconnection.Query<Shared>("InventoryCycleCount_CRUD", new { Action = "SEARCH", ItemmasterID = shared.ItemMasterID }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }

        // this method show all item only based on location 
        public IEnumerable<GetItemMasters> GetItemsbasedLocationID(int? locationId, string searchKey)
        {
            try
            {

                return this.m_dbconnection.Query<GetItemMasters>("[InventoryCycleCount_CRUD]",
                                         new
                                         {
                                             Action = "GETITEMS",
                                             LocationId = locationId,
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {
                throw e;
            }
        }


    }
}
