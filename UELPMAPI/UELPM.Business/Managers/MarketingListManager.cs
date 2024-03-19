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
    public class MarketingListManager : IMarketingListManager
    {

        public ListResult GetList(UserInfo MyUserInfo)
        {
            MarketingListRepository listRepository  = new MarketingListRepository(MyUserInfo);
            return listRepository.GetList(MyUserInfo);
        }

        public int CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public int CreateListWithEmails(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            MarketingListRepository listRepository = new MarketingListRepository(MyUserInfo);
            return listRepository.CreateListWithEmails(listDTO,MyUserInfo);
        }
        public int UpdateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo)
        {
            MarketingListRepository listRepository = new MarketingListRepository(MyUserInfo);
            return listRepository.UpdateListWithEmails(listbyemail, MyUserInfo);
        }
        public int DeleteList(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public MarketingListDTO GetDefaultListId(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

 

        public MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<MarketingListDTO> GetListWithEmailDetails(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientsType)
        {
            throw new NotImplementedException();
        }

        public int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public int UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }



        public int UpdateListWithNewConnections(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
    }
}
