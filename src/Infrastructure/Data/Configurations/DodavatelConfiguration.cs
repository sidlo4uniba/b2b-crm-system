using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations
{
    public class DodavatelConfiguration : IEntityTypeConfiguration<Dodavatel>
    {
        public void Configure(EntityTypeBuilder<Dodavatel> builder)
        {
            builder.Property(d => d.NazovFirmy)
                .IsRequired();

            builder.Property(d => d.Email)
                .IsRequired();

            builder.Property(d => d.Telefon)
                .IsRequired();

            builder.OwnsOne(d => d.Adresa);

            builder.Property(d => d.Aktivny)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasMany(d => d.Tovary)
                .WithOne(t => t.Dodavatel)
                .HasForeignKey(t => t.DodavatelId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(d => d.Aktivny);
        }
    }
} 
