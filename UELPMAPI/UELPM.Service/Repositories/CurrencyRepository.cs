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
    public class CurrencyRepository : ICurrencyRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public CurrencyDisplayResult GetCurrency(GridDisplayInput gridDisplayInput)
        {
            try
            {
                CurrencyDisplayResult currencyDisplayResult = new CurrencyDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    currencyDisplayResult.CurrencyManagementList = result.Read<Currency>().AsList();
                    currencyDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return currencyDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public Currency GetCurrencyDetails(int Id)
        {
            Currency currencyObj = new Currency();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD", new
                {

                    Action = "SELECTBYID",
                    Id = Id
                }, commandType: CommandType.StoredProcedure))
                {
                    currencyObj = result.Read<Currency>().FirstOrDefault();
                }
                return currencyObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ValidateCurrency(Currency m_validateCurrency)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            Name = m_validateCurrency.Name
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate Currency";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string CreateCurrency(Currency m_currency)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("Currency_CRUD", new
                    {
                        Action = "INSERT",
                        Name = m_currency.Name,
                        Code = m_currency.Code,
                        Symbol = m_currency.Symbol,
                        Status = 1
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    if (validateNameStatus == 0)
                    {
                        status = m_currency.Id.ToString();
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public string UpdateCurrency(Currency m_currency)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("Currency_CRUD", new
                    {
                        Action = "UPDATE",
                        Name = m_currency.Name,
                        Code = m_currency.Code,
                        Symbol = m_currency.Symbol,
                        Status = m_currency.Status,
                        Id = m_currency.Id
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    //if (validateNameStatus == 0)
                    //{
                    //    status = "Duplicate";
                    //}
                    //else {
                        status = validateNameStatus.ToString();
                    //}
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }

        }

        public bool DeleteCurrency(int Id)
        {
            try
            {
                int result= this.m_dbconnection.Query<int>("Currency_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    Id = Id
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();

                if (result == 1)
                {
                    return false;
                }
                else
                    return true;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public CurrencyDisplayResult GetAllCurrencies(GridDisplayInput gridDisplayInput)
        {
            try
            {
                CurrencyDisplayResult currencyDisplayResult = new CurrencyDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    currencyDisplayResult.CurrencyManagementList = result.Read<Currency>().AsList();
                    currencyDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return currencyDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public CurrencyDisplayResult GetDefaultCurrency(GridDisplayInput gridDisplayInput)
        {
            try
            {
                CurrencyDisplayResult currencyDisplayResult = new CurrencyDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    currencyDisplayResult.CurrencyManagementList = result.Read<Currency>().AsList();
                    currencyDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return currencyDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public Currency GetCurrencyById(int Id)
        {
            Currency currencyObj = new Currency();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Currency_CRUD", new
                {

                    Action = "SELECTBYID",
                    Id = Id
                }, commandType: CommandType.StoredProcedure))
                {
                    currencyObj = result.Read<Currency>().FirstOrDefault();
                }
                return currencyObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }



    }
}
