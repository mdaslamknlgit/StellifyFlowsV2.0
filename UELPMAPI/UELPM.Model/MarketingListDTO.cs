using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class MarketingListDTO
    {
        public int Id { get; set; }
        public string ListName { get; set; }
        public string ListDesc { get; set; }
        
        public int CompanyId { get; set; }
        public int UserId { get; set; }

        public int UpdatedBy { get; set; }
        public bool IsActive { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

        public DateTime UpdatedDate { get; set; }
        public int EmailCount { get; set; }
        //public List<EmailDTO> Emails { get; set; }

        public ICollection<EmailDTO> EmailLists { get; set; }
    }

public class ListSearch
    {
        public string ListName { get; set; }
        public string ListDesc { get; set; }

        public int ListTypeId { get; set; }
        public int UserId { get; set; }

        public int CompanyId { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }
    }

    public class ListResult
    {
        public List<MarketingListDTO> Lists { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }


    public class ConnectionsDisplayResult
    {
        public List<MarketingListDTO> ConnectionsList { get; set; }
        public int TotalRecords { get; set; }
    }






}
