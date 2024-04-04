using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class OpportunityManager : IOpportunityManager
    {
        public OpportunityResult SearchOpportunity(UserInfo MyUserInfo, SearchOpportunity searchOpportunity)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.SearchOpportunity( MyUserInfo, searchOpportunity);
        }

        public IEnumerable<OpportunityDTO> GetOpportunityList(int TypeId, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.GetOpportunityList(TypeId, MyUserInfo);
        }
        public OpportunityDTO GetOpportunityDetails(UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.GetOpportunityDetails( MyUserInfo);
        }

        public OpportunityDTO GetOpportunityInfo(int Id, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.GetOpportunityInfo(Id,MyUserInfo);
        }

        public ResultReponse CreateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.CreateOpportunity(Opportunity, MyUserInfo);
        }

        public ResultReponse UpdateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.UpdateOpportunity(Opportunity, MyUserInfo);
        }

        public ResultReponse DeleteOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.DeleteOpportunity(Opportunity, MyUserInfo);
        }

        public ResultReponse CloseOpportunity(CloseOpp closeOpp, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.CloseOpportunity(closeOpp, MyUserInfo);
        }

        public IEnumerable<ProbabilityDomainItem> GetProbabilityDomainItem(UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.GetProbabilityDomainItem(MyUserInfo);
        }


        public OpportunityProductResults AddOpportunityProducts(OpportunityProductsInput opportunityProductsInput, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.AddOpportunityProducts(opportunityProductsInput, MyUserInfo);

        }

        public OpportunityProductsDetailsList GetOpportunityProductsDetailsList(int OpportunityId, UserInfo MyUserInfo)
        {
            OpportunityRepository m_OpportunityRepository = new OpportunityRepository(MyUserInfo);
            return m_OpportunityRepository.GetOpportunityProductsDetailsList(OpportunityId, MyUserInfo);
        }

    }
}
