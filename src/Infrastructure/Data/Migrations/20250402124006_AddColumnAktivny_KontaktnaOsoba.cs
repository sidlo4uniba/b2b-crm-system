using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnAktivny_KontaktnaOsoba : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Aktivny",
                table: "KontaktneOsoby",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Aktivny",
                table: "KontaktneOsoby");
        }
    }
}
