using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class ObjednavkaConfiguration : IEntityTypeConfiguration<Objednavka>
{
    public void Configure(EntityTypeBuilder<Objednavka> builder)
    {
        builder.HasMany(o => o.CenovePonuky)
               .WithOne(cp => cp.Objednavka)
               .HasForeignKey(cp => cp.ObjednavkaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.PoslednaCenovaPonuka)
               .WithOne()
               .HasForeignKey<Objednavka>(o => o.PoslednaCenovaPonukaId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Firma)
               .WithMany(f => f.Objednavky)
               .HasForeignKey(o => o.FirmaId)
               .IsRequired()
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.KontaktnaOsoba)
               .WithMany()
               .HasForeignKey(o => o.KontaktnaOsobaId)
               .IsRequired()
               .OnDelete(DeleteBehavior.Restrict);

        builder.Property(o => o.Faza)
               .HasConversion<string>();

        builder.Property(o => o.ChybaKlienta)
               .HasConversion<string>();

        builder.Property(o => o.Poznamka);

        builder.HasIndex(o => o.Faza);
        builder.HasIndex(o => o.Zaplatene);
        builder.HasIndex(o => o.Zrusene);
        builder.HasIndex(o => o.NaplanovanyDatumVyroby);
    }
} 
