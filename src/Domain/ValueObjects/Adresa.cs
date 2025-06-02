using CRMBackend.Domain.Common;

namespace CRMBackend.Domain.ValueObjects;

public class Adresa : ValueObject
{
    public required string Ulica { get; init; }
    public required string Mesto { get; init; }
    public required string PSC { get; init; }
    public string? Krajina { get; init; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Ulica;
        yield return Mesto;
        yield return PSC;
        yield return Krajina ?? string.Empty;
    }
} 
