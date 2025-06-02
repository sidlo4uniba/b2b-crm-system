using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMBackend.Infrastructure.Data.Configurations;

public class CenovaPonukaTovarConfiguration : IEntityTypeConfiguration<CenovaPonukaTovar>
{
    public void Configure(EntityTypeBuilder<CenovaPonukaTovar> builder)
    {
        builder.HasOne(cpt => cpt.CenovaPonuka)
               .WithMany(cp => cp.Polozky)
               .HasForeignKey(cpt => cpt.CenovaPonukaId)
               .IsRequired();

        builder.HasOne(cpt => cpt.Tovar)
               .WithMany()
               .HasForeignKey(cpt => cpt.TovarId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cpt => cpt.VariantTovar)
               .WithMany()
               .HasForeignKey(cpt => cpt.VariantTovarId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.Property(cpt => cpt.PovodnaCena)
               .HasColumnType("decimal(18,2)");

        builder.Property(cpt => cpt.Mnozstvo).IsRequired();
    }
} 