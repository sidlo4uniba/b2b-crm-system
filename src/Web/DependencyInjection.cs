using Azure.Identity;
using CRMBackend.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

using NSwag;
using NSwag.Generation.Processors.Security;
using Plainquire.Filter.Mvc;
using Plainquire.Page.Abstractions;
using Plainquire.Page.Mvc;
using Plainquire.Sort.Mvc;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                if(builder.Environment.IsDevelopment())
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
                else
                {
                    var allowedOrigins = builder.Configuration
                        .GetSection("Cors:AllowedOrigins")
                        .Get<string[]>();
                
                    if (allowedOrigins != null && allowedOrigins.Length > 0)
                    {
                        policy.WithOrigins(allowedOrigins)
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    }
                    else
                    {
                        throw new InvalidOperationException(
                            "Required CORS configuration 'Cors:AllowedOrigins' is missing, empty, " +
                            "or could not be found in appsettings.json or other configuration sources. " +
                            "Application cannot start without defined CORS origins."
                        );
                    }
                }
            });
        });
        
        builder.Services.Configure<PageConfiguration>(c => c.IgnoreParseExceptions = true);

        builder.Services.AddControllers()
            .AddFilterSupport()
            .AddSortSupport()
            .AddPageSupport();
        
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();
        
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();


        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddOpenApiDocument((configure, sp) =>
        {
            configure.Title = "CRMBackend API";
            
            configure.AddSecurity("JWT", Enumerable.Empty<string>(), new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Name = "Authorization",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Type into the textbox: Bearer {your JWT token}."
            });

            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
        });
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }
}
