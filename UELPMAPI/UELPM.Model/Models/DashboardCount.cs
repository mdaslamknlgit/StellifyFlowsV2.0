using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DashboardCount
    {
        public int PurchaseOrder { get; set; }
        public int ExpensesPurchaseOrder { get; set; }
        public int FixedAssetPurchaseOrder { get; set; }
        public int ContractPurchaseOrder { get; set; }
        public int GoodsReceivedNote { get; set; }
        public int Invoice { get; set; }
    }
}
