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
using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public class LeadsRepository : ILeadsRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string DeleteQueryStr = "";
        string InsertQueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public LeadsRepository(UserInfo MyUserInfo)
        {
            //TODO
        }

        public LeadsRepository()
        {
            ////m_dbconnection = new MySqlConnection(ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString);
            //TenantConnectionStr = string.Format(TenantConnectionStr, MyUserInfo.databasename);
            //m_dbconnection = new MySqlConnection(TenantConnectionStr);
        }

        public IEnumerable<LeadsDTO> GetLeads(UserInfo MyUserInfo)
        {

            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            const string sql = @"SELECT Leads.*, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where Leads.CreatedBy = @UserId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "UserId", MyUserInfo.UserId } }).ToList();

            return MyLeadsInfo;

        }

        public LeadsResult GetLeadsByPagination(int skip, int take,UserInfo MyUserInfo)
        {
            LeadsResult leadsResult = new LeadsResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            QueryStr = @"SELECT Leads.*, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where Leads.CreatedBy = @UserId And Converted=0 And IsQualified=0 order by Leads.UpdatedDate";
            if(skip ==0 && take ==0)
            {
                //Nothing To do
                QueryStr = QueryStr + ";";
            }
            if (skip >= 0 && take > 0)
            {
                QueryStr = QueryStr + string.Format(" OFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;",skip,take);
            }

            QueryStr = QueryStr + @"SELECT COUNT(*)
                                FROM Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where Leads.CreatedBy = @UserId  And Converted=0 And IsQualified=0;";

            // PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();
            //LeadsResult leadsResult = new LeadsResult();

            try
            {
                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                {
                    UserId = MyUserInfo.UserId

                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    leadsResult.Status = "SUCCESS";
                    leadsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    leadsResult.Leads = result.Read<LeadsDTO>().AsList();
                    //total number of purchase orders
                    leadsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return leadsResult;
            }
            catch(Exception exp)
            {
                leadsResult.Status = "ERROR";
                leadsResult.Message = exp.ToString();

            }

            return leadsResult;


            //IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(QueryStr, new Dictionary<string, object> { { "UserId", MyUserInfo.UserId } }).ToList();

            //leadsResult.Leads = MyLeadsInfo.ToList();
            //if (MyLeadsInfo.ToList().Count > 0)
            //{
            //    leadsResult.TotalRecords = MyLeadsInfo.Count();
            //}
            //else
            //{
            //    leadsResult.TotalRecords = 0;
            //}
            //return leadsResult;

        }

        public LeadsResult SearchLeads(UserInfo MyUserInfo, LeadsSearch leadsSearchInput)
        {
            LeadsResult leadsResult = new LeadsResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            const string sql = @"SELECT Leads.*, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where Leads.CreatedBy = @UserId;";
            QueryStr = @"SELECT Leads.*, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where 1=1 And Converted=0 And IsQualified=0 ";

            CountQueryStr = @"SELECT Count(*)
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where 1=1 And Converted=0 And IsQualified=0 ";
            CountQueryStr = CountQueryStr + string.Format(" And Leads.OwnerId = {0} ", MyUserInfo.UserId); 

            if (!string.IsNullOrEmpty(leadsSearchInput.Name))
            {
                QueryStr = QueryStr + " \nAnd ( Leads.FirstName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.LastName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.EmailId like '%" + leadsSearchInput.Name + "%')";

                CountQueryStr = CountQueryStr + " \nAnd ( Leads.FirstName like '%" + leadsSearchInput.Name + "%'";
                CountQueryStr = CountQueryStr + " Or Leads.LastName like '%" + leadsSearchInput.Name + "%'";
                CountQueryStr = CountQueryStr + " Or Leads.EmailId like '%" + leadsSearchInput.Name + "%')";

            }
            if (!string.IsNullOrEmpty(leadsSearchInput.Topic))
            {
                
                QueryStr = QueryStr + " And ( Leads.Topic like '%" + leadsSearchInput.Topic + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.Topic like '%" + leadsSearchInput.Topic + "%')";
                if (!string.IsNullOrEmpty(leadsSearchInput.FirstName))
                {
                    QueryStr = QueryStr + " Or ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                    CountQueryStr = CountQueryStr + " Or ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                }
                if (!string.IsNullOrEmpty(leadsSearchInput.LastName))
                {
                    QueryStr = QueryStr + " Or ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                    CountQueryStr = CountQueryStr + " Or ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                }
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.FirstName))
            {
                QueryStr = QueryStr + " And ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.LastName))
            {
                QueryStr = QueryStr + " And ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                CountQueryStr = CountQueryStr  + " And ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.Email))
            {
                QueryStr = QueryStr + " And ( Leads.EmailId like '%" + leadsSearchInput.Email + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.EmailId like '%" + leadsSearchInput.Email + "%')";
            }


            if (!string.IsNullOrEmpty(leadsSearchInput.FromDate))
            {
                QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'",leadsSearchInput.FromDate,leadsSearchInput.ToDate);
                CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", leadsSearchInput.FromDate, leadsSearchInput.ToDate);
            }

            QueryStr = QueryStr + string.Format(" And Leads.OwnerId = {0} ", MyUserInfo.UserId);

            //Check Lead Source is Selected By User
            if(!string.IsNullOrEmpty(leadsSearchInput.LeadSourceId))
            {
                //SELECT Id FROM [dbo].[Split] ('1,2,3',',')
                QueryStr = QueryStr + string.Format(" And Leads.LeadsourceId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
                CountQueryStr = CountQueryStr + string.Format(" And Leads.LeadsourceId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
            }



            if (leadsSearchInput.Skip == 0 && leadsSearchInput.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By Leads.CreatedDate Desc;";
            }
            if (leadsSearchInput.Skip >= 0 && leadsSearchInput.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By Leads.CreatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", leadsSearchInput.Skip, leadsSearchInput.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    leadsResult.Status = "SUCCESS";
                    leadsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    leadsResult.Leads = result.Read<LeadsDTO>().AsList();
                    //total number of purchase orders
                    leadsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return leadsResult;
            }
            catch(Exception exp)
            {
                leadsResult.Status = "ERROR";
                leadsResult.Message = exp.ToString();
            }
            return leadsResult;

        }

        public LeadsResult SearchLeads(int ModuleId,int FormId,int ViewId, LeadsSearch leadsSearchInput, UserInfo MyUserInfo)
        {
            string ViewSQL = "";
            AppViewsDTO appViewsDTO = new AppViewsDTO();
            LeadsResult leadsResult = new LeadsResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);

            appViewsDTO = appViewsRepository.GetAppViewsByModuleId(ModuleId,FormId,ViewId,MyUserInfo);

            ViewSQL = appViewsDTO.ViewSQL;

            QueryStr = ViewSQL;



            //QueryStr = @"SELECT Leads.*, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
            //                    FROM     Leads LEFT OUTER JOIN
            //                    Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
            //                    LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
            //                    LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
            //                    Where 1=1 And Converted=0 And IsQualified=0 ";

            CountQueryStr = @"SELECT Count(*)
                                FROM     Leads LEFT OUTER JOIN
                                Probability ON Leads.ProbabilityId = Probability.Id LEFT OUTER JOIN
                                LeadSource ON Leads.LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
                                LeadStatus ON Leads.LeadStatId = LeadStatus.LeadStatID
                                Where 1=1 And Converted=0 And IsQualified=0 ";

            //select Data from dbo.Split(@purchaseOrderId,',')
            //select data from dbo.Split(dbo.GetUserIds(685),',')
            //And Leads.OwnerId in(select data from dbo.Split(dbo.GetUserIds(685),','));

            //CountQueryStr = CountQueryStr + string.Format(" And Leads.OwnerId = {0} ", MyUserInfo.UserId);
            CountQueryStr = CountQueryStr + string.Format(" And Leads.OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            if (!string.IsNullOrEmpty(leadsSearchInput.Name))
            {
                QueryStr = QueryStr + " \nAnd ( Leads.FirstName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.LastName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.EmailId like '%" + leadsSearchInput.Name + "%')";

                CountQueryStr = CountQueryStr + " \nAnd ( Leads.FirstName like '%" + leadsSearchInput.Name + "%'";
                CountQueryStr = CountQueryStr + " Or Leads.LastName like '%" + leadsSearchInput.Name + "%'";
                CountQueryStr = CountQueryStr + " Or Leads.EmailId like '%" + leadsSearchInput.Name + "%')";

            }
            if (!string.IsNullOrEmpty(leadsSearchInput.Topic))
            {

                QueryStr = QueryStr + " And ( Leads.Topic like '%" + leadsSearchInput.Topic + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.Topic like '%" + leadsSearchInput.Topic + "%')";
                if (!string.IsNullOrEmpty(leadsSearchInput.FirstName))
                {
                    QueryStr = QueryStr + " Or ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                    CountQueryStr = CountQueryStr + " Or ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                }
                if (!string.IsNullOrEmpty(leadsSearchInput.LastName))
                {
                    QueryStr = QueryStr + " Or ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                    CountQueryStr = CountQueryStr + " Or ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                }
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.FirstName))
            {
                QueryStr = QueryStr + " And ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.FirstName like '%" + leadsSearchInput.FirstName + "%')";
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.LastName))
            {
                QueryStr = QueryStr + " And ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.LastName like '%" + leadsSearchInput.LastName + "%')";
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.Email))
            {
                QueryStr = QueryStr + " And ( Leads.EmailId like '%" + leadsSearchInput.Email + "%')";
                CountQueryStr = CountQueryStr + " And ( Leads.EmailId like '%" + leadsSearchInput.Email + "%')";
            }


            if (!string.IsNullOrEmpty(leadsSearchInput.FromDate))
            {
                QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", leadsSearchInput.FromDate, leadsSearchInput.ToDate);
                CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", leadsSearchInput.FromDate, leadsSearchInput.ToDate);
            }
            //CountQueryStr = CountQueryStr + string.Format(" And Leads.OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            //QueryStr = QueryStr + string.Format(" And Leads.OwnerId = {0} ", MyUserInfo.UserId);
            QueryStr = QueryStr + string.Format(" And Leads.OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            //Check Lead Source is Selected By User
            if (!string.IsNullOrEmpty(leadsSearchInput.LeadSourceId))
            {
                //SELECT Id FROM [dbo].[Split] ('1,2,3',',')
                QueryStr = QueryStr + string.Format(" And Leads.LeadsourceId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
                CountQueryStr = CountQueryStr + string.Format(" And Leads.LeadsourceId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
            }



            if (leadsSearchInput.Skip == 0 && leadsSearchInput.Take == 0)
            {
                //Nothing To do
                //QueryStr = QueryStr + " Order By Leads.UpdatedDate Desc;";
                QueryStr = QueryStr + " Order By Leads.LastModifiedDate Desc;";
            }
            if (leadsSearchInput.Skip >= 0 && leadsSearchInput.Take > 0)
            {
                //QueryStr = QueryStr + " \nOrder By Leads.UpdatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", leadsSearchInput.Skip, leadsSearchInput.Take);
                QueryStr = QueryStr + " \nOrder By Leads.LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", leadsSearchInput.Skip, leadsSearchInput.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    leadsResult.Status = "SUCCESS";
                    leadsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    leadsResult.Leads = result.Read<LeadsDTO>().AsList();
                    //total number of purchase orders
                    leadsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return leadsResult;
            }
            catch (Exception exp)
            {
                leadsResult.Status = "ERROR";
                leadsResult.Message = exp.ToString();
            }
            return leadsResult;

        }
        public IEnumerable<LeadNames> SearchLeadNames(UserInfo MyUserInfo, LeadsSearch leadsSearchInput)
        {
            List<LeadNames> leadNamesList = new List<LeadNames>();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            QueryStr = @"SELECT Id,FirstName +' '+ LastName As 'Name' From Leads Where 1=1 ";

            if (!string.IsNullOrEmpty(leadsSearchInput.Name))
            {
                QueryStr = QueryStr + " And ( Leads.FirstName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.LastName like '%" + leadsSearchInput.Name + "%'";
                QueryStr = QueryStr + " Or Leads.EmailId like '%" + leadsSearchInput.Name + "%')";
            }

            if (!string.IsNullOrEmpty(leadsSearchInput.FromDate))
            {
                QueryStr = QueryStr + string.Format(" And convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", leadsSearchInput.FromDate, leadsSearchInput.ToDate);
            }

            IEnumerable<LeadNames> LeadNamesInfo   = this.m_dbconnection.Query<LeadNames>(QueryStr, new Dictionary<string, object> { { "UserId", MyUserInfo.UserId } }).ToList();
            leadNamesList = LeadNamesInfo.ToList();

            return leadNamesList;
        }
        public LeadsInfoList GetLeadsGroupByStages(UserInfo MyUserInfo)
        {
            int AddedLeadId = 0;
            //IEnumerable<string> MultiUserIDS;
            LeadNames LeadName = null;
            List<int> MultiUserIDS = new List<int>();
            string LeadListSQL = "";
            int ErrorList = 0;
            ErrorLogRepository MyErrorLogRepository = null;


            List<LeadsByGroup> MyLeadDTOFormaterList = new List<LeadsByGroup>();
            LeadsInfoList MyLeadsInfoList = new LeadsInfoList();
            List<LeadNames> LeadNamesList = new List<LeadNames>();
            try
            {
                MyErrorLogRepository = new ErrorLogRepository(MyUserInfo);

                List<ProbabilityDTO> _LeadPipeline = new List<ProbabilityDTO>();
                List<GroupLeadDTO> _leadlist = new List<GroupLeadDTO>();

                //ErrorList = MyErrorLogDbService.SaveLog("GetLeads DbService Start ");

                int SnoCount = 1;
                const string PipeIdsSQL = @"SELECT Id,name,colour FROM probability order by sortOrder asc ;";
                _LeadPipeline = m_dbconnection.Query<ProbabilityDTO>(PipeIdsSQL).ToList();

                int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();

                List<int> UserIds = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray().ToList();

                UserIds.Sort();

                int[] UIds = UserIds.ToArray();

                int ProbId = 0;


                //Check if has multiple users
                if (MyUserInfo.UsersIds.IndexOf(',') > -1)
                {

                }
                //Split UserID

                var UserIDS = MyUserInfo.UsersIds.Split(',');


                for (var i = 0; i < UserIDS.Count(); i++)
                {
                    //lines.Add("foo") // so what is this supposed to do??
                    MultiUserIDS.Add(Convert.ToInt32(UserIDS[i]));
                }


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeads DbService forloop Start ");
                foreach (var ProbItem in _LeadPipeline)
                {
                    ProbId = ProbItem.Id;
                    //string sql = "SELECT * FROM SomeTable WHERE id IN @ids"
                    //var results = conn.Query(sql, new { ids = new[] { 1, 2, 3, 4, 5 } });
                    try
                    {
                        //ErrorList = MyErrorLogDbService.SaveLog("Probability : " + ProbId.ToString());

                        if (ProbId <= 2)
                        {
                            //const string LeadListSQL = @"Select Lds.*,Prb.name stage,Prb.colour from leads Lds
                            //                       inner join probability Prb on Lds.probabilityId=Prb.Id where Lds.probabilityId=@Id
                            //                        and Lds.createdBy in (select id from boundhoundmaster.rmm where mid=@userids);";

                            LeadListSQL = @"Select Lds.*,Prb.name stage,Prb.colour from leads Lds
                                                   inner join probability Prb on Lds.probabilityId=Prb.Id where Lds.probabilityId=@Id
                                                    and Lds.createdBy in (@userids);";

                            //_leadlist = this._db.Query<GroupLeadDTO>(LeadListSQL, new Dictionary<string, object> { { "Id", ProbId }, { "userIds", Ids } }).ToList();
                            _leadlist = this.m_dbconnection.Query<GroupLeadDTO>(LeadListSQL, new Dictionary<string, object> { { "Id", ProbId }, { "userids", MyUserInfo.UserId } }).ToList();


                            int TotalCount = _leadlist.Count;
                            //ErrorList = MyErrorLogRepository.SaveLog("Query: " + ProbId.ToString() + " :" + LeadListSQL);
                            //ErrorList = MyErrorLogRepository.SaveLog("Leads Count : " + _leadlist.Count().ToString());
                        }
                        else
                        {
                            //const string LeadListSQL = @"Select ld.Id,ld.Id LeadId,ld.leadno,ld.FirstName,ld.lastname,ld.mobile,ld.emailId,ld.converted,ld.Createddate,pb.name stage,
                            //                         pb.colour,opp.probabilityId,opp.actualRevenue, opp.Id OppId,
                            //                         opp.oppTopic,concat(ct.FirstName,ct.LastName) ContactName,                              
                            //                         act.AccountName compName,opp.closeDate from opportunity opp
                            //                         inner join contacts ct on ct.Id=opp.contactId
                            //                         left join account act on act.Id=ct.AccountId
                            //                         inner join leads ld on ld.Id=opp.leadsId
                            //                         inner join probability pb on pb.Id=opp.probabilityId
                            //                         where opp.probabilityId=@Id
                            //                         And COALESCE(opp.closedate,curDate()) between (select date(startdate) from fiscalyear) and (select date(enddate) from fiscalyear)
                            //                         and opp.createdBy in (select id from boundhoundmaster.rmm where mid=@userids);";

                            LeadListSQL = @"Select ld.Id,ld.Id LeadId,ld.leadno,ld.FirstName,ld.lastname,ld.mobile,ld.emailId,ld.converted,ld.Createddate,pb.name stage,
                                                        pb.colour,opp.probabilityId,opp.actualRevenue, opp.Id OppId,
                                                        opp.oppTopic,concat(ct.FirstName,ct.LastName) ContactName,                              
                                                        act.AccountName compName,opp.closeDate from opportunity opp
                                                        inner join contacts ct on ct.Id=opp.contactId
                                                        left join accounts act on act.Id=ct.AccountId
                                                        inner join leads ld on ld.Id=opp.leadId
                                                        inner join probability pb on pb.Id=opp.probabilityId
                                                        where opp.probabilityId=@Id
                                                        --And COALESCE(opp.closedate,curDate()) between (select date(startdate) from fiscalyear) and (select date(enddate) from fiscalyear)
                                                        and opp.createdBy in (@userids);";

                            //_leadlist = this._db.Query<GroupLeadDTO>(LeadListSQL, new Dictionary<string, object> { { "Id", ProbId }, { "userIds", Ids } }).ToList();
                            _leadlist = this.m_dbconnection.Query<GroupLeadDTO>(LeadListSQL, new Dictionary<string, object> { { "Id", ProbId }, { "userids", MyUserInfo.UserId } }).ToList();


                            int TotalCount = _leadlist.Count;

                            //_leadlist = this._db.Query<GroupLeadDTO>(LeadListSQL, new Dictionary<string, object> { { "Id", ProbId } }).ToList();
                            //ErrorList = MyErrorLogRepository.SaveLog("Query: " + ProbId.ToString() + " :" + LeadListSQL);
                            //ErrorList = MyErrorLogRepository.SaveLog("Leads Count : " + _leadlist.Count().ToString());
                        }
                    }
                    catch (Exception exp)
                    {
                        ErrorList = MyErrorLogRepository.SaveLog("Error: " + exp.ToString());
                        ErrorList = MyErrorLogRepository.SaveLog("GetLeads Error From DbService " + exp.ToString());
                        continue;
                    }


                    if (_leadlist.Count > 0)
                    {
                        var BreakPoint = "Stop Debugger";
                    }

                    int HeaderCount = _leadlist.Count();
                    //ErrorList = MyErrorLogDbService.SaveLog("Count: " + HeaderCount.ToString());

                    LeadNames LeadNameHeader = new LeadNames() { Sno = SnoCount, topic = ProbItem.Name, Count = HeaderCount, ProbabilityId = ProbItem.Id, Colour = ProbItem.Colour };
                    LeadNamesList.Add(LeadNameHeader);
                    SnoCount++;

                    List<ChildLeadDTO> ChildLeadDTOList = new List<ChildLeadDTO>();

                    //ErrorList = MyErrorLogDbService.SaveLog("For Loop Starts: ");

                    foreach (var LeadItem in _leadlist)
                    {
                        ChildLeadDTO MyChildLeadDTO = new ChildLeadDTO();
                        GroupLeadDTO MyLeadsDTO = new GroupLeadDTO()
                        {
                            Id = LeadItem.Id,
                            LeadId=LeadItem.Id,
                            OppId = LeadItem.OppId,
                            topic = LeadItem.topic,
                            stage = LeadItem.stage,
                            firstName = LeadItem.firstName,
                            lastName = LeadItem.lastName,
                            mobile = LeadItem.mobile,
                            emailId = LeadItem.emailId,
                            compName = LeadItem.compName,
                            oppTopic = LeadItem.oppTopic,
                            URL = LeadItem.URL,
                            ProfileId = LeadItem.ProfileId,
                            JobTitle = LeadItem.JobTitle,
                            ProbabilityId = LeadItem.ProbabilityId,
                            ActualRevenue = LeadItem.ActualRevenue,
                            EstBudget = LeadItem.EstBudget,
                            StringCreatedDate = Convert.ToDateTime(LeadItem.CreatedDate).ToString("dd/MM/yyyy"),
                            CreatedDate = LeadItem.CreatedDate,
                            UpdatedDate = LeadItem.UpdatedDate,
                            Colour=LeadItem.Colour
                        };

                        MyChildLeadDTO.data = MyLeadsDTO;
                        ChildLeadDTOList.Add(MyChildLeadDTO);
                    }
                    //ErrorList = MyErrorLogDbService.SaveLog("For Loop Ends: ");
                    LeadsByGroup MyLeadsByGroup = new LeadsByGroup();
                    MyLeadsByGroup.children = ChildLeadDTOList;

                    //Changes To Include firstName,lastName.mobile,emailid,compName,StringCreatedDate
                    //LeadNames LeadName = new LeadNames() { ProbabilityId = ProbItem.Id, topic = ProbItem.Name, Colour = ProbItem.Colour };

                    if (MyLeadsByGroup.children.ToList().Count > 0)
                    {
                        //add leads records firstName,lastName.mobile,emailid,compName,StringCreatedDate
                        AddedLeadId = _leadlist[0].Id;
                        LeadName = new LeadNames() {
                            ProbabilityId = ProbItem.Id,
                            topic = ProbItem.Name,
                            Stage = ProbItem.Name,
                            Colour = ProbItem.Colour,
                            firstName = _leadlist[0].firstName,
                            lastName = _leadlist[0].lastName,
                            mobile = _leadlist[0].mobile,
                            compName = _leadlist[0].compName,
                            emailId = _leadlist[0].emailId,
                            StringCreatedDate= MyLeadsByGroup.children[0].data.StringCreatedDate,
                            LeadId=_leadlist[0].Id
                        };
                    }
                    else
                    {
                        LeadName = new LeadNames() { ProbabilityId = ProbItem.Id, topic = ProbItem.Name, Stage=ProbItem.Name, Colour = ProbItem.Colour };
                    }
                    MyLeadsByGroup.data = LeadName;

                    //ErrorList = MyErrorLogDbService.SaveLog("List Added Starts: ");
                    MyLeadDTOFormaterList.Add(MyLeadsByGroup);
                    //ErrorList = MyErrorLogDbService.SaveLog("List Added Ends: ");
                }

                //Remove Added Leads from children

                for (int i = 0; i <= MyLeadDTOFormaterList.Count-1; i++)
                {
                    if (MyLeadDTOFormaterList[i].children.Count > 0)
                    {
                        MyLeadDTOFormaterList[i].children.RemoveAt(0);
                    }
                }
                MyLeadsInfoList.LeadNames = LeadNamesList;
                MyLeadsInfoList.LeadByGroup = MyLeadDTOFormaterList;
                //ErrorList = MyErrorLogDbService.SaveLog("Completed ");
            }

            catch (Exception ex)
            {
                ErrorList = MyErrorLogRepository.SaveLog("GetLeads Error From DbService " + ex.ToString());
                throw;
            }

            return MyLeadsInfoList;
        }

        public IEnumerable<SalutationDTO> GetSalutation(UserInfo MyUserInfo)
        {

            QueryStr = @"Select * From Salutation Where SalActive=1;;";


            IEnumerable<SalutationDTO> MySalutationList = m_dbconnection.Query<SalutationDTO>(QueryStr).ToList();

            return MySalutationList;

        }
        public IEnumerable<LeadSourceDTO> GetLeadSource(UserInfo MyUserInfo)
        {

            const string sql = @" select * from leadsource where isactive=1;";


            IEnumerable<LeadSourceDTO> MyLeadSourceList = m_dbconnection.Query<LeadSourceDTO>(sql).ToList();

            return MyLeadSourceList;

        }

        public IEnumerable<LeadSourceDTO> GetLeadSourceById(UserInfo MyUserInfo,int LeadSourceId)
        {

            string sql =string.Format("Select * From LeadSource Where IsActive=1 And LeadSourceId={0};", LeadSourceId);


            IEnumerable<LeadSourceDTO> MyLeadSourceList = m_dbconnection.Query<LeadSourceDTO>(sql).ToList();

            return MyLeadSourceList;

        }
        public LeadsDTO GetLeadsById(int id)
        {

            const string sql = @"SELECT  * from Leads  WHERE id = @id;";
            LeadsDTO MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "id", id } }).FirstOrDefault();

            return MyLeadsInfo;

        }
        public LeadInfo GetLeadById(int id)
        {
            LeadInfo leadInfo = new LeadInfo();

            IEnumerable<ListIds> listIds = null;

            QueryStr = @"SELECT  * from Leads  WHERE id = @id;";
            
            leadInfo.Lead = this.m_dbconnection.Query<LeadsDTO>(QueryStr, new Dictionary<string, object> { { "id", id } }).FirstOrDefault();

            if (leadInfo.Lead != null)
            {
                //Get Connections Groups
                QueryStr = @" Select ListId From EmailList Where LeadId=@id";

                listIds = this.m_dbconnection.Query<ListIds>(QueryStr, new Dictionary<string, object> { { "id", id } }).ToList();

                if(listIds !=null)
                {
                    leadInfo.ListIds = listIds;
                }
            }

            return leadInfo;

        }
        public IEnumerable<LeadsDTO> GetLeadsByRatingId(int RatingId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.ratingId = @ratingId;
";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "ratingId", RatingId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByCurId(int CurId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE  Lds.curId = @curId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "curId", CurId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByPriceListId(int PriceListId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.priceListId = @priceListId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "priceListId", PriceListId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByUserId(int UserId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.userId = @userId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "userId", UserId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByindsId(int indsId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.indsId = @indsId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "indsId", indsId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByOwnerId(int OwnerId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.ownerId = @ownerId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "ownerId", OwnerId } }).ToList();

            return MyLeadsInfo;

        }
        public IEnumerable<LeadsDTO> GetLeadsBySourceId(int SourceId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.sourceId = @sourceId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "sourceId", SourceId } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByStatus(int Status)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.status = @status;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "status", Status } }).ToList();

            return MyLeadsInfo;

        }

        public IEnumerable<LeadsDTO> GetLeadsByStatId(int StatId)
        {

            const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId,Lds.jobTitle,Lds.ratingId,Lds.curId,
                                Lds.priceListId,Lds.compName,Lds.ownerId,
                                Lds.userId,Lds.busPhone,Lds.homePhone,Lds.OtherPhone,Lds.mobile,Lds.emailId,Lds.webSite,
                                Lds.sourceId,Lds.sourceChildId,Lds.statReasonId,Lds.statId,Lds.IndsId,Lds.annualRevenue,Lds.estBudget,
                                Lds.noOfEmployees,Lds.sicCode,Lds.leadratingId, Lds.campaignId,Lds.description,
                                Lds.IsClose,Lds.isEmail,Lds.isBulkEmail,Lds.isCall,Lds.isSMS,Lds.status,Lds.converted,Lds.convDate,
                                Lds.convUserId,Lds.isQualified,
                                Lds.customerTypeId,Lds.customerSubTypeId from Leads Lds WHERE Lds.statId = @statId;";
            IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "statId", StatId } }).ToList();

            return MyLeadsInfo;

        }

        //public IEnumerable<LeadsDTO> GetLeadsById(int id)
        //{

        //    const string sql =
        //         @"SELECT * FROM Leads WHERE id = @id;";
        //    //  IEnumerable<LeadsDTO> MyLeadsInfo = _db.Query<LeadsDTO>("SELECT * FROM Leads WHERE id = @id", new { id = id }).ToList();
        //    IEnumerable<LeadsDTO> MyLeadsInfo = this._db.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "id", id } }).ToList();

        //    return MyLeadsInfo;

        //}

        public OppCreatedDTO Create_Account_Contact_Oppurtunity(LeadsDTO MyLeadInfo, UserInfo MyUserInfo)
        {
            int AccountId = 0;
            int ContactId = 0;
            int ContactAdrID = 0;
            int OpportunityId = 0;
            bool canCreateAccount = false;
            string AccountQuery = "";
            AccountsDTO AccountInfo = null;
            OppCreatedDTO MyOppCreatedDTO = new OppCreatedDTO();
            try
            {
                if (MyLeadInfo.CompName != null)
                {
                    if (MyLeadInfo.CompName.Length > 0)
                    {

                        //Check company already exists in account table if exists bring the account id so that we can update only contacts
                        AccountQuery = @"Select * From Accounts Where AccountName=@AccountName;";
                        AccountInfo = this.m_dbconnection.Query<AccountsDTO>(AccountQuery, new Dictionary<string, object> { { "AccountName", MyLeadInfo.CompName } }).FirstOrDefault();

                        if (AccountInfo != null)
                        {
                            if (AccountInfo.Id > 0)
                            {
                                AccountId = AccountInfo.Id;

                            }
                            else
                            {
                                canCreateAccount = true;
                            }
                        }
                        else
                        {
                            canCreateAccount = true;
                        }
                    }
                }
                if (canCreateAccount)
                {
                    string insertAccountSql = @"INSERT Accounts
                                                (
                                                 AccountName, LeadId, curId, mainPhone,otherPhone,emailId,
                                                 mobile,annualRevenue,noOfEmployees,sicCode,priceListId,Website,
                                                 campaignId,isActive,createdBy,createdDate
                                                )
                                       values
                                                (
                                                @AccountName,@LeadId,@curId,@mainPhone,@otherPhone,@emailId,
                                                @mobile,@annualRevenue,@noOfEmployees,@sicCode,@priceListId,@Website,
                                                @campaignId,@isActive,@createdBy,@createdDate
                                                );
                                                SELECT SCOPE_IDENTITY();";


                    AccountId = this.m_dbconnection.QuerySingle<int>(insertAccountSql,
                                                    new
                                                    {

                                                        AccountName = MyLeadInfo.CompName,
                                                        LeadId = MyLeadInfo.Id,
                                                        curId = MyLeadInfo.CurId,
                                                        mainPhone = MyLeadInfo.BusPhone,
                                                        otherPhone = MyLeadInfo.OthPhone,
                                                        emailId = MyLeadInfo.EmailId,
                                                        mobile = MyLeadInfo.Mobile,
                                                        annualRevenue = MyLeadInfo.AnnualRevenue,
                                                        noOfEmployees = MyLeadInfo.NoOfEmployees,
                                                        sicCode = MyLeadInfo.SicCode,
                                                        priceListId = MyLeadInfo.PriceListId,
                                                        website = MyLeadInfo.WebSite,
                                                        campaignId = MyLeadInfo.CampaignId,
                                                        isActive = true,
                                                        createdBy = MyUserInfo.UserId,
                                                        createdDate = DateTime.Now
                                                    }) ;

                }
                else
                {
                    //already checked the account id
                    //AccountId
                }

                string InsertContactSql = @"INSERT contacts
                                            (
                                                salId, FirstName, Midname, LastName, JobTitle, 
                                                leadId, AccountId, curId, BusinessPhone, HomePhone, Mobile,  emailId,RegardingId,
                                                createdBy, createdDate
                                            ) 
                                            values 
                                            (
                                                @salId, @FirstName, @Midname,@LastName, @JobTitle,
                                                @leadId, @AccountId, @curId, @BusinessPhone, @HomePhone, @Mobile,  @emailId,@RegardingId,
                                                @createdBy, @createdDate
                                            );
                                    SELECT SCOPE_IDENTITY();";
                ContactId = this.m_dbconnection.QuerySingle<int>(InsertContactSql,
                                                new
                                                {
                                                    salId = MyLeadInfo.SalutationId,
                                                    FirstName = MyLeadInfo.FirstName,
                                                    Midname = MyLeadInfo.LastName,
                                                    LastName = MyLeadInfo.LastName,
                                                    JobTitle = MyLeadInfo.JobTitle,
                                                    LeadId = MyLeadInfo.Id,
                                                    AccountId = AccountId,
                                                    curId = MyLeadInfo.CurId,
                                                    BusinessPhone = MyLeadInfo.BusPhone,
                                                    HomePhone = MyLeadInfo.HomePhone,
                                                    Mobile = MyLeadInfo.Mobile,
                                                    emailId = MyLeadInfo.EmailId,
                                                    RegardingId=8,
                                                    createdBy = MyUserInfo.UserId,
                                                    createdDate = DateTime.Now
                                                });

                string InsertOpportunityQRY = @"INSERT opportunity(oppTopic, probabilityId, priceListId, curId,
                                               leadId,AccountId,contactId,actualRevenue,createdBy,createdDate)
                    values(@oppTopic, @probabilityId, @priceListId, @curId,@leadId,@AccountId,@contactId,
                        @actualRevenue,@createdBy,@createdDate);SELECT SCOPE_IDENTITY();";

                //oppTopic = "Opp Topic " + MyLeadInfo.Topic,
                OpportunityId = this.m_dbconnection.QuerySingle<int>(InsertOpportunityQRY,
                  new
                  {
                      oppTopic = MyLeadInfo.Topic,
                      //probabilityId = MyLeadInfo.ProbabilityId,
                      probabilityId = 3,
                      priceListId = MyLeadInfo.PriceListId,
                      leadId = MyLeadInfo.Id,
                      curId = MyLeadInfo.CurId,
                      AccountId = AccountId,
                      contactId = ContactId,
                      actualRevenue = MyLeadInfo.EstBudget,
                      createdBy = MyUserInfo.UserId,
                      createdDate = DateTime.Now
                  });

            }
            catch (Exception ex)
            {
                var message = ex.ToString();
                throw;

            }
            if (ContactId > 0 && OpportunityId > 0)
            {
                //return true;
                MyOppCreatedDTO.ContactId = ContactId;
                MyOppCreatedDTO.AccountId = AccountId;
                MyOppCreatedDTO.OppId = OpportunityId;
            }

            return MyOppCreatedDTO;
        }

        public int UpdateLeadStatus(int LeadId, int LeadStatId, int UserId)
        {
            string updateQuery = "";
            int RetLeadId = 0;
            try
            {
                //updateQuery = @"UPDATE Leads SET probabilityId=@probabilityId,converted=@converted,updatedBy=@updatedBy WHERE Id =@Id";
                updateQuery = @"UPDATE Leads SET LeadStatId=@LeadStatId,updatedBy=@updatedBy,UpdatedDate=@UpdatedDate,Converted=1,IsQualified=1,
                                ConvertedBy=@ConvertedBy,ConvertedDate=@ConvertedDate WHERE Id =@Id";
                RetLeadId = this.m_dbconnection.Execute(updateQuery, new
                {
                    LeadStatId = LeadStatId,
                    updatedBy = UserId,
                    ConvertedBy=UserId,
                    updatedDate = DateTime.Now,
                    ConvertedDate=DateTime.Now,
                    Id = LeadId
                });
            }
            catch (Exception exp)
            {
                RetLeadId = 0;
            }
            return RetLeadId;
        }
        public int UpdateLeadProbability(int LeadId, int ProbabilityId, int UserId)
        {
            string updateQuery = "";
            int RetLeadId = 0;
            try
            {
                //updateQuery = @"UPDATE Leads SET probabilityId=@probabilityId,converted=@converted,updatedBy=@updatedBy WHERE Id =@Id";
                updateQuery = @"UPDATE Leads SET probabilityId=@probabilityId,updatedBy=@updatedBy WHERE Id =@Id";
                RetLeadId = this.m_dbconnection.Execute(updateQuery, new
                {
                    probabilityId = ProbabilityId,
                    updatedBy = UserId,
                    updatedDate = DateTime.Now,
                    Id = LeadId
                });
            }
            catch (Exception exp)
            {
                RetLeadId = 0;
            }
            return RetLeadId;
        }

        public int ConvertLead(int LeadId,int ConvertedUserId)
        {
            string updateQuery = "";
            int RetLeadId = 0;
            try
            {
                updateQuery = @"UPDATE Leads SET converted=1,isqualified=1,IsClose=1,Status=1,ConvertedBy=@ConvertedBy,
                                ConvertedDate=@ConvertedDate,LastModifiedBy=@LastModifiedBy,LastModifiedDate=@LastModifiedDate WHERE Id =@Id";
                RetLeadId = this.m_dbconnection.Execute(updateQuery, new
                {
                    ConvertedBy=ConvertedUserId,
                    ConvertedDate=DateTime.Now,
                    LastModifiedBy=ConvertedUserId,
                    LastModifiedDate=DateTime.Now,
                    Id = LeadId
                });
            }
            catch (Exception exp)
            {
                RetLeadId = 0;
            }
            return RetLeadId;
        }

        public int UpdateOpportunityStatus(int OppId, int ProbabilityId, int UserId)
        {
            string updateQuery = "";
            int RetLeadId = 0;
            try
            {
                updateQuery = @"UPDATE opportunity SET OppStageId=@OppStageId,probabilityId=@probabilityId,updatedBy=@updatedBy WHERE Id =@Id";
                RetLeadId = this.m_dbconnection.Execute(updateQuery, new
                {
                    probabilityId = ProbabilityId,
                    OppStageId=ProbabilityId,
                    updatedBy = UserId,
                    updatedDate = DateTime.Now,
                    Id = OppId
                });
            }
            catch (Exception exp)
            {
                RetLeadId = 0;
            }
            return RetLeadId;
        }
        public int AddSalesStageHistory(int LeadId, int OppId, int ProbabilityId, string ProbabilityFrom, DateTime StartDate,
             DateTime EndDate, int UserId, int NoOfDays, int WorkingDays)
        {
            string SalesStageInsertQuery = "";
            int SalesStageHisotyId = 0;

            try
            {
                SalesStageInsertQuery = @"INSERT salesstagehistory(leadId,oppId,probabilityId,startDate,endDate,userId,probabilityFromTo,noOfDays,workingDays,updatedDate) 
                                                    values (@leadId,@oppId,@probabilityId,@startDate,@endDate,@userId,@probabilityFromTo,@noOfDays,@workingDays,@updatedDate);
                                                    SELECT SCOPE_IDENTITY();";

                SalesStageHisotyId = this.m_dbconnection.QuerySingle<int>(SalesStageInsertQuery,
                                            new
                                            {
                                                // Id = MyLeadsInfo.Id,
                                                leadId = LeadId,
                                                oppId = OppId,
                                                probabilityId = ProbabilityId,
                                                probabilityFromTo = ProbabilityFrom,
                                                startDate = StartDate,
                                                endDate = EndDate,
                                                userId = UserId,
                                                noOfDays = NoOfDays,
                                                workingDays = WorkingDays,
                                                updatedDate = DateTime.Now
                                            });

                return SalesStageHisotyId;
            }
            catch (Exception exp)
            {
                SalesStageHisotyId = 0;
            }
            return SalesStageHisotyId;
        }


        public ResultReponse ChangeLeadStatus(List<LeadsDTO> MyLeadList, UserInfo MyUserInfo)
        {
            int result = 0;
            ResultReponse obj = new ResultReponse();
            string SalesStageInsertQuery = "";
            int SalesStageHisotyId = 0;
            int CurrentProbability = 0;
            int ProbabilityActualDays = 0;
            TimeSpan mTimeSpan = new TimeSpan(1);
            OppCreatedDTO MyOppCreatedDTO = new OppCreatedDTO();
            string ProbabilityFromTo = "";
            bool LeadConverted = true;
            int CurrentLeadStatId = 0;
            try
            {

                foreach (LeadsDTO MyLeadInfo in MyLeadList)
                {
                    //Get Current Probability from lead
                    //const string CurrentProbabilityInfoQuery = @" select L.probabilityId from  leads L where L.Id=@Id;";
                    //int CurrentProbability = _db.Query<int>(CurrentProbabilityInfoQuery, new { id = MyLeadInfo.Id }).FirstOrDefault();

                    CurrentProbability = MyLeadInfo.PreviousProbabilityId;

                    const string LeadSortOrdersql = @" select P.sortOrder from  leads L inner join probability P  on L.probabilityId=P.Id  where L.Id=@Id;";
                    int LeadSortOrderNo = m_dbconnection.Query<int>(LeadSortOrdersql, new { id = MyLeadInfo.Id }).FirstOrDefault();

                    const string ProbSortOrdersql = @" select sortOrder from  probability  where Id=@Id;";
                    int ProbSortOrderNo = m_dbconnection.Query<int>(ProbSortOrdersql, new { id = MyLeadInfo.ProbabilityId }).FirstOrDefault();

                    //Get Probability Actual Days
                    const string ProbActualDayssql = @" select workingDays from  probability  where Id=@Id;";
                    ProbabilityActualDays = m_dbconnection.Query<int>(ProbActualDayssql, new { id = MyLeadInfo.ProbabilityId }).FirstOrDefault();

                    if (LeadSortOrderNo < ProbSortOrderNo)
                    {

                        const string IsConvertedsql = @" select converted from  leads where Id=@Id;";
                        Boolean IsConverted = m_dbconnection.Query<Boolean>(IsConvertedsql, new { id = MyLeadInfo.Id }).FirstOrDefault();

                        const string sql = @" select ConvertToProspect from  probability where Id=@Id;";
                        Boolean ConvertToProspect = m_dbconnection.Query<Boolean>(sql, new { id = MyLeadInfo.ProbabilityId }).FirstOrDefault();

                        //Get Probability Id in which stage convertoprocespect
                        const string ConverProbabilityQuery = @" select Id from  probability  where ConvertToProspect=@ConvertToProspect;";
                        int ConverProbabilityId = m_dbconnection.Query<int>(ConverProbabilityQuery, new { ConvertToProspect = true }).FirstOrDefault();
                        if (MyLeadInfo.ProbabilityId > ConverProbabilityId)
                        {
                            ConvertToProspect = true;
                        }

                        if (ConvertToProspect == true && IsConverted == false)
                        {
                            const string GetLeadInfoSQL = @" select * from  leads where Id=@Id;";
                            LeadsDTO LeadInfo = m_dbconnection.Query<LeadsDTO>(GetLeadInfoSQL, new { id = MyLeadInfo.Id }).FirstOrDefault();


                            //Get Lead Status IsConverting=1 Id
                            LeadStatusDTO leadStatusDTO = m_dbconnection.Query<LeadStatusDTO>("Select * From LeadStatus Where IsConverting=1").FirstOrDefault();

                            if(leadStatusDTO!=null)
                            {
                                CurrentLeadStatId = leadStatusDTO.LeadStatId;
                            }

                            MyOppCreatedDTO = Create_Account_Contact_Oppurtunity(LeadInfo, MyUserInfo);

                            if (MyOppCreatedDTO.OppId > 0)
                            {
                                //string updateQuery = @"UPDATE Leads SET probabilityId=@probabilityId,converted=@converted,
                                //                    convDate=@convDate,updatedDate=@updatedDate,convUserId=@convUserId WHERE Id =@Id";
                                //result = this._db.Execute(updateQuery, new
                                //{
                                //    probabilityId = MyLeadInfo.ProbabilityId,
                                //    converted = true,
                                //    convDate = DateTime.Now,
                                //    updatedDate=DateTime.Now,
                                //    convUserId = MyUserInfo.UserId,
                                //    Id = MyLeadInfo.Id
                                //});

                                //*********************************************************************************************************************************************************************
                                //Update opportunity status if probability is >2
                                //*********************************************************************************************************************************************************************
                                int OppId = UpdateOpportunityStatus(MyOppCreatedDTO.OppId, MyLeadInfo.ProbabilityId, MyUserInfo.UserId);

                                //*********************************************************************************************************************************************************************
                                int RetLeadId = UpdateLeadProbability(MyLeadInfo.Id, MyLeadInfo.ProbabilityId, MyUserInfo.UserId);
                                int RetLeadId1 = UpdateLeadStatus(MyLeadInfo.Id, CurrentLeadStatId, MyUserInfo.UserId);

                                //Convert this lead 
                                int ConvertLeadY = ConvertLead(MyLeadInfo.Id, MyUserInfo.UserId);

                                //Here have to take updated date and current probability
                                mTimeSpan = (DateTime.Now - MyLeadInfo.CreatedDate);

                                //leadId = MyLeadInfo.Id,
                                //oppId = MyOppCreatedDTO.OppId,
                                //probabilityId = MyLeadInfo.ProbabilityId,
                                //probabilityFromTo = CurrentProbability + "-" + MyLeadInfo.ProbabilityId,
                                //startDate = MyLeadInfo.CreatedDate,
                                //endDate = DateTime.Now,
                                //userId = MyUserInfo.UserId,
                                //noOfDays = mTimeSpan.Days,
                                //workingDays = ProbabilityActualDays
                                ProbabilityFromTo = CurrentProbability + "-" + MyLeadInfo.ProbabilityId;
                                SalesStageHisotyId = AddSalesStageHistory(MyLeadInfo.Id, MyOppCreatedDTO.OppId, MyLeadInfo.ProbabilityId, ProbabilityFromTo,
                                    MyLeadInfo.CreatedDate, DateTime.Now, MyUserInfo.UserId, mTimeSpan.Days, ProbabilityActualDays);

                                result = SalesStageHisotyId;
                            }
                        }
                        else
                        {

                            //*********************************************************************************************************************************************************************
                            //Update opportunity status if probability is >2
                            //*********************************************************************************************************************************************************************
                            if (MyLeadInfo.OppId > 0)
                            {
                                int OppId = UpdateOpportunityStatus(MyLeadInfo.OppId, MyLeadInfo.ProbabilityId, MyUserInfo.UserId);

                                //If Contact Created Need to insert the ContactAddresses As a primary
                                //Create ContactsAddress
                                //if (ContactId > 0)
                                //{
                                //    try
                                //    {
                                //        //ContactAdrID
                                //        string contactAddressInsertSql = @"INSERT ContactsAddress
                                //            (
                                //                ContactID,Name,Street1,Street2,Street3,CountryId,CityID,
                                //                Stat_Province,Zip_PostalCode,Phone,AddresTypeID,
                                //                ShippingMetID,FreightTID,AddressContact,CreatedBy,CreatedDate
                                //            ) 
                                //            values 
                                //            (
                                //                @ContactID,@Name,@Street1,@Street2,@Street3,@CountryId,@CityID,
                                //                @Stat_Province,@Zip_PostalCode,@Phone,@AddresTypeID,
                                //                @ShippingMetID,@FreightTID,@AddressContact,@CreatedBy,@CreatedDate
                                //            );
                                //    SELECT SCOPE_IDENTITY();";
                                //        ContactAdrID = this.m_dbconnection.QuerySingle<int>(contactAddressInsertSql,
                                //                    new
                                //                    {
                                //                        ContactID = ContactId,
                                //                        Name = "Primary",
                                //                        Street1 = MyLeadInfo.Street1,
                                //                        Street2 = MyLeadInfo.Street2,
                                //                        Street3 = MyLeadInfo.Street3,
                                //                        CountryId = 1,
                                //                        CityID = 1,
                                //                        Stat_Province = MyLeadInfo.Stat_Province,
                                //                        Zip_PostalCode = MyLeadInfo.Zip_PostalCode,
                                //                        Phone = MyLeadInfo.BusPhone,
                                //                        AddresTypeID = 1,
                                //                        ShippingMetID = 1,
                                //                        FreightTID = 1,
                                //                        AddressContact = MyLeadInfo.LastName,
                                //                        CreatedBy = MyLeadInfo.CreatedBy,
                                //                        CreatedDate = DateTime.Now
                                //                    });
                                //    }
                                //    catch (Exception exp)
                                //    {
                                //        //TODO
                                //        //DO Nothing
                                //    }


                                //}
                            }

                            //*********************************************************************************************************************************************************************

                            int RetLeadId = UpdateLeadStatus(MyLeadInfo.Id, MyLeadInfo.ProbabilityId, MyUserInfo.UserId);

                            if (MyLeadInfo.UpdatedDate.Year == 0001)
                            {
                                mTimeSpan = (DateTime.Now - MyLeadInfo.CreatedDate);
                            }
                            else
                            {
                                mTimeSpan = (DateTime.Now - MyLeadInfo.UpdatedDate);
                            }

                            //SalesStageInsertQuery = @"INSERT salesstagehistory(leadId,oppId,probabilityId,startDate,endDate,userId,probabilityFromTo,noOfDays,workingDays) 
                            //                        values (@leadId,@oppId,@probabilityId,@startDate,@endDate,@userId,@probabilityFromTo,@noOfDays,@workingDays);
                            //                        SELECT LAST_INSERT_ID();";

                            //SalesStageHisotyId = this._db.QuerySingle<int>(SalesStageInsertQuery,
                            //                            new
                            //                            {
                            //                                // Id = MyLeadsInfo.Id,
                            //                                leadId = MyLeadInfo.Id,
                            //                                oppId = 0,
                            //                                probabilityId = MyLeadInfo.ProbabilityId,
                            //                                probabilityFromTo= CurrentProbability +"-" + MyLeadInfo.ProbabilityId,
                            //                                startDate =MyLeadInfo.CreatedDate,
                            //                                endDate = DateTime.Now,
                            //                                userId = MyUserInfo.UserId,
                            //                                noOfDays= mTimeSpan.Days,
                            //                                workingDays = ProbabilityActualDays
                            //                            });
                            ProbabilityFromTo = CurrentProbability + "-" + MyLeadInfo.ProbabilityId;
                            SalesStageHisotyId = AddSalesStageHistory(MyLeadInfo.Id, 0, MyLeadInfo.ProbabilityId, ProbabilityFromTo,
                                MyLeadInfo.CreatedDate, DateTime.Now, MyUserInfo.UserId, mTimeSpan.Days, ProbabilityActualDays);

                            result = SalesStageHisotyId;
                        }
                    }
                    else
                    {
                        LeadConverted = false;
                        obj.Status = "ERROR";
                        obj.StatusCode = "ERROR";
                        obj.Message = "Lead should always moved to upper stage not lower stage";
                        return obj;


                    }
                }

                if (LeadConverted)
                {
                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Lead Status Changed Successfully ";
                }
                else
                {
                    obj.Status = "ERROR";
                    obj.StatusCode = "ERROR";
                    obj.Message = "Problem in Updating lead please try again";
                }
            }
            catch (Exception ex)
            {
                var message = ex.ToString();
                LeadConverted = false;
                throw;
            }
            return obj;
        }

        public LeadQualifyRequest GetLeadInfoToConvert(LeadQualifyRequest leadQualifyRequest, UserInfo MyUserInfo)
        {

            
            bool ExistByMobile = false;
            bool ExistsByEmail = false;
            bool AccountExists = false;
            LeadQualifyRequest leadQualifyResponse = new LeadQualifyRequest();

            ResultReponse MyResultResponse = new ResultReponse();

            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            AccountsRepository accountsRepository = new AccountsRepository(MyUserInfo);
            ContactsResults contactsResults = new ContactsResults();
            LeadInfo leadInfo = new LeadInfo();

            IEnumerable<AccountsDomainItem> accountsDomainItems  = null;
            leadQualifyResponse = leadQualifyRequest;

            try
            {
                leadInfo = GetLeadById(leadQualifyRequest.LeadId);
                if(leadInfo!=null)
                {
                    //Check Mobile,Email present in contacts
                    contactsResults = contactsRepository.GetContactList(MyUserInfo);
                    if (contactsResults.TotalRecords > 0)
                    {
                        //Find the contacts by mobile no if not empty
                        if (!string.IsNullOrEmpty(leadQualifyRequest.Mobile))
                        {
                            var ExistedContactByMobile = contactsResults.Contacts.Where(x => x.Mobile == leadQualifyRequest.Mobile).ToList();


                            //Existed Contact By Mobile
                            if (ExistedContactByMobile.Count > 0)
                            {
                                //Contact Existed;
                                ExistByMobile = true;
                                leadQualifyRequest.LeadQualifyDetail.CanCreateContact = false;
                                leadQualifyRequest.LeadQualifyDetail.ContactId = ExistedContactByMobile[0].Id;
                                leadQualifyRequest.LeadQualifyDetail.ContactName = ExistedContactByMobile[0].FirstName + ' ' + ExistedContactByMobile[0].LastName;

                            }
                            else
                            {
                                //Assign The ContactId and CanCreateContact=false;
                                ExistByMobile = false;
                                leadQualifyRequest.LeadQualifyDetail.CanCreateContact = true;
                                leadQualifyRequest.LeadQualifyDetail.ContactId = 0;
                                leadQualifyRequest.LeadQualifyDetail.ContactName = "";
                            }

                            if (!ExistByMobile)
                            {
                                //Checking By Email
                                var ExistedContactByEmail = contactsResults.Contacts.Where(x => x.EmailId == leadQualifyRequest.EmailId).ToList();
                                //Existed Contact By Email
                                if (ExistedContactByMobile.Count > 0)
                                {
                                    //Contact Existed;
                                    ExistsByEmail = true;
                                    leadQualifyRequest.LeadQualifyDetail.CanCreateContact = true;
                                    leadQualifyRequest.LeadQualifyDetail.ContactId = 0;
                                    leadQualifyRequest.LeadQualifyDetail.ContactName = ExistedContactByMobile[0].FirstName + ' ' + ExistedContactByMobile[0].LastName;

                                }
                                else
                                {
                                    //Assign The ContactId and CanCreateContact=false;
                                    ExistsByEmail = false;
                                    leadQualifyRequest.LeadQualifyDetail.CanCreateContact = true;
                                    leadQualifyRequest.LeadQualifyDetail.ContactId = 0;
                                    leadQualifyRequest.LeadQualifyDetail.ContactName = "";
                                }
                            }
                        }
                        
                        //Find the Company in Accounts
                        if (!string.IsNullOrEmpty(leadQualifyRequest.CompanyName))
                        {
                            var AccountsList = accountsRepository.GetAllAccounts(MyUserInfo);

                            if(AccountsList.TotalRecords>0)
                            {
                                var AccountsExited = AccountsList.Accounts.Where(x => x.AccountName == leadQualifyRequest.CompanyName).ToList();

                                if(AccountsExited.Count>0)
                                {
                                    AccountExists = true;
                                    leadQualifyRequest.LeadQualifyDetail.CanCreateAccount = false;
                                    leadQualifyRequest.LeadQualifyDetail.AccountId = AccountsExited[0].Id;
                                    leadQualifyRequest.LeadQualifyDetail.AccountName = AccountsExited[0].AccountName;

                                }
                                else
                                {
                                    AccountExists = false;
                                    leadQualifyRequest.LeadQualifyDetail.CanCreateAccount = true;
                                }
                            }
                        }

                    }

                }
                leadQualifyRequest.LeadQualifyDetail.CanCreateOpportunity = true;
                //Get Accounts List
                accountsDomainItems = accountsRepository.GetAccountsDomainItem(MyUserInfo).ToList();
                leadQualifyRequest.Accounts = accountsDomainItems.ToList();

                return leadQualifyResponse;
            }
            catch(Exception exp)
            {
                MyResultResponse.Status = "ERROR";
                MyResultResponse.StatusCode = "ERROR";
                MyResultResponse.Message = "Problem in Updating lead please try again";

                return leadQualifyResponse;
            }
            return leadQualifyResponse;
        }

        public LeadQualifyResponse QualifyLead(LeadQualifyInput leadQualifyInput,UserInfo MyUserInfo)
        {
            LeadQualifyResponse MyLeadQualifyResponse = new LeadQualifyResponse();
            ResultReponse MyResultResponse = new ResultReponse();
            string ProbabilityFromTo = "";
            int SalesStageHisotyId = 0;
            int CurrentProbability = 0;
            int ProbabilityActualDays = 0;

            int LeadId = 0;
            int AccountId = 0;
            int ContactId = 0;
            int OpportunityId = 0;
            int CurrentLeadStatId = 0;

            int ConvertingLeadStatId = 0;

            int ConvertLeadStatId = 0;
            TimeSpan mTimeSpan = new TimeSpan(1);

            int NewAccountId = 0;
            int NewContactId = 0;

            List<LeadsDTO> MyLeadList = new List<LeadsDTO>();
            LeadInfo MyLeadInfo = new LeadInfo();

            LeadStatusRetults leadStatusRetults = new LeadStatusRetults();

            int OppStageId = 0;
            int ProbabilityId = 0;

            
            try
            {
                LeadId = leadQualifyInput.LeadId;

                if (leadQualifyInput.CreateAccount == "YES")
                {
                    if (leadQualifyInput.AccountId == 0)
                    {
                        //Need To Create Account 1st
                        string insertAccountSql = @"INSERT Accounts
                                                (
                                                 AccountName, LeadId, curId, mainPhone,otherPhone,emailId,
                                                 mobile,annualRevenue,noOfEmployees,priceListId,Website,
                                                 campaignId,isActive,createdBy,createdDate
                                                )
                                       values
                                                (
                                                @AccountName,@LeadId,@curId,@mainPhone,@otherPhone,@emailId,
                                                @mobile,@annualRevenue,@noOfEmployees,@priceListId,@Website,
                                                @campaignId,@isActive,@createdBy,@createdDate
                                                );
                                                SELECT SCOPE_IDENTITY();";


                        NewAccountId = this.m_dbconnection.QuerySingle<int>(insertAccountSql,
                                                        new
                                                        {

                                                            AccountName = leadQualifyInput.Account.AccountName,
                                                            LeadId = LeadId,
                                                            curId = leadQualifyInput.Account.CurId,
                                                            mainPhone = leadQualifyInput.Account.BusPhone,
                                                            otherPhone = leadQualifyInput.Account.OtherPhone,
                                                            emailId = leadQualifyInput.Account.EmailId,
                                                            mobile = leadQualifyInput.Account.Mobile,
                                                            annualRevenue = leadQualifyInput.Account.AnnualRevenue,
                                                            noOfEmployees = leadQualifyInput.Account.NoOfEmployees,
                                                            priceListId = 0,
                                                            website = leadQualifyInput.Account.WebSite,
                                                            campaignId = 0,
                                                            isActive = true,
                                                            createdBy = MyUserInfo.UserId,
                                                            createdDate = DateTime.Now
                                                        });
                    }
                }
                else
                {
                    AccountId = leadQualifyInput.AccountId;
                }

                if (leadQualifyInput.CreateContact == "YES")
                {
                    if (leadQualifyInput.AccountId == 0)
                    {
                        AccountId = NewAccountId;
                    }
                    if (leadQualifyInput.ContactId == 0)
                    {
                        //Create Contact
                        string InsertContactSql = @"INSERT contacts
                                            (
                                                salId, FirstName, Midname, LastName, JobTitle, 
                                                leadId, AccountId, curId, BusinessPhone, HomePhone, Mobile,  emailId,RegardingId,
                                                createdBy, createdDate
                                            ) 
                                            values 
                                            (
                                                @salId, @FirstName, @Midname,@LastName, @JobTitle,
                                                @leadId, @AccountId, @curId, @BusinessPhone, @HomePhone, @Mobile,  @emailId,@RegardingId,
                                                @createdBy, @createdDate
                                            );
                                    SELECT SCOPE_IDENTITY();";
                        NewContactId = this.m_dbconnection.QuerySingle<int>(InsertContactSql,
                                                        new
                                                        {
                                                            salId = leadQualifyInput.Contact.SalId,
                                                            FirstName = leadQualifyInput.Contact.FirstName,
                                                            Midname = "",
                                                            LastName = leadQualifyInput.Contact.LastName,
                                                            JobTitle = leadQualifyInput.Contact.JobTitle,
                                                            LeadId = LeadId,
                                                            AccountId = AccountId,
                                                            curId = leadQualifyInput.Contact.CurId,
                                                            BusinessPhone = leadQualifyInput.Contact.BusinessPhone,
                                                            HomePhone = leadQualifyInput.Contact.HomePhone,
                                                            Mobile = leadQualifyInput.Contact.Mobile,
                                                            emailId = leadQualifyInput.Contact.EmailId,
                                                            RegardingId = 8,
                                                            createdBy = MyUserInfo.UserId,
                                                            createdDate = DateTime.Now
                                                        });
                    }
                }
                else
                {
                    ContactId = leadQualifyInput.ContactId;
                }

                if(leadQualifyInput.DontCreateOpportunity==false)
                {
                    //No Need to create account
                }

                if (leadQualifyInput.CreateOpportunity == "YES")
                {
                    OppStageId = 1;
                    ProbabilityId = 1;
                    if (leadQualifyInput.ContactId > 0)
                    {
                        ContactId = leadQualifyInput.ContactId;
                    }
                    else
                    {
                        ContactId = NewContactId;
                    }
                    //Create Opportunity
                    string InsertOpportunityQRY = @"INSERT opportunity(oppTopic, probabilityId, priceListId, curId,
                                               leadId,AccountId,contactId,actualRevenue,createdBy,createdDate)
                    values(@oppTopic, @probabilityId, @priceListId, @curId,@leadId,@AccountId,@contactId,
                        @actualRevenue,@createdBy,@createdDate);SELECT SCOPE_IDENTITY();";

                    

                    //oppTopic = "Opp Topic " + MyLeadInfo.Topic,
                    OpportunityId = this.m_dbconnection.QuerySingle<int>(InsertOpportunityQRY,
                      new
                      {
                          oppTopic = leadQualifyInput.OpportunityTopic,
                          //probabilityId = MyLeadInfo.ProbabilityId,
                          probabilityId = OppStageId,
                          priceListId = 0,
                          leadId = leadQualifyInput.LeadId,
                          curId = leadQualifyInput.Account.CurId,
                          AccountId = AccountId,
                          contactId = ContactId,
                          actualRevenue = leadQualifyInput.Account.EstBudget,
                          createdBy = MyUserInfo.UserId,
                          createdDate = DateTime.Now
                      });

                    if (OpportunityId > 0)
                    {
                        MyLeadInfo = GetLeadById(LeadId);
                        //*********************************************************************************************************************************************************************
                        //Update opportunity status if probability is >2
                        //*********************************************************************************************************************************************************************
                        int OppId = UpdateOpportunityStatus(OpportunityId, OppStageId, MyUserInfo.UserId);

                        //*********************************************************************************************************************************************************************

                        //Need To Get LeadStatus Converting Id
                        leadStatusRetults = GetLeadStatus(MyUserInfo);
                        if(leadStatusRetults!=null)
                        {
                            var results = leadStatusRetults.LeadStatus.Where(x => x.IsConverting == true).FirstOrDefault();
                            ConvertingLeadStatId = results.LeadStatId;

                        }

                        CurrentLeadStatId = MyLeadInfo.Lead.LeadStatId;
                        //CurrentLeadStatId = 4;


                        int RetLeadId = UpdateLeadProbability(LeadId, ConvertingLeadStatId, MyUserInfo.UserId);
                        int RetLeadId1 = UpdateLeadStatus(LeadId, ConvertingLeadStatId, MyUserInfo.UserId);

                        //Convert this lead 
                        int ConvertLeadY = ConvertLead(LeadId, MyUserInfo.UserId);

                        //Here have to take updated date and current probability
                        mTimeSpan = (DateTime.Now - MyLeadInfo.Lead.CreatedDate);

                        //leadId = MyLeadInfo.Id,
                        //oppId = MyOppCreatedDTO.OppId,
                        //probabilityId = MyLeadInfo.ProbabilityId,
                        //probabilityFromTo = CurrentProbability + "-" + MyLeadInfo.ProbabilityId,
                        //startDate = MyLeadInfo.CreatedDate,
                        //endDate = DateTime.Now,
                        //userId = MyUserInfo.UserId,
                        //noOfDays = mTimeSpan.Days,
                        //workingDays = ProbabilityActualDays
                        ProbabilityFromTo = CurrentProbability + "-" + MyLeadInfo.Lead.ProbabilityId;
                        SalesStageHisotyId = AddSalesStageHistory(LeadId, OpportunityId, MyLeadInfo.Lead.ProbabilityId, ProbabilityFromTo,
                            MyLeadInfo.Lead.CreatedDate, DateTime.Now, MyUserInfo.UserId, mTimeSpan.Days, ProbabilityActualDays);

                    }

                    //Success
                    MyLeadQualifyResponse.Status = "SUCCESS";
                    MyLeadQualifyResponse.StatusCode = "SUCCESS";
                    MyLeadQualifyResponse.Message = "Converted Successfully";
                    MyLeadQualifyResponse.Data = string.Format("LeadId:{0},AccountId:{1},ContactId:{2},OpportunityId:{3}", LeadId, AccountId, ContactId, OpportunityId);


                    return MyLeadQualifyResponse;
                }
            }
            catch (Exception exp)
            {
                MyLeadQualifyResponse.Status = "ERROR";
                MyLeadQualifyResponse.StatusCode = "ERROR";
                MyLeadQualifyResponse.Message = "Problem in Updating lead please try again";
                MyLeadQualifyResponse.Data = "ERROR";
                MyLeadQualifyResponse.ErrorMessage = exp.ToString();
            }
            return MyLeadQualifyResponse;
        }
        public ResultReponse ConvertToLead(List<EmailDTO> MyEmailList, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            string SucessMessage = "";

            int NewListId = 0;
            int LeadId = 0;
            int SalesStageHisotyId = 0;
            int UpdateResult = 0;
            string SalesStageInsertQuery = "";
            foreach (EmailDTO MyLead in MyEmailList)
            {
                try
                {
                    const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId and Lds.emailId<>'';";
                    const string sql1 = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId  and Lds.firstName=@firstName and Lds.lastName=@lastName;";
                    LeadsDTO MyLeadsInfoCheckEmailExists = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "emailId", MyLead.Email } }).FirstOrDefault();
                    LeadsDTO MyLeadsInfoCheckValidationExits = this.m_dbconnection.Query<LeadsDTO>(sql1, new Dictionary<string, object> { { "emailId", MyLead.Email }, { "firstName", MyLead.FirstName }, { "lastName", MyLead.LastName } }).FirstOrDefault();

                    if (MyLeadsInfoCheckEmailExists != null)
                    {

                        obj.Message = "Email Already Exist...!!!";
                        obj.Status = "ERROR";
                        obj.StatusCode = "0";
                        obj.Data = "0";
                        ErrorMessage = ErrorMessage + MyLead.FirstName + MyLead.LastName + " Email already exist...!!!\n\n";
                    }

                    else if (MyLeadsInfoCheckValidationExits != null)
                    {
                        obj.Message = "Lead Already Created with FirstName,LastName and EmailId";
                        obj.Status = "ERROR";
                        obj.StatusCode = "0";
                        obj.Data = "0";
                        ErrorMessage = ErrorMessage + MyLead.FirstName + MyLead.LastName + " Lead already created with first name last name...!!!\n\n";
                    }
                    else
                    {
                        string insertUserSql = @"INSERT leads(topic,firstName,lastName,salutationId,jobTitle,ratingId,curId,priceListId,compName,ownerId,userId,busPhone,
                    mobile,emailId,sourceId,statReasonId,probabilityId,createdBy,createdDate) 
                    values (@topic,@firstName,@lastName,@salutationId,@jobTitle,@ratingId,@curId,@priceListId,@compName,@ownerId,@userId,@busPhone,
                    @mobile,@emailId,@sourceId,@statReasonId,@probabilityId,@createdBy,@createdDate);
                    SELECT SCOPE_IDENTITY();";
                        LeadId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                        new
                                                        {
                                                            // Id = MyLeadsInfo.Id,
                                                            topic = MyLead.FirstName + ' ' + MyLead.LastName,
                                                            firstName = MyLead.FirstName,
                                                            lastName = MyLead.LastName,
                                                            salutationId = 1,
                                                            jobTitle = MyLead.Title,
                                                            ratingId = 1,
                                                            curId = 1,
                                                            priceListId = 1,
                                                            compName = MyLead.Company,
                                                            ownerId = MyUserInfo.UserId,
                                                            userId = MyUserInfo.UserId,
                                                            busPhone = MyLead.Phone,
                                                            mobile = MyLead.Mobile,
                                                            emailId = MyLead.Email,
                                                            sourceId = 1,
                                                            statReasonId = 1,
                                                            probabilityId = 1,
                                                            createdBy = MyUserInfo.UserId,
                                                            createdDate = DateTime.Now

                                                        });
                        if (LeadId > 0)
                        {
                            //Add in to salesstagehistory of current date
                            SalesStageInsertQuery = @"INSERT salesstagehistory(leadId,oppId,probabilityId,startDate,userId) 
                                                    values (@leadId,@oppId,@probabilityId,@startDate,@userId);
                                                    SELECT SCOPE_IDENTITY();";

                            SalesStageHisotyId = this.m_dbconnection.QuerySingle<int>(SalesStageInsertQuery,
                                                        new
                                                        {
                                                            // Id = MyLeadsInfo.Id,
                                                            leadId = LeadId,
                                                            oppId = 0,
                                                            probabilityId = 1,
                                                            startDate = DateTime.Now,
                                                            userId = MyUserInfo.UserId
                                                        });


                            //string updateQuery = @"UPDATE emaillist SET isConvert = @isConvert WHERE Id =@Id";
                            string updateQuery = @"UPDATE emaillist SET isConvert = @isConvert WHERE profileid =@profileid";

                            UpdateResult = this.m_dbconnection.Execute(updateQuery, new
                            {
                                isConvert = true,
                                profileid = MyLead.Profileid
                                //Id = MyLead.emaillistId,

                            });

                            obj.Status = "SUCCESS";
                            obj.StatusCode = "SUCCESS";
                            obj.Message = "Lead Created Successfully ";
                            obj.Data = NewListId.ToString();
                            SucessMessage = SucessMessage + MyLead.FirstName + " " + MyLead.LastName + ",";

                        }
                        else
                        {
                            obj.Status = "ERROR";
                            obj.StatusCode = "ERROR";
                            obj.Message = "Error Occured while inserting contact administrator";
                            obj.Data = "0";
                        }
                    }

                }



                catch (Exception ex)
                {
                    var Message = ex.ToString();
                }
            }
            obj.Message = ErrorMessage;
            obj.Data = SucessMessage + " Converted to lead succesfully...!!!";
            return obj;

        }

        public ResultReponse AddToQueue(List<EmailDTO> MyEmailList, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            string SucessMessage = "";

            int NewListId = 0;
            int LeadId = 0;

            foreach (EmailDTO MyLead in MyEmailList)
            {
                try
                {
                    const string sql = @"SELECT EmailListId  from jobqueue  WHERE EmailListId = @EmailListId and isComplete=0;";

                    int AlreadyExists = this.m_dbconnection.Query<int>(sql, new Dictionary<string, object> { { "EmailListId", MyLead.EmaillistId } }).FirstOrDefault();

                    if (AlreadyExists > 0)
                    {

                        obj.Message = "This List Already Exist...!!!";
                        obj.Status = "ERROR";
                        obj.StatusCode = "0";
                        obj.Data = "0";
                        ErrorMessage = ErrorMessage + MyLead.FirstName + MyLead.LastName + " Email already exist...!!!\n\n";
                    }

                    else
                    {
                        string insertUserSql = @"INSERT jobqueue(EmailListId,User,createdBy,createdDate,isComplete,actionType) 
                    values (@EmailListId,@User,@createdBy,@createdDate,@isComplete,@actionType);
                    SELECT SCOPE_IDENTITY();";
                        LeadId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                        new
                                                        {
                                                            // Id = MyLeadsInfo.Id,
                                                            EmailListId = MyLead.EmaillistId,
                                                            User = MyUserInfo.UserId,
                                                            createdBy = MyUserInfo.UserId,
                                                            createdDate = DateTime.Now,
                                                            isComplete = 0,
                                                            actionType = "DETAILS"
                                                        });
                        if (LeadId > 0)
                        {

                            obj.Status = "SUCCESS";
                            obj.StatusCode = "SUCCESS";
                            obj.Message = "Job queue Created Successfully ";
                            obj.Data = NewListId.ToString();
                            SucessMessage = SucessMessage + MyLead.FirstName + " " + MyLead.LastName + ",";

                        }
                        else
                        {
                            obj.Status = "ERROR";
                            obj.StatusCode = "ERROR";
                            obj.Message = "Error Occured while inserting contact administrator";
                            obj.Data = "0";
                        }
                    }

                }



                catch (Exception ex)
                {
                    var Message = ex.ToString();
                }
            }
            obj.Message = ErrorMessage;
            obj.Data = SucessMessage + " add to JobQueue succesfully...!!!";
            return obj;

        }

        public ResultReponse UpdateQueue(List<JobQueueDTO> MyQueueList, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            string SucessMessage = "";

            int NewListId = 0;
            int LeadId = 0;

            foreach (JobQueueDTO MyQueue in MyQueueList)
            {
                try
                {
                    string insertUserSql = @"Update jobqueue set isComplete=@isComplete WHERE Id=@Id;";
                    LeadId = this.m_dbconnection.Execute(insertUserSql,
                                                    new
                                                    {
                                                        isComplete = 1,
                                                        Id = MyQueue.Id

                                                    });
                    if (LeadId > 0)
                    {

                        obj.Status = "SUCCESS";
                        obj.StatusCode = "SUCCESS";
                        obj.Message = "Job queue Updated Successfully ";
                        obj.Data = NewListId.ToString();


                    }
                    else
                    {
                        obj.Status = "ERROR";
                        obj.StatusCode = "ERROR";
                        obj.Message = "Error Occured while inserting contact administrator";
                        obj.Data = "0";
                    }


                }



                catch (Exception ex)
                {
                    var Message = ex.ToString();
                }
            }
            obj.Message = ErrorMessage;
            obj.Data = SucessMessage + " updated JobQueue succesfully...!!!";
            return obj;

        }

        public ResultReponse CreateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            int NewListId = 0;
            int SalesStageHisotyId = 0;
            string SalesStageInsertQuery = "";
            int UpdateResult = 0;
            try
            {
                const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId and Lds.emailId<>'';";
                const string sql1 = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId  and Lds.firstName=@firstName and Lds.lastName=@lastName;";
                LeadsDTO MyLeadsInfoCheckEmailExists = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "emailId", MyLeadInfo.EmailId } }).FirstOrDefault();
                LeadsDTO MyLeadsInfoCheckValidationExits = this.m_dbconnection.Query<LeadsDTO>(sql1, new Dictionary<string, object> { { "emailId", MyLeadInfo.EmailId }, { "firstName", MyLeadInfo.FirstName }, { "lastName", MyLeadInfo.LastName } }).FirstOrDefault();

                if (MyLeadsInfoCheckEmailExists != null)
                {

                    obj.Message = "Email Already Exist...!!!";
                    obj.Status = "ERROR";
                    obj.StatusCode = "0";
                    obj.Data = "0";
                }

                else if (MyLeadsInfoCheckValidationExits != null)
                {
                    obj.Message = "Lead Already Created with FirstName,LastName and EmailId";
                    obj.Status = "ERROR";
                    obj.StatusCode = "0";
                    obj.Data = "0";
                }
                else
                {
                    string InsertLeadSQL = @"INSERT leads(topic,firstName,lastName,salutationId,jobTitle,ratingId,LeadRatingId,curId,priceListId,
                    compName,ownerId,userId, busPhone,mobile,emailId,annualRevenue,estBudget,noOfEmployees,
                    LeadSourceId,statReasonId,probabilityId,sourceCampaign,leadSource,street1,street2,street3,country,city,locality,
                    landMark,PinCode,webSite,LeadStatId,IndsId,createdBy,createdDate,CompanyId) 
                    values (@topic,@firstName,@lastName,@salutationId,@jobTitle,@ratingId,@LeadRatingId,@curId,@priceListId,@compName,@ownerId,@userId,
                    @busPhone, @mobile,@emailId,@annualRevenue,@estBudget,@noOfEmployees, @sourceId,@statReasonId,@probabilityId,@sourceCampaign,
                    @LeadSourceId,@street1,@street2,@street3,@country,@city,@locality,
                    @landMark,@PinCode,@webSite,@LeadStatId,@IndsId,@createdBy,@createdDate,@CompanyId);
                    SELECT SCOPE_IDENTITY();";

                    MyLeadInfo.LeadStatId = 1;

                    NewListId = this.m_dbconnection.QuerySingle<int>(InsertLeadSQL,
                                                    new
                                                    {
                                                        topic = MyLeadInfo.Topic,
                                                        firstName = MyLeadInfo.FirstName,
                                                        lastName = MyLeadInfo.LastName,
                                                        salutationId = MyLeadInfo.SalutationId,
                                                        jobTitle = MyLeadInfo.JobTitle,
                                                        ratingId = 1,
                                                        LeadRatingId=MyLeadInfo.LeadRatingId,
                                                        curId = MyLeadInfo.CurId,
                                                        priceListId = 1,
                                                        compName = MyLeadInfo.CompName,
                                                        ownerId = MyLeadInfo.CreatedBy,
                                                        userId = MyLeadInfo.CreatedBy,
                                                        busPhone = MyLeadInfo.BusPhone,
                                                        mobile = MyLeadInfo.Mobile,
                                                        emailId = MyLeadInfo.EmailId,
                                                        annualRevenue = MyLeadInfo.AnnualRevenue,
                                                        estBudget = MyLeadInfo.EstBudget,
                                                        noOfEmployees = MyLeadInfo.NoOfEmployees,
                                                        sourceId = MyLeadInfo.LeadSourceId,
                                                        statReasonId = 1,
                                                        probabilityId = 1,
                                                        sourceCampaign = MyLeadInfo.SourceCampaign,
                                                        LeadSourceId = MyLeadInfo.LeadSourceId,
                                                        street1 = MyLeadInfo.Street1,
                                                        street2 = MyLeadInfo.Street2,
                                                        street3 = MyLeadInfo.Street3,
                                                        country = MyLeadInfo.Country,
                                                        city = MyLeadInfo.City,
                                                        locality = MyLeadInfo.Locality,
                                                        landMark = MyLeadInfo.LandMark,
                                                        PinCode = MyLeadInfo.PinCode,
                                                        webSite = MyLeadInfo.WebSite,
                                                        IndsId=MyLeadInfo.IndsId,
                                                        LeadStatId =MyLeadInfo.LeadStatId,
                                                        createdBy = MyLeadInfo.CreatedBy,
                                                        createdDate = DateTime.Now,
                                                        lastModifiedBy= MyLeadInfo.CreatedBy,
                                                        LastModifiedDate=DateTime.Now,
                                                        CompanyId = MyLeadInfo.CompanyId,
                                                        LeadRating =  MyLeadInfo.LeadRating
                                                    });

                    if (NewListId > 0)
                    {
                        //Add in to salesstagehistory of current date
                        SalesStageInsertQuery = @"INSERT salesstagehistory(leadId,oppId,probabilityId,startDate,userId) 
                                                    values (@leadId,@oppId,@probabilityId,@startDate,@userId);
                                                    SELECT SCOPE_IDENTITY();";

                        SalesStageHisotyId = this.m_dbconnection.QuerySingle<int>(SalesStageInsertQuery,
                                                    new
                                                    {
                                                        // Id = MyLeadsInfo.Id,
                                                        leadId = NewListId,
                                                        oppId = 0,
                                                        probabilityId = 1,
                                                        startDate = DateTime.Now,
                                                        userId = MyUserInfo.UserId
                                                    });


                        ////string updateQuery = @"UPDATE emaillist SET isConvert = @isConvert WHERE Id =@Id";
                        //string updateQuery = @"UPDATE emaillist SET isConvert = @isConvert WHERE profileid =@profileid";

                        //UpdateResult = this._db.Execute(updateQuery, new
                        //{
                        //    isConvert = true,
                        //    profileid = MyLead.profileid
                        //    //Id = MyLead.emaillistId,

                        //});

                        obj.Status = "SUCCESS";
                        obj.StatusCode = "SUCCESS";
                        obj.Message = "Lead Created Successfully ";
                        obj.Data = NewListId.ToString();

                    }
                    else
                    {
                        obj.Status = "ERROR";
                        obj.StatusCode = "ERROR";
                        obj.Message = "Error Occured while inserting contact administrator";
                        obj.Data = "0";
                    }
                }
            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                obj.Data = "0";
                var Message = ex.ToString();
            }
            return obj;

        }

        public ResultReponse DeleteLead(int Id)
        {
            int result = 0;

            ResultReponse obj = new ResultReponse();
            string updateQuery = @"UPDATE Leads SET status=1 WHERE Id =@Id";

            result = this.m_dbconnection.Execute(updateQuery, new
            {
                Id
            });
            if (result > 0)
            {
                obj.Status = "SUCCESS";
                obj.StatusCode = "SUCCESS";
                obj.Message = "Lead Deleted Successfully ";
                obj.Data = Id.ToString();

            }
            else
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = "Error Occured while Deleting contact administrator";
                obj.Data = "0";
            }
            return obj;
        }

        public ResultReponse UpdateLead(LeadsDTO MyLeadsInfo, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();

            
            TestLead testLead = new TestLead();
            testLead.CreatedBy = 2;

            try
            {

                const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId and Lds.emailId<>'' and Lds.Id<>@Id ;";
                const string sql1 = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId 
                                    and Lds.firstName=@firstName and Lds.lastName=@lastName and Lds.Id<>@Id;";
                LeadsDTO MyLeadsInfoCheckEmailExists = this.m_dbconnection.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "emailId", MyLeadsInfo.EmailId }, { "Id", MyLeadsInfo.Id } }).FirstOrDefault();
                LeadsDTO MyLeadsInfoCheckValidationExits = this.m_dbconnection.Query<LeadsDTO>(sql1, new Dictionary<string, object> { { "emailId", MyLeadsInfo.EmailId },
                                        { "firstName", MyLeadsInfo.FirstName }, { "lastName", MyLeadsInfo.LastName },{ "Id", MyLeadsInfo.Id } }).FirstOrDefault();

                if (MyLeadsInfoCheckEmailExists != null)
                {

                    obj.Message = "Email Already Exist...!!!";
                    obj.Status = "ERROR";
                    obj.StatusCode = "0";
                    obj.Data = "0";
                }

                else if (MyLeadsInfoCheckValidationExits != null)
                {
                    obj.Message = "Lead Already Created with FirstName,LastName and EmailId";
                    obj.Status = "ERROR";
                    obj.StatusCode = "0";
                    obj.Data = "0";
                }

                else
                {

                    int result = 0;
                    //string updateQuery = @"UPDATE Leads SET topic = @topic ,firstName = @firstName,lastName=@lastName,salutationId=@salutationId,jobTitle=@jobTitle,ratingId=@ratingId,
                    //                        curId=@curId,priceListId=@priceListId,compName=@compName,ownerId=@ownerId,userId=@userId,
                    //                        busPhone=@busPhone,homePhone=@homePhone,
                    //                        othPhone=@othPhone,mobile=@mobile,fax=@fax,pager=@pager,emailId=@emailId,webSite=@webSite,
                    //                        sourceId=@sourceId,sourceChildId=@sourceChildId,
                    //                        statReasonId=@statReasonId,statId=@statId,indsId=@indsId,annualRevenue=@annualRevenue,
                    //                        estBudget=@estBudget,noOfEmployees=@noOfEmployees,
                    //                        sicCode=@sicCode,leadratingId=@leadratingId,campaignId=@campaignId,description=@description,
                    //                        close=@close,isEmail=@isEmail,isBulkEmail=@isBulkEmail,
                    //                        isCall=@isCall,isSMS=@isSMS,status=@status,
                    //                        converted=@converted,convDate=@convDate,convUserId=@convUserId,
                    //                        isQualified=@isQualified,customerTypeId=@customerTypeId,
                    //                        customerSubTypeId=@customerSubTypeId,sourceCampaign=@sourceCampaign,leadSource=@leadSource, 
                    //                        street1=@street1,street2=@street2,street3=@street3,
                    //                        country=@country,city=@city,locality=@locality,landMark=@landMark,pinCode=@pinCode,
                    //                        updatedBy=@updatedBy,updatedDate=@updatedDate
                    //                        WHERE Id =@Id";

                    string updateQuery = @"UPDATE Leads SET topic = @topic ,
                                            firstName = @firstName,lastName=@lastName,salutationId=@salutationId,jobTitle=@jobTitle,
                                            ratingId=@ratingId,
                                            curId=@curId,priceListId=@priceListId,compName=@compName,userId=@userId,
                                            busPhone=@busPhone,homePhone=@homePhone,
                                            otherPhone=@otherPhone,mobile=@mobile,emailId=@emailId,webSite=@webSite,
                                            LeadSourceId=@LeadSourceId,sourceChildId=@sourceChildId,
                                            statReasonId=@statReasonId,LeadStatId=@LeadStatId,indsId=@indsId,annualRevenue=@annualRevenue,
                                            estBudget=@estBudget,noOfEmployees=@noOfEmployees,
                                            sicCode=@sicCode,leadratingId=@leadratingId,campaignId=@campaignId,description=@description,
                                            isclose=@isclose,isEmail=@isEmail,isBulkEmail=@isBulkEmail,
                                            isCall=@isCall,isSMS=@isSMS,status=@status,
                                            isQualified=@isQualified,customerTypeId=@customerTypeId,
                                            customerSubTypeId=@customerSubTypeId,sourceCampaign=@sourceCampaign, 
                                            street1=@street1,street2=@street2,street3=@street3,
                                            country=@country,
                                            city=@city,
                                            locality=@locality,
                                            landMark=@landMark,
                                            pinCode=@pinCode,
                                            updatedBy=@updatedBy,
                                            updatedDate=@updatedDate,
                                            LastModifiedBy=@updatedBy,
                                            LastModifiedDate=@updatedDate,
                                            LeadRating=@LeadRating,
                                            CompanyId=@CompanyId,
                                            OwnerId=@OwnerId
                                            WHERE Id =@Id";
                    result = this.m_dbconnection.Execute(updateQuery, new
                    {
                        topic = MyLeadsInfo.Topic,
                        firstName = MyLeadsInfo.FirstName,
                        lastName = MyLeadsInfo.LastName,
                        salutationId = MyLeadsInfo.SalutationId,
                        jobTitle = MyLeadsInfo.JobTitle,
                        ratingId = MyLeadsInfo.RatingId,
                        LeadRatingId= MyLeadsInfo.LeadRatingId,
                        curId = MyLeadsInfo.CurId,
                        priceListId = MyLeadsInfo.PriceListId,
                        compName = MyLeadsInfo.CompName,
                        userId = MyLeadsInfo.UpdatedBy,
                        busPhone = MyLeadsInfo.BusPhone,
                        homePhone = MyLeadsInfo.HomePhone,
                        otherphone = MyLeadsInfo.OthPhone,
                        mobile = MyLeadsInfo.Mobile,
                        emailId = MyLeadsInfo.EmailId,
                        webSite = MyLeadsInfo.WebSite,
                        LeadSourceId = MyLeadsInfo.LeadSourceId,
                        sourceChildId = MyLeadsInfo.SourceChildId,
                        statReasonId = MyLeadsInfo.StatReasonId,
                        LeadStatId = MyLeadsInfo.LeadStatId,
                        indsId = MyLeadsInfo.IndsId,
                        annualRevenue = MyLeadsInfo.AnnualRevenue,
                        estBudget = MyLeadsInfo.EstBudget,
                        noOfEmployees = MyLeadsInfo.NoOfEmployees,
                        sicCode = MyLeadsInfo.SicCode,
                        campaignId = MyLeadsInfo.CampaignId,
                        description = MyLeadsInfo.Description,
                        isclose = MyLeadsInfo.IsClose,
                        isEmail = MyLeadsInfo.IsEmail,
                        isBulkEmail = MyLeadsInfo.IsBulkEmail,
                        isCall = MyLeadsInfo.IsCall,
                        isSMS = MyLeadsInfo.IsSMS,
                        status = MyLeadsInfo.Status,                       
                        isQualified = MyLeadsInfo.IsQualified,
                        customerTypeId = MyLeadsInfo.CustomerTypeId,
                        customerSubTypeId = MyLeadsInfo.CustomerSubTypeId,
                        sourceCampaign = MyLeadsInfo.SourceCampaign,
                        street1 = MyLeadsInfo.Street1,
                        street2 = MyLeadsInfo.Street2,
                        street3 = MyLeadsInfo.Street3,
                        country = MyLeadsInfo.Country,
                        city = MyLeadsInfo.City,
                        locality = MyLeadsInfo.Locality,
                        landMark = MyLeadsInfo.LandMark,
                        pinCode = MyLeadsInfo.PinCode,
                        updatedBy = MyLeadsInfo.UpdatedBy,
                        updatedDate = DateTime.Now,
                        LastModifiedBy = MyLeadsInfo.UpdatedBy,
                        LastModifiedDate = DateTime.Now,
                        LeadRating= MyLeadsInfo.LeadRating,
                        CompanyId= MyLeadsInfo.CompanyId,
                        OwnerId=MyLeadsInfo.OwnerId,
                        Id = MyLeadsInfo.Id
                    });


                    if (result > 0)
                    {
                        obj.Status = "SUCCESS";
                        obj.StatusCode = "SUCCESS";
                        obj.Message = "Lead Updated Successfully ";
                        obj.Data = MyLeadsInfo.Id.ToString();

                    }
                    else
                    {
                        obj.Status = "ERROR";
                        obj.StatusCode = "ERROR";
                        obj.Message = "Error Occured while Updateing contact administrator";
                        obj.Data = "0";
                    }

                }
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                throw;
            }
            return obj;

        }


        //public ResultReponse GenerateLead(LeadsDTO MyLeadsInfo)
        //{
        //    int NewListId = 0;

        //    ResultReponse obj = new ResultReponse();

        //    const string sql = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId;";
        //    const string sql1 = @"SELECT  Lds.Id,Lds.topic,Lds.firstName,Lds.lastName,Lds.salutationId from Leads Lds WHERE Lds.emailId = @emailId  and Lds.firstName=@firstName and Lds.lastName=@lastName;";
        //    LeadsDTO MyLeadsInfoCheckEmailExists = this._db.Query<LeadsDTO>(sql, new Dictionary<string, object> { { "emailId", MyLeadsInfo.EmailId } }).FirstOrDefault();
        //    LeadsDTO MyLeadsInfoCheckValidationExits = this._db.Query<LeadsDTO>(sql1, new Dictionary<string, object> { { "emailId", MyLeadsInfo.EmailId }, { "firstName", MyLeadsInfo.FirstName }, { "lastName", MyLeadsInfo.LastName } }).FirstOrDefault();

        //    if (MyLeadsInfoCheckEmailExists != null)
        //    {

        //        obj.Message = "Email Already Exist...!!!";
        //        obj.Status = "Validation Fail...!!!";
        //        obj.StatusCode = "0";
        //        obj.Data = "0";
        //        return obj;
        //    }

        //    else if (MyLeadsInfoCheckValidationExits != null)
        //    {
        //        obj.Message = "Lead Already Created with FirstName,LastName and EmailId";
        //        obj.Status = "Validation Fail...!!!";
        //        obj.StatusCode = "0";
        //        obj.Data = "0";
        //        return obj;
        //    }


        //    else
        //    {


        //        string insertUserSql = @"INSERT leads(topic,firstName,lastName,salutationId,jobTitle,ratingId,curId,priceListId,compName,ownerId,userId,busPhone,homePhone,
        //            othPhone,mobile,fax,pager,emailId,webSite,sourceId,sourceChildId,statReasonId,statId,indsId,annualRevenue,estBudget,noOfEmployees,sicCode,leadratingId,campaignId,description,close,
        //            isEmail,isBulkEmail,isCall,isSMS,status,converted,convDate,convUserId,addUserId,addDate,editUserId,editDate,delUserId,delDate,isQualified,customerTypeId,customerSubTypeId,pipeId) 
        //            values (@topic,@firstName,@lastName,@salutationId,@jobTitle,@ratingId,@curId,@priceListId,@compName,@ownerId,@userId,@busPhone,@homePhone,
        //            @othPhone,@mobile,@fax,@pager,@emailId,@webSite,@sourceId,@sourceChildId,@statReasonId,@statId,@indsId,@annualRevenue,@estBudget,@noOfEmployees,@sicCode,@leadratingId,@campaignId,@description,@close,
        //            @isEmail,@isBulkEmail,@isCall,@isSMS,@status,@converted,@convDate,@convUserId,@addUserId,@addDate,@editUserId,@editDate,@delUserId,@delDate,@isQualified,@customerTypeId,@customerSubTypeId,@pipeId);
        //            SELECT LAST_INSERT_ID();";
        //        NewListId = this._db.QuerySingle<int>(insertUserSql,
        //                                        new
        //                                        {
        //                                            // Id = MyLeadsInfo.Id,
        //                                            topic = MyLeadsInfo.Topic,
        //                                            firstName = MyLeadsInfo.FirstName,
        //                                            lastName = MyLeadsInfo.LastName,
        //                                            salutationId = MyLeadsInfo.SalutationId,
        //                                            jobTitle = MyLeadsInfo.JobTitle,
        //                                            ratingId = MyLeadsInfo.RatingId,
        //                                            curId = MyLeadsInfo.CurId,
        //                                            priceListId = MyLeadsInfo.PriceListId,
        //                                            compName = MyLeadsInfo.CompName,
        //                                            ownerId = MyLeadsInfo.OwnerId,
        //                                            userId = MyLeadsInfo.UserId,
        //                                            busPhone = MyLeadsInfo.BusPhone,
        //                                            homePhone = MyLeadsInfo.HomePhone,
        //                                            othPhone = MyLeadsInfo.OthPhone,
        //                                            mobile = MyLeadsInfo.Mobile,
        //                                            fax = MyLeadsInfo.Fax,
        //                                            pager = MyLeadsInfo.Pager,
        //                                            emailId = MyLeadsInfo.EmailId,
        //                                            webSite = MyLeadsInfo.WebSite,
        //                                            sourceId = MyLeadsInfo.SourceId,
        //                                            sourceChildId = MyLeadsInfo.SourceChildId,
        //                                            statReasonId = MyLeadsInfo.StatReasonId,
        //                                            statId = MyLeadsInfo.StatId,
        //                                            indsId = MyLeadsInfo.IndsId,
        //                                            annualRevenue = MyLeadsInfo.AnnualRevenue,
        //                                            estBudget = MyLeadsInfo.EstBudget,
        //                                            noOfEmployees = MyLeadsInfo.NoOfEmployees,
        //                                            sicCode = MyLeadsInfo.SicCode,
        //                                            leadratingId = MyLeadsInfo.LeadratingId,
        //                                            campaignId = MyLeadsInfo.CampaignId,
        //                                            description = MyLeadsInfo.Description,
        //                                            close = MyLeadsInfo.Close,
        //                                            isEmail = MyLeadsInfo.IsEmail,
        //                                            isBulkEmail = MyLeadsInfo.IsBulkEmail,
        //                                            isCall = MyLeadsInfo.IsCall,
        //                                            isSMS = MyLeadsInfo.IsSMS,
        //                                            status = MyLeadsInfo.Status,
        //                                            converted = MyLeadsInfo.Converted,
        //                                            convDate = MyLeadsInfo.ConvDate,
        //                                            convUserId = MyLeadsInfo.ConvUserId,
        //                                            addUserId = MyLeadsInfo.AddUserId,
        //                                            addDate = MyLeadsInfo.AddDate,
        //                                            editUserId = MyLeadsInfo.EditUserId,
        //                                            editDate = MyLeadsInfo.EditDate,
        //                                            delUserId = MyLeadsInfo.DelUserId,
        //                                            delDate = MyLeadsInfo.DelDate,
        //                                            isQualified = MyLeadsInfo.IsQualified,
        //                                            customerTypeId = MyLeadsInfo.CustomerTypeId,
        //                                            customerSubTypeId = MyLeadsInfo.CustomerSubTypeId,
        //                                            pipeId = 1

        //                                        });
        //        if (NewListId > 0)
        //        {
        //            obj.Status = "SUCCESS";
        //            obj.StatusCode = "SUCCESS";
        //            obj.Message = "Lead Created Successfully ";
        //            obj.Data = NewListId.ToString();

        //        }
        //        else
        //        {
        //            obj.Status = "ERROR";
        //            obj.StatusCode = "ERROR";
        //            obj.Message = "Error Occured while inserting contact administrator";
        //            obj.Data = "0";
        //        }
        //        return obj;

        //    }


        //}

        public IEnumerable<JobQueueDTO> GetJobQueueList(UserInfo MyUserInfo)
        {
            IEnumerable<JobQueueDTO> JobQueueList = null;
            try
            {

                int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();

                //string QUERY = @" select * from jobqueue where user=@user and isComplete=0 Limit 200";

                string QUERY = @"  select eml.*,jbq.* from emaillist eml
                             inner join jobqueue jbq on jbq.EmailListId=eml.id
                             where jbq.user in @user and jbq.isComplete=0 limit 200;";

                JobQueueList = this.m_dbconnection.Query<JobQueueDTO>(QUERY, new Dictionary<string, object> { { "user", Ids } }).ToList();

            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
            }
            return JobQueueList;
        }


        public LeadStatusRetults GetLeadStatus(UserInfo MyUserInfo)
        {
            LeadStatusRetults leadStatusRetults  = new LeadStatusRetults();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            QueryStr = @"Select * From LeadStatus Where LeadStatActive=1;";

            CountQueryStr = @"Select Count(*) From LeadStatus Where LeadStatActive=1;";


            try
            {
                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                {
                    UserId = MyUserInfo.UserId

                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    leadStatusRetults.Status = "SUCCESS";
                    leadStatusRetults.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    leadStatusRetults.LeadStatus = result.Read<LeadStatusDTO>().AsList();
                    //total number of purchase orders
                    leadStatusRetults.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return leadStatusRetults;
            }
            catch (Exception exp)
            {
                leadStatusRetults.Status = "ERROR";
                leadStatusRetults.Message = exp.ToString();

            }

            return leadStatusRetults;
        }

        public IEnumerable<LeadStatusDomainItem> GetLeadStatusDomainItem(UserInfo MyUserInfo)
        {
            const string sql = @"Select LeadStatId,LeadStatName From LeadStatus Where LeadStatActive=1;";


            IEnumerable<LeadStatusDomainItem> MyLeadStatusDomainItem = m_dbconnection.Query<LeadStatusDomainItem>(sql).ToList();

            return MyLeadStatusDomainItem;
        }

        public int UpdateContactGroupsOfLead(ContactGroups contactGroups, UserInfo MyUserInfo)
        {
            var a = contactGroups;
            int LeadId = 0;
            int NewListId = 0;

            List<EmailDTO> ExistedList = new List<EmailDTO>();
            List<EmailDTO> NotExistedList = new List<EmailDTO>();


            LeadId = contactGroups.Leadid;
            QueryStr = @"Select * From EmailList Where LeadId=@LeadId;";

            IEnumerable<EmailDTO> emailDTOs = null;

            emailDTOs = this.m_dbconnection.Query<EmailDTO>(QueryStr, new Dictionary<string, object> { { "LeadId", LeadId } }).ToList();
            //Check Which List Id Is Existed If Not Existed then delete
            foreach(EmailDTO emailDTO in emailDTOs)
            {
                var E = contactGroups.ListIds.Where(x => x.ListId == emailDTO.ListId).ToList();
                if(E.Count>0)
                {
                    //contactGroups.ListIds.Remove(E.FirstOrDefault());
                    emailDTOs.ToList().Remove(emailDTO);
                    ExistedList.Add(emailDTO);
                }
                else
                {
                    //Do Nothing
                    NotExistedList.Add(emailDTO);
                }


            }

            //Delete Non Existed List
            foreach (EmailDTO emailDTO1 in NotExistedList)
            {
                DeleteQueryStr = string.Format("Delete From EmailList Where EmaillistId={0}", emailDTO1.EmaillistId);
                var AffectedRows = this.m_dbconnection.Execute(DeleteQueryStr);
            }
            //Add List Which User Passed

            foreach (ListIds listIds  in contactGroups.ListIds)
            {
                var Exists = emailDTOs.Where(x => x.ListId == listIds.ListId).FirstOrDefault();
                if(Exists !=null)
                {
                    //Exists
                    //Not Exists Delete
                    //emailDTOs = this.m_dbconnection.Query<EmailDTO>(DeleteQueryStr, new Dictionary<string, object> { { "ListId", listIds.ListId }, { "LeadId", LeadId } }).ToList();
                    //DeleteQueryStr = string.Format("Delete From EmailList Where ListId={0} And LeadId={1}", listIds.ListId, LeadId);
                    //var AffectedRows = this.m_dbconnection.Execute(DeleteQueryStr);

                    // Do Nothing
                }
                else
                {
                    InsertQueryStr = @"Insert Into EmailList (ListId,LeadId,RegardingId) Values (@ListId,@LeadId,@RegardingId);
                        SELECT SCOPE_IDENTITY();";

                    NewListId = this.m_dbconnection.QuerySingle<int>(InsertQueryStr,
                                                   new
                                                   {
                                                       ListId = listIds.ListId,
                                                       LeadId = LeadId,
                                                       RegardingId = 8

                                                   });

                }
            }

            return 1;
        }
        public int UpdateContactGroupsOfContact(ContactGroups contactGroups, UserInfo MyUserInfo)
        {
            var a = contactGroups;
            int LeadId = 0;
            int RegardingId = 0;
            int ContactId = 0;
            int NewListId = 0;

            List<EmailDTO> ExistedList = new List<EmailDTO>();
            List<EmailDTO> NotExistedList = new List<EmailDTO>();


            //LeadId = contactGroups.Leadid;
            RegardingId = contactGroups.RegardingId;
            ContactId = contactGroups.Contactid;
            QueryStr = @"Select * From EmailList Where RegardingId=@RegardingId And ContactId=@ContactId;";

            IEnumerable<EmailDTO> emailDTOs = null;

            emailDTOs = this.m_dbconnection.Query<EmailDTO>(QueryStr, new Dictionary<string, object> { { "RegardingId", RegardingId },{ "ContactId", ContactId } }).ToList();
            //Check Which List Id Is Existed If Not Existed then delete
            foreach (EmailDTO emailDTO in emailDTOs)
            {
                var E = contactGroups.ListIds.Where(x => x.ListId == emailDTO.ListId).ToList();
                if (E.Count > 0)
                {
                    //contactGroups.ListIds.Remove(E.FirstOrDefault());
                    emailDTOs.ToList().Remove(emailDTO);
                    ExistedList.Add(emailDTO);
                }
                else
                {
                    //Do Nothing
                    NotExistedList.Add(emailDTO);
                }


            }

            //Delete Non Existed List
            foreach (EmailDTO emailDTO1 in NotExistedList)
            {
                DeleteQueryStr = string.Format("Delete From EmailList Where EmaillistId={0}", emailDTO1.EmaillistId);
                var AffectedRows = this.m_dbconnection.Execute(DeleteQueryStr);
            }
            //Add List Which User Passed

            foreach (ListIds listIds in contactGroups.ListIds)
            {
                var Exists = emailDTOs.Where(x => x.ListId == listIds.ListId).FirstOrDefault();
                if (Exists != null)
                {
                    //Exists
                    //Not Exists Delete
                    //emailDTOs = this.m_dbconnection.Query<EmailDTO>(DeleteQueryStr, new Dictionary<string, object> { { "ListId", listIds.ListId }, { "LeadId", LeadId } }).ToList();
                    //DeleteQueryStr = string.Format("Delete From EmailList Where ListId={0} And LeadId={1}", listIds.ListId, LeadId);
                    //var AffectedRows = this.m_dbconnection.Execute(DeleteQueryStr);

                    // Do Nothing
                }
                else
                {
                    InsertQueryStr = @"Insert Into EmailList (ListId,ContactId,RegardingId) Values (@ListId,@ContactId,@RegardingId);
                        SELECT SCOPE_IDENTITY();";

                    NewListId = this.m_dbconnection.QuerySingle<int>(InsertQueryStr,
                                                   new
                                                   {
                                                       ListId = listIds.ListId,
                                                       ContactId = ContactId,
                                                       RegardingId = RegardingId

                                                   });

                }
            }

            return 1;
        }


        public IEnumerable<LeadRatingDomainItem> GetLeadRatingDomainItems(UserInfo MyUserInfo)
        {
            const string sql = @"Select * From LeadRating Where LeadRatingIsActive=1;";


            IEnumerable<LeadRatingDomainItem> MyLeadRatingDomainItems = m_dbconnection.Query<LeadRatingDomainItem>(sql).ToList();

            return MyLeadRatingDomainItems;
        }


    }
}
