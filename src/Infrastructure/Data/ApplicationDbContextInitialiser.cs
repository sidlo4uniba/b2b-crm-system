using CRMBackend.Domain.Constants;
using CRMBackend.Infrastructure.Data.Seeders;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace CRMBackend.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();

        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IEnumerable<IDataSeeder> _seeders;
    
    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger, 
        ApplicationDbContext context,
        IEnumerable<IDataSeeder> seeders)
    {
        _logger = logger;
        _context = context;
        _seeders = seeders;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        if(_context.KategorieProduktov.Any() || _context.Tovary.Any() || _context.VariantyTovarov.Any() || 
        _context.Dodavatelia.Any() || _context.Firmy.Any() || _context.Objednavky.Any() || _context.KontaktneOsoby.Any())
        {
            Console.WriteLine("Skipping seeding as data already exists.");
            return;
        }

        Console.WriteLine("Seeding initial data...");

        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                foreach (var seeder in _seeders.OrderBy(s => s.Order))
                {
                    await seeder.SeedAsync(_context);
                }

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
