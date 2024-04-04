using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;

namespace UELPM.WebAPI
{
    public static class ReadCSV
    {
        public static DataTable GetCSVData(string FilePath)
        {
            //Create a DataTable.
            DataTable dt = new DataTable();
            dt.Columns.AddRange(new DataColumn[6] { new DataColumn("FirstName", typeof(string)),
        new DataColumn("LastName", typeof(string)),
        new DataColumn("Email", typeof(string)),
        new DataColumn("Company", typeof(string)),
        new DataColumn("Position",typeof(string)),
            new DataColumn("ConnectedOn",typeof(string)) });

            //Read the contents of CSV file.
            string csvData = File.ReadAllText(FilePath);

            //string csvtojson = CSVToJSON(csvData);
            //Execute a loop over the rows.
            foreach (string row in csvData.Split('\n'))
            {
                if (!string.IsNullOrEmpty(row))
                {
                    dt.Rows.Add();
                    int i = 0;

                    //Execute a loop over the columns.
                    foreach (string cell in row.Split(','))
                    {
                        dt.Rows[dt.Rows.Count - 1][i] = cell;
                        i++;
                    }
                }
            }

            return dt;
        }

        public static string GetCSVDataStr(string FilePath)
        {


            //Read the contents of CSV file.
            //string csvData = File.ReadAllText(FilePath);

            //string csvData = File.ReadAllLines(FilePath);
            var lines = File.ReadAllLines(FilePath).Select(a => a.Split(','));
            var csv = from line in lines
                      select (from piece in line
                              select piece);

            string csvData = "";


            string csvtojson = CSVToJSON(csvData);


            return csvtojson;
        }
        public static string CSVToJSON(string FileContent)
        {
            string ReturnValue = "";


            var jsonContent = (JArray)JsonConvert.DeserializeObject(FileContent);

            //var csv = ServiceStack.Text.CsvSerializer.SerializeToCsv(jsonContent);
            return ReturnValue;
        }

        public static List<string> loadCsvFile(string filePath)
        {
            var reader = new StreamReader(File.OpenRead(filePath));
            List<string> searchList = new List<string>();

            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                searchList.Add(line);
            }
            return searchList;
        }

        public static string readjsonfile(string filePath)
        {
            var reader = new StreamReader(File.OpenRead(filePath));
            List<string> searchList = new List<string>();
            StringBuilder result = new StringBuilder();
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                searchList.Add(line);
                result.AppendLine(line);
            }
            return result.ToString();
        }

        public static string Convert2JSON(string sourcepath, string destpath)
        {
            string ReturnValue = "";

            string SourcePath = sourcepath;

            string Destpath = destpath;

            StreamWriter sw = new StreamWriter(Destpath);
            var csv = new List<string[]>();
            var lines = System.IO.File.ReadAllLines(SourcePath);
            foreach (string line in lines)
                csv.Add(line.Split(','));
            string json = new
                System.Web.Script.Serialization.JavaScriptSerializer().Serialize(csv);
            sw.Write(json);
            sw.Close();

            ReturnValue = json;
            return ReturnValue;
        }

        public static string csvfullreader(string sourcepath)
        {
            StringBuilder rr = new StringBuilder();
            string returnv = "";
            using (var sr = new StreamReader(sourcepath))
            {
                var reader = new CsvHelper.CsvReader(sr);

                //CSVReader will now read the whole file into an enumerable
                IEnumerable<DataRecord> records = reader.GetRecords<DataRecord>();

                //First 5 records in CSV file will be printed to the Output Window
                foreach (DataRecord record in records.Take(5))
                {
                    rr.AppendFormat("{0} {1}, {2}, {3}, {4}, {5}, {6}", record.FirstName, record.LastName, record.Email,
                        record.Company, record.Position, record.ConnectedOn);
                }
            }
            returnv = rr.ToString();
            return returnv;
        }

        //public static List<LinkedinConnectionsDTO> ReadConnectionsCSV(string SourcePath)
        //{
        //    List<LinkedinConnectionsDTO> LinkedinConnectionsList = new List<LinkedinConnectionsDTO>();
        //    int i = 0;
        //    try
        //    {
        //        using (var sr = new StreamReader(@SourcePath))
        //        //using (var sr = new StreamReader(@"Brian_Connections.csv"))
        //        {
        //            //CsvConfiguration config = new CsvConfiguration()
        //            //{
        //            //    Delimiter = ",",
        //            //    QuoteAllFields = false,
        //            //    IgnoreHeaderWhiteSpace = true,
        //            //    IsHeaderCaseSensitive = false
        //            //};

        //            //CsvReader csv = new CsvReader(sr, config);
        //            //List<LinkedinConnectionsDTO> datlist = new List<LinkedinConnectionsDTO>();
        //            var reader = new CsvReader(sr);

        //            try
        //            {
        //                do
        //                {

        //                    var currentrecord = reader.Read();
        //                    if (currentrecord)
        //                    {
        //                        LinkedinConnectionsDTO record = new LinkedinConnectionsDTO();

        //                        record.FirstName = reader.GetField<string>("First Name");
        //                        record.LastName = reader.GetField<string>("Last Name");
        //                        record.Email = reader.GetField<string>("Email Address");
        //                        record.Company = reader.GetField<string>("Company");
        //                        record.Position = reader.GetField<string>("Position");
        //                        record.ConnectedOn = reader.GetField<string>("Connected On");

        //                        LinkedinConnectionsList.Add(record);

        //                        if (record.FirstName == "Rohith kumar")
        //                        {
        //                            var breakk = "break";
        //                        }
        //                        i++;
        //                    }
        //                    else
        //                    {
        //                        break;
        //                    }

        //                } while (true);
        //            }
        //            catch (Exception exp)
        //            {
        //                //nothing
        //                var error = exp.ToString();
        //            }

        //            return LinkedinConnectionsList;
        //        }
        //    }
        //    catch (Exception exp)
        //    {

        //    }


        //    return null;
        //}

    }

    class DataRecord
    {
        //Should have properties which correspond to the Column Names in the file
        //i.e. CommonName,FormalName,TelephoneCode,CountryCode
        public String FirstName { get; set; }
        public String LastName { get; set; }
        public String Email { get; set; }
        public String Company { get; set; }
        public String Position { get; set; }
        public String ConnectedOn { get; set; }
    }
}