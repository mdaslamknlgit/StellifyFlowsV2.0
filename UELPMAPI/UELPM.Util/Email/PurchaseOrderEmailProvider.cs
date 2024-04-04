using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class PurchaseOrderEmailProvider
    {
        public static bool SendPurchaseOrderRequestMail(PurchaseOrderRequestMail objPurchaseOrderRequestMail, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(objPurchaseOrderRequestMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject = $"{type}{" : "}{objPurchaseOrderRequestMail.RequestCode} {" details"}";
            subject += PrepareSubject(objPurchaseOrderRequestMail.SupplierName, objPurchaseOrderRequestMail.Department);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderRequestApproval"]) + "?id=" + objPurchaseOrderRequestMail.RequestId + "&cid=" + objPurchaseOrderRequestMail.CompanyId);
            return MailHelper.SendEmail(objPurchaseOrderRequestMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static bool SendPurchaseOrderRecallApprovalMail(PurchaseOrderRequestMail objPurchaseOrderRequestMail, string status)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            var filePathEmail = string.Empty;
            subject = objPurchaseOrderRequestMail.CompanyShortName == "" ? "" : objPurchaseOrderRequestMail.CompanyShortName + " / ";

            if (objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Fixed" || objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Variable")
            {
                subject += "CM : ";
                filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ContractMasterRecallApprovalEmail.txt");
            }
            else
            {
                filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderRecallApprovalEmail.txt");
                subject += "PO : ";
            }
            subject += objPurchaseOrderRequestMail.RequestCode;
            subject += PrepareSubject(objPurchaseOrderRequestMail.Supplier, "Recall");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(objPurchaseOrderRequestMail.RequestCode));
            mailmessage = mailmessage.Replace("$$PurchaseOrderType", objPurchaseOrderRequestMail.PurchaseOrderType);
            mailmessage = mailmessage.Replace("$$Supplier", objPurchaseOrderRequestMail.SupplierName);
            mailmessage = mailmessage.Replace("$$TotalAmount", objPurchaseOrderRequestMail.TotalAmount);
            mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(objPurchaseOrderRequestMail.DeliveryDate.ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$ContractStartDate", Convert.ToString(objPurchaseOrderRequestMail.ContractStartDate.ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$ContractEndDate", Convert.ToString(objPurchaseOrderRequestMail.ContractEndDate.ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestMail.ApproverName);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", objPurchaseOrderRequestMail.DocumentCurrencySymbol);
            mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objPurchaseOrderRequestMail.SenderName));
            if (objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Fixed" || objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Variable")
            {
                mailmessage = mailmessage.Replace("$$MailTitle", "Contract Master Approval Recall");
                mailmessage = mailmessage.Replace("$$MailSubTitle", "Contract Master Approval Recall".ToUpper());
                mailmessage = mailmessage.Replace("$$Title", "Contract Master");
            }
            else
            {
                mailmessage = mailmessage.Replace("$$MailTitle", "Purchase Order Approval Recall");
                mailmessage = mailmessage.Replace("$$MailSubTitle", "Purchase Order Approval Recall".ToUpper());
                mailmessage = mailmessage.Replace("$$Title", "Purchase Order");
            }

            mailmessage = mailmessage.Replace("$$Status", status);


            return MailHelper.SendEmail(objPurchaseOrderRequestMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendPurchaseOrderRequestApprovalMail(PurchaseOrderRequestMail objPurchaseOrderRequestMail, string type, string status, string previousApproverStatus)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string senderMail = string.Empty;
            string docType = (type == "Purchase Order") ? "PO" : "CM";
             mailmessage = PrepareMailBody(objPurchaseOrderRequestMail, status);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());

            senderMail = objPurchaseOrderRequestMail.SenderEmail;
            subject = objPurchaseOrderRequestMail.CompanyShortName == "" ? "" : objPurchaseOrderRequestMail.CompanyShortName + " / ";
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject += $"{docType}{" : "}{objPurchaseOrderRequestMail.RequestCode} ";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject += $"{docType}{" : "}{objPurchaseOrderRequestMail.RequestCode} ";
            }
            else if (status.ToString().Trim().ToLower() == "voided")
            {
                senderMail = objPurchaseOrderRequestMail.ApproverEmail;
                subject += $"{docType}{" : "}{objPurchaseOrderRequestMail.RequestCode} ";
            }
            else
            {
                subject += $"{docType}{" : "}{objPurchaseOrderRequestMail.RequestCode} ";
            }

            subject += PrepareSubject(objPurchaseOrderRequestMail.Supplier, objPurchaseOrderRequestMail.DocumentStatus);
            if (type == "Purchase Order" && (objPurchaseOrderRequestMail.PurchaseOrderType == "Inventory PO" || objPurchaseOrderRequestMail.PurchaseOrderType == "Fixed Asset PO" || objPurchaseOrderRequestMail.PurchaseOrderType == "Expense PO"))
            {
                //mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderReq"]) + "?id=" + objPurchaseOrderRequestMail.RequestId + "&processId=" + objPurchaseOrderRequestMail.ProcessId + "&cId=" + objPurchaseOrderRequestMail.CompanyId);
                mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderReq"]) + "?id=" + objPurchaseOrderRequestMail.RequestId + "&processId=" + objPurchaseOrderRequestMail.ProcessId + "&cid=" + objPurchaseOrderRequestMail.CompanyId);
            }
            else if (type == "Contract Master" && (objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Fixed" || objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Variable"))
            {
                mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ContractPORequest"]) + "&id=" + objPurchaseOrderRequestMail.RequestId + "&cid=" + objPurchaseOrderRequestMail.CompanyId);

            }
            MailHelper.SendEmail(senderMail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendPurchaseOrderRequestClarificationMail(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail, string type)
        {
            string mailmessage = string.Empty;
            mailmessage = PrepareClarificationMailBody(objPurchaseOrderRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$OrderNumber", objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber);

            //MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.RequesterEmail, objPurchaseOrderRequestClarificationMail.ApproverEmail, "", "", "Mail for Purchase Order Request Clarification", mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.RequesterEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", "Mail for Purchase Order Request Clarification", mailmessage, MailPriority.Normal, null);
        }

        public static bool SendPurchaseOrderMail(PurchaseOrderRequestMail objPurchaseOrderRequestMail, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string docType = type == "Contract Master" ? "CM" : "PO";
            mailmessage = PrepareMailBody(objPurchaseOrderRequestMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject = objPurchaseOrderRequestMail.CompanyShortName != "" ? objPurchaseOrderRequestMail.CompanyShortName + " / " : "";
            subject += $"{docType}{" : "}{objPurchaseOrderRequestMail.RequestCode}";
            subject += PrepareSubject(objPurchaseOrderRequestMail.Supplier, objPurchaseOrderRequestMail.DocumentStatus);

            //mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderApproval"]) + "?id=" + objPurchaseOrderRequestMail.RequestId+ "&processId=" + objPurchaseOrderRequestMail.ProcessId+ "&cId=" + objPurchaseOrderRequestMail.CompanyId);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderApproval"]) + "?id=" + objPurchaseOrderRequestMail.RequestId + "&processId=" + objPurchaseOrderRequestMail.ProcessId + "&cid=" + objPurchaseOrderRequestMail.CompanyId);
            return MailHelper.SendEmail(objPurchaseOrderRequestMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendPurchaseOrderClarificationMail(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string docType = (type == "Purchase Order") ? "PO" : "CM";
            subject = objPurchaseOrderRequestClarificationMail.CompanyShortName == "" ? "" : objPurchaseOrderRequestClarificationMail.CompanyShortName + " / ";
            subject += docType + " : " + objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber;
            subject += PrepareSubject(objPurchaseOrderRequestClarificationMail.SupplierShortName, objPurchaseOrderRequestClarificationMail.WorkFlowStatus);
            mailmessage = PrepareClarificationMailBody(objPurchaseOrderRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$OrderNumber", objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());

            //MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.RequesterEmail, objPurchaseOrderRequestClarificationMail.ApproverEmail, "", "", "Mail for Purchase Order Clarification", mailmessage, MailPriority.Normal, null);
            if (objPurchaseOrderRequestClarificationMail.ProcessId == 5 || objPurchaseOrderRequestClarificationMail.ProcessId == 6)
            {
                mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ContractPORequest"]) + "&id=" + objPurchaseOrderRequestClarificationMail.RequestId + "&processId=" + objPurchaseOrderRequestClarificationMail.ProcessId + "&cid=" + objPurchaseOrderRequestClarificationMail.CompanyId);

            }
            else
            {
                mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderReq"]) + "?id=" + objPurchaseOrderRequestClarificationMail.RequestId + "&processId=" + objPurchaseOrderRequestClarificationMail.ProcessId + "&cid=" + objPurchaseOrderRequestClarificationMail.CompanyId);

            }


            MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.RequesterEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendPurchaseOrderRequestReplyMail(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail, string type)
        {
            string mailmessage = string.Empty;
            mailmessage = PrepareReplyMailBody(objPurchaseOrderRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$OrderNumber", objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber);

            //MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.ApproverEmail, objPurchaseOrderRequestClarificationMail.RequesterEmail, "", "", "Reply Mail for Purchase Order Request Clarification", mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", "Reply Mail for Purchase Order Request Clarification", mailmessage, MailPriority.Normal, null);
        }

        public static void SendPurchaseOrderReplyMail(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string docType = (type == "Purchase Order") ? "PO" : "CM";
            subject = objPurchaseOrderRequestClarificationMail.CompanyShortName == "" ? "" : objPurchaseOrderRequestClarificationMail.CompanyShortName + " / ";
            subject += docType + " : " + objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber;
            subject += PrepareSubject(objPurchaseOrderRequestClarificationMail.SupplierShortName, "Reply for clarifications");
            mailmessage = PrepareReplyMailBody(objPurchaseOrderRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$OrderNumber", objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber);

            //MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.ApproverEmail, objPurchaseOrderRequestClarificationMail.RequesterEmail, "", "", "Reply Mail for Purchase Order Clarification", mailmessage, MailPriority.Normal, null);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["PurchaseOrderApproval"]) + "?id=" + objPurchaseOrderRequestClarificationMail.RequestId + "&processId=" + objPurchaseOrderRequestClarificationMail.ProcessId + "&cid=" + objPurchaseOrderRequestClarificationMail.CompanyId);

            MailHelper.SendEmail(objPurchaseOrderRequestClarificationMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static bool SendTicketMailtoEngineer(Ticket ticket, CompanyDetails company, List<EngineerAssignList> engineerslist, byte[] pdfResult)
        {
            bool response = false;
            string subject = string.Empty;
            if (ticket != null)
            {
                foreach (var engineer in engineerslist)
                {
                    string mailmessage = string.Empty;
                    var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/TicketEmailToEngineer.txt");
                    StreamReader srEmailInfo = new StreamReader(filePathEmail);
                    mailmessage = srEmailInfo.ReadToEnd();
                    srEmailInfo.Close();

                    //mailmessage = mailmessage.Replace("$$EngineerName", engineer.Name);
                    //mailmessage = mailmessage.Replace("$$TicketNumber", ticket.TicketNo);
                    //mailmessage = mailmessage.Replace("$$Address", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.PurchaseOrderRequestCode));
                    //mailmessage = mailmessage.Replace("$$Job Description", ticket.JobDesciption);
                    //mailmessage = mailmessage.Replace("$$Service Date", ticket.PreferredServiceDatetime);   // company name        
                    //mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                    //mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.RequestedByUserName));

                    //subject = $"{" Ticket: "}{" : "}{Convert.ToString(ticket.TicketNo)} {" details"}";
                    //subject += PrepareSubject(engineer.Name, objQuotationRequest.PurchaseOrderRequest.Location);

                    Attachment attachment = null;
                    //attachment = new Attachment(new MemoryStream(pdfResult), "QuoationRequest.pdf");
                    response = MailHelper.SendEmail(engineer.Email, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }

            }

            return response;
        }

        public static bool SendQuotationRequestMailtoSupplier(QuotationRequest objQuotationRequest, CompanyDetails company, byte[] pdfResult)
        {
            bool response = false;
            string subject = string.Empty;
            if (objQuotationRequest.QuotationVendorItems != null)
            {
                if (objQuotationRequest.QuotationVendorItems.Count > 0)
                {
                    foreach (var supplier in objQuotationRequest.QuotationVendorItems)
                    {
                        string mailmessage = string.Empty;
                        var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/QuotationRequestEmailToSupplier.txt");
                        StreamReader srEmailInfo = new StreamReader(filePathEmail);
                        mailmessage = srEmailInfo.ReadToEnd();
                        srEmailInfo.Close();

                        mailmessage = mailmessage.Replace("$$SupplierName", supplier.QuotationSupplier.SupplierName);
                        mailmessage = mailmessage.Replace("$$QuotationNumber", objQuotationRequest.QuotationRequestCode);
                        mailmessage = mailmessage.Replace("$$PurchaseOrderNumber", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.PurchaseOrderRequestCode));
                        mailmessage = mailmessage.Replace("$$PurchaseOrderType", objQuotationRequest.PurchaseOrderRequest.PurchaseOrderType);
                        mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name        
                        mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                        mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objQuotationRequest.PurchaseOrderRequest.RequestedByUserName));
                        mailmessage = mailmessage.Replace("$$RequesterEmail", objQuotationRequest.PurchaseOrderRequest.RequestedEmail);

                        subject = $"{" Quotation Request: "}{" : "}{Convert.ToString(objQuotationRequest.QuotationRequestCode)} {" details"}";
                        subject += PrepareSubject(supplier.QuotationSupplier.SupplierName, objQuotationRequest.PurchaseOrderRequest.Location);

                        Attachment attachment = null;
                        attachment = new Attachment(new MemoryStream(pdfResult), "QuoationRequest.pdf");
                        response = MailHelper.SendEmail(supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], objQuotationRequest.PurchaseOrderRequest.RequestedEmail, "", subject, mailmessage, MailPriority.Normal, attachment);
                    }
                }
            }

            return response;
        }

        public static bool SendPurchaseOrderToSupplier(CompanyDetails company, byte[] pdfResult, PurchaseOrder purchaseOrderDetails = null, FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null, ContractPurchaseOrder contractPurchaseOrderDetails = null, ExpensesPurchaseOrder expensesPurchaseOrderDetails = null, PurchaseOrderRequest purchaseOrderRequestDetails = null)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;

            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderEmailToSupplier.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            Attachment attachment = null;
            attachment = new Attachment(new MemoryStream(pdfResult), "PurchaseOrder.pdf");
            var response = false;

            if (purchaseOrderDetails != null)
            {
                mailmessage = mailmessage.Replace("$$SupplierName", purchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(purchaseOrderDetails.PurchaseOrderCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", purchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", purchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(purchaseOrderDetails.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{purchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(purchaseOrderDetails.RequestedByUserName));  // company name                
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", purchaseOrderDetails.CurrencySymbol);
                if (purchaseOrderDetails.Supplier.SupplierEmail != null)
                {
                    subject = $"{" PurchaseOrder number: "}{Convert.ToString(purchaseOrderDetails.PurchaseOrderCode)} {" details"}";
                    subject += PrepareSubject(purchaseOrderDetails.Supplier.SupplierName, purchaseOrderDetails.Location);
                    response = MailHelper.SendEmail(purchaseOrderDetails.Supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }
                else
                {
                    response = false;
                }
            }
            else if (purchaseOrderRequestDetails != null)
            {
                mailmessage = mailmessage.Replace("$$SupplierName", purchaseOrderRequestDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(purchaseOrderRequestDetails.PurchaseOrderRequestCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", purchaseOrderRequestDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", purchaseOrderRequestDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{purchaseOrderRequestDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(purchaseOrderRequestDetails.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(purchaseOrderRequestDetails.RequestedByUserName));  // company name              
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", purchaseOrderRequestDetails.CurrencySymbol);
                attachment = new Attachment(new MemoryStream(pdfResult), "PurchaseOrder.pdf");
                if (purchaseOrderRequestDetails.Supplier.SupplierEmail != null)
                {
                    subject = $"{" PurchaseOrder number: "}{Convert.ToString(purchaseOrderRequestDetails.PurchaseOrderRequestCode)} {" details"}";
                    subject += PrepareSubject(purchaseOrderRequestDetails.Supplier.SupplierName, purchaseOrderRequestDetails.Location);
                    response = MailHelper.SendEmail(purchaseOrderRequestDetails.Supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }
                else
                {
                    response = false;
                }
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                mailmessage = mailmessage.Replace("$$SupplierName", fixedPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", fixedPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", fixedPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate)));
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(fixedPurchaseOrderDetails.RequestedByUserName));  // company name              
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", fixedPurchaseOrderDetails.CurrencySymbol);
                if (fixedPurchaseOrderDetails.Supplier.SupplierEmail != null)
                {
                    subject = $"{" PurchaseOrder number: "}{Convert.ToString(fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode)} {" details"}";
                    subject += PrepareSubject(fixedPurchaseOrderDetails.Supplier.SupplierName, fixedPurchaseOrderDetails.Location);
                    response = MailHelper.SendEmail(fixedPurchaseOrderDetails.Supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }
                else
                {
                    response = false;
                }
            }

            else if (contractPurchaseOrderDetails != null)
            {
                mailmessage = mailmessage.Replace("$$SupplierName", contractPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", contractPurchaseOrderDetails.CPONumber);
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", contractPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", contractPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", contractPurchaseOrderDetails.EndDate)));
                mailmessage = mailmessage.Replace("$$Sender", contractPurchaseOrderDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", contractPurchaseOrderDetails.CurrencySymbol);
                if (contractPurchaseOrderDetails.Supplier.SupplierEmail != null)
                {
                    subject = $"{" ContractMaster number: "}{Convert.ToString(contractPurchaseOrderDetails.CPONumber)} {" details"}";
                    subject += PrepareSubject(contractPurchaseOrderDetails.Supplier.SupplierName, contractPurchaseOrderDetails.Location);
                    response = MailHelper.SendEmail(contractPurchaseOrderDetails.Supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }
                else
                {
                    response = false;
                }
            }
            else if (expensesPurchaseOrderDetails != null)
            {
                mailmessage = mailmessage.Replace("$$SupplierName", expensesPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode);
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", expensesPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", expensesPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{expensesPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", DateTime.Now)));
                mailmessage = mailmessage.Replace("$$Sender", expensesPurchaseOrderDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", expensesPurchaseOrderDetails.CurrencySymbol);
                if (expensesPurchaseOrderDetails.Supplier.SupplierEmail != null)
                {
                    subject = $"{" PurchaseOrder number: "}{Convert.ToString(expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode)} {" details"}";
                    subject += PrepareSubject(expensesPurchaseOrderDetails.Supplier.SupplierName, expensesPurchaseOrderDetails.Location);
                    response = MailHelper.SendEmail(expensesPurchaseOrderDetails.Supplier.SupplierEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                }
                else
                {
                    response = false;
                }
            }

            return response;

        }

        public static bool SendPurchaseOrderToSupplierContactPersons(List<SupplierContactPerson> SupplierContactPersons, CompanyDetails company, byte[] pdfResult, PurchaseOrder purchaseOrderDetails = null, FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null, ContractPurchaseOrder contractPurchaseOrderDetails = null, ExpensesPurchaseOrder expensesPurchaseOrderDetails = null, PurchaseOrderRequest purchaseOrderRequestDetails = null)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            subject = company.CompanyShortName == "" ? "" : company.CompanyShortName + " / ";
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderEmailToSupplier.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            Attachment attachment = null;
            attachment = new Attachment(new MemoryStream(pdfResult), "PurchaseOrder.pdf");
            var response = false;

            if (purchaseOrderDetails != null)
            {
                //mailmessage = mailmessage.Replace("$$SupplierName", purchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(purchaseOrderDetails.PurchaseOrderCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", purchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", purchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(purchaseOrderDetails.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{purchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(purchaseOrderDetails.RequestedByUserName));  // company name                
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", purchaseOrderDetails.CurrencySymbol);
                if (SupplierContactPersons != null)
                {
                    subject += $"{" PO: "}{Convert.ToString(purchaseOrderDetails.PurchaseOrderCode)}";
                    subject += PrepareSubject(purchaseOrderDetails.Supplier.SupplierShortName, purchaseOrderDetails.WorkFlowStatusText);
                    for (int i = 0; i < SupplierContactPersons.Count; i++)
                    {
                        //mailmessage = mailmessage.Replace("$$SupplierName", SupplierContactPersons[i].Name);
                        mailmessage = mailmessage.Replace("$$Name", SupplierContactPersons[i].Name);
                        response = MailHelper.SendEmail(SupplierContactPersons[i].EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                        mailmessage = mailmessage.Replace(SupplierContactPersons[i].Name, "$$Name");

                    }
                }
                else
                {
                    response = false;
                }
            }
            else if (purchaseOrderRequestDetails != null)
            {
                // mailmessage = mailmessage.Replace("$$SupplierName", purchaseOrderRequestDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(purchaseOrderRequestDetails.PurchaseOrderRequestCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", purchaseOrderRequestDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", purchaseOrderRequestDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{purchaseOrderRequestDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(purchaseOrderRequestDetails.ExpectedDeliveryDate.ToString("dd-MM-yyyy")));
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(purchaseOrderRequestDetails.RequestedByUserName));  // company name              
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", purchaseOrderRequestDetails.CurrencySymbol);
                attachment = new Attachment(new MemoryStream(pdfResult), "PurchaseOrder.pdf");
                if (SupplierContactPersons != null)
                {
                    subject += $"{" PO: "}{Convert.ToString(purchaseOrderRequestDetails.PurchaseOrderRequestCode)}";
                    subject += PrepareSubject(purchaseOrderRequestDetails.Supplier.SupplierShortName, purchaseOrderRequestDetails.WorkFlowStatusText);
                    for (int i = 0; i < SupplierContactPersons.Count; i++)
                    {
                        mailmessage = mailmessage.Replace("$$Name", SupplierContactPersons[i].Name);
                        response = MailHelper.SendEmail(SupplierContactPersons[i].EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                        mailmessage = mailmessage.Replace(SupplierContactPersons[i].Name, "$$Name");
                    }
                }
                else
                {
                    response = false;
                }
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                //mailmessage = mailmessage.Replace("$$SupplierName", fixedPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode));
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", fixedPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", fixedPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate)));
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(fixedPurchaseOrderDetails.RequestedByUserName));  // company name              
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", fixedPurchaseOrderDetails.CurrencySymbol);
                if (SupplierContactPersons != null)
                {
                    subject += $"{" PO: "}{Convert.ToString(fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode)}";
                    subject += PrepareSubject(fixedPurchaseOrderDetails.Supplier.SupplierShortName, fixedPurchaseOrderDetails.WorkFlowStatusText);
                    for (int i = 0; i < SupplierContactPersons.Count; i++)
                    {
                        mailmessage = mailmessage.Replace("$$Name", SupplierContactPersons[i].Name);
                        response = MailHelper.SendEmail(SupplierContactPersons[i].EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                        mailmessage = mailmessage.Replace(SupplierContactPersons[i].Name, "$$Name");
                    }
                }
                else
                {
                    response = false;
                }
            }

            else if (contractPurchaseOrderDetails != null)
            {
                //mailmessage = mailmessage.Replace("$$SupplierName", contractPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", contractPurchaseOrderDetails.CPONumber);
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", contractPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", contractPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", contractPurchaseOrderDetails.EndDate)));
                mailmessage = mailmessage.Replace("$$Sender", contractPurchaseOrderDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", contractPurchaseOrderDetails.CurrencySymbol);
                if (SupplierContactPersons != null)
                {
                    subject += $"{" CM: "}{Convert.ToString(contractPurchaseOrderDetails.CPONumber)}";
                    subject += PrepareSubject(contractPurchaseOrderDetails.Supplier.SupplierShortName, contractPurchaseOrderDetails.WorkFlowStatusText);
                    for (int i = 0; i < SupplierContactPersons.Count; i++)
                    {
                        mailmessage = mailmessage.Replace("$$Name", SupplierContactPersons[i].Name);
                        response = MailHelper.SendEmail(SupplierContactPersons[i].EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                        mailmessage = mailmessage.Replace(SupplierContactPersons[i].Name, "$$Name");
                    }
                }
                else
                {
                    response = false;
                }
            }
            else if (expensesPurchaseOrderDetails != null)
            {
                //mailmessage = mailmessage.Replace("$$SupplierName", expensesPurchaseOrderDetails.Supplier.SupplierShortName);
                mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode);
                mailmessage = mailmessage.Replace("$$PurchaseOrderType", expensesPurchaseOrderDetails.PurchaseOrderType);
                mailmessage = mailmessage.Replace("$$CompanyName", company.CompanyName);   // company name
                mailmessage = mailmessage.Replace("$$Supplier", expensesPurchaseOrderDetails.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$TotalAmount", $"{expensesPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
                mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", DateTime.Now)));
                mailmessage = mailmessage.Replace("$$Sender", expensesPurchaseOrderDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", expensesPurchaseOrderDetails.CurrencySymbol);
                if (SupplierContactPersons != null)
                {
                    subject += $"{" PO: "}{Convert.ToString(expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode)}";
                    subject += PrepareSubject(expensesPurchaseOrderDetails.Supplier.SupplierShortName, expensesPurchaseOrderDetails.WorkFlowStatusText);
                    for (int i = 0; i < SupplierContactPersons.Count; i++)
                    {
                        mailmessage = mailmessage.Replace("$$Name", SupplierContactPersons[i].Name);
                        response = MailHelper.SendEmail(SupplierContactPersons[i].EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, attachment);
                        mailmessage = mailmessage.Replace(SupplierContactPersons[i].Name, "$$Name");
                    }
                }
                else
                {
                    response = false;
                }
            }
            return response;

        }



        private static string PrepareMailBody(PurchaseOrderRequestMail objPurchaseOrderRequestMail, string type = null)
        {
            string mailmessage = string.Empty;
            var filePathEmail = string.Empty;
            if (type == null)
            {
                if (objPurchaseOrderRequestMail.ProcessId == 5 || objPurchaseOrderRequestMail.ProcessId == 6)
                {
                    filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ContractMasterRequestEmail.txt");

                }
                else
                {
                    filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderRequestEmail.txt");

                }
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestMail.ApproverName);
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objPurchaseOrderRequestMail.SenderName));
            }
            else
            {
                if (objPurchaseOrderRequestMail.ProcessId == 5 || objPurchaseOrderRequestMail.ProcessId == 6)
                {
                    filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ContractMasterRequestApprovalMail.txt");
                }
                else
                {
                    filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderRequestApprovalMail.txt");

                }
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();

                if (type.ToString().Trim().ToLower() == "voided")
                {
                    mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestMail.ApproverName);
                    mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objPurchaseOrderRequestMail.SenderName));
                }
                else
                {
                    mailmessage = mailmessage.Replace("$$Name", Convert.ToString(objPurchaseOrderRequestMail.SenderName));
                    mailmessage = mailmessage.Replace("$$Sender", objPurchaseOrderRequestMail.ApproverName);
                }
            }
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", objPurchaseOrderRequestMail.DocumentCurrencySymbol);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(objPurchaseOrderRequestMail.RequestCode));
            mailmessage = mailmessage.Replace("$$PurchaseOrderType", objPurchaseOrderRequestMail.PurchaseOrderType);
            mailmessage = mailmessage.Replace("$$Supplier", objPurchaseOrderRequestMail.SupplierName);
            mailmessage = mailmessage.Replace("$$TotalAmount", objPurchaseOrderRequestMail.TotalAmount);
            mailmessage = mailmessage.Replace("$$ContractStartDate", Convert.ToString(objPurchaseOrderRequestMail.ContractStartDate.ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(objPurchaseOrderRequestMail.DeliveryDate.ToString("dd-MM-yyyy")));
            return mailmessage;
        }

        private static string PrepareClarificationMailBody(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderRequestClarificationMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestClarificationMail.RequesterName);
            mailmessage = mailmessage.Replace("$$Clarification", objPurchaseOrderRequestClarificationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$Supplier", objPurchaseOrderRequestClarificationMail.Supplier);
            mailmessage = mailmessage.Replace("$$TotalAmount", objPurchaseOrderRequestClarificationMail.TotalAmount);
            mailmessage = mailmessage.Replace("$$Status", objPurchaseOrderRequestClarificationMail.WorkFlowStatus);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber));
            mailmessage = mailmessage.Replace("$$sender", objPurchaseOrderRequestClarificationMail.ApproverName);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", objPurchaseOrderRequestClarificationMail.DocumentCurrencySymbol);
            return mailmessage;
        }

        private static string PrepareReplyMailBody(PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarificationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderClarificationReplyMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestClarificationMail.ApproverName);
            mailmessage = mailmessage.Replace("$$Reply", objPurchaseOrderRequestClarificationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$Supplier", objPurchaseOrderRequestClarificationMail.Supplier);
            mailmessage = mailmessage.Replace("$$TotalAmount", objPurchaseOrderRequestClarificationMail.TotalAmount);
            mailmessage = mailmessage.Replace("$$Status", objPurchaseOrderRequestClarificationMail.WorkFlowStatus);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(objPurchaseOrderRequestClarificationMail.PurchaseOrderNumber));
            mailmessage = mailmessage.Replace("$$sender", objPurchaseOrderRequestClarificationMail.RequesterName);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", objPurchaseOrderRequestClarificationMail.DocumentCurrencySymbol);
            return mailmessage;
        }

        private static string PrepareSubject(string supplierName, string documentStatus)
        {
            string subject = string.Empty;

            if ((!string.IsNullOrEmpty(supplierName) && (!string.IsNullOrEmpty(documentStatus))))
            {
                subject += $"{" / "} { supplierName } {" / "} { documentStatus }";
            }

            else if ((!string.IsNullOrEmpty(supplierName) && (string.IsNullOrEmpty(documentStatus))))
            {
                subject += $"{" / "} {  supplierName  }";
            }
            else if ((string.IsNullOrEmpty(supplierName) && (!string.IsNullOrEmpty(documentStatus))))
            {
                subject += $"{" / "} { documentStatus  }";
            }
            return subject;
        }
    }
}
