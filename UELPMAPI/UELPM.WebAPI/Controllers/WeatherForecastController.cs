using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using System.IO;
using System.Net.Http.Formatting;
using Newtonsoft.Json;
using System.Collections.Specialized;
using System.Net.Http.Headers;
using UELPM.Service.Repositories;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class WeatherForecastController : ApiController
    {
		private static readonly string[] Summaries = new[]
				{
			"Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
		};

		private readonly ILogger<WeatherForecastController> logger;

		public WeatherForecastController(ILogger<WeatherForecastController> logger)
		{
			this.logger = logger;
		}

		[HttpGet]
		[CacheControl(MaxAge = 0)]
		[Route("api/WeatherForecast/Get")]
		public IHttpActionResult Get(System.Threading.CancellationToken cancel) // NOTE: RETURN TYPE IS IActionResult
		{
			var rng = new Random();
			var data = Enumerable.Range(1, 2000).Select(index => new WeatherForecast // NOTE: NOTICE THE SIZE OF THE ARRAY
			{
				Date = DateTime.Now.AddDays(index),
				TemperatureC = rng.Next(-20, 55),
				Summary = Summaries[rng.Next(Summaries.Length)]
			});
			var json = System.Text.Json.JsonSerializer.Serialize(data);
			if (!string.IsNullOrEmpty(Request.Headers["Accept-Encoding"]))
			{
				var encodings = Request.Headers["Accept-Encoding"].ToString().Split(',', StringSplitOptions.TrimEntries);
				if (Array.IndexOf(encodings, "br") > -1)
				{
					Response.Headers.Append("Content-Encoding", "br");
					var compressedBytes = await Compressor.BrotliCompressBytesAsync(System.Text.Encoding.UTF8.GetBytes(json), cancel);
					return File(compressedBytes, "application/json");
				}
				if (Array.IndexOf(encodings, "gzip") > -1)
				{
					Response.Headers.Append("Content-Encoding", "gzip");
					var compressedBytes = await Compressor.GZipCompressBytesAsync(System.Text.Encoding.UTF8.GetBytes(json), cancel);
					return File(compressedBytes, "application/json");
				}
			}
			Response.ContentType = "application/json"; // ADD THE CONTENT TYPE
			return Content(json); // return non-compressed data
		}
	}

	internal class Compressor
	{
		public static async Task<byte[]> BrotliCompressBytesAsync(byte[] bytes, System.Threading.CancellationToken cancel)
		{
			using (var outputStream = new MemoryStream())
			{
				using (var compressionStream = new BrotliStream(outputStream, CompressionLevel.Optimal))
				{
					await compressionStream.WriteAsync(bytes, 0, bytes.Length, cancel);
				}
				return outputStream.ToArray();
			}
		}
		public static async Task<byte[]> GZipCompressBytesAsync(byte[] bytes, System.Threading.CancellationToken cancel)
		{
			using (var outputStream = new MemoryStream())
			{
				using (var compressionStream = new GZipStream(outputStream, CompressionLevel.Optimal))
				{
					await compressionStream.WriteAsync(bytes, 0, bytes.Length, cancel);
				}
				return outputStream.ToArray();
			}
		}
	}
}