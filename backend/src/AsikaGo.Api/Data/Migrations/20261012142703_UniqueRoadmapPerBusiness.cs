using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UniqueRoadmapPerBusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_user_roadmaps_business_id",
                table: "user_roadmaps");

            migrationBuilder.CreateIndex(
                name: "ix_user_roadmaps_business_id",
                table: "user_roadmaps",
                column: "business_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_user_roadmaps_business_id",
                table: "user_roadmaps");

            migrationBuilder.CreateIndex(
                name: "ix_user_roadmaps_business_id",
                table: "user_roadmaps",
                column: "business_id");
        }
    }
}
