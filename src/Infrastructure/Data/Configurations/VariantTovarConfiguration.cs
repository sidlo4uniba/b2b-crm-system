using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class VariantTovarConfiguration : IEntityTypeConfiguration<VariantTovar>
{
    public void Configure(EntityTypeBuilder<VariantTovar> builder)
    {
        builder.HasOne(v => v.Tovar)
               .WithMany(t => t.Varianty)
               .HasForeignKey(v => v.TovarId)
               .IsRequired()
               .OnDelete(DeleteBehavior.Restrict);

        builder.Property(v => v.FarbaHex)
            .HasMaxLength(7);

        builder.OwnsOne(v => v.Velkost);

        builder.Property(v => v.Cena)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(v => v.ObrazokURL);

        builder.HasIndex(v => v.TovarId);

        builder.Property(v => v.Aktivny)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(v => v.Aktivny);
    }
} 
