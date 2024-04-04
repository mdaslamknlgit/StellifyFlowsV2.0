using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class NotesDTO
    {
        public int NotesId { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public string Notes { get; set; }

        public int? FromUserID { get; set; }

        public int? ToUserID { get; set; }

        public bool? IsRead { get; set; }

        public DateTime? NotesReadDate { get; set; }

        public bool? NotesStatus { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

    }


    public class NotesRetsults
    {
        public List<NotesDTO> Notes { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

}
