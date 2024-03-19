using ExcelDataReader;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;

namespace UELPM.Service.ExcelUpload
{
    public class ExcelReader
    {
        string _path;
        Stream _stream;

        public ExcelReader(string path)
        {
            _path = path;
        }

        public ExcelReader(Stream excel)
        {
            _stream = excel;
        }

        public IExcelDataReader GetExcelReader()
        {
            // ExcelDataReader works with the binary Excel file, so it needs a FileStream
            // to get started. This is how we avoid dependencies on ACE or Interop:
            FileStream stream = File.Open(_path, FileMode.Open, FileAccess.Read);

            // We return the interface, so that
            IExcelDataReader reader = null;
            try
            {
                if (_path.EndsWith(".xls"))
                {
                    reader = ExcelReaderFactory.CreateBinaryReader(stream);
                }
                if (_path.EndsWith(".xlsx"))
                {
                    reader = ExcelReaderFactory.CreateOpenXmlReader(stream);
                }
                return reader;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IExcelDataReader GetExcelReaderStream()
        {
            // ExcelDataReader works with the binary Excel file, so it needs a FileStream
            // to get started. This is how we avoid dependencies on ACE or Interop:
            Stream stream = _stream;

            // We return the interface, so that
            IExcelDataReader reader = null;
            try
            {
                //if (_path.EndsWith(".xls"))
                //{
                // reader = ExcelReaderFactory.CreateBinaryReader(stream);
                //}
                //if (_path.EndsWith(".xlsx"))
                //{
                reader = ExcelReaderFactory.CreateOpenXmlReader(stream);
                //}
                return reader;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IEnumerable<string> getWorksheetNames()
        {
            var reader = this.GetExcelReader();
            var workbook = reader.AsDataSet();
            var sheets = from DataTable sheet in workbook.Tables select sheet.TableName;
            return sheets;
        }

        public IEnumerable<DataRow> GetFileData(string sheet, bool firstRowIsColumnNames = true)
        {
            var reader = this.GetExcelReader();
            //reader.IsFirstRowAsColumnNames = firstRowIsColumnNames;

            var result = reader.AsDataSet(new ExcelDataSetConfiguration()
            {
                ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                {
                    UseHeaderRow = true
                }
            }).Tables[sheet];

            //var rows = from DataRow a in workSheet.Rows select a;
            //this is older code
            //var filteredRows = workSheet.Rows.Cast<DataRow>().Where(row => row.ItemArray.Any(field => !(field is System.DBNull)));//remove blank data row from excel table
            //return filteredRows;


            //var workSheet = reader.AsDataSet().Tables[sheet];
            var workSheet1 = result;
            var FilteredRows = workSheet1.Rows.Cast<DataRow>().Where(row => row.ItemArray.Any(field => !(field is System.DBNull)));//remove blank data row from excel table

            return FilteredRows;

        }

        public IEnumerable<DataRow> GetData(string sheet, bool firstRowIsColumnNames = true)
        {
            var reader = this.GetExcelReaderStream();
            //reader.IsFirstRowAsColumnNames = firstRowIsColumnNames;

            var result = reader.AsDataSet(new ExcelDataSetConfiguration()
            {
                ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                {
                    UseHeaderRow = true
                }
            }).Tables[sheet];
            var workSheet1 = result;
            var FilteredRows = workSheet1.Rows.Cast<DataRow>().Where(row => row.ItemArray.Any(field => !(field is System.DBNull)));//remove blank data row from excel table

            return FilteredRows;

        }


        public IEnumerable<DataRow> GetDataBySheetId(int SheetId, string sheet, bool firstRowIsColumnNames = true)
        {
            DataTable SheetData = null;
            string ActualSheetName = "Reward History";
            string SheetName = "Reward History";
            DataSet ResultDataSet = null;

            IEnumerable<DataRow> RetDS = null;

            var reader = this.GetExcelReaderStream();

            SheetName = reader.AsDataSet().Tables[SheetId].TableName;

            if (ActualSheetName == SheetName)
            {
                var result = reader.AsDataSet(new ExcelDataSetConfiguration()
                {
                    ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                    {
                        UseHeaderRow = true
                    }
                }).Tables[sheet];
                SheetData = result;
            }
            else
            {
                var result = reader.AsDataSet(new ExcelDataSetConfiguration()
                {
                    ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                    {
                        UseHeaderRow = true
                    }
                }).Tables[SheetId];
                SheetData = result;
            }


            RetDS = SheetData.Rows.Cast<DataRow>().Where(row => row.ItemArray.Any(field => !(field is System.DBNull)));//remove blank data row from excel table

            return RetDS;

        }
    }
}