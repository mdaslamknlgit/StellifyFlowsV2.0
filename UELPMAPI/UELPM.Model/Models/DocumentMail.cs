using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DocumentMailData
    {
        public int DocumentId { get; set; }
        public int DocumentMasterId { get; set; }
        public string DocumentStatus { get; set; }
        public string DocumentCode { get; set; }
        public string DocumentSubjectCode { get; set; }
        public string DocumentMasterCode { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public UserProfile Receiver { get; set; }
        public UserProfile Sender { get; set; }
        public Suppliers Supplier { get; set; }
        public string CompanyShortName { get; set; }
        public string DocumentValue { get; set; }
        public string MailTemplatepath { get; set; }
        public string Clarification { get; set; }
        public string MailLink { get; set; }
        public string MailTitle { get; set; }
        public string AmountHeaderText { get; set; }
        public string DocumentCurrencySymbol { get; set; }
        public List<LineItem> ItemDetails { get; set; }
        public string InvoiceCode { get; set; }
        public string ChatRemarks { get; set; }
        public int WFStatusId { get; set; }
        public string Header1 { get; set; }
        public string Header2 { get; set; }
        public string LinkCssClass { get; set; }
        public string CustomerName { get; set; }
        public string CustomerType { get; set; }
        public string CustomerShortName { get; set; }
        public string Subject { get; set; }
        public string CreditTerm { get; set; }

        public DocumentMailData()
        {
            ItemDetails = new List<LineItem>();
        }
    }

    public class MailData
    {
        public int DocumentId { get; set; }
        public int ProcessId { get; set; }
        public int Sender { get; set; }
        public int Receiver { get; set; }
        public int CompanyId { get; set; }
        public string ChatRemarks { get; set; }
    }

    public class MailInfo
    {
        public string From { get; set; }
        public string FromDisplayName { get; set; }
        public List<string> To { get; set; }
        public string ToMailName { get; set; }
        public List<string> CC { get; set; }
        public List<string> BCC { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public List<Attachment> Attachments { get; set; }
        public bool AppendDontReplyText { get; set; } = true;
    }
}
