using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ProductsDTO
    {
        public int ProductID { get; set; }

        public string ProductCode { get; set; }

        public string ProductSerialNo { get; set; }

        public string ProductName { get; set; }

        public int? ProductFamilyId { get; set; }

        public string ProductDescription { get; set; }

        public bool? ProductIsActive { get; set; }

        public int? CategoryID { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }

    public class ProductsDomainItem
    {
        public int ProductID { get; set; }

        public string ProductName { get; set; }
    }

    public class SearchProducts
    {
        public int ProductID { get; set; }

        public string ProductCode { get; set; }

        public string ProductSerialNo { get; set; }

        public string ProductName { get; set; }

        public int? ProductFamilyId { get; set; }

        public string ProductDescription { get; set; }

        public bool ProductIsActive { get; set; }

        public int? CategoryID { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int CreatedBy { get; set; }

        public int UserId { get; set; }

        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }

    public class ProductsListResult
    {
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public IEnumerable<ProductsDTO> ProductsList { get; set; }

        public string Query { get; set; }
    }








}
