using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace UELPM.Util.StringOperations
{
    public class StringOperations
    {
        public static bool IsNullOrEmpty(string value)
        {
            bool _returnVal = false;
            if (string.IsNullOrEmpty(value))
            {
                _returnVal = true;
            }
            else
            {
                _returnVal = (value == "null" || value == "[object Object]" || value == "undefined" || value == "(null)") ? true : false;
            }
            return _returnVal;
        }

        public static bool CompareConditon(double dbvalue, double value, string conditionOperator)
        {
            bool result = false;
            switch (conditionOperator)
            {
                case "<":
                    if (value < dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "==":
                    if (dbvalue == value)
                    {
                        result = true;
                    }
                    break;
                case ">":
                    if (value > dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "<=":
                    if (value <= dbvalue)
                    {
                        result = true;
                    }
                    break;
                case ">=":
                    if (value >= dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "!=":
                    if (value != dbvalue)
                    {
                        result = true;
                    }

                    break;
            }


            return result;
        }

        public static bool IsNumbersOnly(string s)
        {
            if (s == null || s == string.Empty)
                return false;

            try
            {
                double number = 0;
                if (double.TryParse(s, out number))
                {
                    return true;
                }
            }
            catch (Exception ex)
            {

                return false;
            }

            foreach (char c in s)
            {
                if (c == '.')
                {
                    continue;
                }
                if (c < '0' || c > '9') // Avoid using .IsDigit or .IsNumeric as they will return true for other characters
                    return false;
            }

            return true;
        }

        public static string PascalCase(string value)
        {
            return Regex.Replace(value, @"([a-z])([A-Z])", "$1 $2");
        }

        public static bool HasDraftCode(string value)
        {
            bool _returnVal = false;
            if (string.IsNullOrEmpty(value))
            {
                _returnVal = true;
            }
            else
            {
                _returnVal = (value.IndexOf('D') == 0) ? true : false;
            }
            return _returnVal;
        }

        public static string ToSentence(string Input)
        {
            return new string(Input.SelectMany((c, i) => i > 0 && char.IsUpper(c) ? new[] { ' ', c } : new[] { c }).ToArray());
        }
    }
}
