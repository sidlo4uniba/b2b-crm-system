using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgainUpdateUniqueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Firmy_IcDph",
                table: "Firmy",
                column: "IcDph",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Firmy_IcDph",
                table: "Firmy");
        }
    }
}
