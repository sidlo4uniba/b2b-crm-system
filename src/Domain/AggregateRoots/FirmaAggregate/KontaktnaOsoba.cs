using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.FirmaAggregate;

[EntityFilter(Prefix = "")]
public class KontaktnaOsoba : BaseEntity
{
    public int FirmaId { get; private set; }
    public Firma Firma { get; set; } = null!;
    public required string Meno { get; set; }
    public required string Priezvisko { get; set; }
    public required string Telefon { get; set; }
    public required string Email { get; set; }

    public bool Aktivny { get; set; } = true;
} 
