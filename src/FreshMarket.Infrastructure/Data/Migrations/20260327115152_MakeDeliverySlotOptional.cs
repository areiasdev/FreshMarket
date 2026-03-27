using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreshMarket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakeDeliverySlotOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliverySlots_DeliverySlotId",
                table: "Orders");

            migrationBuilder.AlterColumn<int>(
                name: "DeliverySlotId",
                table: "Orders",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateOnly>(
                name: "PreferredDeliveryDate",
                table: "Orders",
                type: "date",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliverySlots_DeliverySlotId",
                table: "Orders",
                column: "DeliverySlotId",
                principalTable: "DeliverySlots",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliverySlots_DeliverySlotId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PreferredDeliveryDate",
                table: "Orders");

            migrationBuilder.AlterColumn<int>(
                name: "DeliverySlotId",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliverySlots_DeliverySlotId",
                table: "Orders",
                column: "DeliverySlotId",
                principalTable: "DeliverySlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
