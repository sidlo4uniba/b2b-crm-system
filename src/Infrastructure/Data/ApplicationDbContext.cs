using System.Reflection;
using CRMBackend.Application.Common.Interfaces;
using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Entities;
using CRMBackend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<TodoList> TodoLists => Set<TodoList>();

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    public DbSet<Objednavka> Objednavky => Set<Objednavka>();
    public DbSet<CenovaPonuka> CenovePonuky => Set<CenovaPonuka>();
    public DbSet<CenovaPonukaTovar> CenovaPonukaTovary => Set<CenovaPonukaTovar>();
    public DbSet<Firma> Firmy => Set<Firma>();
    public DbSet<KontaktnaOsoba> KontaktneOsoby => Set<KontaktnaOsoba>();
    public DbSet<Tovar> Tovary => Set<Tovar>();
    public DbSet<VariantTovar> VariantyTovarov => Set<VariantTovar>();
    public DbSet<Dodavatel> Dodavatelia => Set<Dodavatel>();
    public DbSet<KategoriaProduktu> KategorieProduktov => Set<KategoriaProduktu>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(builder);
    }
}
