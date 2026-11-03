using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBarangayClearanceText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE registration_steps SET description = 'This shows your barangay has no objection to your business. Your city needs it before giving you a permit.' WHERE id = '44444444-4444-4444-4444-000000000002';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE registration_steps SET description = 'This shows your barangay has no objection to your business. Your city needs it before giving you a permit. Confirm the exact list at your barangay hall.' WHERE id = '44444444-4444-4444-4444-000000000002';");
        }
    }
}
