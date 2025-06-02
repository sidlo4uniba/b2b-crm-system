using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.Tovary.Queries.GetTovar;

public record VariantTovarDTO
{
    public required int Id { get; init; }
    public required int TovarId { get; init; }
    public string? FarbaHex { get; init; }
    public Velkost? Velkost { get; init; }
    public required decimal Cena { get; init; }
    public string? ObrazokURL { get; init; }
    public required bool Aktivny { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.AggregateRoots.TovarAggregate.VariantTovar, VariantTovarDTO>();
        }
    }
} 
