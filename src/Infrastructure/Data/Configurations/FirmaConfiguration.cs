using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class FirmaConfiguration : IEntityTypeConfiguration<Firma>
{
    public void Configure(EntityTypeBuilder<Firma> builder)
    {
        builder.Property(f => f.Nazov)
               .IsRequired();

        builder.Property(f => f.ICO)
               .IsRequired();

        builder.Property(f => f.IcDph);

        builder.OwnsOne(f => f.Adresa);

        builder.Property(f => f.SkoreSpolahlivosti)
               .HasColumnType("decimal(3,2)")
               .HasDefaultValue(0.7m);

        builder.Property(f => f.HodnotaObjednavok)
               .HasColumnType("decimal(18,2)");

        builder.HasMany(f => f.KontaktneOsoby)
               .WithOne(ko => ko.Firma)
               .HasForeignKey(ko => ko.FirmaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(f => f.Objednavky)
               .WithOne(o => o.Firma)
               .HasForeignKey(o => o.FirmaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => f.Nazov);
        builder.HasIndex(f => f.ICO).IsUnique();
        builder.HasIndex(f => f.IcDph).IsUnique();
        builder.HasIndex(f => f.SkoreSpolahlivosti);
    }
}
