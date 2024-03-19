using System;

namespace UELPM.Model.Models
{
    public class RequestType
    {
        public int RequestTypeId { get; set; }      
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }      
    }
}
