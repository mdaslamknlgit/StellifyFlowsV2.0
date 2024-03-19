namespace UELPM.Model.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public int? ItemMasterId { get; set; }
        public string ItemDescription { get; set; }
        public int ItemCategory { get; set; }
        public double ItemPrice { get; set; }
        public bool Status { get; set; }
    }
}
