using CRMBackend.Application.Common.Models;

namespace CRMBackend.Application.Tovary.Queries.GetTovar;

public record TovarDetailDTO : BaseAuditableDto
{
    public required int DodavatelId { get; init; }
    public required string DodavatelNazovFirmy { get; init; }
    public required string DodavatelEmail { get; init; }
    public required string DodavatelTelefon { get; init; }
    
    public required string InterneId { get; init; }
    public required string Nazov { get; init; }
    public string? ObrazokURL { get; init; }
    public required int KategoriaId { get; init; }
    public string? Ean { get; init; }
    public required decimal Cena { get; init; }
    public required bool Aktivny { get; init; }
    public required List<VariantTovarDTO> Varianty { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.AggregateRoots.TovarAggregate.Tovar, TovarDetailDTO>()
                .ForMember(dest => dest.Varianty, opt => opt.MapFrom(src => src.Varianty));
        }
    }
} 
