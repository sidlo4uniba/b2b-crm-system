namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.DownloadCenovaPonuka;

public class InvoiceFileResponse
{
    public byte[] FileContents { get; }
    public string FileName { get; }
    public string ContentType { get; } = "application/pdf";

    public InvoiceFileResponse(byte[] fileContents, string cenovaPonukaNumber)
    {
        FileContents = fileContents;
        FileName = $"Faktura-{cenovaPonukaNumber}.pdf";
    }
} 