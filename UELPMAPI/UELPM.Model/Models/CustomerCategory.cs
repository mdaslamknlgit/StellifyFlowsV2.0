using System;

namespace UELPM.Model.Models
{
    public class CustomerCategory
    {
        public int CustomerCategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public bool? isDeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
