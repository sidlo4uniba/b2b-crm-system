using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;

namespace CRMBackend.Application.KategorieProduktovAggregate.Queries.GetKategorieProduktov;

public class KategorieProduktovDto
{
    public required int Id { get; set; }
    public required string Nazov { get; set; }
    
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<KategoriaProduktu, KategorieProduktovDto>();
        }
    }
} 
