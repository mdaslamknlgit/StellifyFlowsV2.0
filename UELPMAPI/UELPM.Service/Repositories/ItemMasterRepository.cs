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
    public class ItemMasterRepository : IItemMasterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public string CreateItemMaster(ItemMaster itemmaster)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ItemMaster_CRUD",
                new
                {
                    Action = "INSERT",
                    ItemMasterCode = itemmaster.ItemMasterCode,
                    ItemTypeID = itemmaster.ItemTypeID,
                    MeasurementUnitID = itemmaster.MeasurementUnitID,
                    Name = itemmaster.Name,
                    Price = itemmaster.Price,
                    AverageCost = itemmaster.AverageCost,
                    PurchasePrice=itemmaster.PurchasePrice,
                    SalesPrice=itemmaster.SalesPrice,
                    Status = itemmaster.Status,
                    ExpiryDate = itemmaster.ExpiryDate,
                    Manufacturer = itemmaster.Manufacturer,
                    Brand = itemmaster.Brand,
                    OpeningStockValue = itemmaster.OpeningStockValue,
                    Description = itemmaster.Description,
                    ReOrderLevel = itemmaster.ReOrderLevel,
                    LowAlertQuantity = itemmaster.LowAlertQuantity,
                    GST = Convert.ToInt32(ConfigurationManager.AppSettings["GSTValue"]),
                    IsDeleted = itemmaster.IsDeleted,
                    TrackInventory=itemmaster.TrackInventory,
                    CreatedBy = itemmaster.CreatedBy,
                    ModifiedBy = itemmaster.ModifiedBy,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now,
                    LocationId = itemmaster.LocationId,
                    CompanyId=itemmaster.CompanyId,
                    GLCode=itemmaster.GLCode
                }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;
            }
            catch (Exception ex)
            { throw ex; }
        }      

        public string UpdateItemMaster(ItemMaster itemmaster)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ItemMaster_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ItemMasterID = itemmaster.ItemMasterID,
                        ItemMasterCode = itemmaster.ItemMasterCode,
                        ItemTypeID = itemmaster.ItemTypeID,
                        MeasurementUnitID = itemmaster.MeasurementUnitID,
                        Name = itemmaster.Name,
                        Price = itemmaster.Price,
                        AverageCost = itemmaster.AverageCost,
                        PurchasePrice = itemmaster.PurchasePrice,
                        SalesPrice = itemmaster.SalesPrice,
                        Status = itemmaster.Status,
                        ExpiryDate = itemmaster.ExpiryDate,
                        Manufacturer = itemmaster.Manufacturer,
                        Brand = itemmaster.Brand,
                        OpeningStockValue = itemmaster.OpeningStockValue,
                        Description = itemmaster.Description,
                        ReOrderLevel = itemmaster.ReOrderLevel,
                        LowAlertQuantity = itemmaster.LowAlertQuantity,
                        GST = Convert.ToInt32(ConfigurationManager.AppSettings["GSTValue"]),
                        IsDeleted = itemmaster.IsDeleted,
                        TrackInventory=itemmaster.TrackInventory,
                        CreatedBy = itemmaster.CreatedBy,
                        ModifiedBy = itemmaster.ModifiedBy,
                        ModifiedDate = DateTime.Now,
                        LocationId = itemmaster.LocationId,
                        CompanyId = itemmaster.CompanyId,
                        GLCode = itemmaster.GLCode
                    }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool DeleteItemMaster(int itemmasterId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("ItemMaster_CRUD", new { Action = "DELETE", itemmasterId = itemmasterId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }


        public ItemMasterDisplayResult GetItemMaster(ItemMasterDisplayInput itemMasterDisplayInput)
        {
            try
            {
                ItemMasterDisplayResult itemmasterDisplayResult = new ItemMasterDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ItemMaster_CRUD", new
                {
                    Action = "SELECT",
                    Search = itemMasterDisplayInput.Search,
                    Skip = itemMasterDisplayInput.Skip,
                    Take = itemMasterDisplayInput.Take,
                    CompanyId= itemMasterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    itemmasterDisplayResult.ItemMaster = result.Read<ItemMaster>().AsList();
                    itemmasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemmasterDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemMasterDisplayResult GetAllSearchItemMasters(ItemMasterDisplayInput itemMasterDisplayInput)
        {
            try
            {
                ItemMasterDisplayResult itemmasterDisplayResult = new ItemMasterDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ItemMaster_CRUD", new
                {
                    Action = "SELECT",
                    Search = itemMasterDisplayInput.Search,
                    Skip = itemMasterDisplayInput.Skip,
                    Take = itemMasterDisplayInput.Take,
                    CompanyId = itemMasterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    itemmasterDisplayResult.ItemMaster = result.Read<ItemMaster>().AsList();
                    itemmasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemmasterDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemMaster GetItemMasterById(int ItemMasterId,int CompanyId)
        {
            ItemMaster itemMaster = new ItemMaster();
            try
            {
                //using (var result = this.m_dbconnection.Query("ItemMaster_CRUD", new
                //{
                //    Action = "SELECTBYID",
                //    CompanyId = CompanyId,
                //    ItemMasterID=ItemMasterId
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    itemmasterDisplayResult.ItemMaster = result.Read<ItemMaster>().AsList();
                //    itemmasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //}
                //return itemmasterDisplayResult;

                using (var result = this.m_dbconnection.QueryMultiple("ItemMaster_CRUD", new
                {

                    Action = "SELECTBYID",
                    ItemMasterId=ItemMasterId,
                    CompanyId = CompanyId

                }, commandType: CommandType.StoredProcedure))
                {
                    itemMaster = result.Read<ItemMaster>().FirstOrDefault();
                }

                return itemMaster;
            }
            catch (Exception ex)
            { throw ex; }
        }
        public IEnumerable<Locations> GetLocationList(int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_Getlocations",
                    new
                    {
                        companyId = companyId
                    },
                    commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public IEnumerable<ItemTypes> GetItemTypeList()
        {
            try
            {
                return this.m_dbconnection.Query<ItemTypes>("usp_GetItemType", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public IEnumerable<Shared> GetItemcategorylist(int itemTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<Shared>("usp_GetItemcategorylist", new { ItemTypeID = itemTypeId }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }
        public UploadResult UploadItems(string filePath, int userId)
        {
            try
            {
                UploadResult uploadResult = null;
                int count = 0;
                int Fcount = 0;
                int result = 0;
                string companies = string.Empty;
                List<ItemMaster> ItemMasterList = new List<ItemMaster>();
                List<DynamicParameters> InvenoryItems = new List<DynamicParameters>();
                this.m_dbconnection.Open();
                DataTable dtAccountCodes = ExcelUpload.ExcelUpload.ReadAsDataTable(filePath);
                var Itemmasterdetails = from table in dtAccountCodes.AsEnumerable()
                                         select new
                                         {

                                             CompanyName = table["Entity"],
                                             Name = table["Sub Category"],
                                             AccountCode = table["Account Code"],
                                             AssetType = table["Type"],
                                             Description = table["Description"]
                                         };


                uploadResult = new UploadResult();
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {

                        foreach (var columnValue in Itemmasterdetails)
                        {
                            DynamicParameters itemObj = new DynamicParameters();
                            itemObj.Add("@CompanyName", Convert.ToString(columnValue.CompanyName).Trim(), DbType.String, ParameterDirection.Input);
                            itemObj.Add("@Type", Convert.ToString(columnValue.AssetType).Trim(), DbType.String, ParameterDirection.Input);
                            itemObj.Add("@Name", Convert.ToString(columnValue.Name).Trim(), DbType.String, ParameterDirection.Input);
                            itemObj.Add("@Description", Convert.ToString(columnValue.Description).Trim(), DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountCode", Convert.ToString(columnValue.AccountCode).Trim(), DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", userId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@result", dbType: DbType.Int32, direction: ParameterDirection.Output);
                            itemObj.Add("@ItemType", "Finance", DbType.String, ParameterDirection.Input);
                            InvenoryItems.Add(itemObj);

                        }


                        var sqlresult = this.m_dbconnection.Execute("IPS_InsertInventoryItems", InvenoryItems,
                                transaction: objTransaction,
                                commandType: CommandType.StoredProcedure);

                        InvenoryItems.ForEach(data => {
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


    }
}
