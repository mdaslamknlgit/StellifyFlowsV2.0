using System.IO;

namespace UELPM.Util.PdfGenerator
{
    public static class ReadHtml
    {
        public static string RetrieveTemplate(string folderName, string templateName)
        {
            var filePath1 = Path.Combine($"{folderName}\\{templateName}.html");
            var filePath = System.Web.Hosting.HostingEnvironment.MapPath("~/" + filePath1);
            using (var rdr = System.IO.File.OpenText(filePath))
            {
                return rdr.ReadToEnd();
            }
        }
        public static string RetrieveFile(string folderName, string filename,string format)
        {
            var filePath1 = Path.Combine($"{folderName}\\{filename}.{format}");
            var filePath = System.Web.Hosting.HostingEnvironment.MapPath("~/" + filePath1);
            using (var rdr = System.IO.File.OpenText(filePath))
            {
                return rdr.ReadToEnd();
            }
        }
    }
}
