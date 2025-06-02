using CRMBackend.Application.Common.DTOs.Invoices;
using CRMBackend.Application.Common.Interfaces.Services;
using Microsoft.Extensions.Logging;
using PuppeteerSharp;
using System.Reflection;
using PuppeteerSharp.BrowserData;
using PuppeteerSharp.Media;
using RazorEngine;
using RazorEngine.Templating;

namespace CRMBackend.Infrastructure.Services.Invoices;

public class InvoiceGeneratorService : IInvoiceGeneratorService
{
    private readonly ILogger<InvoiceGeneratorService> _logger;
    private readonly string _chromiumPath = Path.GetTempPath();

    public InvoiceGeneratorService(ILogger<InvoiceGeneratorService> logger)
    {
        _logger = logger;
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(InvoiceDTO invoiceData)
    {
        try
        {
            var browserFetcher = new BrowserFetcher(new BrowserFetcherOptions { Path = _chromiumPath });
            await browserFetcher.DownloadAsync(Chrome.DefaultBuildId);

            string templateHtml = await LoadTemplateAsync();
            string processedHtml = ProcessTemplate(templateHtml, invoiceData);

            byte[] pdfBytes;
            using (var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                ExecutablePath = browserFetcher.GetExecutablePath(Chrome.DefaultBuildId),
                Args = new[] { "--no-sandbox" }
            }))
            {
                using (var page = await browser.NewPageAsync())
                {
                    await page.EmulateMediaTypeAsync(MediaType.Print);
                    await page.SetContentAsync(processedHtml);
                    await page.WaitForNetworkIdleAsync();

                    pdfBytes = await page.PdfDataAsync(new PdfOptions
                    {
                        PrintBackground = true,
                        MarginOptions = new MarginOptions
                        {
                            Top = "10mm",
                            Bottom = "10mm",
                            Left = "10mm",
                            Right = "10mm"
                        }
                    });
                }
            }

            _logger.LogInformation("Generated invoice PDF for company {CompanyName}, invoice #{InvoiceNumber}",
                invoiceData.NazovFirmy, invoiceData.CisloDokumentu);
            
            return pdfBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating invoice PDF for company {CompanyName}", invoiceData.NazovFirmy);
            throw;
        }
    }

    private async Task<string> LoadTemplateAsync()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = "invoice_htmltemplate";
        
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            throw new FileNotFoundException("Invoice template not found as embedded resource");
        }
        
        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync();
    }

    private string ProcessTemplate(string templateHtml, InvoiceDTO invoiceData)
    {
        try
        {
            string key = $"invoice_{invoiceData.CisloDokumentu}";
            
            if (!Engine.Razor.IsTemplateCached(key, typeof(InvoiceDTO)))
            {
                Engine.Razor.Compile(templateHtml, key, typeof(InvoiceDTO));
            }
            
            return Engine.Razor.Run(key, typeof(InvoiceDTO), invoiceData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing invoice template");
            throw;
        }
    }
} 
