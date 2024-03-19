using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.tool.xml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Util.Templates.PurchaseOrder
{
    public class PurchaseOrderTemplate
    {

        public static string PurchaseOrderCreationTemplate(UELPM.Model.Models.PurchaseOrder purchaseOrderObj)
        {

            StringBuilder stringBuilderObj = new StringBuilder();

            string supplierType = purchaseOrderObj.Supplier.SupplierTypeID == 1 ? "UEL Supplier" : "External Supplier";
            string isGstRequired = purchaseOrderObj.IsGstRequired == true ? "Yes" : "No";

            stringBuilderObj.Append("<div style='width:100%'><table style='width:100%'>");
            stringBuilderObj.Append("<tr><td class='label'>Requestor:</td><td>"+purchaseOrderObj.RequestedByUserName+ "</td><td></td><td class='label'>Designation:</td><td>" + purchaseOrderObj.RequestedByUserName+"</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Date:</td><td>" + purchaseOrderObj.CreatedDate + "</td><td></td><td class='label'>PO Number:</td><td>" + purchaseOrderObj.PurchaseOrderCode + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Type:</td><td>" + supplierType + "</td><td></td><td class='label'>Cost Of Service:</td><td>" + purchaseOrderObj.CostOfService + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>PO Type:</td><td>" + purchaseOrderObj.PurchaseOrderType + "</td><td></td><td class='label'>Department:</td><td>" + purchaseOrderObj.Location + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier:</td><td>" + purchaseOrderObj.Supplier.SupplierName + "</td><td></td><td class='label'>Expected Delivery:</td><td>" + purchaseOrderObj.ExpectedDeliveryDate + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Address:</td><td>" + purchaseOrderObj.Supplier.BillingAddress1 + "</td><td></td><td class='label'>GST Required:</td><td>" + isGstRequired + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Delivery Address:</td><td>" + purchaseOrderObj.DeliveryAddress + "</td><td></td><td class='label'>Vendor Reference:</td><td>" + purchaseOrderObj.VendorReferences + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Fax:</td><td>" + purchaseOrderObj.Supplier.BillingFax + "</td><td></td><td class='label'>Currency Type:</td><td>" + purchaseOrderObj.CurrencyCode + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>No.of Entries :</td><td>" + purchaseOrderObj.PurchaseOrderItems.Count + "</td><td></td><td class='label'>Status:</td><td>" + purchaseOrderObj.PurchaseOrderStatusText + "</td></tr>");
            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='margin-top:2%'><table class='purchaseOrderItems'>");
            stringBuilderObj.Append("<thead><th  style='width:5%;'>S.No</th><th style='width:15 %;'>Item</th><th style='width:25%;'>Description</th><th style='width:7%;'>UOM</th><th style='width:10%;'>Qty</th><th style='width:10%;'>Price (" + purchaseOrderObj.CurrencySymbol+ ")</th><th style='width:10%;'>Total (" + purchaseOrderObj.CurrencySymbol + ")</th></thead>");

            for (var i = 0; i < purchaseOrderObj.PurchaseOrderItems.Count; i++)
            {
                stringBuilderObj.Append("<tr>" +
                                        "<td  style='width:5%;'>" + (i+1)+"</td>" +
                                        "<td style='width:15%;'>" + purchaseOrderObj.PurchaseOrderItems[i].Item.ItemName+"</td>" +
                                        "<td style='width:25%;'>" + purchaseOrderObj.PurchaseOrderItems[i].Item.Description + "</td>" +
                                        "<td style='width:7%;'>" + purchaseOrderObj.PurchaseOrderItems[i].MeasurementUnitCode + "</td>" +
                                        "<td style='width:10%;' align='right'>" + purchaseOrderObj.PurchaseOrderItems[i].ItemQty + "</td>" +
                                        "<td style='width:10%;' align='right'>" + purchaseOrderObj.PurchaseOrderItems[i].Unitprice + "</td>" +
                                        "<td style='width:10%;' align='right'>" + (purchaseOrderObj.PurchaseOrderItems[i].Unitprice * purchaseOrderObj.PurchaseOrderItems[i].ItemQty) + "</td>" +
                                        "</tr>");
            }

            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='width:100%;margin-top:2%'>");
            stringBuilderObj.Append("<div style='float:left;width:70%'>");
            stringBuilderObj.Append("<div><h4> Payment Terms</h4></div>");
            stringBuilderObj.Append("<div>"+purchaseOrderObj.PaymentTerms+"</div>");
            stringBuilderObj.Append("<div><h4>Instructions to vendor</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderObj.Instructions + "</div>");
            stringBuilderObj.Append("<div><h4>Justifications</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderObj.Justifications + "</div>");
            stringBuilderObj.Append("<div><h4>Delivery Terms</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderObj.DeliveryTerm + "</div>");
            stringBuilderObj.Append("</div>");

            stringBuilderObj.Append("<div style='float:left;width:30%;'>" +
                                    "<table style='width:100%;'>" +
                                        "<tr><td style='width:60%;' class='label'>Sub Total</td><td style='width:5%;'></td><td style='width:35%;'>" + purchaseOrderObj.SubTotal+"</td></tr>" +
                                        "<tr><td class='label'>Discount</td><td></td><td>" + purchaseOrderObj.Discount + "</td></tr>" +
                                        "<tr><td class='label'>Tax Rate (%)</td><td></td><td>" + purchaseOrderObj.TaxRate + "</td></tr>" +
                                        "<tr><td class='label'>Total Tax</td><td></td><td>" + purchaseOrderObj.TotalTax + "</td></tr>" +
                                        "<tr><td class='label'>Shipping Charges</td><td></td><td>" + purchaseOrderObj.ShippingCharges + "</td></tr>" +
                                        "<tr><td class='label'>Others</td><td></td><td>" + purchaseOrderObj.OtherCharges + "</td></tr>" +
                                        "<tr><td class='label'>Total</td><td></td><td>" + purchaseOrderObj.TotalAmount + "</td></tr>" +
                                    "</table>" +
                                    "</div>");

            stringBuilderObj.Append("</div>");

            stringBuilderObj.Append(" <style> .label{ font-weight:bold; }   table.purchaseOrderItems,table.purchaseOrderItems td,table.purchaseOrderItems th{ border: 1px solid black;} </style>");


            return stringBuilderObj.ToString();
        }
    }
}
