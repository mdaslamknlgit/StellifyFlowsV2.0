﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Model
{
    public class AccountsDTO
    {
        public int Id { get; set; }

        public string AcctNo { get; set; }

        public string AccountName { get; set; }

        public int? LeadId { get; set; }

        public string LeadNo { get; set; }

        public int? ContactId { get; set; }

        public int? RelId { get; set; }

        public int? CurId { get; set; }

        public string BusPhone { get; set; }
        public string MainPhone { get; set; }

        public string OtherPhone { get; set; }

        public string Mobile { get; set; }

        public string EmailId { get; set; }

        public string WebSite { get; set; }
        public int? TerId { get; set; }

        public int? AcctCatId { get; set; }

        public int? IndsId { get; set; }

        public decimal? AnnualRevenue { get; set; }

        public decimal? EstBudget { get; set; }
        public bool? IsActive { get; set; }

        public int? NoOfEmployees { get; set; }

        public string SicCode { get; set; }

        public string TickerSymbol { get; set; }

        public int? OwnUserId { get; set; }

        public decimal? CreditLimit { get; set; }

        public int? PayTermId { get; set; }

        public int? PriceListId { get; set; }

        public bool? CreditHold { get; set; }

        public string AcctDesc { get; set; }

        public int? CampaignId { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public string Website { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int UserId { get; set; }

    }

    public class AccountsDomainItem
    {
        public int AccountId { get; set; }
        public string AccountName { get; set; }

 
    }

    public class AccountsDomainList
    {
        public int AccountId { get; set; }
        public string AccountName { get; set; }
        public List<ContactsDomainItem> Contatcs { get; set; }
    }

    public class ContactsDomainItem
    {
        public int AccountId { get; set; }
        public int ContactId { get; set; }
        public string ContactName { get; set; }
    }
    public class SearchAccounts
    {
        public string AcctNo { get; set; }

        public string AccountName { get; set; }

        public string MainPhone { get; set; }

        public string OtherPhone { get; set; }

        public string Mobile { get; set; }

        public string EmailId { get; set; }

        public int CreatedBy { get; set; }

        public int UserId { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int ViewId { get; set; }
    }
    public class AccountsResult
    {
        public List<AccountsDTO> Accounts { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

    public class QuickAccount
    {
        public int AccountId { get; set; }

        public string AccountName { get; set; }

        public string MainPhone { get; set; }

        public string Website { get; set; }

        public int CreatedBy { get; set; }
    }




}
