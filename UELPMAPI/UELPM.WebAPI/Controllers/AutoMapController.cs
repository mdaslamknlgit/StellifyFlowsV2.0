using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;
using System.Data;
using CsvHelper.Configuration;
using CsvHelper;
using Microsoft.VisualBasic.FileIO;
using System.Data.OleDb;
using System.Configuration;


namespace UELPM.WebAPI.Controllers
{
    public class AutoMapController : ApiController
    {
        private readonly IMarketingListManager m_IListManger;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public AutoMapController(IMarketingListManager listManger)
        {
            //MyUserInfo = SetUserInfo();
            m_IListManger = listManger;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpPost, Route("api/AutoMap/CSVAutomapUpload/{UserId}/{CompanyId}")]
        public IHttpActionResult CSVAutomapUpload( int UserId,int CompanyId)
        {
            int returnValue = 0;
            int ListId = 0;
            string ListName = "";
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
                        if (FileType=="EXCEL")
                        {
                            FileExtension ="."+ postedFile.FileName.Split('.')[1];
                            da = ExcelService.ReadAsDataTable(filePath);
                            //da = GetDataTabletFromExcelFile(filePath,FileExtension,"Yes");
                        }
                        var csdata = httpRequest.Form["csdata"];

                        ListId = Convert.ToInt32(httpRequest.Form["ListId"]);
                        ListName = httpRequest.Form["ListName"];


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


                        List<EmailDTO> MyEmailList = new List<EmailDTO>();



                        //foreach (DataRow row in da.Rows)
                        //{
                        //    EmailDTO MyEmailInfo = new EmailDTO();


                        //    foreach (DataColumn column in da.Columns)
                        //    {
                        //        string ColumnName = column.ColumnName;
                        //        string ColumnData = row[column].ToString();
                        //        MyEmailInfo.company=
                        //    }
                        //}

                        //for (int i = 0; i < csvModelList.Count; i++)
                        foreach (DataRow dr in EmailDataTable.Rows)
                        {
                            try
                            {
                                //string s = csvModelList[i].Text;
                                //string[] words = s.Split('=');
                                //string rname = words[1];
                                //string cname = words[0];

                                EmailDTO MyEmailInfo = new EmailDTO();

                                if (EmailDataTable.Columns.Contains("FirstName"))
                                {
                                    //MyEmailInfo.firstname =EmailDataTable.Rows[i]["firstname"].ToString();
                                    MyEmailInfo.FirstName = dr["FirstName"].ToString();
                                }

                                if (EmailDataTable.Columns.Contains("LastName"))
                                {
                                    MyEmailInfo.LastName = dr["LastName"].ToString();
                                }

                                if (EmailDataTable.Columns.Contains("Email"))
                                {
                                    MyEmailInfo.Email = dr["Email"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Company"))
                                {
                                    MyEmailInfo.Company = dr["Company"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Title"))
                                {
                                    MyEmailInfo.Title = dr["Title"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Phone"))
                                {
                                    MyEmailInfo.Phone = dr["Phone"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("Mobile"))
                                {
                                    MyEmailInfo.Mobile = dr["Mobile"].ToString();
                                }
                                if (EmailDataTable.Columns.Contains("URL"))
                                {
                                    MyEmailInfo.Url = dr["URL"].ToString();
                                }

                                //if (EmailDataTable.Columns.Contains("ConnectionType"))
                                //{
                                //    MyEmailInfo.connectiontype = dr["ConnectionType"].ToString();
                                //}
                                //else
                                //{
                                //    MyEmailInfo.connectiontype = "2nd";
                                //}
                                if (EmailDataTable.Columns.Contains("ConnectedOn"))
                                {
                                    try
                                    {
                                        MyEmailInfo.LastUpdated = Convert.ToDateTime(dr["ConnectedOn"].ToString());
                                    }
                                    catch (Exception exp)
                                    {
                                        MyEmailInfo.LastUpdated = DateTime.Now;
                                    }
                                }
                                else
                                {
                                    MyEmailInfo.LastUpdated = DateTime.Now;
                                }

                                //Get Regarding Import From Regarding Table
                                //
                                MyEmailInfo.RegardingId = 16;
                                MyEmailList.Add(MyEmailInfo);
                            }
                            catch (Exception exp)
                            {
                                var MessageError = exp.ToString();
                            }
                            //break;
                        }

                       
                        ListByEmail listByEmail = new ListByEmail();
                        listByEmail.EmailList = MyEmailList;
                        if (ListId > 0)
                        {
                            listByEmail.ListId = ListId;
                            returnValue = m_IListManger.UpdateListWithEmails(listByEmail, MyUserInfo);
                        }
                        else
                        {
                            listByEmail.ListName = ListName;
                            returnValue = m_IListManger.CreateListWithEmails(listByEmail, MyUserInfo);
                        }



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
        private static List<DataRecord> convertcsv(string csv_file_path)
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


        private static DataTable GetDataTabletFromExcelFile(string FilePath, string Extension, string isHDR)
        {
            DataTable csvData = new DataTable();
            string conStr = "";
            try
            {
                switch (Extension)
                {
                    case ".xls": //Excel 97-03  
                        conStr = ConfigurationManager.ConnectionStrings["Excel03ConString"]
                        .ConnectionString;
                        break;
                    case ".xlsx": //Excel 07  
                        conStr = ConfigurationManager.ConnectionStrings["Excel07ConString"]
                        .ConnectionString;
                        break;

                }

                conStr = String.Format(conStr, FilePath, isHDR);
                OleDbConnection connExcel = new OleDbConnection(conStr);
                OleDbCommand cmdExcel = new OleDbCommand();
                OleDbDataAdapter oda = new OleDbDataAdapter();
                DataTable dt = new DataTable();
                cmdExcel.Connection = connExcel;

                //Get the name of First Sheet  
                connExcel.Open();

                DataTable dtExcelSchema;
                dtExcelSchema = connExcel.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
                string SheetName = dtExcelSchema.Rows[0]["TABLE_NAME"].ToString();
                connExcel.Close();
                //Read Data from First Sheet  
                connExcel.Open();
                cmdExcel.CommandText = "SELECT * From [" + SheetName + "]";
                oda.SelectCommand = cmdExcel;
                oda.Fill(dt);
                connExcel.Close();
                //Bind Data to GridView  

                //GridView1.Caption = Path.GetFileName(FilePath);
                //GridView1.DataSource = dt;
                //GridView1.DataBind();

                csvData = dt;

                return csvData;
            }
            catch(Exception ex)
            {
                var Error = ex.ToString();
            }
            return csvData;
           

        }

    }
}
