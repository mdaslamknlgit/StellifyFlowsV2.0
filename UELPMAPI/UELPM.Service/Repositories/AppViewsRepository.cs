using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Service.Interface;
using Dapper;
using System.Configuration;
using System.Data.SqlClient;

namespace UELPM.Service.Repositories
{
    public class AppViewsRepository : IAppViewsRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public AppViewsRepository(UserInfo MyUserInfo)
        {
            //TODO
        }

        public AppViewsResult SearchAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo)
        {
            AppViewsResult appViewsResult = new AppViewsResult();

            QueryStr = @"Select * From AppViews Where 1=1 ";
            QueryStr = QueryStr + string.Format(" And FormId={0} ", appViewsSearch.FormId);

            CountQueryStr = @"Select Count(*) From AppViews Where 1=1 " ;
            QueryStr = QueryStr + string.Format(" And FormId={0} ", appViewsSearch.FormId);

            if (!string.IsNullOrEmpty(appViewsSearch.ViewName))
            {
                QueryStr = QueryStr + " And ( ViewName like '%" + appViewsSearch.ViewName + "%')";
                CountQueryStr = CountQueryStr + " And ( ViewName like '%" + appViewsSearch.ViewName + "%')";
            }

            if (!string.IsNullOrEmpty(appViewsSearch.ViewAlias))
            {
                QueryStr = QueryStr + " And ( ViewAlias like '%" + appViewsSearch.ViewAlias + "%')";
                CountQueryStr = CountQueryStr + " And ( ViewAlias like '%" + appViewsSearch.ViewAlias + "%')";
            }

            //if (!appViewsSearch.IsActive)
            //{
            //    QueryStr = QueryStr + " And ( Leads.FirstName like '%" + appViewsSearch.IsActive + "%')";
            //    CountQueryStr = CountQueryStr + " And ( Leads.FirstName like '%" + appViewsSearch.IsActive + "%')";
            //}

            //if (!appViewsSearch.IsSystem)
            //{
            //    QueryStr = QueryStr + " And ( Leads.LastName like '%" + appViewsSearch.IsSystem + "%')";
            //    CountQueryStr = CountQueryStr + " And ( Leads.LastName like '%" + appViewsSearch.IsSystem + "%')";
            //}

            //QueryStr = QueryStr + string.Format(" And CreatedBy = {0} ", MyUserInfo.UserId);
            //CountQueryStr = CountQueryStr + string.Format(" And CreatedBy = {0} ", MyUserInfo.UserId);


            if (appViewsSearch.Skip == 0 && appViewsSearch.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By ViewName Asc;";
            }
            if (appViewsSearch.Skip >= 0 && appViewsSearch.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By ViewName Asc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", appViewsSearch.Skip, appViewsSearch.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    appViewsResult.Status = "SUCCESS";
                    appViewsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    appViewsResult.AppViews = result.Read<AppViewsDTO>().AsList();
                    //total number of purchase orders
                    appViewsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return appViewsResult;
            }
            catch (Exception exp)
            {
                appViewsResult.Status = "ERROR";
                appViewsResult.Message = exp.ToString();
            }
            return appViewsResult;

        }
        public AppViewsResult GetAppViews(AppViewsSearch appViewsSearch, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
        public AppViewsDTO GetAppViewsByModuleId(int ModuleId, int FormId,int ViewId, UserInfo MyUserInfo)
        {
            QueryStr = @"Select * From AppViews Where FormId={0} And ViewId={1};";

            QueryStr = string.Format(QueryStr, FormId, ViewId);

            AppViewsDTO appViewsDTO = this.m_dbconnection.Query<AppViewsDTO>(QueryStr).FirstOrDefault();

            return appViewsDTO;
        }


    }
}
