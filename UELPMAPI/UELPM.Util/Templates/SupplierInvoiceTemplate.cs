using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Util.Templates
{
    public class SupplierInvoiceTemplate
    {
        public static string SupplierInvoice(UELPM.Model.Models.Invoice invoiceObj)
        {

            StringBuilder stringBuilderObj = new StringBuilder();

            string supplierType = invoiceObj.Supplier.SupplierTypeID == 1 ? "UEL Supplier" : "External Supplier";
            string isGstRequired = invoiceObj.IsGstRequired == true ? "Yes" : "No";

            stringBuilderObj.Append("<div style='width:100%'><table style='width:100%'>");
            stringBuilderObj.Append("<tr><td class='label'>Requestor:</td><td>" + invoiceObj.RequestedByUserName + "</td><td></td><td class='label'>Designation:</td><td>" + invoiceObj.RequestedByUserName + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Invoice Number:</td><td>" + invoiceObj.InvoiceCode + "</td><td></td><td class='label'>Date:</td><td>"+invoiceObj.CreatedDate+"</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>PO Number:</td><td>" + invoiceObj.PurchaseOrderCode + "</td><td></td><td class='label'>PO Type:</td><td>"+invoiceObj.PurchaseOrderType+"</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Type:</td><td>" + supplierType + "</td><td></td><td class='label'>Department:</td><td>" + invoiceObj.Location + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier:</td><td>" + invoiceObj.Supplier.SupplierName + "</td><td></td><td class='label'>Currency Type:</td><td>" + invoiceObj.CurrencyCode + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Address:</td><td>" + invoiceObj.Supplier.BillingAddress1 + "</td><td></td><td class='label'>Status:</td><td>" + invoiceObj.InvoiceStatus + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Delivery Address:</td><td>" + invoiceObj.DeliveryAddress + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Fax:</td><td>" + invoiceObj.Supplier.BillingFax + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>No.of Entries :</td><td>" + invoiceObj.InvoiceItems.Count + "</td></tr>");
            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='margin-top:2%'><table class='InvoiceItems'>");
            stringBuilderObj.Append("<thead><th  style='width:5%;'>S.No</th><th style='width:45%;'>Description</th><th style='width:15%;'>Qty</th><th style='width:15%;'>Price (" + invoiceObj.CurrencySymbol + ")</th><th style='width:15%;'>Total (" + invoiceObj.CurrencySymbol + ")</th></thead>");

            for (var i = 0; i < invoiceObj.InvoiceItems.Count; i++)
            {
                stringBuilderObj.Append("<tr>" +
                                        "<td  style='width:5%;'>" + (i + 1) + "</td>" +
                                        "<td style='width:45%;'>" + invoiceObj.InvoiceItems[i].ItemDescription + "</td>" +
                                        "<td style='width:15%;' align='right'>" + Math.Round(invoiceObj.InvoiceItems[i].ItemQty,2) + "</td>" +
                                        "<td style='width:15%;' align='right'>" + Math.Round(invoiceObj.InvoiceItems[i].Unitprice,2) + "</td>" +
                                        "<td style='width:15%;' align='right'>" + Math.Round((invoiceObj.InvoiceItems[i].Unitprice * invoiceObj.InvoiceItems[i].ItemQty),2) + "</td>" +
                                        "</tr>");
            }

            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='width:100%;margin-top:2%'>");
            stringBuilderObj.Append("<div style='float:left;width:70%'>");
            stringBuilderObj.Append("<div><h4> Payment Terms</h4></div>");
            stringBuilderObj.Append("<div>" + invoiceObj.PaymentTerms + "</div>");
            stringBuilderObj.Append("</div>");

            stringBuilderObj.Append("<div style='float:left;width:30%;'>" +
                                    "<table style='width:100%;'>" +
                                        "<tr><td style='width:60%;' class='label'>Sub Total</td><td style='width:5%;'></td><td style='width:35%;'>" + Math.Round(invoiceObj.SubTotal,2) + "</td></tr>" +
                                        "<tr><td class='label'>Discount</td><td></td><td>" + Math.Round(invoiceObj.Discount,2) + "</td></tr>" +
                                        "<tr><td class='label'>Tax Rate (%)</td><td></td><td>" + Math.Round(invoiceObj.TaxRate,2) + "</td></tr>" +
                                        "<tr><td class='label'>Total Tax</td><td></td><td>" + Math.Round(invoiceObj.TotalTax,2) + "</td></tr>" +
                                        "<tr><td class='label'>Shipping Charges</td><td></td><td>" + Math.Round(invoiceObj.ShippingCharges,2) + "</td></tr>" +
                                        "<tr><td class='label'>Others</td><td></td><td>" + Math.Round(invoiceObj.OtherCharges,2) + "</td></tr>" +
                                        "<tr><td class='label'>Total</td><td></td><td>" + Math.Round(invoiceObj.TotalAmount,2) + "</td></tr>" +
                                    "</table>" +
                                    "</div>");
            stringBuilderObj.Append("</div>");
            stringBuilderObj.Append(" <style> .label{ font-weight:bold; }   table.InvoiceItems,table.InvoiceItems td,table.InvoiceItems th{ border: 1px solid black;} </style>");
            return stringBuilderObj.ToString();
        }
    }
}
