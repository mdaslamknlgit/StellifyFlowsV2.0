using UELPM.Business.Interface;
using UELPM.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Service.Repositories;
using UELPM.Model.Models;

namespace StellifyCRM.Business.List
{
    public class ConnectionManager : IConnectionManager
    {

        public IEnumerable<MarketingListDTO> GetList(UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetList(MyUserInfo);
        }

        public IEnumerable<MarketingListDTO> GetAllList()
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository();
            return m_ListRepository.GetAllList();
        }
        public ConnectionsDisplayResult GetConnectionWithDetails(UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetConnectionWithDetails(MyUserInfo);
        }

        public ResultReponse CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.CreateList(listDTO,MyUserInfo);
        }

        public ResultReponse UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.UpdateList(listDTO, MyUserInfo);
        }

        public int CreateListWithEmails(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.CreateListWithEmails(listDTO, MyUserInfo);
        }
        public int UpdateListWithNewConnections(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.UpdateListWithNewConnections(listDTO, MyUserInfo);
        }
        public int DeleteList(int Id, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.DeleteList(Id,MyUserInfo);
        }

        public MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetListInfo(Id,MyUserInfo);
        }

        public MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetListDetails(Id, MyUserInfo);
        }

        public int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.MoveToList(EmailIds,listId,MyUserInfo);
        }



        public IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientType)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetRecipients(MyUserInfo, RecipientType);
        }

        public int UpdateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.UpdateListWithEmails(listbyemail,MyUserInfo);
        }

        ConnectionsDisplayResult IConnectionManager.GetListWithEmailDetails(UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetConnectionWithDetails(MyUserInfo);
        }

        ConnectionsDisplayResult IConnectionManager.GetMarketingListWithDetailsByListId(int ListId,UserInfo MyUserInfo)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.GetMarketingListWithDetailsByListId(ListId,MyUserInfo);
        }

        public ListResult SearchConnections(UserInfo MyUserInfo, ListSearch listSearch)
        {
            ConnectionRepository m_ListRepository = new ConnectionRepository(MyUserInfo);
            return m_ListRepository.SearchConnections(MyUserInfo, listSearch);
        }
    }
}
