using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class ProductsRepository : IProductsRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public ProductsRepository(UserInfo MyUserInfo)
        {
            //TODO
        }

        public ProductsListResult SearchProducts(UserInfo MyUserInfo, SearchProducts searchProducts)
        {
            ProductsListResult productsListResult = new ProductsListResult();

            QueryStr = @"Select * From Products Where 1=1  ";
            //QueryStr = QueryStr + string.Format(" and CreatedBy in(Select Data from dbo.Split({0}, ','))  ", searchProducts.CreatedBy);

            CountQueryStr = @"SELECT Count(*) From Products Where 1=1 ";
            //CountQueryStr = CountQueryStr + string.Format(" and CreatedBy in(Select Data from dbo.Split({0}, ','))  ", searchProducts.CreatedBy);

            //Product Code
            if (!string.IsNullOrEmpty(searchProducts.ProductCode))
            {
                QueryStr = QueryStr + " \nAnd ( ProductCode like '%" + searchProducts.ProductCode + "%' )";

                CountQueryStr = CountQueryStr + " \nAnd ( ProductCode like '%" + searchProducts.ProductCode + "%' )";

            }

            //Product Name
            if (!string.IsNullOrEmpty(searchProducts.ProductName))
            {
                QueryStr = QueryStr + " \nAnd ( ProductName like '%" + searchProducts.ProductName + "%' )";

                CountQueryStr = CountQueryStr + " \nAnd ( ProductName like '%" + searchProducts.ProductName + "%' )";

            }

            //Product Is Active
            if (searchProducts.ProductIsActive)
            {
                QueryStr = QueryStr + " \nAnd ( ProductIsActive = 1 )";

                CountQueryStr = CountQueryStr + " \nAnd ( ProductIsActive = 1)";
            }
            else
            {
                QueryStr = QueryStr + " \nAnd ( ProductIsActive = 0 )";

                CountQueryStr = CountQueryStr + " \nAnd ( ProductIsActive = 0)";
            }

            //From Date & To Date
            if (!string.IsNullOrEmpty(searchProducts.FromDate))
            {
                //If ToDate Not suplly take today's date
                if (!string.IsNullOrEmpty(searchProducts.ToDate))
                {
                    QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", searchProducts.FromDate, searchProducts.ToDate);
                    CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", searchProducts.FromDate, searchProducts.ToDate);

                }
                else
                {
                    try
                    {
                        searchProducts.ToDate = DateTime.Now.GetDateTimeFormats()[4].ToString();
                    }
                    catch(Exception exp)
                    {
                        searchProducts.ToDate = searchProducts.FromDate;
                    }
                    QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", searchProducts.FromDate, searchProducts.ToDate);
                    CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", searchProducts.FromDate, searchProducts.ToDate);

                }

            }

            //Skip & Take
            if (searchProducts.Skip == 0 && searchProducts.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By CreatedDate Desc;";
            }
            if (searchProducts.Skip >= 0 && searchProducts.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By CreatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", searchProducts.Skip, searchProducts.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of products..
                    productsListResult.Status = "SUCCESS";
                    productsListResult.Message = "SUCCESS";

                    productsListResult.ProductsList = result.Read<ProductsDTO>().AsList();

                    //total number of purchase orders
                    productsListResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return productsListResult;
            }
            catch (Exception exp)
            {
                productsListResult.Status = "ERROR";
                productsListResult.Message = exp.ToString();
                productsListResult.Query = QueryStr;
            }
            return productsListResult;
        }

        public ProductsDTO GetProductByProductId(UserInfo MyUserInfo, int ProductId)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<ProductsDomainItem> GetProductDomainItem(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
        public ResultReponse CreateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ResultReponse UpdateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
    }
}
