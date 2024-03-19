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
    public class DealsManager : IDealsManager
    {

        DealsResult IDealsManager.SearchDeals(int ModuleId, int FormId, int ViewId, DealsSearch dealsSearch, UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.SearchDeals(ModuleId, FormId, ViewId, dealsSearch, MyUserInfo);
        }

        public DealDTO GetDealById(int DealId, UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealById(DealId, MyUserInfo);
        }
        public ResultReponse CreateDeal(DealForm dealForm , UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.CreateDeal(dealForm, MyUserInfo);
        }

        public ResultReponse UpdateDeal(DealForm dealForm , UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.UpdateDeal(dealForm, MyUserInfo);
        }

        public IEnumerable<DealTypeDomainItem> GetDealTypeDomainItem(UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealTypeDomainItem( MyUserInfo);
        }

        public IEnumerable<DealStagesDTO> GetDealStage(UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealStage(MyUserInfo);
        }

        public IEnumerable<ContactsAccountDetailsDTO> GetContactsByAccountId(int AccountId, UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetContactsByAccountId (AccountId, MyUserInfo);
        }

        public ResultReponse CreateQuickAccount(QuickAccount quickAccount , UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.CreateQuickAccount(quickAccount, MyUserInfo);
        }

        public ResultReponse CreateQuickContact(QuickContact quickContact , UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.CreateQuickContact(quickContact, MyUserInfo);
        }

        public ResultReponse CloseDeal(DealCloseForm dealCloseForm, UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.CloseDeal(dealCloseForm, MyUserInfo);
        }


        public IEnumerable<DealReasonForLossDTO> GetDealResonForLossDomainItems(UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealResonForLossDomainItems(MyUserInfo);
        }

        public IEnumerable<DealReasonForLossDTO> GetDealResonForLossList(UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealResonForLossList(MyUserInfo);
        }

        public DealReasonForLossDTO GetDealResonForLosById(int DealReasonId, UserInfo MyUserInfo)
        {
            DealsRepository m_DealsRepository = new DealsRepository(MyUserInfo);
            return m_DealsRepository.GetDealResonForLosById(DealReasonId,MyUserInfo);
        }



    }
}
