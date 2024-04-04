using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class ItemsListingRepository: IItemsListingRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        //SearchItemListing
        public ItemsListingDisplayResult SearchItemListing(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ItemsListingDisplayResult itemslistingDisplayResult = new ItemsListingDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ItemsListing_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search,
                    CompanyId=gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    itemslistingDisplayResult.ItemsListing = result.Read<ItemsListing>().AsList();
                    itemslistingDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemslistingDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemsListingDisplayResult GetFilterItemListing(ItemsListingFilterDisplayInput itemsListingFilterDisplayInput)
        {
            try
            {
                ItemsListingDisplayResult itemslistingDisplayResult = new ItemsListingDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ItemsListing_CRUD", new
                {
                    Action = "FILTER",
                    ItemNameFilter = itemsListingFilterDisplayInput.ItemNameFilter,
                    ItemCategoryFilter = itemsListingFilterDisplayInput.ItemCategoryFilter,
                    ItemTypeFilter = itemsListingFilterDisplayInput.ItemTypeFilter,
                    DepartmentFilter = itemsListingFilterDisplayInput.DepartmentFilter,
                    Skip = itemsListingFilterDisplayInput.Skip,
                    Take = itemsListingFilterDisplayInput.Take,
                    CompanyId = itemsListingFilterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    itemslistingDisplayResult.ItemsListing = result.Read<ItemsListing>().AsList();
                    itemslistingDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemslistingDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemsListingDisplayResult SearchItems(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ItemsListingDisplayResult itemslistingDisplayResult = new ItemsListingDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ItemsListing_CRUD", new
                {
                    Action = "SEARCHITEMS",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search,
                    CompanyId = gridDisplayInput.CompanyId,
                    LocationId= gridDisplayInput.LocationId
                }, commandType: CommandType.StoredProcedure))
                {
                    itemslistingDisplayResult.ItemsListing = result.Read<ItemsListing>().AsList();
                    itemslistingDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemslistingDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemsListingDisplayResult GetItemsListing(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ItemsListingDisplayResult itemslistingDisplayResult = new ItemsListingDisplayResult();
                string itemListingQuery = "";
                string groupByCondition = "  group by IM.ItemMasterID,IM.ItemMasterCode,IM.Name,IM.Manufacturer,IM.Brand," +
                                        "IM.ExpiryDate,Im.OpeningStockValue,Im.LowAlertQuantity,Im.ReOrderLevel,IC. Name," +
                                        "IT.Name, Loc.Name, mea.Name,IM.Status,IM.ModifiedDate  ";
                string whereCondition =
                                     @"  FROM ItemMaster IM
                                         left join StockDetails SD on IM.ItemMasterID=SD.ItemMasterId
					                     join ItemType IT on IT.ItemTypeID=IM.ItemTypeID
					                     join ItemCategory IC on IC.ItemCategoryID=IT.ItemCategoryID
					                     join Location Loc on loc.LocationID=IM.LocationId
					                     join MeasurementUnit Mea on Mea.MeasurementUnitID=IM.MeasurementUnitID    
                                         where  
                                            IM.IsDeleted = 0 ";
                if (gridDisplayInput.CompanyId > 0)
                {
                    whereCondition += " and  ( IM.CompanyId = @CompanyId ) ";
                }
                if (gridDisplayInput.Search != null && gridDisplayInput.Search != "")
                {
                    whereCondition += " and ( IM.Name LIKE concat('%',@Search,'%') or IM.OpeningStockValue LIKE concat('%',@Search,'%') " +
                                        "or IC.Name LIKE concat('%',@Search,'%') or IM.ExpiryDate LIKE concat('%',@Search,'%')" +
                                        "or IM.ItemMasterCode LIKE concat('%',@Search,'%') or Loc.Name LIKE concat('%',@Search,'%')" +
                                        "or IT.Name LIKE concat('%',@Search,'%') or IM.Manufacturer LIKE concat('%',@Search,'%')" +
                                        "or IM.Brand LIKE concat('%',@Search,'%') or Mea.Name LIKE concat('%',@Search,'%')" +
                                        "or IM.ReOrderLevel LIKE concat('%',@Search,'%') or IM.LowAlertQuantity LIKE concat('%',@Search,'%') " +
                                        "or CASE WHEN IM.Status='1' THEN 'Active' ELSE 'InActive' END LIKE concat('%',@Search,'%')" +
                                        "or StockInhand LIKE concat('%',@Search,'%') ) ";
                }
                itemListingQuery = @" Select IM.ItemMasterID,IM.ItemMasterCode,IM.Name,IM.Manufacturer,IM.Brand,IM.ExpiryDate,Im.OpeningStockValue,
                                      IM.LowAlertQuantity,IM.ReOrderLevel,IC. Name as ItemCategoryName,
	                                  IT.Name as ItemTypeName, Loc.Name as LocationName, mea.Name as UOMName,
			                          CASE WHEN IM.Status='1' THEN 'Active' ELSE 'InActive' END AS StatusName,
			                          sum(SD.StockIn),sum(SD.StockOut),isnull(((IM.OpeningStockValue-sum(SD.StockOut))+sum(SD.StockIn)),IM.OpeningStockValue) as StockInhand ";
                itemListingQuery += whereCondition;

                itemListingQuery += groupByCondition;


                itemListingQuery += " order by ";

                if (gridDisplayInput.SortExpression == "ItemMasterCode")
                {
                    itemListingQuery += " IM.ItemMasterCode ";
                }
                else if (gridDisplayInput.SortExpression == "Name")
                {
                    itemListingQuery += " IM.Name ";
                }
                else if (gridDisplayInput.SortExpression == "LocationName")
                {
                    itemListingQuery += " Loc.Name ";
                }
                else
                {
                    itemListingQuery += " IM.ModifiedDate ";
                }

                if (gridDisplayInput.SortDirection != "undefined")
                {
                    itemListingQuery += gridDisplayInput.SortDirection;
                }

                if (gridDisplayInput.Take > 0)
                {
                    itemListingQuery += "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                    itemListingQuery += " select " +
                                          "      count(*) from (select  IM.ItemMasterID ";
                    itemListingQuery += whereCondition;

                    itemListingQuery += groupByCondition;
                    itemListingQuery += ") a";
                }
                using (var result = this.m_dbconnection.QueryMultiple(itemListingQuery, new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.Text))
                {
                    itemslistingDisplayResult.ItemsListing = result.Read<ItemsListing>().AsList();
                    itemslistingDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemslistingDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Shared> GetExistingItemsListing(Shared shared)
        {
            try
            {
                return this.m_dbconnection.Query<Shared>("ItemsListing_CRUD", new { Action = "SEARCH", locationID = shared.LocationID, ItemmasterID= shared.ItemMasterID }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }



        
        public IEnumerable<ItemsListing> SearchItemListing(int locationID)
        {
            try
            {
                return this.m_dbconnection.Query<ItemsListing>("ItemsListing_CRUD",new { Action = "SEARCH", locationID = locationID }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }

        

    }
}
