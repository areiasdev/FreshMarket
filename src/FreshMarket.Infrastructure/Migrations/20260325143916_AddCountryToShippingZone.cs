using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreshMarket.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCountryToShippingZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PostalCodePrefix",
                table: "ShippingZones",
                newName: "PostalCode");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "ShippingZones",
                newName: "IsAvailable");

            migrationBuilder.RenameColumn(
                name: "City",
                table: "ShippingZones",
                newName: "Country");

            migrationBuilder.RenameIndex(
                name: "IX_ShippingZones_PostalCodePrefix",
                table: "ShippingZones",
                newName: "IX_ShippingZones_PostalCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PostalCode",
                table: "ShippingZones",
                newName: "PostalCodePrefix");

            migrationBuilder.RenameColumn(
                name: "IsAvailable",
                table: "ShippingZones",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "Country",
                table: "ShippingZones",
                newName: "City");

            migrationBuilder.RenameIndex(
                name: "IX_ShippingZones_PostalCode",
                table: "ShippingZones",
                newName: "IX_ShippingZones_PostalCodePrefix");
        }
    }
}
