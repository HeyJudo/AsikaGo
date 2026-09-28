using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "business_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    region = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "text", nullable: true),
                    display_name = table.Column<string>(type: "text", nullable: true),
                    is_anonymous = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "registration_steps",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    agency = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_registration_steps", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "source_references",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    date_verified = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_source_references", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "business_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_name = table.Column<string>(type: "text", nullable: true),
                    business_type = table.Column<string>(type: "text", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    city_id = table.Column<Guid>(type: "uuid", nullable: false),
                    registration_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_profiles", x => x.id);
                    table.ForeignKey(
                        name: "fk_business_profiles_business_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "business_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_business_profiles_cities_city_id",
                        column: x => x.city_id,
                        principalTable: "cities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_business_profiles_profiles_user_id",
                        column: x => x.user_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "requirements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    source_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_requirements", x => x.id);
                    table.ForeignKey(
                        name: "fk_requirements_registration_steps_step_id",
                        column: x => x.step_id,
                        principalTable: "registration_steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_requirements_source_references_source_id",
                        column: x => x.source_id,
                        principalTable: "source_references",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user_roadmaps",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roadmaps", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_roadmaps_business_profiles_business_id",
                        column: x => x.business_id,
                        principalTable: "business_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roadmap_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    city_id = table.Column<Guid>(type: "uuid", nullable: true),
                    step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_id = table.Column<Guid>(type: "uuid", nullable: true),
                    effect = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roadmap_rules", x => x.id);
                    table.ForeignKey(
                        name: "fk_roadmap_rules_business_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "business_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_roadmap_rules_cities_city_id",
                        column: x => x.city_id,
                        principalTable: "cities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_roadmap_rules_registration_steps_step_id",
                        column: x => x.step_id,
                        principalTable: "registration_steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_roadmap_rules_requirements_requirement_id",
                        column: x => x.requirement_id,
                        principalTable: "requirements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "requirement_progresses",
                columns: table => new
                {
                    roadmap_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_prepared = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_requirement_progresses", x => new { x.roadmap_id, x.requirement_id });
                    table.ForeignKey(
                        name: "fk_requirement_progresses_requirements_requirement_id",
                        column: x => x.requirement_id,
                        principalTable: "requirements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_requirement_progresses_user_roadmaps_roadmap_id",
                        column: x => x.roadmap_id,
                        principalTable: "user_roadmaps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roadmap_progresses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    roadmap_id = table.Column<Guid>(type: "uuid", nullable: false),
                    step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roadmap_progresses", x => x.id);
                    table.ForeignKey(
                        name: "fk_roadmap_progresses_registration_steps_step_id",
                        column: x => x.step_id,
                        principalTable: "registration_steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_roadmap_progresses_user_roadmaps_roadmap_id",
                        column: x => x.roadmap_id,
                        principalTable: "user_roadmaps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "business_categories",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { new Guid("22222222-2222-2222-2222-222222222201"), "Restaurants, cafes, and food stalls.", "Food and Beverage" },
                    { new Guid("22222222-2222-2222-2222-222222222202"), "Selling goods directly to consumers.", "Retail" },
                    { new Guid("22222222-2222-2222-2222-222222222203"), "Offering skills or labor rather than goods.", "Services" }
                });

            migrationBuilder.InsertData(
                table: "cities",
                columns: new[] { "id", "name", "region" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111101"), "Quezon City", "NCR" },
                    { new Guid("11111111-1111-1111-1111-111111111102"), "Manila", "NCR" },
                    { new Guid("11111111-1111-1111-1111-111111111103"), "Pasig", "NCR" }
                });

            migrationBuilder.CreateIndex(
                name: "ix_business_categories_name",
                table: "business_categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_business_profiles_category_id",
                table: "business_profiles",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_business_profiles_city_id",
                table: "business_profiles",
                column: "city_id");

            migrationBuilder.CreateIndex(
                name: "ix_business_profiles_user_id",
                table: "business_profiles",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_cities_name",
                table: "cities",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_requirement_progresses_requirement_id",
                table: "requirement_progresses",
                column: "requirement_id");

            migrationBuilder.CreateIndex(
                name: "ix_requirements_source_id",
                table: "requirements",
                column: "source_id");

            migrationBuilder.CreateIndex(
                name: "ix_requirements_step_id",
                table: "requirements",
                column: "step_id");

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_progresses_roadmap_id_step_id",
                table: "roadmap_progresses",
                columns: new[] { "roadmap_id", "step_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_progresses_step_id",
                table: "roadmap_progresses",
                column: "step_id");

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_rules_category_id",
                table: "roadmap_rules",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_rules_city_id",
                table: "roadmap_rules",
                column: "city_id");

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_rules_requirement_id",
                table: "roadmap_rules",
                column: "requirement_id");

            migrationBuilder.CreateIndex(
                name: "ix_roadmap_rules_step_id",
                table: "roadmap_rules",
                column: "step_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_roadmaps_business_id",
                table: "user_roadmaps",
                column: "business_id");

            migrationBuilder.Sql(
                "ALTER TABLE profiles ADD CONSTRAINT fk_profiles_auth_users FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;");

            // RLS with no policies denies the anon-key REST path Supabase exposes on every public
            // table; the backend connects as the postgres role, which bypasses RLS entirely.
            migrationBuilder.Sql("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE cities ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE registration_steps ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE source_references ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE roadmap_rules ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE roadmap_progresses ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE requirement_progresses ENABLE ROW LEVEL SECURITY;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE profiles DROP CONSTRAINT fk_profiles_auth_users;");

            migrationBuilder.DropTable(
                name: "requirement_progresses");

            migrationBuilder.DropTable(
                name: "roadmap_progresses");

            migrationBuilder.DropTable(
                name: "roadmap_rules");

            migrationBuilder.DropTable(
                name: "user_roadmaps");

            migrationBuilder.DropTable(
                name: "requirements");

            migrationBuilder.DropTable(
                name: "business_profiles");

            migrationBuilder.DropTable(
                name: "registration_steps");

            migrationBuilder.DropTable(
                name: "source_references");

            migrationBuilder.DropTable(
                name: "business_categories");

            migrationBuilder.DropTable(
                name: "cities");

            migrationBuilder.DropTable(
                name: "profiles");
        }
    }
}
