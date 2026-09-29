using AsikaGo.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<BusinessCategory> BusinessCategories => Set<BusinessCategory>();
    public DbSet<BusinessProfile> BusinessProfiles => Set<BusinessProfile>();
    public DbSet<RegistrationStep> RegistrationSteps => Set<RegistrationStep>();
    public DbSet<SourceReference> SourceReferences => Set<SourceReference>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<RoadmapRule> RoadmapRules => Set<RoadmapRule>();
    public DbSet<UserRoadmap> UserRoadmaps => Set<UserRoadmap>();
    public DbSet<RoadmapProgress> RoadmapProgress => Set<RoadmapProgress>();
    public DbSet<RequirementProgress> RequirementProgress => Set<RequirementProgress>();

    // Fixed seed ids so the InitialSchema migration is reproducible.
    // MVP is Pasig-only (D8); ...101 (QC) and ...102 (Manila) were removed by ScopeToPasig.
    private static readonly Guid PasigId = new("11111111-1111-1111-1111-111111111103");

    private static readonly Guid FoodAndBeverageId = new("22222222-2222-2222-2222-222222222201");
    private static readonly Guid RetailId = new("22222222-2222-2222-2222-222222222202");
    private static readonly Guid ServicesId = new("22222222-2222-2222-2222-222222222203");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Profile>(e =>
        {
            e.Property(p => p.Id).ValueGeneratedNever();
            e.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<City>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
            e.HasData(new City { Id = PasigId, Name = "Pasig", Region = "NCR" });
        });

        modelBuilder.Entity<BusinessCategory>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
            e.HasData(
                new BusinessCategory { Id = FoodAndBeverageId, Name = "Food and Beverage", Description = "Restaurants, cafes, and food stalls." },
                new BusinessCategory { Id = RetailId, Name = "Retail", Description = "Selling goods directly to consumers." },
                new BusinessCategory { Id = ServicesId, Name = "Services", Description = "Offering skills or labor rather than goods." });
        });

        modelBuilder.Entity<BusinessProfile>(e =>
        {
            e.Property(b => b.RegistrationStatus).HasConversion<string>().HasMaxLength(20);
            e.Property(b => b.CreatedAt).HasDefaultValueSql("now()");
            e.HasIndex(b => b.UserId);
            e.HasOne(b => b.User).WithMany().HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Category).WithMany().HasForeignKey(b => b.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.City).WithMany().HasForeignKey(b => b.CityId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Requirement>(e =>
        {
            e.HasOne(r => r.Step).WithMany().HasForeignKey(r => r.StepId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Source).WithMany().HasForeignKey(r => r.SourceId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RoadmapRule>(e =>
        {
            e.Property(r => r.Effect).HasConversion<string>().HasMaxLength(10);
            e.HasOne(r => r.Category).WithMany().HasForeignKey(r => r.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.City).WithMany().HasForeignKey(r => r.CityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Step).WithMany().HasForeignKey(r => r.StepId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Requirement).WithMany().HasForeignKey(r => r.RequirementId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserRoadmap>(e =>
        {
            e.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
            e.HasOne(u => u.Business).WithMany().HasForeignKey(u => u.BusinessId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RoadmapProgress>(e =>
        {
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(p => new { p.RoadmapId, p.StepId }).IsUnique();
            e.HasOne(p => p.Roadmap).WithMany().HasForeignKey(p => p.RoadmapId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Step).WithMany().HasForeignKey(p => p.StepId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RequirementProgress>(e =>
        {
            e.HasKey(p => new { p.RoadmapId, p.RequirementId });
            e.HasOne(p => p.Roadmap).WithMany().HasForeignKey(p => p.RoadmapId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Requirement).WithMany().HasForeignKey(p => p.RequirementId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
