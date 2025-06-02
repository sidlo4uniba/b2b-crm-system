using AutoMapper;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;

namespace CRMBackend.Application.FirmaAggregate.Queries.GetFirma;

public class KontaktnaOsobaDTO
{
    public int Id { get; init; }
    public required string Meno { get; init; }
    public required string Priezvisko { get; init; }
    public required string Telefon { get; init; }
    public required string Email { get; init; }
    public required bool Aktivny { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap< KontaktnaOsoba, KontaktnaOsobaDTO >();
        }
    }
}
