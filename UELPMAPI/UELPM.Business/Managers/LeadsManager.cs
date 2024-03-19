using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class LeadsManager : ILeadsManager
    {
        public LeadsInfoList GetLeadsGroupByStages(UserInfo MyUserInfo)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.GetLeadsGroupByStages(MyUserInfo);
        }
        public IEnumerable<LeadsDTO> GetLeads(UserInfo MyUserInfo)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.GetLeads(MyUserInfo);
        }
        public LeadsResult GetLeadsByPagination(int skip,int take,UserInfo MyUserInfo)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.GetLeadsByPagination(skip,take,MyUserInfo);
        }

        public LeadsResult SearchLeads(UserInfo MyUserInfo, LeadsSearch leadsSearchInput)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.SearchLeads(MyUserInfo, leadsSearchInput);
        }

        public LeadsResult SearchLeads(int ModuleId,int FormId,int ViewId, LeadsSearch leadsSearchInput, UserInfo MyUserInfo)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.SearchLeads(ModuleId,FormId, ViewId, leadsSearchInput, MyUserInfo);
        }
        public IEnumerable<LeadNames> SearchLeadNames(UserInfo MyUserInfo, LeadsSearch leadsSearchInput)
        {
            LeadsRepository m_ListRepository = new LeadsRepository();
            return m_ListRepository.SearchLeadNames(MyUserInfo, leadsSearchInput);
        }
        public LeadsDTO GetLeadsById(int id, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsById(id);
        }

        public LeadInfo GetLeadById(int id, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadById(id);
        }
        public ResultReponse ConvertToLead(List<EmailDTO> MyEmailList, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.ConvertToLead(MyEmailList, MyUserInfo);
        }
        public ResultReponse AddToQueue(List<EmailDTO> MyEmailList, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.AddToQueue(MyEmailList, MyUserInfo);
        }
        public ResultReponse UpdateQueue(List<JobQueueDTO> MyQueueList, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.UpdateQueue(MyQueueList, MyUserInfo);
        }
        public ResultReponse CreateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.CreateLead(MyLeadInfo, MyUserInfo);
        }

        public ResultReponse ChangeLeadStatus(List<LeadsDTO> MyLeadList, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.ChangeLeadStatus(MyLeadList, MyUserInfo);
        }

        public LeadQualifyResponse QualifyLead(LeadQualifyInput leadQualifyInput, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.QualifyLead(leadQualifyInput, MyUserInfo);
        }
        public LeadQualifyRequest GetLeadInfoToConvert(LeadQualifyRequest leadQualifyRequest, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadInfoToConvert(leadQualifyRequest, MyUserInfo);
        }
        public IEnumerable<LeadSourceDTO> GetLeadSource(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadSource(MyUserInfo);
        }

        public IEnumerable<SalutationDTO> GetSalutation(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetSalutation(MyUserInfo);
        }
        public IEnumerable<LeadSourceDTO> GetLeadSourceById(UserInfo MyUserInfo,int LeadSourceId)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadSourceById(MyUserInfo,LeadSourceId);
        }


        //public ResultReponse GenerateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo)
        //{
        //    LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
        //    return m_LeadsRepository.GenerateLead(MyLeadInfo);
        //}

        public ResultReponse UpdateLead(LeadsDTO MyLeadDTO, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.UpdateLead(MyLeadDTO, MyUserInfo);
        }

        public ResultReponse DeleteLead(int Id, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.DeleteLead(Id);
        }

        public IEnumerable<LeadsDTO> GetLeadsByRatingId(int RatingId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByRatingId(RatingId);
        }

        public IEnumerable<LeadsDTO> GetLeadsByindsId(int indsId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByindsId(indsId);
        }

        public IEnumerable<LeadsDTO> GetLeadsByCurId(int CurId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByCurId(CurId);
        }

        public IEnumerable<LeadsDTO> GetLeadsByPriceListId(int PriceListId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByPriceListId(PriceListId);
        }
        public IEnumerable<LeadsDTO> GetLeadsByUserId(int UserId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByUserId(UserId);
        }
        public IEnumerable<LeadsDTO> GetLeadsByOwnerId(int OwnerId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByOwnerId(OwnerId);
        }

        public IEnumerable<LeadsDTO> GetLeadsBySourceId(int SourceId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsBySourceId(SourceId);
        }
        public IEnumerable<LeadsDTO> GetLeadsByStatus(int Status, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByStatus(Status);
        }

        public IEnumerable<LeadsDTO> GetLeadsByStatId(int StatId, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadsByStatId(StatId);
        }
        public IEnumerable<JobQueueDTO> GetJobQueueList(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetJobQueueList(MyUserInfo);
        }


        public LeadStatusRetults GetLeadStatus(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadStatus(MyUserInfo);
        }

        public IEnumerable<LeadStatusDomainItem> GetLeadStatusDomainItem(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadStatusDomainItem(MyUserInfo);
        }

        public int UpdateContactGroupsOfLead(ContactGroups contactGroups,UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.UpdateContactGroupsOfLead(contactGroups,MyUserInfo);
        }

        public int UpdateContactGroupsOfContact(ContactGroups contactGroups, UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.UpdateContactGroupsOfContact(contactGroups, MyUserInfo);
        }

        public IEnumerable<LeadRatingDomainItem> GetLeadRatingDomainItems(UserInfo MyUserInfo)
        {
            LeadsRepository m_LeadsRepository = new LeadsRepository(MyUserInfo);
            return m_LeadsRepository.GetLeadRatingDomainItems( MyUserInfo);
        }
    }
}
