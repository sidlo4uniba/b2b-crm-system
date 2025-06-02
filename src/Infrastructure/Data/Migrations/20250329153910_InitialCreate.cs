using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CRMBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Dodavatelia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NazovFirmy = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefon = table.Column<string>(type: "text", nullable: false),
                    Adresa_Ulica = table.Column<string>(type: "text", nullable: true),
                    Adresa_Mesto = table.Column<string>(type: "text", nullable: true),
                    Adresa_PSC = table.Column<string>(type: "text", nullable: true),
                    Adresa_Krajina = table.Column<string>(type: "text", nullable: true),
                    Poznamka = table.Column<string>(type: "text", nullable: true),
                    Aktivny = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dodavatelia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Firmy",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nazov = table.Column<string>(type: "text", nullable: false),
                    ICO = table.Column<string>(type: "text", nullable: false),
                    Adresa_Ulica = table.Column<string>(type: "text", nullable: false),
                    Adresa_Mesto = table.Column<string>(type: "text", nullable: false),
                    Adresa_PSC = table.Column<string>(type: "text", nullable: false),
                    Adresa_Krajina = table.Column<string>(type: "text", nullable: true),
                    IcDph = table.Column<string>(type: "text", nullable: true),
                    SkoreSpolahlivosti = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    HodnotaObjednavok = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Firmy", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KategorieProduktov",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nazov = table.Column<string>(type: "text", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KategorieProduktov", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoLists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Colour_Code = table.Column<string>(type: "text", nullable: false),
                    MaxItems = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KontaktneOsoby",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirmaId = table.Column<int>(type: "integer", nullable: false),
                    Meno = table.Column<string>(type: "text", nullable: false),
                    Priezvisko = table.Column<string>(type: "text", nullable: false),
                    Telefon = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KontaktneOsoby", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KontaktneOsoby_Firmy_FirmaId",
                        column: x => x.FirmaId,
                        principalTable: "Firmy",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tovary",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InterneId = table.Column<string>(type: "text", nullable: false),
                    Nazov = table.Column<string>(type: "text", nullable: false),
                    ObrazokURL = table.Column<string>(type: "text", nullable: true),
                    KategoriaId = table.Column<int>(type: "integer", nullable: false),
                    Ean = table.Column<string>(type: "text", nullable: true),
                    Cena = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DodavatelId = table.Column<int>(type: "integer", nullable: false),
                    Aktivny = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tovary", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tovary_Dodavatelia_DodavatelId",
                        column: x => x.DodavatelId,
                        principalTable: "Dodavatelia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tovary_KategorieProduktov_KategoriaId",
                        column: x => x.KategoriaId,
                        principalTable: "KategorieProduktov",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TodoItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ListId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: true),
                    Reminder = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Done = table.Column<bool>(type: "boolean", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TodoItems_TodoLists_ListId",
                        column: x => x.ListId,
                        principalTable: "TodoLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VariantyTovarov",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TovarId = table.Column<int>(type: "integer", nullable: false),
                    FarbaHex = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Velkost_Code = table.Column<string>(type: "text", nullable: true),
                    Cena = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ObrazokURL = table.Column<string>(type: "text", nullable: true),
                    Aktivny = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariantyTovarov", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VariantyTovarov_Tovary_TovarId",
                        column: x => x.TovarId,
                        principalTable: "Tovary",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CenovaPonukaTovary",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CenovaPonukaId = table.Column<int>(type: "integer", nullable: false),
                    TovarId = table.Column<int>(type: "integer", nullable: true),
                    VariantTovarId = table.Column<int>(type: "integer", nullable: true),
                    Mnozstvo = table.Column<int>(type: "integer", nullable: false),
                    PovodnaCena = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CenovaPonukaTovary", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CenovaPonukaTovary_Tovary_TovarId",
                        column: x => x.TovarId,
                        principalTable: "Tovary",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CenovaPonukaTovary_VariantyTovarov_VariantTovarId",
                        column: x => x.VariantTovarId,
                        principalTable: "VariantyTovarov",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CenovePonuky",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ObjednavkaId = table.Column<int>(type: "integer", nullable: false),
                    FinalnaCena = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Stav = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CenovePonuky", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Objednavky",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirmaId = table.Column<int>(type: "integer", nullable: false),
                    KontaktnaOsobaId = table.Column<int>(type: "integer", nullable: false),
                    PoslednaCenovaPonukaId = table.Column<int>(type: "integer", nullable: true),
                    Faza = table.Column<string>(type: "text", nullable: false),
                    Zrusene = table.Column<bool>(type: "boolean", nullable: false),
                    Zaplatene = table.Column<bool>(type: "boolean", nullable: false),
                    OcakavanyDatumDorucenia = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NaplanovanyDatumVyroby = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Poznamka = table.Column<string>(type: "text", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Objednavky", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                        column: x => x.PoslednaCenovaPonukaId,
                        principalTable: "CenovePonuky",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Objednavky_Firmy_FirmaId",
                        column: x => x.FirmaId,
                        principalTable: "Firmy",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Objednavky_KontaktneOsoby_KontaktnaOsobaId",
                        column: x => x.KontaktnaOsobaId,
                        principalTable: "KontaktneOsoby",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CenovaPonukaTovary_CenovaPonukaId",
                table: "CenovaPonukaTovary",
                column: "CenovaPonukaId");

            migrationBuilder.CreateIndex(
                name: "IX_CenovaPonukaTovary_TovarId",
                table: "CenovaPonukaTovary",
                column: "TovarId");

            migrationBuilder.CreateIndex(
                name: "IX_CenovaPonukaTovary_VariantTovarId",
                table: "CenovaPonukaTovary",
                column: "VariantTovarId");

            migrationBuilder.CreateIndex(
                name: "IX_CenovePonuky_ObjednavkaId",
                table: "CenovePonuky",
                column: "ObjednavkaId");

            migrationBuilder.CreateIndex(
                name: "IX_CenovePonuky_Stav",
                table: "CenovePonuky",
                column: "Stav");

            migrationBuilder.CreateIndex(
                name: "IX_Dodavatelia_Aktivny",
                table: "Dodavatelia",
                column: "Aktivny");

            migrationBuilder.CreateIndex(
                name: "IX_Firmy_ICO",
                table: "Firmy",
                column: "ICO",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Firmy_Nazov",
                table: "Firmy",
                column: "Nazov");

            migrationBuilder.CreateIndex(
                name: "IX_Firmy_SkoreSpolahlivosti",
                table: "Firmy",
                column: "SkoreSpolahlivosti");

            migrationBuilder.CreateIndex(
                name: "IX_KontaktneOsoby_Email",
                table: "KontaktneOsoby",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_KontaktneOsoby_FirmaId",
                table: "KontaktneOsoby",
                column: "FirmaId");

            migrationBuilder.CreateIndex(
                name: "IX_KontaktneOsoby_FirmaId_Email",
                table: "KontaktneOsoby",
                columns: new[] { "FirmaId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_Faza",
                table: "Objednavky",
                column: "Faza");

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_FirmaId",
                table: "Objednavky",
                column: "FirmaId");

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_KontaktnaOsobaId",
                table: "Objednavky",
                column: "KontaktnaOsobaId");

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_NaplanovanyDatumVyroby",
                table: "Objednavky",
                column: "NaplanovanyDatumVyroby");

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_PoslednaCenovaPonukaId",
                table: "Objednavky",
                column: "PoslednaCenovaPonukaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_Zaplatene",
                table: "Objednavky",
                column: "Zaplatene");

            migrationBuilder.CreateIndex(
                name: "IX_Objednavky_Zrusene",
                table: "Objednavky",
                column: "Zrusene");

            migrationBuilder.CreateIndex(
                name: "IX_TodoItems_ListId",
                table: "TodoItems",
                column: "ListId");

            migrationBuilder.CreateIndex(
                name: "IX_Tovary_Aktivny",
                table: "Tovary",
                column: "Aktivny");

            migrationBuilder.CreateIndex(
                name: "IX_Tovary_DodavatelId",
                table: "Tovary",
                column: "DodavatelId");

            migrationBuilder.CreateIndex(
                name: "IX_Tovary_InterneId",
                table: "Tovary",
                column: "InterneId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tovary_KategoriaId",
                table: "Tovary",
                column: "KategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tovary_Nazov",
                table: "Tovary",
                column: "Nazov");

            migrationBuilder.CreateIndex(
                name: "IX_VariantyTovarov_Aktivny",
                table: "VariantyTovarov",
                column: "Aktivny");

            migrationBuilder.CreateIndex(
                name: "IX_VariantyTovarov_TovarId",
                table: "VariantyTovarov",
                column: "TovarId");

            migrationBuilder.AddForeignKey(
                name: "FK_CenovaPonukaTovary_CenovePonuky_CenovaPonukaId",
                table: "CenovaPonukaTovary",
                column: "CenovaPonukaId",
                principalTable: "CenovePonuky",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CenovePonuky_Objednavky_ObjednavkaId",
                table: "CenovePonuky",
                column: "ObjednavkaId",
                principalTable: "Objednavky",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                table: "Objednavky");

            migrationBuilder.DropTable(
                name: "CenovaPonukaTovary");

            migrationBuilder.DropTable(
                name: "TodoItems");

            migrationBuilder.DropTable(
                name: "VariantyTovarov");

            migrationBuilder.DropTable(
                name: "TodoLists");

            migrationBuilder.DropTable(
                name: "Tovary");

            migrationBuilder.DropTable(
                name: "Dodavatelia");

            migrationBuilder.DropTable(
                name: "KategorieProduktov");

            migrationBuilder.DropTable(
                name: "CenovePonuky");

            migrationBuilder.DropTable(
                name: "Objednavky");

            migrationBuilder.DropTable(
                name: "KontaktneOsoby");

            migrationBuilder.DropTable(
                name: "Firmy");
        }
    }
}
