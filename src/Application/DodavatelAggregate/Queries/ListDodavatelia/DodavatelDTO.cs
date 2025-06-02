using AutoMapper;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.DodavatelAggregate.Queries.ListDodavatelia;

public record DodavatelDTO : BaseAuditableDto
{
    public required string NazovFirmy { get; init; }
    public required string Email { get; init; }
    public required string Telefon { get; init; }
    public Adresa? Adresa { get; init; }
    public string? Poznamka { get; init; }
    public bool Aktivny { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Dodavatel, DodavatelDTO>();
        }
    }
} 
