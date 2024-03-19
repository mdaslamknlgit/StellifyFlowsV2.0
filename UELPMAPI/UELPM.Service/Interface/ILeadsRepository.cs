using UELPM.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ILeadsRepository
    {
        LeadsInfoList GetLeadsGroupByStages(UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeads(UserInfo MyUserInfo);
        LeadsResult GetLeadsByPagination(int skip, int take, UserInfo MyUserInfo);
        LeadsResult SearchLeads(UserInfo MyUserInfo,LeadsSearch leadsSearchInput);

        LeadsResult SearchLeads(int ModuleId, int FormId, int ViewId, LeadsSearch leadsSearchInput, UserInfo MyUserInfo);

        IEnumerable<LeadNames> SearchLeadNames(UserInfo MyUserInfo, LeadsSearch leadsSearchInput);
        LeadsDTO GetLeadsById(int id);

        LeadInfo GetLeadById(int id);
        ResultReponse ConvertToLead(List<EmailDTO> MyEmailList, UserInfo MyUserInfo);
        ResultReponse AddToQueue(List<EmailDTO> MyEmailList, UserInfo MyUserInfo);
        ResultReponse CreateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo);
        ResultReponse ChangeLeadStatus(List<LeadsDTO> MyLeadList, UserInfo MyUserInfo);

        LeadQualifyRequest GetLeadInfoToConvert(LeadQualifyRequest leadQualifyRequest, UserInfo MyUserInfo);

        IEnumerable<LeadSourceDTO> GetLeadSource(UserInfo MyUserInfo);

        IEnumerable<SalutationDTO> GetSalutation(UserInfo MyUserInfo);
        IEnumerable<LeadSourceDTO> GetLeadSourceById(UserInfo MyUserInfo,int LeadSourceId);
        // ResultReponse GenerateLead(LeadsDTO MyLeadInfo);
        ResultReponse UpdateLead(LeadsDTO MyleadsDTO, UserInfo MyUserInfo);
        ResultReponse DeleteLead(int Id);

        IEnumerable<LeadsDTO> GetLeadsByRatingId(int RatingId);
        IEnumerable<LeadsDTO> GetLeadsByindsId(int indsId);
        IEnumerable<LeadsDTO> GetLeadsByCurId(int CurId);
        IEnumerable<LeadsDTO> GetLeadsByPriceListId(int PriceListId);
        IEnumerable<LeadsDTO> GetLeadsByUserId(int UserId);
        IEnumerable<LeadsDTO> GetLeadsByOwnerId(int OwnerId);
        IEnumerable<LeadsDTO> GetLeadsBySourceId(int SourceId);
        IEnumerable<LeadsDTO> GetLeadsByStatus(int Status);
        IEnumerable<LeadsDTO> GetLeadsByStatId(int StatId);
        IEnumerable<JobQueueDTO> GetJobQueueList(UserInfo MyUserInfo);
        ResultReponse UpdateQueue(List<JobQueueDTO> MyQueueList, UserInfo MyUserInfo);

        LeadStatusRetults GetLeadStatus(UserInfo MyUserInfo);

        IEnumerable<LeadStatusDomainItem> GetLeadStatusDomainItem(UserInfo MyUserInfo);

        int UpdateContactGroupsOfLead(ContactGroups contactGroups, UserInfo MyUserInfo);

        int UpdateContactGroupsOfContact(ContactGroups contactGroups, UserInfo MyUserInfo);

        IEnumerable<LeadRatingDomainItem> GetLeadRatingDomainItems(UserInfo MyUserInfo);



    }
}
