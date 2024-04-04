namespace UELPM.Model.Models
{
    public class SupplierContactPerson
    {
      public int ContactPersonId { get; set; }
	  public string Name { get; set; }
	  public string ContactNumber { get; set; }
	  public string EmailId { get; set; }
      public string Saluation { get; set; }
      public string Surname { get; set; }
      public string Department { get; set; }
      public int CompanyId { get; set; }
        public bool IsModified { get; set; }
    }
}
