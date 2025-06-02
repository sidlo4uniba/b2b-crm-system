using AutoMapper;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.GetObjednavka;

public record CenovaPonukaDTO
{
    public int Id { get; init; }
    public decimal FinalnaCena { get; init; }
    public StavCenovejPonuky Stav { get; init; }
    public required IEnumerable<CenovaPonukaTovarDTO> Polozky { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CenovaPonuka, CenovaPonukaDTO>();
        }
    }
} 
