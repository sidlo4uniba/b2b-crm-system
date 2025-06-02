using AutoMapper;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.ValueObjects;
using CRMBackend.Application.Common.Models;


namespace CRMBackend.Application.DodavatelAggregate.Queries.GetDodavatel;

public record DodavatelDetailDTO : BaseAuditableDto
{
    public required string NazovFirmy { get; init; }
    public required string Email { get; init; }
    public required string Telefon { get; init; }
    public Adresa? Adresa { get; init; }
    public string? Poznamka { get; init; }
    public bool Aktivny { get; init; }
    public required IReadOnlyCollection<TovarDTO> Tovary { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Dodavatel, DodavatelDetailDTO>();
        }
    }
} 
