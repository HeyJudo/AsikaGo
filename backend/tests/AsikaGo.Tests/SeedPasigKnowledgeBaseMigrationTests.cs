using AsikaGo.Api.Data.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Xunit;

namespace AsikaGo.Tests;

public class SeedPasigKnowledgeBaseMigrationTests
{
    [Fact]
    public void Up_AppliesEmbeddedSeedSql()
    {
        using var stream = typeof(SeedPasigKnowledgeBase).Assembly
            .GetManifestResourceStream("seed/001_pasig_knowledge_base.sql");
        Assert.NotNull(stream);
        var expected = new StreamReader(stream).ReadToEnd();

        var op = Assert.Single(new SeedPasigKnowledgeBase().UpOperations);

        Assert.Equal(expected, Assert.IsType<SqlOperation>(op).Sql);
        Assert.Contains("INSERT INTO registration_steps", expected);
    }

    [Fact]
    public void Down_DeletesSeedRowsInForeignKeyOrder()
    {
        var tables = new SeedPasigKnowledgeBase().DownOperations
            .Select(o => Assert.IsType<SqlOperation>(o).Sql.Split(' ')[2])
            .ToArray();

        Assert.Equal(new[] { "roadmap_rules", "requirements", "registration_steps", "source_references" }, tables);
    }
}
