namespace CRMBackend.Infrastructure.Data.Seeders;

public interface IDataSeeder
{
    Task SeedAsync(ApplicationDbContext dbContext);
    int Order { get; }
} 