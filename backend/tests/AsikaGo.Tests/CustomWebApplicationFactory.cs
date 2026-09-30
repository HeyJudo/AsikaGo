using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;

namespace AsikaGo.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set the environment to Development for testing
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            // Add InMemory database for testing
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
                options.UseSnakeCaseNamingConvention();
            });

            // Build the service provider and create the database
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();

            // Seed test data
            InitializeTestData(db);
        });
    }

    private void InitializeTestData(AppDbContext db)
    {
        if (db.BusinessCategories.Any())
        {
            return;
        }

        var categories = new List<BusinessCategory>
        {
            new BusinessCategory
            {
                Id = Guid.NewGuid(),
                Name = "Food and Beverage",
                Description = "Restaurants, cafes, and food stalls."
            },
            new BusinessCategory
            {
                Id = Guid.NewGuid(),
                Name = "Retail",
                Description = "Selling goods directly to consumers."
            },
            new BusinessCategory
            {
                Id = Guid.NewGuid(),
                Name = "Services",
                Description = "Offering skills or labor rather than goods."
            }
        };

        db.BusinessCategories.AddRange(categories);
        db.SaveChanges();
    }
}