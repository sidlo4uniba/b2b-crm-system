using AutoMapper;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;

namespace CRMBackend.Application.DodavatelAggregate.Queries.GetDodavatel;

public record TovarDTO : BaseAuditableDto
{
    public required string InterneId { get; init; }
    public required string Nazov { get; init; }
    public string? ObrazokURL { get; init; }
    public required KategoriaProduktu Kategoria { get; init; }
    public int KategoriaId { get; init; }
    public string? Ean { get; init; }
    public required decimal Cena { get; init; }
    public bool Aktivny { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Tovar, TovarDTO>();
        }
    }
} 
