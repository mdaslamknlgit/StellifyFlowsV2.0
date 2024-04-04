using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.tool.xml;
using iTextSharp.tool.xml.pipeline;
using System;
using UELPM.Model.Models;

namespace UELPM.Util.PdfGenerator
{
    public class HeaderFooter : PdfPageEventHelper
    {
        private ElementList HeaderElements { get; set; }
        private ElementList FooterElements { get; set; }
        private string WaterMarkText { get; set; }
        private Position _Position { get; set; }
        public HeaderFooter(ElementList headerElements, ElementList footerElements, Position position, string watermarkText = "")
        {
            HeaderElements = headerElements;
            FooterElements = footerElements;
            if (position == null)
                _Position = new Position();
            else
                _Position = position;
            WaterMarkText = watermarkText;
        }

        public override void OnStartPage(PdfWriter writer, Document document)
        {
            float fontSize = 75;
            float xPosition = 300;
            float yPosition = 400;
            float angle = 45;
            try
            {
                PdfContentByte under = writer.DirectContentUnder;
                BaseFont baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.EMBEDDED);
                under.BeginText();
                under.SetColorFill(BaseColor.LIGHT_GRAY);
                under.SetFontAndSize(baseFont, fontSize);
                under.ShowTextAligned(PdfContentByte.ALIGN_CENTER, WaterMarkText, xPosition, yPosition, angle);
                under.EndText();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
            }
        }

        public override void OnEndPage(PdfWriter writer, Document document)
        {
            try
            {
                ColumnText headerText = new ColumnText(writer.DirectContent);
                foreach (IElement e in HeaderElements)
                {
                    headerText.AddElement(e);
                }
                headerText.SetSimpleColumn(document.Left, document.Top - 15, document.Right, document.GetTop(-80), 10, Element.ALIGN_MIDDLE);
                headerText.Go();

                ColumnText footerText = new ColumnText(writer.DirectContent);
                foreach (IElement e in FooterElements)
                {
                    footerText.AddElement(e);
                }
                footerText.SetSimpleColumn(document.Left, document.Bottom + _Position.lly, document.Right, document.GetBottom(_Position.ury), 10, Element.ALIGN_MIDDLE);
                footerText.Go();
            }
            catch (DocumentException de)
            {
                throw new Exception(de.Message);
            }
        }

        public class HtmlElementHandler : IElementHandler
        {
            public ElementList Elements { get; set; }

            public HtmlElementHandler()
            {
                Elements = new ElementList();
            }

            public ElementList GetElements()
            {
                return Elements;
            }

            public void Add(IWritable w)
            {
                if (w is WritableElement)
                {
                    foreach (IElement e in ((WritableElement)w).Elements())
                    {
                        Elements.Add(e);
                    }
                }
            }
        }

        public class Position
        {
            public float llx { get; set; }
            public float lly { get; set; } = 0;
            public float urx { get; set; }
            public float ury { get; set; } = -80;
            public float leading { get; set; }
            public Element alignment { get; set; }
        }
    }
}
