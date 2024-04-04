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
    public class OpportunityRepository : IOpportunityRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public OpportunityRepository(UserInfo MyUserInfo)
        {
            //TODO
        }
        public OpportunityResult SearchOpportunity(UserInfo MyUserInfo, SearchOpportunity searchOpportunity)
        {
            OpportunityResult opportunityResult = new OpportunityResult();
            //QueryStr = @"SELECT a.AccountName,concat(c.FirstName, ' ', c.LastName)ContactName, 
            //                    c.FirstName,c.Midname,c.LastName,
            //                    opp.Id,opp.oppTopic,opp.AccountId,opp.ContactId,opp.RegardingId,opp.RegarId,opp.RelId,
            //                    opp.PriceListId,opp.CurId,opp.LeadId,opp.CloseRevenue,opp.CloseDate,
            //                    opp.estRevenue,opp.estCloseDate,opp.ProbabilityId,opp.ActualRevenue,opp.OppStatReasonId,
            //                    opp.StatusReasonId,opp.WonLost,opp.CampaignId,opp.OppCloseDesc,opp.OppDesc,
            //                    opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate,
            //                    opp.UpdatedBy,opp.UpdatedDate,opp.DeletedBy,opp.DeletedDate,
            //                    Pb.Name ProbabilityName,case when opp.statusReasonId = 1
            //                    then 'In Progress'  else 'On Hold' end as StatusReason
            //                    FROM opportunity opp inner join probability Pb on opp.ProbabilityId = Pb.Id
            //                    inner join contacts c on c.Id = opp.contactId 
            //                    left join Accounts a on c.AccountId = a.Id
            //                    where 1=1 ";
            QueryStr = @"SELECT a.AccountName,concat(c.FirstName, ' ', c.LastName)ContactName, 
                                c.FirstName,c.Midname,c.LastName,
                                opp.Id,opp.oppTopic,opp.AccountId,opp.ContactId,opp.RegardingId,opp.RegarId,opp.RelId,
                                opp.PriceListId,opp.CurId,opp.LeadId,opp.CloseRevenue,opp.CloseDate,
                                opp.estRevenue,convert(varchar, opp.estCloseDate, 23) EstCloseDate ,opp.ProbabilityId,opp.ActualRevenue,opp.OppStatReasonId,
                                opp.StatusReasonId,opp.WonLost,opp.CampaignId,opp.OppCloseDesc,opp.OppDesc,
                                opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate,
                                opp.UpdatedBy,opp.UpdatedDate,opp.DeletedBy,opp.DeletedDate,
                                Pb.Name ProbabilityName,case when opp.statusReasonId = 1
                                then 'In Progress'  else 'On Hold' end as StatusReason
                                FROM opportunity opp inner join probability Pb on opp.ProbabilityId = Pb.Id
                                left join contacts c on c.Id = opp.contactId 
                                left join Accounts a on c.AccountId = a.Id
                                where 1=1 ";

            //QueryStr = @"SELECT a.AccountName, opp.Id,opp.oppTopic,opp.AccountId,opp.ContactId,opp.RegardingId,opp.RegarId,opp.RelId,
            //                    opp.PriceListId,opp.CurId,opp.LeadId,opp.CloseRevenue,opp.CloseDate,
            //                    opp.estRevenue,opp.estCloseDate,opp.ProbabilityId,opp.ActualRevenue,opp.OppStatReasonId,
            //                    opp.StatusReasonId,opp.WonLost,opp.CampaignId,opp.OppCloseDesc,opp.OppDesc,
            //                    opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate,
            //                    opp.UpdatedBy,opp.UpdatedDate,opp.DeletedBy,opp.DeletedDate,
            //                    Pb.Name ProbabilityName,case when opp.statusReasonId = 1
            //                    then 'In Progress'  else 'On Hold' end as StatusReason
            //                    FROM opportunity opp inner join probability Pb on opp.ProbabilityId = Pb.Id
            //                    --left join contacts c on c.Id = opp.contactId 
            //                    left join Accounts a on opp.AccountId = a.Id
            //                    where 1=1 ";


            QueryStr = QueryStr + string.Format(" and opp.createdBy in(Select Data from dbo.Split({0}, ','))  ", searchOpportunity.UserId);

            CountQueryStr = @"SELECT Count(*)
                                                FROM opportunity opp inner join probability Pb on opp.ProbabilityId = Pb.Id
                                                --left join contacts c on c.Id = opp.contactId 
                                                left join Accounts a on opp.AccountId = a.Id
                                                where 1=1 ";
            CountQueryStr = CountQueryStr + string.Format(" and opp.createdBy in(Select Data from dbo.Split({0}, ','))  ", searchOpportunity.UserId);

            if (!string.IsNullOrEmpty(searchOpportunity.OppTopic))
            {
                QueryStr = QueryStr + " \nAnd ( opp.oppTopic like '%" + searchOpportunity.OppTopic + "%' )";

                CountQueryStr = CountQueryStr + " \nAnd ( opp.oppTopic like '%" + searchOpportunity.OppTopic + "%' )";

            }


            if (searchOpportunity.Skip == 0 && searchOpportunity.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By Opp.CreatedDate Desc;";
            }
            if (searchOpportunity.Skip >= 0 && searchOpportunity.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By Opp.CreatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", searchOpportunity.Skip, searchOpportunity.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    opportunityResult.Status = "SUCCESS";
                    opportunityResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    opportunityResult.Opportunities = result.Read<OpportunityDTO>().AsList();
                    //total number of purchase orders
                    opportunityResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return opportunityResult;
            }
            catch (Exception exp)
            {
                opportunityResult.Status = "ERROR";
                opportunityResult.Message = exp.ToString();
            }
            return opportunityResult;
        }
        public IEnumerable<OpportunityDTO> GetOpportunityList(int TypeId, UserInfo MyUserInfo)
        {
            string OpportunityListQRY = "";
            try
            {
                int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();
                IEnumerable<OpportunityDTO> OpportunityList;
                if (TypeId == 1)
                {
                    OpportunityListQRY = @"SELECT a.AccountName,concat(c.FirstName,' ',c.LastName)ContactName, opp.Id,opp.oppTopic,
                                                opp.estCloseDate,opp.estRevenue,
                                                Pb.Name ProbabilityName,case when opp.statusReasonId=1
                                                then 'In Progress'  else 'On Hold' end as StatusReason,
                                                opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate
                                                FROM opportunity opp inner join probability Pb on opp.ProbabilityId=Pb.Id
                                                inner join contacts c on c.Id=opp.contactId left join Accounts a on c.AccountId=a.Id 
                                                where opp.IsClose=0 
                                                and c.createdBy in(Select Data from dbo.Split(@userIds,','));";
                    OpportunityList = this.m_dbconnection.Query<OpportunityDTO>(OpportunityListQRY, new Dictionary<string, object> { { "userIds", MyUserInfo.UsersIds } }).ToList();
                    return OpportunityList;
                }
                else if (TypeId == 2)
                {
                    OpportunityListQRY = @"SELECT a.AccountName,concat(c.FirstName,' ',c.LastName)ContactName, opp.Id,opp.oppTopic,
                                                opp.estCloseDate,opp.estRevenue,
                                                opp.closeRevenue,
                                                Pb.Name ProbabilityName,case when opp.statusReasonId=1
                                                then 'In Progress'  else 'On Hold' end as StatusReason,
                                                opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate
                                                FROM opportunity opp inner join probability Pb on opp.ProbabilityId=Pb.Id
                                                inner join contacts c on c.Id=opp.contactId left join Accounts a on c.AccountId=a.Id 
                                                where opp.IsClose=1 
                                                --and c.createdBy in(Select Data from dbo.Split(@userIds,','));";
                    OpportunityList = this.m_dbconnection.Query<OpportunityDTO>(OpportunityListQRY, new Dictionary<string, object> { { "userIds", MyUserInfo.UsersIds } }).ToList();
                    return OpportunityList;
                }
                else
                {
                    OpportunityListQRY = @"SELECT a.AccountName,concat(c.FirstName,' ',c.LastName)ContactName, opp.Id,opp.oppTopic,
                                                opp.estCloseDate,opp.estRevenue,
                                                opp.closeRevenue,
                                                Pb.Name ProbabilityName,case when opp.statusReasonId=1
                                                then 'In Progress'  else 'On Hold' end as StatusReason,
                                                opp.IsActive,Opp.IsClose,Opp.CreatedBy,Opp.CreatedDate
                                                FROM opportunity opp inner join probability Pb on opp.ProbabilityId=Pb.Id
                                                inner join contacts c on c.Id=opp.contactId left join Accounts a on c.AccountId=a.Id 
                                                --and c.createdBy in(Select Data from dbo.Split(@userIds,','));";
                    OpportunityList = this.m_dbconnection.Query<OpportunityDTO>(OpportunityListQRY, new Dictionary<string, object> { { "userIds", MyUserInfo.UsersIds } }).ToList();
                    return OpportunityList;
                }
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                return null;
            }
        }
        public OpportunityDTO GetOpportunityInfo(int Id,UserInfo MyUserInfo)
        {
            OpportunityDTO OpportunityInfo = new OpportunityDTO();
            try
            {
                QueryStr = @"SELECT opp.*,convert(varchar, opp.estCloseDate, 23) EstCloseDate,case when opp.IsActive=1 then 'Active'  else 'In Active' end as Status,ld.topic OriginatingLead 
                                                            FROM opportunity  opp
                                                            left join leads ld on ld.id=opp.leadId
                                                            where opp.Id=@Id;";
                OpportunityInfo = this.m_dbconnection.Query<OpportunityDTO>(QueryStr, new Dictionary<string, object> { { "Id", Id } }).FirstOrDefault();

                const string sql = @"select UserName from UserProfile Where UserId=@Id;";
                OpportunityInfo.UserName = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "Id", MyUserInfo .UserId} }).FirstOrDefault();

                return OpportunityInfo;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                return null;
            }
        }
        public OpportunityDTO GetOpportunityDetails(UserInfo MyUserInfo)
        {
            OpportunityDTO OpportunityList = new OpportunityDTO();
            try
            {

                string PriceListQRY = @"  SELECT * from PriceList;";
                OpportunityList.PriceList = this.m_dbconnection.Query<PriceListDTO>(PriceListQRY).ToList();

                string CurrencyListQRY = @"  SELECT * from currency;";
                OpportunityList.CurrencyList = this.m_dbconnection.Query<CurrencyDTO>(CurrencyListQRY).ToList();

                string ContactListQRY = @"SELECT C.Id, CONCAT(C.FirstName, '--', case when A.AccountName IS NULL then ' '  else A.AccountName end)
                                         AS ContactName FROM contacts C  left join account A on C.AccountId=A.Id;";
                OpportunityList.ContactList = this.m_dbconnection.Query<ContactDTO>(ContactListQRY).ToList();


                string StatusReasonListQRY = @"  SELECT * from oppstatusreason;";
                OpportunityList.OppStatusReasonList = this.m_dbconnection.Query<OppStatusReasonDTO>(StatusReasonListQRY).ToList();

                string ProbabilityListListQRY = @"  SELECT Id,CONCAT(name,'--',value) Name from probability;";
                OpportunityList.ProbabilityList = this.m_dbconnection.Query<ProbabilityDTO>(ProbabilityListListQRY).ToList();


                const string sql = @"SELECT userName FROM boundhoundmaster.users where Id=@Id;";
                OpportunityList.UserName = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "Id", MyUserInfo.UserId } }).FirstOrDefault();


                return OpportunityList;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                return null;
            }
        }
        public ResultReponse CreateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {

                int rowsAffected = 0;

                const string sql = @"Select oppTopic from opportunity  Where oppTopic=@oppTopic;";
                string oppTopic = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "oppTopic", Opportunity.OppTopic } }).FirstOrDefault();

                if (oppTopic == null)
                {

                    if(Opportunity.AccountId==0)
                    {
                        MyResultReponse.Status = "ERROR";
                        MyResultReponse.StatusCode = "ERROR";
                        MyResultReponse.Message = "Account Should Not Be NULL";
                        MyResultReponse.Data = "0";

                        return MyResultReponse;

                    }
                    string InsertOpportunityQRY = @"INSERT opportunity(
                                                    oppNo, oppTopic,RegardingId,RegarId,AccountId,ContactId,
                                                    estCloseDate, probabilityId, priceListId, curId,
                                                    leadId,statusReasonId,oppDesc,actualRevenue,estRevenue,createdBy,createdDate)
                                                    values(
                                                    @oppNo, @oppTopic,@RegardingId,@RegarId,@AccountId,@ContactId,
                                                    @estCloseDate, @probabilityId, @priceListId, @curId,
                                                    @leadId,@statusReasonId,@oppDesc, @actualRevenue,@estRevenue,@createdBy,@createdDate);
                                                    SELECT SCOPE_IDENTITY();";
                    //Opportunity.EstCloseDate = Convert.ToDateTime(Opportunity.EstCloseDateStr);
                    rowsAffected = this.m_dbconnection.QuerySingle<int>(InsertOpportunityQRY,
                      new
                      {
                          oppNo = Opportunity.OppNo,
                          oppTopic = Opportunity.OppTopic,
                          RegardingId = Opportunity.RegardingId,
                          RegarId = Opportunity.RegarId,
                          AccountId = Opportunity.AccountId,
                          ContactId = Opportunity.ContactId,
                          estCloseDate = Opportunity.EstCloseDate,
                          probabilityId = Opportunity.ProbabilityId,
                          priceListId = Opportunity.PriceListId,
                          curId = Opportunity.CurId,
                          leadId = Opportunity.LeadId,                        
                          statusReasonId = Opportunity.StatusReasonId,
                          oppDesc = Opportunity.OppDesc,
                          actualRevenue = Opportunity.ActualRevenue,
                          estRevenue = Opportunity.EstRevenue,
                          createdBy = MyUserInfo.UserId,
                          createdDate = DateTime.Now
                      });

                    if (rowsAffected > 0)
                    {
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "Opportunity Created Successfully ";
                        MyResultReponse.Data = rowsAffected.ToString();
                    }

                    else
                    {
                        MyResultReponse.Status = "ERROR";
                        MyResultReponse.StatusCode = "ERROR";
                        MyResultReponse.Message = "Error Occured while inserting Opportunity administrator";
                        MyResultReponse.Data = rowsAffected.ToString();
                    }
                }
                else
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message =string.Format("Opportunity oppTopic Already Exists...  {0} !!!  ", oppTopic);
                    MyResultReponse.Data = rowsAffected.ToString();
                }

            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();
                var Message = ex.ToString();
                throw;
            }

            return MyResultReponse;
        }
        public ResultReponse UpdateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            //LeadsDbService MyLeadsDbService = new LeadsDbService(MyUserInfo);

            LeadsRepository leadsRepository = new LeadsRepository(MyUserInfo);

            int CurrentProbability = 0;
            int SalesStageHisotyId = 0;
            string ProbabilityFromTo = "";
            OpportunityDTO CurrentOpportunityInfo = new OpportunityDTO();

            int ProbabilityActualDays = 0;

            TimeSpan mTimeSpan = new TimeSpan(1);
            try
            {
                //************************************************************************************************************************************************
                //Get Current Probability Id
                //************************************************************************************************************************************************
                const string CurrentOpportunityQuery = @"Select * from opportunity  Where Id=@Id;";
                CurrentOpportunityInfo = this.m_dbconnection.Query<OpportunityDTO>(CurrentOpportunityQuery, new Dictionary<string, object> { { "Id", Opportunity.Id } }).FirstOrDefault();
                //************************************************************************************************************************************************

                int rowsAffected = 0;

                const string sql = @"Select oppTopic from opportunity  Where oppTopic=@oppTopic And Id<>@Id;;";
                string oppTopic = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "oppTopic", Opportunity.OppTopic }, { "Id", Opportunity.Id } }).FirstOrDefault();

                //Get Probability Actual Days
                const string ProbActualDayssql = @" select workingDays from  probability  where Id=@Id;";
                ProbabilityActualDays = m_dbconnection.Query<int>(ProbActualDayssql, new { id = Opportunity.ProbabilityId }).FirstOrDefault();

                if (oppTopic == null)
                {
                    string UpdateOpportunityQRY = @" UPDATE opportunity SET 
                                                oppTopic=@oppTopic,RegardingId=@RegardingId,RegarId=@RegarId,
                                                AccountId=@AccountId,contactId=@contactId,estCloseDate=@estCloseDate,
                                                probabilityId=@probabilityId,priceListId=@priceListId,curId=@curId,
                                                LeadId=@LeadId,statusReasonId=@statusReasonId,oppDesc=@oppDesc,
                                                actualRevenue=@actualRevenue,estRevenue=@estRevenue,
                                                updatedBy=@updatedBy,updatedDate=@updatedDate
                                                WHERE Id=@Id";
                    //Opportunity.EstCloseDate = Convert.ToDateTime(Opportunity.EstCloseDateStr);
                    rowsAffected = this.m_dbconnection.Execute(UpdateOpportunityQRY,
                      new
                      {
                          oppTopic = Opportunity.OppTopic,
                          RegardingId = Opportunity.RegardingId,
                          RegarId = Opportunity.RegarId,
                          AccountId = Opportunity.AccountId,
                          ContactId = Opportunity.ContactId,
                          estCloseDate = Opportunity.EstCloseDate,
                          probabilityId = Opportunity.ProbabilityId,
                          priceListId = Opportunity.PriceListId,
                          curId = Opportunity.CurId,
                          leadId = Opportunity.LeadId,
                          statusReasonId = Opportunity.StatusReasonId,
                          oppDesc = Opportunity.OppDesc,
                          actualRevenue = Opportunity.ActualRevenue,
                          estRevenue = Opportunity.EstRevenue,
                          updatedBy = MyUserInfo.UserId,
                          updatedDate = DateTime.Now,
                          Id=Opportunity.Id
                      });

                    if (rowsAffected > 0)
                    {
                        //Update Lead Status mean probability
                        if (Opportunity.LeadId > 0)
                        {
                            int RetLeadId = leadsRepository.UpdateLeadStatus(Opportunity.LeadId, Opportunity.ProbabilityId, MyUserInfo.UserId);
                        }
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "Opportunity Updated Successfully ";
                        MyResultReponse.Data = rowsAffected.ToString();

                        //Check If User selected probability then update or else
                        //nothing to do
                        if (CurrentOpportunityInfo.ProbabilityId != Opportunity.ProbabilityId)
                        {
                            //Update Sales Stage History
                            //Here have to take updated date and current probability
                            if (CurrentOpportunityInfo.UpdatedDate != null)
                            {
                                mTimeSpan = (DateTime.Now - CurrentOpportunityInfo.UpdatedDate);
                            }
                            else
                            {
                                mTimeSpan = (DateTime.Now - CurrentOpportunityInfo.CreatedDate);
                            }

                            ProbabilityFromTo = CurrentOpportunityInfo.ProbabilityId + "-" + Opportunity.ProbabilityId;
                            SalesStageHisotyId = leadsRepository.AddSalesStageHistory(Opportunity.LeadId, Opportunity.Id, Opportunity.ProbabilityId, ProbabilityFromTo,
                                CurrentOpportunityInfo.UpdatedDate, DateTime.Now, MyUserInfo.UserId, mTimeSpan.Days, ProbabilityActualDays);
                        }
                    }

                    else
                    {
                        MyResultReponse.Status = "ERROR";
                        MyResultReponse.StatusCode = "ERROR";
                        MyResultReponse.Message = "Error Occured while inserting contact administrator";
                        MyResultReponse.Data = rowsAffected.ToString();
                    }

                }
                else
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Topic Name Already Exists...!!!";
                    MyResultReponse.Data = rowsAffected.ToString();
                }

            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while Updateding contact administrator";
                MyResultReponse.Data = ex.ToString();
                var Message = ex.ToString();
                throw;
            }

            return MyResultReponse;
        }
        public ResultReponse DeleteOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int result = 0;
            try
            {

                string updateQuery = @"UPDATE Opportunity 
SET OppActive = @OppActive,
oppDesc=@oppDesc,
deletedBy=@deletedBy,
deletedDate=@deletedDate WHERE Id =@Id";

                result = this.m_dbconnection.Execute(updateQuery, new
                {
                    OppActive = Opportunity.IsActive,
                    oppDesc = Opportunity.OppDesc,
                    deletedBy = MyUserInfo.UserId,
                    deletedDate = DateTime.Now,
                    Id = Opportunity.Id


                });
                MyResultReponse.Status = "SUCCESS";
                MyResultReponse.StatusCode = "SUCCESS";
                MyResultReponse.Message = "Opportunity Updated Successfully ";
                MyResultReponse.Data = result.ToString();
            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Updating Failed...!!!";
                MyResultReponse.Data = Opportunity.ToString();
            }
            return MyResultReponse;
        }
        public ResultReponse CloseOpportunity(CloseOpp closeOpp, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            //LeadsDbService MyLeadsDbService = new LeadsDbService(MyUserInfo);

            LeadsRepository leadsRepository = new LeadsRepository(MyUserInfo);

            string LostReason = "";
            int ReasonId = 0;
            try
            {

                int rowsAffected = 0;


                LostReason = closeOpp.SelectedId;
                if (closeOpp.Status == false)
                {
                    ReasonId = int.Parse(closeOpp.SelectedId);
                }

                string UpdateCampaignQRY = @" UPDATE opportunity SET closeRevenue=@closeRevenue,won_lost=@won_lost,oppClose=@oppClose,probabilityId=@probabilityId,
                                                oppCloseDesc=@oppCloseDesc,closeDate=@closeDate,statusReasonId=@statusReasonId WHERE Id=@Id";

                rowsAffected = this.m_dbconnection.Execute(UpdateCampaignQRY,
                  new
                  {
                      closeRevenue = closeOpp.CloseRevenue.Replace(",", ""),
                      won_lost = closeOpp.Status,
                      oppClose = 1,
                      probabilityId = 9,
                      oppCloseDesc = closeOpp.OppDesc,
                      closeDate = closeOpp.OppCloseDate,
                      statusReasonId = ReasonId,
                      Id = closeOpp.CurrentOppId
                  });

                if (rowsAffected > 0)
                {
                    const string sql = @"Select LeadsId from opportunity  Where Id=@Id;;";
                    int LeadId = this.m_dbconnection.Query<int>(sql, new Dictionary<string, object> { { "Id", closeOpp.CurrentOppId } }).FirstOrDefault();
                    string UpdateQRY = @" UPDATE Leads SET converted=@converted,probabilityId=@probabilityId,updatedBy=@updatedBy,updatedDate=@updatedDate WHERE Id=@Id";

                    rowsAffected = this.m_dbconnection.Execute(UpdateQRY,
                      new
                      {
                          converted = 1,
                          probabilityId = 9,
                          updatedBy = MyUserInfo.UserId,
                          updatedDate = DateTime.Now,
                          Id = LeadId
                      });
                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.StatusCode = "SUCCESS";
                    MyResultReponse.Message = "Opportunity Updated Successfully ";
                    MyResultReponse.Data = rowsAffected.ToString();
                }

                else
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Error Occured while inserting contact administrator";
                    MyResultReponse.Data = rowsAffected.ToString();
                }
            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while Updateding contact administrator";
                MyResultReponse.Data = ex.ToString();
                var Message = ex.ToString();
                throw;
            }

            return MyResultReponse;
        }
        public IEnumerable<ProbabilityDomainItem> GetProbabilityDomainItem(UserInfo MyUserInfo)
        {
            string OpportunityListQRY = "";
            IEnumerable<ProbabilityDomainItem> ProbabilityDomainItemList;

            try
            {
                //QueryStr = string.Format(" Select Id,AccountName As AccountName From Accounts As Accts Where IsActive=1;");

                //IEnumerable<AccountsDomainItem> accountsDomainItems = this.m_dbconnection.Query<AccountsDomainItem>(QueryStr).ToList();

                //return accountsDomainItems;

                QueryStr = @"  SELECT Id,CONCAT(name,'--',value) Name,value from probability where isactive=1;";
                ProbabilityDomainItemList = this.m_dbconnection.Query<ProbabilityDomainItem>(QueryStr).ToList();

                return ProbabilityDomainItemList;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                return null;
            }
        }

        //public OpportunityProductResults AddOpportunityProducts(IEnumerable<OpportunityProductsDTO> opportunityProductsDTOs, UserInfo MyUserInfo)
        public OpportunityProductResults AddOpportunityProducts(OpportunityProductsInput opportunityProductsInput , UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            string oppTopic = "";
            string OpportunityPoductsQuery = "";
            string InsertProductsInOpportunityQuery = "";
            bool IsProductExists = false;
            int TotalProductsExists = 0;
            int OpportunityId = 0;
            int TotalProductsRequest = 0;

            OpportunityProductResults opportunityProductResults = new OpportunityProductResults();


            try
            {
                
                int rowsAffected = 0;
                List<OpportunityProductExist> opportunityProductExists = new List<OpportunityProductExist>();

                OpportunityId = opportunityProductsInput.OpportunityId;

                if (opportunityProductsInput.opportunityProductsDTOs.Count>0)
                {
                    TotalProductsRequest = opportunityProductsInput.opportunityProductsDTOs.Count;

                    foreach (OpportunityProductsDTO opportunityProductsDTO in opportunityProductsInput.opportunityProductsDTOs)
                    {
                        OpportunityProductsDTO opportunityProductsDTOInfo = new OpportunityProductsDTO();
                        OpportunityProductExist opportunityProductExist = new OpportunityProductExist();

                        OpportunityPoductsQuery = @"Select * From OpportunityProducts Where ProductId=@ProductId And OpportunityId=@OpportunityId;";
                        opportunityProductsDTOInfo = this.m_dbconnection.Query<OpportunityProductsDTO>(OpportunityPoductsQuery,
                            new Dictionary<string, object> {
                            { "ProductId", opportunityProductsDTO.ProductId } ,
                            { "OpportunityId" , OpportunityId }
                            }).FirstOrDefault();

                        if (opportunityProductsDTOInfo != null)
                        {
                            if (opportunityProductsDTOInfo.ProductId == opportunityProductsDTO.ProductId)
                            {
                                //OpportunityId= opportunityProductsDTOInfo.OpportunityId.Value;
                                opportunityProductExist.ProductId = opportunityProductsDTOInfo.ProductId.Value;
                                opportunityProductExist.OpportunityId = OpportunityId;
                                opportunityProductExist.Status = "ALREADYEXISTS";
                                opportunityProductExist.Message = "Product Already Exists In Opportunity ";

                                opportunityProductExists.Add(opportunityProductExist);
                                IsProductExists = true;
                                TotalProductsExists++;



                            }
                        }
                        else
                        {
                            //Add Product Here
                            InsertProductsInOpportunityQuery = @"INSERT OpportunityProducts(
                                                    OpportunityId,ProductId,WritePName)
                                                    values(
                                                    @OpportunityId,@ProductId,@WritePName);
                                                    SELECT SCOPE_IDENTITY();";

                            rowsAffected = this.m_dbconnection.QuerySingle<int>(InsertProductsInOpportunityQuery,
                             new
                             {
                                 OpportunityId = OpportunityId,
                                 ProductId = opportunityProductsDTO.ProductId,
                                 WritePName = opportunityProductsDTO.WritePName,
                                 createdBy = MyUserInfo.UserId,
                                 createdDate = DateTime.Now
                             });

                            if (rowsAffected > 0)
                            {
                                opportunityProductExist.OpportunityId = OpportunityId;
                                opportunityProductExist.ProductId = opportunityProductsDTO.ProductId.Value;
                                opportunityProductExist.Status = "SUCCESS";
                                opportunityProductExist.Message = "Product Added Successfully ";

                                opportunityProductExists.Add(opportunityProductExist);
                            }

                            else
                            {
                                opportunityProductExist.OpportunityId = OpportunityId;
                                opportunityProductExist.ProductId = opportunityProductsDTOInfo.ProductId.Value;
                                opportunityProductExist.Status = "ERROR";
                                opportunityProductExist.Message = "Product Already Exists In Opportunity ";

                                opportunityProductExists.Add(opportunityProductExist);
                            }
                        }

                    }
                    if (TotalProductsRequest == TotalProductsExists)
                    {
                        opportunityProductResults.OpportunityId = OpportunityId;
                        opportunityProductResults.OpportunityProductExists = opportunityProductExists;
                        opportunityProductResults.Status = "ERROR";
                        opportunityProductResults.StatusCode = "ERROR";
                        opportunityProductResults.Message = "Product Already Exists In Opportunity";
                        opportunityProductResults.IsProductExists = IsProductExists;
                        opportunityProductResults.TotalProductsExists = TotalProductsExists;
                    }
                    else
                    {
                        opportunityProductResults.OpportunityId = OpportunityId;
                        opportunityProductResults.OpportunityProductExists = opportunityProductExists;
                        opportunityProductResults.Status = "SUCCESS";
                        opportunityProductResults.StatusCode = "SUCCESS";
                        opportunityProductResults.Message = "SUCCESS";
                        opportunityProductResults.IsProductExists = IsProductExists;
                        opportunityProductResults.TotalProductsExists = TotalProductsExists;
                    }

                }
                else
                {
                    opportunityProductResults.OpportunityId = OpportunityId;
                    opportunityProductResults.OpportunityProductExists = opportunityProductExists;
                    opportunityProductResults.Status = "ERROR";
                    opportunityProductResults.StatusCode = "ERROR";
                    opportunityProductResults.Message = "No Products Attached";
                    opportunityProductResults.IsProductExists = false;
                    opportunityProductResults.TotalProductsExists = 0;
                }


                return opportunityProductResults;

            }
            catch (Exception ex)
            {
                opportunityProductResults.Status = "FAIL";
                opportunityProductResults.StatusCode = "FAIL";
                opportunityProductResults.Message = "Error Occured while inserting contact administrator";
                opportunityProductResults.OpportunityProductExists = null;
                opportunityProductResults.Error = ex.ToString();
               
            }

            return opportunityProductResults;
        }


        public OpportunityProductsDetailsList GetOpportunityProductsDetailsList(int OpportunityId, UserInfo MyUserInfo)
        {
            OpportunityProductsDetailsList opportunityProductsDetailsList = new OpportunityProductsDetailsList();
            IEnumerable<OpportunityProductsListsDTO> OpportunityProductsLists = null;
            try
            {
                QueryStr = @"SELECT dbo.OpportunityProducts.OpportunityProductId, dbo.OpportunityProducts.OpportunityId, dbo.OpportunityProducts.OpportunityProductType, dbo.OpportunityProducts.ProductId, dbo.Products.ProductCode, 
                  dbo.Products.ProductSerialNo, dbo.Products.ProductName, dbo.Products.ProductFamilyId, dbo.Products.ProductDescription, dbo.Products.ProductIsActive, dbo.Products.CategoryID, dbo.Products.CreatedBy, dbo.Products.CreatedDate, 
                  dbo.OpportunityProducts.UnitsId, dbo.OpportunityProducts.PricingType, dbo.OpportunityProducts.PricePerUnit, dbo.OpportunityProducts.VolDiscount, dbo.OpportunityProducts.Qty, dbo.OpportunityProducts.Amount, 
                  dbo.OpportunityProducts.ManualDiscount, dbo.OpportunityProducts.Tax, dbo.OpportunityProducts.ExtendedAmount, dbo.OpportunityProducts.RequestDate, dbo.OpportunityProducts.Price, dbo.OpportunityProducts.DiscPer, 
                  dbo.OpportunityProducts.PriceListId
                  FROM     dbo.Products LEFT OUTER JOIN
                  dbo.OpportunityProducts ON dbo.Products.ProductID = dbo.OpportunityProducts.ProductId
                                                            Where OpportunityId=@OpportunityId;";
                OpportunityProductsLists = this.m_dbconnection.Query<OpportunityProductsListsDTO>(QueryStr, new Dictionary<string, object> { { "OpportunityId", OpportunityId } }).ToList();

                if(OpportunityProductsLists!=null)
                {
                    opportunityProductsDetailsList.TotalRecords = OpportunityProductsLists.Count();
                    opportunityProductsDetailsList.Status = "SUCCESS";
                    opportunityProductsDetailsList.Message = "SUCCESS";
                    opportunityProductsDetailsList.OpportunityProductsLists = OpportunityProductsLists.ToList();

                }
                else
                {
                    opportunityProductsDetailsList.TotalRecords = 0;
                    opportunityProductsDetailsList.Status = "ERROR";
                    opportunityProductsDetailsList.Message = "ERROR";
                    opportunityProductsDetailsList.OpportunityProductsLists = null;

                }
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                opportunityProductsDetailsList.TotalRecords = 0;
                opportunityProductsDetailsList.Status = "ERROR";
                opportunityProductsDetailsList.Message = "ERROR";
                opportunityProductsDetailsList.OpportunityProductsLists = null;
            }
            return opportunityProductsDetailsList;
        }
    }
}
