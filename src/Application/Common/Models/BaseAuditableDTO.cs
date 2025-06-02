namespace CRMBackend.Application.Common.Models;

public abstract record BaseAuditableDto
{
    public required int Id { get; init; }
    public required DateTimeOffset VytvoreneDna { get; set; }
    public string? VytvorilUzivatel { get; set; }
    public required DateTimeOffset UpraveneDna { get; set; }
    public string? UpravilUzivatel { get; set; }
}
