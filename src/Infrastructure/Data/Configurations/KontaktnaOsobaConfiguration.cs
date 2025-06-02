using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class KontaktnaOsobaConfiguration : IEntityTypeConfiguration<KontaktnaOsoba>
{
    public void Configure(EntityTypeBuilder<KontaktnaOsoba> builder)
    {
        builder.Property(ko => ko.Meno)
               .IsRequired();

        builder.Property(ko => ko.Priezvisko)
               .IsRequired();

        builder.Property(ko => ko.Telefon)
               .IsRequired();

        builder.Property(ko => ko.Email)
               .IsRequired();

        builder.HasOne(ko => ko.Firma)
               .WithMany(f => f.KontaktneOsoby)
               .HasForeignKey(ko => ko.FirmaId)
               .IsRequired();
        
        builder.Property(t => t.Aktivny)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(ko => ko.Email);
        builder.HasIndex(ko => ko.FirmaId);
    }
}
