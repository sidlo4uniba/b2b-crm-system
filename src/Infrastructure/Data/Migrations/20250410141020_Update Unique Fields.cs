using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUniqueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Tovary_Ean",
                table: "Tovary",
                column: "Ean",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tovary_Ean",
                table: "Tovary");
        }
    }
}
