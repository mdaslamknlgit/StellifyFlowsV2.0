using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ContactsController : ApiController
    {
        private readonly IContactsManager m_IContactsManager;
        private readonly IEntityImportManager m_IEntityImportManager;

        private readonly UserInfo MyUserInfo = new UserInfo();
        public ContactsController(IContactsManager contactsManager,IEntityImportManager entityImportManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IContactsManager = contactsManager;
            m_IEntityImportManager = entityImportManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contacts/GetContactList/{UserId}")]
        public IHttpActionResult GetContactList(int UserId)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                ContactsResults contactsResults = null;
                contactsResults = m_IContactsManager.GetContactList(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(contactsResults);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contacts/SearchContact")]
        public IHttpActionResult SearchContact([FromUri] ContactSearch contactSearch)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = contactSearch.UserId;
                MyUserInfo.UsersIds = contactSearch.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                ContactsResults contactsResults = null;
                
                contactsResults = m_IContactsManager.SearchContact(MyUserInfo, contactSearch);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(contactsResults);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "SearchContact", Ex.ToString());
            }
            return null;
        }


        [Route("api/contacts/GetContactDetailById/{id}/{UserId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetContactDetailById(int id,int UserId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();

                ContactDTO contactDTO = null;
                contactDTO = m_IContactsManager.GetContactDetailById(id, MyUserInfo);
                return Json(contactDTO);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadById", Ex.ToString()); }
            return null;
        }

        [Route("api/contacts/GetContactByContactId/{id}/{UserId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetContactByContactId(int id, int UserId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();

                ContactInfo contactInfo  = null;
                contactInfo = m_IContactsManager.GetContactByContactId(id, MyUserInfo);
                return Json(contactInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetContactByContactId", Ex.ToString()); }
            return null;
        }


        [Route("api/contacts/CreateContact")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult CreateContact(ContactDTO contactDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
            //    BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

            //    MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
            //    MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
            //    MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
            //    MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
            //    MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

                //int returnValue = 0;
                Helpers.Info(typeof(ContactsController).ToString(), "CreateContact", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IContactsManager.CreateContact(contactDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "CreateContact", "Done " + DateTime.Now.ToString());
                //if (returnValue > 0)
                //{
                //    if (returnValue == 9999)
                //    {
                //        MyResultReponse.Status = "EXISTS";
                //        MyResultReponse.StatusCode = "EXISTS";
                //        MyResultReponse.Message = "Contact already exists ";
                //        MyResultReponse.Data = returnValue.ToString();
                //    }
                //    else
                //    {
                //        MyResultReponse.Status = "SUCCESS";
                //        MyResultReponse.StatusCode = "SUCCESS";
                //        MyResultReponse.Message = "List Created Successfully ";
                //        MyResultReponse.Data = returnValue.ToString();
                //    }
                //}
                //else
                //{
                //    MyResultReponse.Status = "ERROR";
                //    MyResultReponse.StatusCode = "ERROR";
                //    MyResultReponse.Message = "Error Occured while inserting contact administrator";
                //    MyResultReponse.Data = "0";
                //}
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "CreateContact", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator ";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [Route("api/contacts/UpdateContact")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult UpdateContact(ContactDTO contactDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

                int returnValue = 0;
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateContact", "Started " + DateTime.Now.ToString());
                returnValue = m_IContactsManager.UpdateContact(contactDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateContact", "Done " + DateTime.Now.ToString());

                if (returnValue > 0)
                {
                    if (returnValue == 9999)
                    {
                        MyResultReponse.Status = "EXISTS";
                        MyResultReponse.StatusCode = "EXISTS";
                        MyResultReponse.Message = "Contact Already Exists ";
                        MyResultReponse.Data = returnValue.ToString();

                    }
                    else
                    {
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "Contact Updated Successfully ";
                        MyResultReponse.Data = returnValue.ToString();

                    }

                }
                else
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Error Occured while Updating contact administrator";
                    MyResultReponse.Data = "0";
                }
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "UpdateContact", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while Updating contact administrator";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return null;
        }

        [Route("api/contacts/DeleteContact")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult DeleteContact(ContactDTO contactDTO)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

                ResultReponse MyResultReponse = new ResultReponse();
                Helpers.Info(typeof(ContactsController).ToString(), "DeleteContact", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IContactsManager.DeleteContact(contactDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "DeleteContact", "Done " + DateTime.Now.ToString());
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(ContactsController).ToString(), "DeleteContact", Ex.ToString()); }
            return null;
        }

        [Route("api/contacts/GetMaritalStatusById/{id}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetMaritalStatusById(int id)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();

                MaritalStatus maritalStatus = null;
                maritalStatus = m_IContactsManager.GetMaritalStatusById(id, MyUserInfo);
                return Json(maritalStatus);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetMaritalStatusById", Ex.ToString()); }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contacts/GetMaritalStatus")]
        public IHttpActionResult GetMaritalStatus()
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = contactSearch.UserId;
                //MyUserInfo.UsersIds = contactSearch.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                List<MaritalStatus> maritalStatuses = null;
                maritalStatuses = m_IContactsManager.GetMaritalStatus(MyUserInfo).ToList();


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(maritalStatuses);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetMaritalStatus", Ex.ToString());
            }
            return null;
        }


        [Route("api/contacts/GetContactsByAccountId/{AccountId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetContactsByAccountId(int AccountId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();

                ContactsResults contactsResults  = null;
                contactsResults = m_IContactsManager.GetContactsByAccountId(AccountId, MyUserInfo);
                return Json(contactsResults);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetMaritalStatusById", Ex.ToString()); }
            return null;
        }

        [Route("api/contacts/ImportContacts/{UserId}/{CompanyId}")]
        [HttpPost]
        public IHttpActionResult ImportContacts(int UserId, int CompanyId)
        {
            int returnValue = 0;
            int _UserId = 0;
            int _CompanyId = 0;
             string FileType = "";
            string FileExtension = "";
            ResultReponse MyResultReponse = new ResultReponse();
            List<DataRecord> DataRecordList = null;
            System.Net.Http.Headers.HttpRequestHeaders headers = this.Request.Headers;

            BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

            //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
            //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
            //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
            //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
            //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

            MyUserInfo.UserId = UserId;
            MyUserInfo.UsersIds = UserId.ToString();
            MyUserInfo.CompanyId = CompanyId;

            var httpRequest = HttpContext.Current.Request;

            DataTable da = null;
            try
            {
                FileType = httpRequest.Form["FileType"]; ;
                if (httpRequest.Files.Count > 0)
                {
                    foreach (string file in httpRequest.Files)
                    {
                        var postedFile = httpRequest.Files[file];

                        //string pathToFiles = HttpContext.Current.Server.MapPath("/UploadedFiles");
                        var filePath = HttpContext.Current.Server.MapPath("~/UploadedFiles/" + postedFile.FileName);
                        postedFile.SaveAs(filePath);
                        //Read csv 
                        DataRecordList = convertcsv(filePath);
                        if (FileType == "CSV")
                        {
                            da = GetDataTabletFromCSVFile(filePath);
                        }
                        if (FileType == "EXCEL")
                        {
                            FileExtension = "." + postedFile.FileName.Split('.')[1];
                            da = ExcelService.ReadAsDataTable(filePath);
                            //da = GetDataTabletFromExcelFile(filePath,FileExtension,"Yes");
                        }
                        var csdata = httpRequest.Form["csdata"];

                        _UserId = Convert.ToInt32(httpRequest.Form["UserId"]);
                        _CompanyId =Convert.ToInt32(httpRequest.Form["CompanyId"]);
                        try
                        {
                            //Write Saving Code Here
                            FileStream fs;
                            fs = File.Open(filePath, FileMode.Open, FileAccess.Read);
                            var excelReader = new ExcelReader(fs);
                            IEnumerable<DataRow> PaymentData = excelReader.GetData("Sheet1");
                            foreach (var row in PaymentData)
                            {

                            }

                        }
                        catch (Exception exp)
                        {
                            continue;
                        }
                        DataTable EmailDataTable = da;


                        List<EmailDTO> MyEmailList = new List<EmailDTO>();


                    }
                }
                MyResultReponse.Data = returnValue.ToString();
                MyResultReponse.Status = "SUCCESS";
                MyResultReponse.StatusCode = "SUCCESS";
                MyResultReponse.Message = "Imported successfully";
            }
            catch (Exception exp)
            {
                MyResultReponse.Data = "0"; ;
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occurred contact administrator";
                MyResultReponse.ErrorMessage = exp.ToString();

            }
            return Json(MyResultReponse);


        }

        [Route("api/contacts/EntityImport/{EntityId}/{EntityName}/{UserId}/{CompanyId}")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult EntityImport(int EntityId, string EntityName,int UserId,int CompanyId)
        {
            int returnValue = 0;

            string FileType = "";
            string FileExtension = "";
            ResultReponse MyResultReponse = new ResultReponse();
            List<DataRecord> DataRecordList = null;
            System.Net.Http.Headers.HttpRequestHeaders headers = this.Request.Headers;

            BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

            //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
            //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
            //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
            //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
            //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

            MyUserInfo.UserId = UserId;
            MyUserInfo.UsersIds = UserId.ToString();
            MyUserInfo.CompanyId = CompanyId;



            var httpRequest = HttpContext.Current.Request;

            DataTable da = null;
            try
            {
                FileType = httpRequest.Form["FileType"]; ;
                if (httpRequest.Files.Count > 0)
                {
                    foreach (string file in httpRequest.Files)
                    {
                        var postedFile = httpRequest.Files[file];

                        //string pathToFiles = HttpContext.Current.Server.MapPath("/UploadedFiles");
                        var filePath = HttpContext.Current.Server.MapPath("~/UploadedFiles/" + postedFile.FileName);
                        postedFile.SaveAs(filePath);
                        //Read csv 
                        //DataRecordList = convertcsv(filePath);
                        if (FileType == "CSV")
                        {
                            da = GetDataTabletFromCSVFile(filePath);
                        }
                        if (FileType == "EXCEL")
                        {
                            FileExtension = "." + postedFile.FileName.Split('.')[1];
                            da = ExcelService.ReadAsDataTable(filePath);
                            //da = GetDataTabletFromExcelFile(filePath,FileExtension,"Yes");
                        }
                        var csdata = httpRequest.Form["csdata"];

                        EntityId = Convert.ToInt32(httpRequest.Form["EntityId"]);
                        EntityName = httpRequest.Form["EntityName"];


                        //var csdata = headers.GetValues("csdata").First();
                        var result = JsonHelper.JsonDeserialize<List<CSVModel>>(csdata);
                        List<CSVModel> csvModelList = result;
                        List<string> colList = new List<string>();

                        try
                        {

                            for (int i = 0; i < csvModelList.Count; i++)
                            {
                                string s = csvModelList[i].Text;
                                string[] words = s.Split('=');
                                string rname = words[1];
                                string cname = words[0];
                                colList.Add(cname);
                                da.Columns[rname].ColumnName = cname;

                            }


                            for (int j = da.Columns.Count - 1; j >= 0; j--)
                            {
                                DataColumn dc = da.Columns[j];
                                if (!colList.Contains(dc.ColumnName))
                                {
                                    da.Columns.Remove(dc);
                                }
                            }

                        }


                        catch (Exception exp)
                        {
                            continue;
                        }
                        DataTable EmailDataTable = da;


                        List<EntityImport> MyEntityImportList = new List<EntityImport>();

                        //for (int i = 0; i < csvModelList.Count; i++)
                        foreach (DataRow dr in EmailDataTable.Rows)
                        {
                            try
                            {
                                //string s = csvModelList[i].Text;
                                //string[] words = s.Split('=');
                                //string rname = words[1];
                                //string cname = words[0];

                                EntityImport EntityImportInfo = new EntityImport();

                                if (EmailDataTable.Columns.Contains("FirstName"))
                                {
                                    //EntityImportInfo.firstname =EmailDataTable.Rows[i]["firstname"].ToString();
                                    EntityImportInfo.FirstName = dr["FirstName"].ToString();
                                }

                                if (EmailDataTable.Columns.Contains("LastName"))
                                {
                                    EntityImportInfo.LastName = dr["LastName"].ToString();
                                }

                                if (EmailDataTable.Columns.Contains("EmailId"))
                                {
                                    EntityImportInfo.Email = dr["EmailId"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Company"))
                                {
                                    EntityImportInfo.AccountName = dr["Company"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("AccountName"))
                                {
                                    EntityImportInfo.AccountName = dr["AccountName"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Title"))
                                {
                                    EntityImportInfo.Title = dr["Title"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Phone"))
                                {
                                    EntityImportInfo.MobileNo = dr["Phone"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Mobile"))
                                {
                                    EntityImportInfo.MobileNo = dr["Mobile"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("LinkedInURL"))
                                {
                                    EntityImportInfo.LinkedInURL = dr["URL"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("City"))
                                {
                                    EntityImportInfo.City = dr["City"].ToString();
                                }
                                //if (EmailDataTable.Columns.Contains("ConnectedOn"))
                                //{
                                //    try
                                //    {
                                //        EntityImportInfo.LastUpdated = Convert.ToDateTime(dr["ConnectedOn"].ToString());
                                //    }
                                //    catch (Exception exp)
                                //    {
                                //        EntityImportInfo.LastUpdated = DateTime.Now;
                                //    }
                                //}
                                //else
                                //{
                                //    EntityImportInfo.LastUpdated = DateTime.Now;
                                //}

                                //Get Regarding Import From Regarding Table
                                //
                                MyEntityImportList.Add(EntityImportInfo);
                            }
                            catch (Exception exp)
                            {
                                var MessageError = exp.ToString();
                            }
                            //break;
                        }


                        EntityImportList entityImportList  = new EntityImportList();
                        entityImportList.EntityId = EntityId;
                        entityImportList.EntityName = EntityName;
                        entityImportList.EntityList = MyEntityImportList;

                        if (EntityId > 0)
                        {
                            MyResultReponse = m_IEntityImportManager.EntityImport(entityImportList,EntityId, EntityName,UserId,CompanyId, MyUserInfo);
                        }
                        
                    }
                }
                //MyResultReponse.Data = returnValue.ToString();
                //MyResultReponse.Status = "SUCCESS";
                //MyResultReponse.StatusCode = "SUCCESS";
                //MyResultReponse.Message = "Imported successfully";
            }
            catch (Exception exp)
            {
                MyResultReponse.Data = "0"; ;
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occurred contact administrator";
                MyResultReponse.ErrorMessage = exp.ToString();

            }
            return Json(MyResultReponse);


        }

        #region Private Functions
        private List<DataRecord> convertcsv(string csv_file_path)
        {
            int i = 0;
            using (var sr = new StreamReader(csv_file_path))
            {
                CsvConfiguration config = new CsvConfiguration()
                {
                    Delimiter = ",",
                    QuoteAllFields = false,
                    IgnoreHeaderWhiteSpace = true,
                    IsHeaderCaseSensitive = false
                };

                CsvReader csv = new CsvReader(sr, config);
                List<DataRecord> datlist = new List<DataRecord>();
                var reader = new CsvReader(sr);
                reader.Read();
                int total = reader.Row;
                try
                {
                    do
                    {

                        DataRecord record = new DataRecord();

                        record.FirstName = reader.GetField<string>("First Name");
                        record.LastName = reader.GetField<string>("Last Name");
                        record.Email = reader.GetField<string>("Email Address");
                        record.Company = reader.GetField<string>("Company");
                        record.Position = reader.GetField<string>("Position");
                        record.ConnectedOn = reader.GetField<string>("Connected On");

                        datlist.Add(record);

                        if (record.FirstName == "Rohith kumar")
                        {
                            var breakk = "break";
                        }
                        i++;
                        reader.Read();
                    } while (!reader.IsRecordEmpty());

                    return datlist;
                }
                catch (Exception exp)
                {
                    var messerror = exp.ToString();
                }
            }
            return null;
        }

        private static DataTable GetDataTabletFromCSVFile(string csv_file_path)
        {
            DataTable csvData = new DataTable();

            try
            {

                using (TextFieldParser csvReader = new TextFieldParser(csv_file_path))
                {
                    csvReader.SetDelimiters(new string[] { "," });
                    csvReader.HasFieldsEnclosedInQuotes = true;
                    string[] colFields = csvReader.ReadFields();
                    foreach (string column in colFields)
                    {
                        DataColumn datecolumn = new DataColumn(column);
                        datecolumn.AllowDBNull = true;
                        csvData.Columns.Add(datecolumn);
                    }

                    while (!csvReader.EndOfData)
                    {
                        string[] fieldData = csvReader.ReadFields();
                        //Making empty value as null
                        for (int i = 0; i < fieldData.Length; i++)
                        {
                            if (fieldData[i] == "")
                            {
                                fieldData[i] = null;
                            }
                        }
                        csvData.Rows.Add(fieldData);
                    }
                }
            }
            catch (Exception ex)
            {
                var Error = ex.ToString();
            }
            return csvData;
        }

        #endregion
    }



}
