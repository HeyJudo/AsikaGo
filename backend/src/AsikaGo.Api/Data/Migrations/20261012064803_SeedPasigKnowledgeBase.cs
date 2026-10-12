using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedPasigKnowledgeBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string name = "seed/001_pasig_knowledge_base.sql";
            using var stream = typeof(SeedPasigKnowledgeBase).Assembly.GetManifestResourceStream(name)
                ?? throw new InvalidOperationException($"Embedded resource '{name}' not found. Is database/seed/ present at build time?");
            migrationBuilder.Sql(new StreamReader(stream).ReadToEnd());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM roadmap_rules WHERE id::text LIKE '66666666-6666-6666-6666-%';");
            migrationBuilder.Sql("DELETE FROM requirements WHERE id::text LIKE '55555555-5555-5555-5555-%';");
            migrationBuilder.Sql("DELETE FROM registration_steps WHERE id::text LIKE '44444444-4444-4444-4444-%';");
            migrationBuilder.Sql("DELETE FROM source_references WHERE id::text LIKE '33333333-3333-3333-3333-%';");
        }
    }
}
