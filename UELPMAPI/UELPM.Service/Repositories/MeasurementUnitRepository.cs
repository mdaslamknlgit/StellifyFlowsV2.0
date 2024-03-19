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

    public class MeasurementUnitRepository : IMeasurementUnitRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);


        /*
            this method is used to get the list of item categories.... 
             
        */
        public MeasurementUnitDisplayResult GetMeasurementUnits(MeasurementUnitDisplayInput itemCategory)
        {
            try
            {
                MeasurementUnitDisplayResult measurementUnitsDisplayResult = new MeasurementUnitDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("MeasurementUnit_CRUD", new
                {

                    Action = "SELECT",
                    Search = "",
                    Skip = itemCategory.Skip,
                    Take = itemCategory.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    measurementUnitsDisplayResult.MeasurementUnits = result.Read<MeasurementUnit>().AsList();
                    //total number of item categories.
                    measurementUnitsDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return measurementUnitsDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public MeasurementUnit GetMeasurementUnitById(int MeasurementUnitId)
        {
            const string sql = @"select
				MeasurementUnitID,
				Name,
				Code,
				Abbreviation,
				Description,
                CreatedBy,
                CreatedDate
			from
				dbo.MeasurementUnit Where MeasurementUnitID = @MeasurementUnitID;";
            MeasurementUnit measurementUnit  = this.m_dbconnection.Query<MeasurementUnit>(sql, new Dictionary<string, object> { { "MeasurementUnitID", MeasurementUnitId } }).FirstOrDefault();

            return measurementUnit;
        }
        public MeasurementUnitDisplayResult GetAllMeasurementUnits(MeasurementUnitDisplayInput measurementSearch)
        {
            try
            {
                MeasurementUnitDisplayResult measurementUnitsDisplayResult = new MeasurementUnitDisplayResult();

                string whereCondition = "";
                string query = "select " +
                               "     MeasurementUnitID, " +
                               "     Name, " +
                               "     Code, " +
                               "     Abbreviation, " +
                               "     Description " +
                               " from " +
                               "     dbo.MeasurementUnit ";

                if (measurementSearch.Name != "" && measurementSearch.Name != null)
                {
                    whereCondition = " where(Name LIKE '%' + @Name + '%') ";
                }
                if (measurementSearch.Code != "" && measurementSearch.Code != null)
                {
                    whereCondition = " where(Code LIKE '%' + @Code + '%') ";
                }
                if (measurementSearch.Search != "" && measurementSearch.Search != null)
                {
                    whereCondition = " where(Name LIKE '%' + @Search + '%' OR Code LIKE '%' + @Search + '%') ";
                }

                whereCondition += " AND(IsDeleted = 0) ";

                query += whereCondition;

                query += " order by Name asc " +
                        "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

               
                query += " select count(*) " +
                        " from " +
                        " dbo.MeasurementUnit ";

                query += whereCondition;

                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple(query, new
                {

                    Action = "SELECT",
                    Search = measurementSearch.Search,
                    Skip = measurementSearch.Skip,
                    Take = measurementSearch.Take,
                    Name = measurementSearch.Name,
                    Code = measurementSearch.Code

                }, commandType: CommandType.Text))
                {
                    measurementUnitsDisplayResult.MeasurementUnits = result.Read<MeasurementUnit>().AsList();
                    measurementUnitsDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return measurementUnitsDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
            this method is used to create a new item category and return the last inserted 
            category id..
        */
        public int CreateMeasurementUnit(MeasurementUnit measurementUnit)
        {
            try
            {


                return this.m_dbconnection.Query<int>("MeasurementUnit_CRUD",
                new
                {
                    Action = "INSERT",
                    Name = measurementUnit.Name.Trim(),
                    Code = measurementUnit.Code.Trim(),
                    Abbreviation = measurementUnit.Abbreviation.Trim(),
                    Description = measurementUnit.Description,
                    CreatedBy = measurementUnit.CreatedBy
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /*
            this method is used to update the item category...
        */
        public int UpdateMeasurementUnit(MeasurementUnit measurementUnit)
        {

            try
            {


                return this.m_dbconnection.Query<int>("MeasurementUnit_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       MeasurementUnitID = measurementUnit.MeasurementUnitID,
                                                       Name = measurementUnit.Name.Trim(),
                                                       Code = measurementUnit.Code.Trim(),
                                                       Abbreviation = measurementUnit.Abbreviation.Trim(),
                                                       Description = measurementUnit.Description.Trim(),
                                                       ModifiedBy = measurementUnit.CreatedBy,
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
         this method is used to delete the item category...
        */
        public bool DeleteMeasurementUnit(MeasurementUnitDelete measurementUnitDelete)
        {

            try
            {

                return this.m_dbconnection.Query<bool>("MeasurementUnit_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            MeasurementUnitID = measurementUnitDelete.MeasurementUnitID,
                                            ModifiedBy = measurementUnitDelete.ModifiedBy
                                        },
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CheckExistingUOM(int measurementUnitId)
        {
            try
            {
                int count = 0;
                using (var result = this.m_dbconnection.QueryMultiple("MeasurementUnit_CRUD", new
                {
                    Action = "EXISTINGUOM",
                    MeasurementUnitID = measurementUnitId
                }, commandType: CommandType.StoredProcedure))
                {
                    count = result.ReadFirstOrDefault<int>();
                }

                return count;

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /*
            this method is used to delete the item category...
        */
        public string ValidateMeasurementUnit(ValidateMesurementUnit validateMesurementUnit)
        {

            try
            {
                string status = "";

                using(var result = this.m_dbconnection.QueryMultiple("MeasurementUnit_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            MeasurementUnitID = validateMesurementUnit.MeasurementUnitID,
                                            Name = validateMesurementUnit.Name,
                                            Code = validateMesurementUnit.Code

                                        },
                                        commandType: CommandType.StoredProcedure))
                {



                    int validateNameStatus = result.ReadFirstOrDefault<int>();

                    int validateCodeStatus = result.ReadFirstOrDefault<int>();

                    if (validateNameStatus > 0)
                    {

                        status = "duplicatename";
                    }
                    else if (validateCodeStatus > 0)
                    {

                        status = "duplicatecode";
                    }

                }

                return status;
       
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
