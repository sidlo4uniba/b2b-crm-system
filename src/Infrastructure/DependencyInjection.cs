using Keycloak.AuthServices.Authentication;
using Keycloak.AuthServices.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using CRMBackend.Application.Common.Interfaces;
using CRMBackend.Domain.Constants;
using CRMBackend.Infrastructure.Data;
using CRMBackend.Infrastructure.Data.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;
using CRMBackend.Infrastructure.Data.Repositories;
using CRMBackend.Infrastructure.Identity;
using CRMBackend.Infrastructure.Data.Seeders;
using CRMBackend.Application.Common.Interfaces.Services;
using CRMBackend.Infrastructure.Services.Invoices;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("CRMBackendDb");
        Guard.Against.Null(connectionString, message: "Connection string 'CRMBackendDb' not found.");
        
        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseNpgsql(connectionString);
            
            options.ConfigureWarnings(warnings =>
            {
                warnings.Log(RelationalEventId.PendingModelChangesWarning);
            });

        });

        builder.Services.AddScoped<ApplicationDbContextInitialiser>();
        
        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();
        
        builder.Services.AddScoped(typeof(IWriteRepository<>), typeof(WriteRepository<>));
        builder.Services.AddScoped(typeof(IReadRepository<>), typeof(ReadRepository<>));
        
        
        builder.Services.AddScoped<ICurrentUser, CurrentUser>();

        builder.Services.AddKeycloakWebApiAuthentication(builder.Configuration);
        builder.Services.AddAuthorization(options =>
            {
                // options.AddPolicy(Policies.CanPurge, builder =>
                // {
                //     builder
                //         .RequireRealmRoles("admin");
                // });
            })
            .AddKeycloakAuthorization(builder.Configuration);

        builder.Services.AddScoped<IDataSeeder, DodavatelSeeder>();
        builder.Services.AddScoped<IDataSeeder, FirmaSeeder>();
        builder.Services.AddScoped<IDataSeeder, TovarSeeder>();
        builder.Services.AddScoped<IDataSeeder, ObjednavkaSeeder>();

        // Register invoice generation service
        builder.Services.AddSingleton<IInvoiceGeneratorService, InvoiceGeneratorService>();
    }
}
