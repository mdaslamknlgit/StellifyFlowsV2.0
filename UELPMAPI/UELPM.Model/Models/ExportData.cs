using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DocumentExportData
    {
        public List<InvoiceSection> Invoices { get; set; }
        public List<InvoiceDetailsSection> InvoiceDetails { get; set; }
        public List<InvoicePaymentScheduleSection> InvoicePaymentScheduleSections { get; set; }
        public List<InvoiceOptinalFieldsSection> InvoiceOptinalFieldsSections { get; set; }
        public List<InvoiceDetailsOptinalFieldsSection> InvoiceDetailsOptinalFieldsSections  { get; set; }
        public DocumentExportData()
        {
            Invoices = new List<InvoiceSection>();
            InvoiceDetails = new List<InvoiceDetailsSection>();
            InvoicePaymentScheduleSections = new List<InvoicePaymentScheduleSection>();
            InvoiceOptinalFieldsSections = new List<InvoiceOptinalFieldsSection>();
            InvoiceDetailsOptinalFieldsSections = new List<InvoiceDetailsOptinalFieldsSection>();
        }
    }

    public class InvoiceSection
    {
        public string CNTBTCH { get; set; }
        public string CNTITEM { get; set; }
        public string IDVEND { get; set; }
        public string IDINVC { get; set; }
        public string TEXTTRX { get; set; }
        public string ORDRNBR { get; set; }
        public string PONBR { get; set; }
        public string INVCDESC { get; set; }
        public string INVCAPPLTO { get; set; }
        public string IDACCTSET { get; set; }
        public string DATEINVC { get; set; }
        public string FISCYR { get; set; }
        public string FISCPER { get; set; }
        public string CODECURN { get; set; }
        public string EXCHRATE { get; set; }
        public string TERMCODE { get; set; }
        public string DATEDUE { get; set; }
        public string CODETAXGRP { get; set; }
        public string TAXCLASS1 { get; set; }
        public string BASETAX1 { get; set; }
        public string AMTTAX1 { get; set; }
        public string AMTTAXDIST { get; set; }
        public string AMTINVCTOT { get; set; }
        public string AMTTOTDIST { get; set; }
        public string AMTGROSDST { get; set; }
        public string AMTDUE { get; set; }
        public string AMTTAXTOT { get; set; }
        public string AMTGROSTOT { get; set; }
    }
    public class InvoiceDetailsSection
    {
        public string CNTBTCH { get; set; }
        public string CNTITEM { get; set; }
        public string CNTLINE { get; set; }
        public string IDDIST { get; set; }
        public string TEXTDESC { get; set; }
        public string AMTTOTTAX { get; set; }
        public string BASETAX1 { get; set; }
        public string TAXCLASS1 { get; set; }
        public string RATETAX1 { get; set; }
        public string AMTTAX1 { get; set; }
        public string IDGLACCT { get; set; }
        public string AMTDIST { get; set; }
        public string COMMENT { get; set; }
        public string SWIBT { get; set; }
    }
    public class InvoicePaymentScheduleSection
    {
        public string CNTBTCH { get; set; }
        public string CNTITEM { get; set; }
        public string CNTPAYM { get; set; }
        public string DATEDUE { get; set; }
        public string AMTDUE { get; set; }
    }
    public class InvoiceOptinalFieldsSection
    {
        public string CNTBTCH { get; set; }
        public string CNTITEM { get; set; }
        public string OPTFIELD { get; set; }
        public string VALUE { get; set; }
        public string TYPE { get; set; }
        public string LENGTH { get; set; }
        public string DECIMALS { get; set; }
        public string ALLOWNULL { get; set; }
        public string VALIDATE { get; set; }
        public string VALINDEX { get; set; }
        public string VALIFTEXT { get; set; }
        public string VALIFMONEY { get; set; }
        public string VALIFNUM { get; set; }
        public string VALIFLONG { get; set; }
        public string VALIFBOOL { get; set; }
        public string VALIFDATE { get; set; }
        public string VALIFTIME { get; set; }
        public string FDESC { get; set; }
        public string VDESC { get; set; }
    }
    public class InvoiceDetailsOptinalFieldsSection
    {
        public string CNTBTCH { get; set; }
        public string CNTITEM { get; set; }
        public string CNTLINE { get; set; }
        public string OPTFIELD { get; set; }
        public string VALUE { get; set; }
        public string TYPE { get; set; }
        public string LENGTH { get; set; }
        public string DECIMALS { get; set; }
        public string ALLOWNULL { get; set; }
        public string VALIDATE { get; set; }
        public string VALINDEX { get; set; }
        public string VALIFTEXT { get; set; }
        public string VALIFMONEY { get; set; }
        public string VALIFNUM { get; set; }
        public string VALIFLONG { get; set; }
        public string VALIFBOOL { get; set; }
        public string VALIFDATE { get; set; }
        public string VALIFTIME { get; set; }
        public string FDESC { get; set; }
        public string VDESC { get; set; }
    }
}
