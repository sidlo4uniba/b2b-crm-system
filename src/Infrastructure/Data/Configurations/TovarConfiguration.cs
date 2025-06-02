using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class TovarConfiguration : IEntityTypeConfiguration<Tovar>
{
    public void Configure(EntityTypeBuilder<Tovar> builder)
    {
        builder.Property(t => t.InterneId)
            .IsRequired();

        builder.Property(t => t.Nazov)
            .IsRequired();

        builder.Property(t => t.ObrazokURL);

        builder.Property(t => t.Ean);

        builder.Property(t => t.Cena)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(t => t.Aktivny)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(t => t.Kategoria)
            .WithMany()
            .HasForeignKey(t => t.KategoriaId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.Varianty)
            .WithOne(v => v.Tovar)
            .HasForeignKey(v => v.TovarId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.InterneId).IsUnique();
        builder.HasIndex(t => t.Ean).IsUnique();
        builder.HasIndex(t => t.Nazov);
        builder.HasIndex(t => t.KategoriaId);
        builder.HasIndex(t => t.Aktivny);
    }
} 
