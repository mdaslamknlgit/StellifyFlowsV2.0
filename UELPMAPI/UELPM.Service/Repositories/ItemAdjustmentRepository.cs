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
    public class ItemAdjustmentRepository : IItemAdjustmentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ItemAdjustments_CRUD",
                new
                {
                    Action = "INSERT",
                    ItemMasterId = itemAdjustment.ItemMasterId,
                    ExistingQty = itemAdjustment.ExistingQty,
                    AdjustedQty = itemAdjustment.AdjustedQty,
                    ReasonForAdjustment= itemAdjustment.ReasonForAdjustment,
                    WorkFlowStatusid= 1,
                    LocationId= itemAdjustment.LocationId,
                    IsDeleted = itemAdjustment.IsDeleted,
                    CreatedBy = itemAdjustment.CreatedBy,
                    ModifiedBy = itemAdjustment.ModifiedBy,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool DeleteItemAdjustment(int itemAdjustmentId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("ItemAdjustments_CRUD", new { Action = "DELETE", ItemAdjustmentId = itemAdjustmentId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemAdjustmentDisplayResult GetItemAdjustment(ItemAdjustmentDisplayInput itemAdjustmentDisplayInput)
        {
            try
            {
                ItemAdjustmentDisplayResult itemadjustmentDisplayResult = new ItemAdjustmentDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("ItemAdjustments_CRUD", new
                {
                    Action = "SELECT",
                    Skip = itemAdjustmentDisplayInput.Skip,
                    Take = itemAdjustmentDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    itemadjustmentDisplayResult.ItemAdjustment = result.Read<ItemAdjustment>().AsList();
                    //total number of item categories.
                    itemadjustmentDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemadjustmentDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public int UpdateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ItemAdjustments_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ItemAdjustmentId=itemAdjustment.ItemAdjustmentId,
                        ItemMasterId = itemAdjustment.ItemMasterId,
                        AdjustedQty = itemAdjustment.AdjustedQty,
                        ReasonForAdjustment = itemAdjustment.ReasonForAdjustment,
                        LocationId = itemAdjustment.LocationId,
                        IsDeleted = itemAdjustment.IsDeleted,
                        CreatedBy = itemAdjustment.CreatedBy,
                        ModifiedBy = itemAdjustment.ModifiedBy,
                        ModifiedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }
    }
}
