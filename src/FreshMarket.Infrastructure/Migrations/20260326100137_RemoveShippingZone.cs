using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FreshMarket.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShippingZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliverySlots_ShippingZones_ShippingZoneId",
                table: "DeliverySlots");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ShippingZones_ShippingZoneId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "ShippingZones");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShippingZoneId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_DeliverySlots_ShippingZoneId",
                table: "DeliverySlots");

            migrationBuilder.DropColumn(
                name: "ShippingZoneId",
                table: "DeliverySlots");

            migrationBuilder.RenameColumn(
                name: "DeliveryDate",
                table: "DeliverySlots",
                newName: "Date");

            migrationBuilder.RenameIndex(
                name: "IX_DeliverySlots_DeliveryDate_StartTime_EndTime",
                table: "DeliverySlots",
                newName: "IX_DeliverySlots_Date_StartTime_EndTime");

            migrationBuilder.RenameIndex(
                name: "IX_DeliverySlots_DeliveryDate_IsActive",
                table: "DeliverySlots",
                newName: "IX_DeliverySlots_Date_IsActive");

            migrationBuilder.AlterColumn<string>(
                name: "DeliveryPostalCode",
                table: "Orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8)",
                oldMaxLength: 8);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "DeliverySlots",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingFee",
                table: "DeliverySlots",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "DeliverySlots");

            migrationBuilder.DropColumn(
                name: "ShippingFee",
                table: "DeliverySlots");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "DeliverySlots",
                newName: "DeliveryDate");

            migrationBuilder.RenameIndex(
                name: "IX_DeliverySlots_Date_StartTime_EndTime",
                table: "DeliverySlots",
                newName: "IX_DeliverySlots_DeliveryDate_StartTime_EndTime");

            migrationBuilder.RenameIndex(
                name: "IX_DeliverySlots_Date_IsActive",
                table: "DeliverySlots",
                newName: "IX_DeliverySlots_DeliveryDate_IsActive");

            migrationBuilder.AlterColumn<string>(
                name: "DeliveryPostalCode",
                table: "Orders",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<int>(
                name: "ShippingZoneId",
                table: "DeliverySlots",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShippingZones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    MinOrderValue = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    ShippingFee = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingZones", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShippingZoneId",
                table: "Orders",
                column: "ShippingZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliverySlots_ShippingZoneId",
                table: "DeliverySlots",
                column: "ShippingZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingZones_PostalCode",
                table: "ShippingZones",
                column: "PostalCode");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliverySlots_ShippingZones_ShippingZoneId",
                table: "DeliverySlots",
                column: "ShippingZoneId",
                principalTable: "ShippingZones",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ShippingZones_ShippingZoneId",
                table: "Orders",
                column: "ShippingZoneId",
                principalTable: "ShippingZones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
