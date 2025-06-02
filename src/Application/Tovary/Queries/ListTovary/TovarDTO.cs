using CRMBackend.Application.Common.Models;

namespace CRMBackend.Application.Tovary.Queries.ListTovary;

public record TovarDTO : BaseAuditableDto
{
    public required int DodavatelId { get; init; }
    public required string DodavatelNazovFirmy { get; init; }
    public required string DodavatelEmail { get; init; }
    public required string DodavatelTelefon { get; init; }

    public required string InterneId { get; init; }
    public required string Nazov { get; init; }
    public string? ObrazokURL { get; init; }
    public required int KategoriaId { get; init; }
    public string? Ean { get; init; }
    public required decimal Cena { get; init; }
    public required bool Aktivny { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.AggregateRoots.TovarAggregate.Tovar, TovarDTO>();
        }
    }
} 
