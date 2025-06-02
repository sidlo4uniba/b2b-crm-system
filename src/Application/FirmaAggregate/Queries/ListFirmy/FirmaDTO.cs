using AutoMapper;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.FirmaAggregate.Queries.ListFirmy;

public record FirmaDTO : BaseAuditableDto
{
    public required string Nazov { get; init; }
    public required string ICO { get; init; }
    public required Adresa Adresa { get; init; }
    public string? IcDph { get; init; }
    public decimal SkoreSpolahlivosti { get; init; }
    public decimal HodnotaObjednavok { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap< Firma, FirmaDTO >();
        }
    }
}
