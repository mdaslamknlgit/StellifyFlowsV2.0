using Mustache;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Util.StringOperations
{
    public static class EmailBody
    {
        public static string PrepareBodyFromHtml<T>(string html, T data)
        {
            string htmlString = html;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string result = generator.Render(JObject.Parse(JsonConvert.SerializeObject(data)));
            return result;
        }
    }
}
