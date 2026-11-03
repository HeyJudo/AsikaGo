using AsikaGo.Api.Data.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Xunit;

namespace AsikaGo.Tests;

public class UpdateBarangayClearanceTextMigrationTests
{
    const string Step2Id = "44444444-4444-4444-4444-000000000002";
    const string NewText = "This shows your barangay has no objection to your business. Your city needs it before giving you a permit.";
    const string RemovedSentence = "Confirm the exact list at your barangay hall.";

    [Fact]
    public void Up_UpdatesOnlyStep2Description()
    {
        var sql = Assert.IsType<SqlOperation>(Assert.Single(new UpdateBarangayClearanceText().UpOperations)).Sql;

        Assert.StartsWith("UPDATE registration_steps SET description = ", sql);
        Assert.Contains($"'{NewText}'", sql);
        Assert.EndsWith($"WHERE id = '{Step2Id}';", sql);
        Assert.DoesNotContain(RemovedSentence, sql);
    }

    [Fact]
    public void Down_RestoresTheOldSentence()
    {
        var sql = Assert.IsType<SqlOperation>(Assert.Single(new UpdateBarangayClearanceText().DownOperations)).Sql;

        Assert.Contains($"'{NewText} {RemovedSentence}'", sql);
        Assert.EndsWith($"WHERE id = '{Step2Id}';", sql);
    }

    [Fact]
    public void SeedSql_MatchesTheMigration()
    {
        using var stream = typeof(SeedPasigKnowledgeBase).Assembly
            .GetManifestResourceStream("seed/001_pasig_knowledge_base.sql");
        var seed = new StreamReader(stream!).ReadToEnd();

        Assert.Contains($"'{Step2Id}', 'Barangay Business Clearance', 'Barangay hall of your business address', '{NewText}',", seed);
        Assert.DoesNotContain(RemovedSentence, seed);
    }
}
