using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class CenovaPonukaConfiguration : IEntityTypeConfiguration<CenovaPonuka>
{
    public void Configure(EntityTypeBuilder<CenovaPonuka> builder)
    {
        builder.HasOne(cp => cp.Objednavka)
               .WithMany(o => o.CenovePonuky)
               .HasForeignKey(cp => cp.ObjednavkaId)
               .IsRequired();

        builder.HasMany(cp => cp.Polozky)
               .WithOne(cpt => cpt.CenovaPonuka)
               .HasForeignKey(cpt => cpt.CenovaPonukaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.Property(cp => cp.Stav)
               .HasConversion<string>();

        builder.Property(cp => cp.FinalnaCena)
               .HasColumnType("decimal(18,2)");

        builder.HasIndex(cp => cp.Stav);
    }
} 