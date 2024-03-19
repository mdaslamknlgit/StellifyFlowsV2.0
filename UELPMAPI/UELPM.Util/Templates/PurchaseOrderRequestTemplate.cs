using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Util.Templates
{
    public class PurchaseOrderRequestTemplate
    {
        public static string PurchaseOrderRequestCreationTemplate(UELPM.Model.Models.PurchaseOrderRequest purchaseOrderRequestObj)
        {

            StringBuilder stringBuilderObj = new StringBuilder();

            string supplierType = purchaseOrderRequestObj.Supplier.SupplierTypeID == 1 ? "UEL Supplier" : "External Supplier";
            string isGstRequired = purchaseOrderRequestObj.IsGstRequired == true ? "Yes" : "No";

            stringBuilderObj.Append("<div style='width:100%'><table style='width:100%'>");
            stringBuilderObj.Append("<tr><td class='label'>Requestor:</td><td>" + purchaseOrderRequestObj.RequestedByUserName + "</td><td></td><td class='label'>Designation:</td><td>" + purchaseOrderRequestObj.RequestedByUserName + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Date:</td><td>" + purchaseOrderRequestObj.CreatedDate + "</td><td></td><td class='label'>PO Number:</td><td>" + purchaseOrderRequestObj.PurchaseOrderRequestCode + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Type:</td><td>" + supplierType + "</td><td></td><td class='label'>Cost Of Service:</td><td>" + purchaseOrderRequestObj.CostOfService + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>PO Type:</td><td>" + purchaseOrderRequestObj.PurchaseOrderType + "</td><td></td><td class='label'>Department:</td><td>" + purchaseOrderRequestObj.Location + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier:</td><td>" + purchaseOrderRequestObj.Supplier.SupplierName + "</td><td></td><td class='label'>Expected Delivery:</td><td>" + purchaseOrderRequestObj.ExpectedDeliveryDate + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Supplier Address:</td><td>" + purchaseOrderRequestObj.Supplier.BillingAddress1 + "</td><td></td><td class='label'>GST Required:</td><td>" + isGstRequired + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Delivery Address:</td><td>" + purchaseOrderRequestObj.DeliveryAddress + "</td><td></td><td class='label'>Vendor Reference:</td><td>" + purchaseOrderRequestObj.VendorReferences + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>Fax:</td><td>" + purchaseOrderRequestObj.Supplier.BillingFax + "</td><td></td><td class='label'>Currency Type:</td><td>" + purchaseOrderRequestObj.CurrencyCode + "</td></tr>");
            stringBuilderObj.Append("<tr><td class='label'>No.of Entries :</td><td>" + purchaseOrderRequestObj.PurchaseOrderRequestItems.Count + "</td><td></td><td class='label'>Status:</td><td>" + purchaseOrderRequestObj.PurchaseOrderStatusText + "</td></tr>");
            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='margin-top:2%'><table class='PurchaseOrderRequestItems'>");
            stringBuilderObj.Append("<thead><th  style='width:5%;'>S.No</th><th style='width:15 %;'>Item</th><th style='width:25%;'>Description</th><th style='width:7%;'>UOM</th><th style='width:10%;'>Qty</th><th style='width:10%;'>Price (" + purchaseOrderRequestObj.CurrencySymbol + ")</th><th style='width:10%;'>Total (" + purchaseOrderRequestObj.CurrencySymbol + ")</th></thead>");

            for (var i = 0; i < purchaseOrderRequestObj.PurchaseOrderRequestItems.Count; i++)
            {
                stringBuilderObj.Append("<tr>" +
                                        "<td  style='width:5%;'>" + (i + 1) + "</td>" +
                                        "<td style='width:15%;'>" + purchaseOrderRequestObj.PurchaseOrderRequestItems[i].Item.ItemName + "</td>" +
                                        "<td style='width:25%;'>" + purchaseOrderRequestObj.PurchaseOrderRequestItems[i].ItemDescription + "</td>" +
                                        "<td style='width:7%;'>" + purchaseOrderRequestObj.PurchaseOrderRequestItems[i].MeasurementUnitCode + "</td>" +
                                        "<td style='width:10%;' align='right'>" + purchaseOrderRequestObj.PurchaseOrderRequestItems[i].ItemQty + "</td>" +
                                        "<td style='width:10%;' align='right'>" + purchaseOrderRequestObj.PurchaseOrderRequestItems[i].Unitprice + "</td>" +
                                        "<td style='width:10%;' align='right'>" + (purchaseOrderRequestObj.PurchaseOrderRequestItems[i].Unitprice * purchaseOrderRequestObj.PurchaseOrderRequestItems[i].ItemQty) + "</td>" +
                                        "</tr>");
            }

            stringBuilderObj.Append("</table></div>");

            stringBuilderObj.Append("<div style='width:100%;margin-top:2%'>");
            stringBuilderObj.Append("<div style='float:left;width:70%'>");
            stringBuilderObj.Append("<div><h4> Payment Terms</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderRequestObj.PaymentTerms + "</div>");
            stringBuilderObj.Append("<div><h4>Instructions to vendor</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderRequestObj.Instructions + "</div>");
            stringBuilderObj.Append("<div><h4>Justifications</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderRequestObj.Justifications + "</div>");
            stringBuilderObj.Append("<div><h4>Delivery Terms</h4></div>");
            stringBuilderObj.Append("<div>" + purchaseOrderRequestObj.DeliveryTerm + "</div>");
            stringBuilderObj.Append("</div>");

            stringBuilderObj.Append("<div style='float:left;width:30%;'>" +
                                    "<table style='width:100%;'>" +
                                        "<tr><td style='width:60%;' class='label'>Sub Total</td><td style='width:5%;'></td><td style='width:35%;'>" + purchaseOrderRequestObj.SubTotal + "</td></tr>" +
                                        "<tr><td class='label'>Discount</td><td></td><td>" + purchaseOrderRequestObj.Discount + "</td></tr>" +
                                        "<tr><td class='label'>Tax Rate (%)</td><td></td><td>" + purchaseOrderRequestObj.TaxRate + "</td></tr>" +
                                        "<tr><td class='label'>Total Tax</td><td></td><td>" + purchaseOrderRequestObj.TotalTax + "</td></tr>" +
                                        "<tr><td class='label'>Shipping Charges</td><td></td><td>" + purchaseOrderRequestObj.ShippingCharges + "</td></tr>" +
                                        "<tr><td class='label'>Others</td><td></td><td>" + purchaseOrderRequestObj.OtherCharges + "</td></tr>" +
                                        "<tr><td class='label'>Total</td><td></td><td>" + purchaseOrderRequestObj.TotalAmount + "</td></tr>" +
                                    "</table>" +
                                    "</div>");

            stringBuilderObj.Append("</div>");

            stringBuilderObj.Append(" <style> .label{ font-weight:bold; }   table.PurchaseOrderRequestItems,table.PurchaseOrderRequestItems td,table.PurchaseOrderRequestItems th{ border: 1px solid black;} </style>");


            return stringBuilderObj.ToString();
        }
    }
}
