using AutoMapper;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Application.Common.DTOs.Invoices;

public class InvoiceDTO
{
    public required int FirmaId { get; init; }
    public required string NazovFirmy { get; init; }
    public required string ICO { get; init; }
    public string? IcDph { get; init; }
    public required Adresa Adresa { get; init; }
    
    public required string KontaktnaOsobaMeno { get; init; }
    public required string KontaktnaOsobaPriezvisko { get; init; }
    public required string KontaktnaOsobaEmail { get; init; }
    public required string KontaktnaOsobaTelefon { get; init; }
    
    public required int CenovaPonukaId { get; init; }
    public required decimal FinalnaCena { get; init; }
    public required DateTime DatumVystavenia { get; init; }
    public required DateTime DatumSplatnosti { get; init; }
    public required string CisloDokumentu { get; init; }
    
    public required IEnumerable<InvoiceItemDTO> Polozky { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CenovaPonuka, InvoiceDTO>()
                .ForMember(dest => dest.CenovaPonukaId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FinalnaCena, opt => opt.MapFrom(src => src.FinalnaCena))
                .ForMember(dest => dest.FirmaId, opt => opt.MapFrom(src => src.Objednavka.FirmaId))
                .ForMember(dest => dest.NazovFirmy, opt => opt.MapFrom(src => src.Objednavka.Firma.Nazov))
                .ForMember(dest => dest.ICO, opt => opt.MapFrom(src => src.Objednavka.Firma.ICO))
                .ForMember(dest => dest.IcDph, opt => opt.MapFrom(src => src.Objednavka.Firma.IcDph))
                .ForMember(dest => dest.Adresa, opt => opt.MapFrom(src => src.Objednavka.Firma.Adresa))
                .ForMember(dest => dest.KontaktnaOsobaMeno, opt => opt.MapFrom(src => src.Objednavka.KontaktnaOsoba.Meno))
                .ForMember(dest => dest.KontaktnaOsobaPriezvisko, opt => opt.MapFrom(src => src.Objednavka.KontaktnaOsoba.Priezvisko))
                .ForMember(dest => dest.KontaktnaOsobaEmail, opt => opt.MapFrom(src => src.Objednavka.KontaktnaOsoba.Email))
                .ForMember(dest => dest.KontaktnaOsobaTelefon, opt => opt.MapFrom(src => src.Objednavka.KontaktnaOsoba.Telefon))
                .ForMember(dest => dest.DatumVystavenia, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.DatumSplatnosti, opt => opt.MapFrom(src => DateTime.UtcNow.AddDays(14)))
                .ForMember(dest => dest.CisloDokumentu, opt => opt.MapFrom(src => $"FV-{DateTime.UtcNow.Year}-{src.Id:D6}"))
                .ForMember(dest => dest.Polozky, opt => opt.MapFrom(src => src.Polozky));
        }
    }
}

public class InvoiceItemDTO
{
    public required int Id { get; init; }
    public required string NazovTovaru { get; init; }
    public required string InterneId { get; init; }
    public required int Mnozstvo { get; init; }
    public required decimal JednotkovaCena { get; init; }
    public required decimal CelkovaCena { get; init; }
    public string? FarbaHex { get; init; }
    public string? VelkostKod { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CenovaPonukaTovar, InvoiceItemDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.NazovTovaru, opt => opt.MapFrom(src => src.Tovar!.Nazov))
                .ForMember(dest => dest.InterneId, opt => opt.MapFrom(src => src.Tovar!.InterneId))
                .ForMember(dest => dest.Mnozstvo, opt => opt.MapFrom(src => src.Mnozstvo))
                .ForMember(dest => dest.JednotkovaCena, opt => opt.MapFrom(src => 
                   (src.VariantTovar != null && src.VariantTovar.Cena != 0)
                            ? src.VariantTovar.Cena
                            : src.Tovar!.Cena
                ))
                .ForMember(dest => dest.CelkovaCena, opt => opt.MapFrom(src => 
                    ((src.VariantTovar != null && src.VariantTovar.Cena != 0)
                            ? src.VariantTovar.Cena
                            : src.Tovar!.Cena) * src.Mnozstvo
                ))
                .ForMember(dest => dest.FarbaHex, opt => opt.MapFrom(src =>
                    src.VariantTovar != null ? src.VariantTovar.FarbaHex : null))
                .ForMember(dest => dest.VelkostKod, opt => opt.MapFrom(src =>
                    src.VariantTovar != null && src.VariantTovar.Velkost != null ? src.VariantTovar.Velkost.Code : null));
        }
    }
} 
