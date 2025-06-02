using AutoMapper;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Enums;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.GetObjednavka;

public record CenovaPonukaTovarDTO
{
    public required int Id { get; init; }
    public required string NazovTovaru { get; init; }
    public required string InterneId { get; init; }
    public required int KategoriaId { get; init; }
    public required int TovarId { get; init; }
    public int? VariantTovarId { get; init; }
    public required int Mnozstvo { get; init; }
    public required decimal Cena { get; init; }
    public required bool JeVariantTovaru { get; init; }
    public Velkost? Velkost { get; init; }
    public String? FarbaHex { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CenovaPonukaTovar, CenovaPonukaTovarDTO>()
                .ForMember(dest => dest.NazovTovaru, opt => opt.MapFrom(src => src.Tovar!.Nazov))
                .ForMember(dest => dest.InterneId, opt => opt.MapFrom(src => src.Tovar!.InterneId))
                .ForMember(dest => dest.KategoriaId, opt => opt.MapFrom(src => src.Tovar!.KategoriaId))
                .ForMember(dest => dest.TovarId, opt => opt.MapFrom(src => src.TovarId))
                .ForMember(dest => dest.VariantTovarId, opt => opt.MapFrom(src => src.VariantTovarId))
                .ForMember(dest => dest.JeVariantTovaru, opt => opt.MapFrom(src =>
                    src.JeVariantTovaru))
                .ForMember(dest => dest.Velkost, opt => opt.MapFrom(src =>
                    src.VariantTovar != null ? src.VariantTovar.Velkost : null))
                .ForMember(dest => dest.FarbaHex, opt => opt.MapFrom(src =>
                    src.VariantTovar != null ? src.VariantTovar.FarbaHex : null))
                .ForMember(dest => dest.Cena, opt => opt.MapFrom(src =>
                    src.CenovaPonuka.Stav == StavCenovejPonuky.Poslane ||
                    src.CenovaPonuka.Stav == StavCenovejPonuky.Schvalene ||
                    src.CenovaPonuka.Stav == StavCenovejPonuky.Zrusene
                        ? src.PovodnaCena
                        : (src.VariantTovar != null && src.VariantTovar.Cena != 0)
                            ? src.VariantTovar.Cena
                            : src.Tovar!.Cena
                    ));
        }
    }
}
