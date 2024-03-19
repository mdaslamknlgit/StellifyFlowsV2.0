using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using UELPM.Model.Models;
using System.Configuration;
using context = System.Web.HttpContext;

namespace UELPM.Util.FileOperations
{
    public class FileOperations
    {
        public bool SaveFile(FileSave fileSaveObj)
        {
            try
            {
                string pathString = System.Configuration.ConfigurationManager.AppSettings["AttachmentDrive"];
                string pathString1 = null;
                string pathString2 = null;
                pathString = Path.Combine(pathString, fileSaveObj.CompanyName);
                pathString1 = pathString;
                pathString2 = pathString;
                //checking if the directory with the company name exists
                //if directory does not exists then we need to create the directory
                if (!Directory.Exists(pathString))
                {
                    Directory.CreateDirectory(pathString);
                }
                pathString = Path.Combine(pathString, fileSaveObj.ModuleName);
                pathString1 = Path.Combine(pathString1, "Quotations");
                pathString2 = Path.Combine(pathString2, "TicketSubContractor");
                //checking if the directory with the module name exists
                //if directory does not exists then we need to create the directory
                if (!Directory.Exists(pathString))
                {
                    Directory.CreateDirectory(pathString);
                }
                if (!Directory.Exists(pathString1))
                {
                    Directory.CreateDirectory(pathString1);
                }
                if (!Directory.Exists(pathString2))
                {
                    Directory.CreateDirectory(pathString2);
                }
                if (fileSaveObj.Files != null)
                {
                    for (var i = 0; i < fileSaveObj.Files.Count; i++)
                    {
                        string filePath = null;
                        var file = fileSaveObj.Files[i];
                        ////The below code commented by sateesh on 17-06-2020 due to files are being uploaded to wrong folder.

                        //if (file.FileName.Contains("Quotation"))
                        //{
                        //    filePath = Path.Combine(pathString1, fileSaveObj.UniqueId + "_" + file.FileName);
                        //}
                        //else if (file.FileName.Contains("TicketSubContractor"))
                        //{
                        //    filePath = Path.Combine(pathString2, fileSaveObj.UniqueId + "_" + file.FileName);
                        //}
                        //else
                        //{
                        filePath = Path.Combine(pathString, fileSaveObj.UniqueId + "_" + file.FileName);
                        //}

                        if (!File.Exists(filePath))
                        {
                            file.SaveAs(filePath);
                        }
                    }
                }
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool DeleteFile(FileSave fileSaveObj)
        {
            try
            {
                string pathString = System.Configuration.ConfigurationManager.AppSettings["AttachmentDrive"];

                pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName);

                if (fileSaveObj.FilesNames != null)
                {
                    for (var i = 0; i < fileSaveObj.FilesNames.Length; i++)
                    {
                        string filePath = Path.Combine(pathString, fileSaveObj.UniqueId + "_" + fileSaveObj.FilesNames[i]);
                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }
                    }
                }
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public byte[] ReadFile(FileSave fileSaveObj)
        {
            try
            {
                string pathString = System.Configuration.ConfigurationManager.AppSettings["AttachmentDrive"];

                pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName, fileSaveObj.UniqueId + "_" + fileSaveObj.FilesNames[0]);

                return File.ReadAllBytes(pathString);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] ReadQuotationFile(FileSave fileSaveObj)
        {
            try
            {
                string[] splitvalue = fileSaveObj.UniqueId.Split('\\');
                int UniqueId = Convert.ToInt32(splitvalue[0]);
                int RowId = Convert.ToInt32(splitvalue[1]);
                string pathString = System.Configuration.ConfigurationManager.AppSettings["AttachmentDrive"];
                if (fileSaveObj.ModuleName == "TicketSubContractor")
                {
                    pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName, UniqueId + "_TicketSubContractor@" + RowId + "!" + fileSaveObj.FilesNames[0]);
                }
                else if (fileSaveObj.ModuleName == AttachmentFolderNames.InventoryPurchaseOrder)
                {
                    pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName, UniqueId + "_SPOFiles@" + RowId + "!" + fileSaveObj.FilesNames[0]);
                }
                else if (fileSaveObj.ModuleName == AttachmentFolderNames.AssetPurchaseOrder)
                {
                    pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName, UniqueId + "_APOFiles@" + RowId + "!" + fileSaveObj.FilesNames[0]);
                }
                else if (fileSaveObj.ModuleName == AttachmentFolderNames.ExpensePurchaseOrder)
                {
                    pathString = Path.Combine(pathString, fileSaveObj.CompanyName, fileSaveObj.ModuleName, UniqueId + "_EXPOFiles@" + RowId + "!" + fileSaveObj.FilesNames[0]);
                }
                else
                {
                    pathString = Path.Combine(pathString, fileSaveObj.CompanyName, "Quotations", UniqueId + "_Quotation@" + RowId + "!" + fileSaveObj.FilesNames[0]);
                }
                return File.ReadAllBytes(pathString);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string SaveBankQRCode(BankMaster bank)
        {
            try
            {
                string pathString = context.Current.Server.MapPath("~/Images/BankQRCodes");
                if (!Directory.Exists(pathString))
                {
                    Directory.CreateDirectory(pathString);
                }
                string filePath = null;
                var file = bank.QRImage[0];
                string fileName = Path.GetFileNameWithoutExtension(file.FileName).Replace(" ", "");
                fileName = string.Concat(fileName, bank.BankName.Replace(" ",""), bank.BankCode.Replace(" ", ""));
                fileName = string.Concat(fileName, Path.GetExtension(file.FileName));
                filePath = Path.Combine(pathString, fileName);
                if (!File.Exists(filePath))
                {
                    file.SaveAs(filePath);
                }
                return "images/BankQRCodes/" + fileName;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public string SaveCompanyLogo(Company company)
        {
            try
            {
                string pathString = context.Current.Server.MapPath("~/Images/CompanyLogos");
                if (!Directory.Exists(pathString))
                {
                    Directory.CreateDirectory(pathString);
                }
                string filePath = null;
                var file = company.Image[0];
                string fileName = Path.GetFileNameWithoutExtension(file.FileName);
                fileName = string.Concat(fileName,company.CompanyCode, company.CompanyId);
                fileName = string.Concat(fileName, Path.GetExtension(file.FileName));
                filePath = Path.Combine(pathString, fileName);
                if (!File.Exists(filePath))
                {
                    file.SaveAs(filePath);
                }
                return "Images/CompanyLogos/" + fileName;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
