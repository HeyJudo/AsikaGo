using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AsikaGo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ScopeToPasig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111101"));

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111102"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "cities",
                columns: new[] { "id", "name", "region" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111101"), "Quezon City", "NCR" },
                    { new Guid("11111111-1111-1111-1111-111111111102"), "Manila", "NCR" }
                });
        }
    }
}
