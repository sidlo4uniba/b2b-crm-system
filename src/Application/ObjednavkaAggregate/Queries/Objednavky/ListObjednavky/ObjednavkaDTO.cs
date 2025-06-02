using AutoMapper;
using CRMBackend.Application.Common.Mappings;
using CRMBackend.Application.Common.Models;
using CRMBackend.Application.FirmaAggregate.Queries.ListFirmy;
using CRMBackend.Application.FirmaAggregate.Queries.GetFirma;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.ListObjednavky;

public record ObjednavkaDTO : BaseAuditableDto
{
    public int FirmaId { get; init; }
    public required string FirmaNazov { get; init; }
    public required string FirmaICO { get; init; }
    public int KontaktnaOsobaId { get; init; }
    public required string KontaktnaOsobaMeno { get; init; }
    public required string KontaktnaOsobaPriezvisko { get; init; }
    public required string KontaktnaOsobaTelefon { get; init; }
    public required string KontaktnaOsobaEmail { get; init; }
    
    public ObjednavkaFaza Faza { get; init; }
    public string? Poznamka { get; init; }
    public ChybaKlienta? ChybaKlienta { get; init; }
    public DateTime? OcakavanyDatumDorucenia { get; init; }
    public DateTime? NaplanovanyDatumVyroby { get; init; }
    public bool Zrusene { get; init; }
    public bool Zaplatene { get; init; }
    public int? PoslednaCenovaPonukaId { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Objednavka, ObjednavkaDTO>();
        }
    }
} 
