using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class ContactsManager : IContactsManager
    {
        public ResultReponse CreateContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.CreateContact(contactDTO, MyUserInfo);
        }

        public int UpdateContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.UpdateContact(contactDTO, MyUserInfo);
        }

        public ResultReponse DeleteContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.DeleteContact(contactDTO, MyUserInfo);
        }

        public ContactDTO GetContactAccountById(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ContactDTO GetContactDetailById(int Id, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetContactDetailById(Id,MyUserInfo);
        }

        public ContactInfo GetContactByContactId(int Id, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetContactByContactId(Id, MyUserInfo);
        }

        public ContactsResults GetContactList(UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetContactList(MyUserInfo);
        }

        public IEnumerable<ContactDTO> GetPrimaryContactListById(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ContactsResults SearchContact(UserInfo MyUserInfo, ContactSearch contactSearch)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.SearchContact(MyUserInfo, contactSearch);
        }

        public IEnumerable<MaritalStatus> GetMaritalStatus(UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetMaritalStatus( MyUserInfo);
        }

        public MaritalStatus GetMaritalStatusById(int Id, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetMaritalStatusById(Id,MyUserInfo);
        }

        public ContactsResults GetContactsByAccountId(int AccountId, UserInfo MyUserInfo)
        {
            ContactsRepository contactsRepository = new ContactsRepository(MyUserInfo);
            return contactsRepository.GetContactsByAccountId(AccountId, MyUserInfo);
        }



    }
}
