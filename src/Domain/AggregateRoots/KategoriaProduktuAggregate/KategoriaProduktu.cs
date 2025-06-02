using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;

[EntityFilter(Prefix = "")]
public class KategoriaProduktu : BaseAuditableEntity, IAggregateRoot
{
    public required string Nazov { get; set; }
} 
