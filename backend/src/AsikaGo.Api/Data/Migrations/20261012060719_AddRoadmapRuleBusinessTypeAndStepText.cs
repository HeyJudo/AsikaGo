using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRoadmapRuleBusinessTypeAndStepText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "business_type",
                table: "roadmap_rules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "actions",
                table: "registration_steps",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "condition_note",
                table: "registration_steps",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "business_type",
                table: "roadmap_rules");

            migrationBuilder.DropColumn(
                name: "actions",
                table: "registration_steps");

            migrationBuilder.DropColumn(
                name: "condition_note",
                table: "registration_steps");
        }
    }
}
