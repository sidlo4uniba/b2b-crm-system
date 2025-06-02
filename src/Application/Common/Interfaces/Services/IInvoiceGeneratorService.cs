using CRMBackend.Application.Common.DTOs.Invoices;

namespace CRMBackend.Application.Common.Interfaces.Services;

public interface IInvoiceGeneratorService
{
    Task<byte[]> GenerateInvoicePdfAsync(InvoiceDTO invoiceData);
} 