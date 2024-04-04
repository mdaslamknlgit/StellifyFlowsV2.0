using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ReportParameter
    {
        public REPORTTYPE ReportType { get; set; }
        public ReportParamData FilterOptions { get; set; }
        public int WorkflowStatusId { get; set; }
        public int TypeId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedDateFrom { get; set; }
        public DateTime CreatedDateTo { get; set; }
    }
    public class ReportParam
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
    public class ReportParamData
    {
        public List<ReportParam> Entities { get; set; }
        public List<ReportParam> Departments { get; set; }
        public List<ReportParam> Statuses { get; set; }
        public List<ReportParam> Requesters { get; set; }
        public List<ReportParam> SupplierTypes { get; set; }
    }

    public enum REPORTTYPE
    {
        SUPPLIER,
        PO,
        POITEMS,
        POCMASTER,
        POC,
        APINVOICE,
        APCREDITNOTE,
        COA,
        POPMASTER,
        POPINVOICE,
        ADMINWORKFLOW,
        CASHFLOW
    }
}
