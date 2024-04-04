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
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class ReportsRepository : IReportsRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        static string SP_Name = "Sp_reportdata";
        static string SP_Data_Name = "Sp_report_param_data";
        public ReportsRepository()
        {

        }
        public ReportParamData GetParamData(int userId)
        {
            try
            {

                ReportParamData paramData = new ReportParamData();
                using (var result = this.m_dbconnection.QueryMultiple(SP_Data_Name, new { UserId = userId }, commandType: CommandType.StoredProcedure))
                {
                    paramData.Entities = result.Read<ReportParam>().AsList();
                    //paramData.Departments = result.Read<ReportParam>().AsList();
                    paramData.Statuses = result.Read<ReportParam>().AsList();
                    paramData.Requesters = result.Read<ReportParam>().AsList();
                }
                return paramData;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public dynamic GetReportData(ReportParameter reportParameter)
        {
            try
            {
                string query = ReadHtml.RetrieveFile("ReportQueries", reportParameter.ReportType.ToString(), "txt");
                
                query = query + " WHERE";
                if (reportParameter.FilterOptions.Entities != null && reportParameter.FilterOptions.Entities.Count > 0)
                {
                    query = query + string.Format(" T1.companyid in ({0}) and", String.Join(",", reportParameter.FilterOptions.Entities.Select(p => p.Id)));
                }
                if (reportParameter.FilterOptions.Statuses != null && reportParameter.FilterOptions.Statuses.Count > 0)
                {
                    query = query + string.Format(" T1.WorkFlowStatusid in ({0}) and", String.Join(",", reportParameter.FilterOptions.Statuses.Select(p => p.Id)));
                }
                if (reportParameter.FilterOptions.SupplierTypes != null && reportParameter.FilterOptions.SupplierTypes.Count > 0)
                {
                    query = query + string.Format(" T1.suppliertypeid in ({0}) and", String.Join(",", reportParameter.FilterOptions.SupplierTypes.Select(p => p.Id)));
                }
                if (reportParameter.FilterOptions.Requesters != null && reportParameter.FilterOptions.Requesters.Count > 0)
                {
                    query = query + string.Format(" T1.userid in ({0}) and", String.Join(",", reportParameter.FilterOptions.Requesters.Select(p => p.Id)));
                }
                if (reportParameter.ReportType == REPORTTYPE.POC || reportParameter.ReportType == REPORTTYPE.POCMASTER)
                {
                    query = query + string.Format(" T1.ismasterpo = {0} and", reportParameter.ReportType == REPORTTYPE.POC ? 0 : 1);
                }
                query = query.Remove(query.LastIndexOf(' ')).TrimEnd();
                switch (reportParameter.ReportType)
                {
                    case REPORTTYPE.SUPPLIER:
                    case REPORTTYPE.COA:
                    case REPORTTYPE.ADMINWORKFLOW:
                        break;
                    case REPORTTYPE.PO:
                    case REPORTTYPE.POITEMS:
                    case REPORTTYPE.POCMASTER:
                    case REPORTTYPE.POC:
                    case REPORTTYPE.APINVOICE:
                    case REPORTTYPE.APCREDITNOTE:
                    case REPORTTYPE.POPMASTER:
                    case REPORTTYPE.POPINVOICE:
                    case REPORTTYPE.CASHFLOW:
                        query = query+ "and t1.Locationid in (select DepartmentId from UserCompanyDepartments ucd where UserId="+reportParameter.UserId+" and ucd.CompanyId in("+ String.Join(",", reportParameter.FilterOptions.Entities.Select(p => p.Id)) + "))";
                        break;
                    default:
                        break;
                }
                var response = this.m_dbconnection.Query<dynamic>(query).ToList();

                return response;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
