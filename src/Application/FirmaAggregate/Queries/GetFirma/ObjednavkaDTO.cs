using AutoMapper;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;

namespace CRMBackend.Application.FirmaAggregate.Queries.GetFirma;

public record ObjednavkaDTO : BaseAuditableDto
{
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
            CreateMap< Objednavka, ObjednavkaDTO >();
        }
    }
} 
