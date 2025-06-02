namespace CRMBackend.Domain.Common;

public abstract class BaseAuditableEntity : BaseEntity
{
    public DateTimeOffset VytvoreneDna { get; set; }

    public string? VytvorilUzivatel { get; set; }

    public DateTimeOffset UpraveneDna { get; set; }

    public string? UpravilUzivatel { get; set; }
}
